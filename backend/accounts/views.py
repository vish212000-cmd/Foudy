from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import ScopedRateThrottle
from drf_spectacular.utils import extend_schema, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
import uuid
import random
import secrets
import redis
import logging
from django.conf import settings
from core.redis import RedisNamespaces, RedisTTL

redis_client = redis.from_url(settings.REDIS_URL)
logger = logging.getLogger('foudy.auth')

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, GuestUpgradeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    EmailVerificationRequestSerializer, EmailVerificationConfirmSerializer
)
from .models import User, UserSession
from profiles.models import Profile

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def create_tokens_for_user(user, request):
    refresh = RefreshToken.for_user(user)
    
    # Create UserSession
    session = UserSession.objects.create(
        user=user,
        refresh_token_family=refresh.payload.get('jti', uuid.uuid4()),
        device_info=request.META.get('HTTP_USER_AGENT', '')[:255],
        ip_address=get_client_ip(request),
        expires_at=timezone.now() + timezone.timedelta(days=7)
    )
    
    refresh['session_id'] = str(session.id)
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite='Strict'
    )

class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = User.objects.create_user(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            is_guest=False
        )
        Profile.objects.create(
            user=user,
            display_name=serializer.validated_data['display_name']
        )
        
        tokens = create_tokens_for_user(user, request)
        response_data = {
            'access_token': tokens['access'],
            'user': UserSerializer(user).data
        }
        response = Response(response_data, status=status.HTTP_201_CREATED)
        set_refresh_cookie(response, tokens['refresh'])
        return response

class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    @extend_schema(request=LoginSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            logger.warning("Failed login attempt", extra={
                "event": "login_failed",
                "email": serializer.validated_data['email'],
                "ip": get_client_ip(request)
            })
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
        tokens = create_tokens_for_user(user, request)
        response_data = {
            'access_token': tokens['access'],
            'user': UserSerializer(user).data
        }
        
        logger.info("Successful login", extra={
            "event": "login_success",
            "user_id": user.id,
            "ip": get_client_ip(request)
        })
        
        response = Response(response_data, status=status.HTTP_200_OK)
        set_refresh_cookie(response, tokens['refresh'])
        return response

class GuestLoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses={201: UserSerializer})
    def post(self, request):
        user = User.objects.create(is_guest=True)
        Profile.objects.create(
            user=user,
            display_name=f"Guest{random.randint(1000, 9999)}"
        )
        
        tokens = create_tokens_for_user(user, request)
        response_data = {
            'access_token': tokens['access'],
            'user': UserSerializer(user).data
        }
        response = Response(response_data, status=status.HTTP_201_CREATED)
        set_refresh_cookie(response, tokens['refresh'])
        return response

class GuestUpgradeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=GuestUpgradeSerializer, responses={200: UserSerializer})
    def post(self, request):
        if not request.user.is_guest:
            return Response({"error": "User is already a registered account"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = GuestUpgradeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        request.user.email = serializer.validated_data['email']
        request.user.set_password(serializer.validated_data['password'])
        request.user.is_guest = False
        request.user.save()
        
        tokens = create_tokens_for_user(request.user, request)
        response_data = {
            'access_token': tokens['access'],
            'user': UserSerializer(request.user).data
        }
        response = Response(response_data, status=status.HTTP_200_OK)
        set_refresh_cookie(response, tokens['refresh'])
        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={204: None})
    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                # Also revoke the associated session
                session_id = token.payload.get('session_id')
                if session_id:
                    UserSession.objects.filter(id=session_id, user=request.user).update(is_revoked=True)
        except Exception:
            pass
            
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('refresh_token')
        return response

class LogoutAllDevicesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={204: None})
    def post(self, request):
        # Revoke all sessions for this user
        UserSession.objects.filter(user=request.user).update(is_revoked=True)
        
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('refresh_token')
        return response

class RefreshView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses={200: OpenApiTypes.OBJECT})
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({"error": "No refresh token provided"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            refresh = RefreshToken(refresh_token)
            
            session_id = refresh.payload.get('session_id')
            if session_id:
                try:
                    session = UserSession.objects.get(id=session_id)
                    if session.is_revoked:
                        return Response({"error": "Session is revoked"}, status=status.HTTP_401_UNAUTHORIZED)
                except UserSession.DoesNotExist:
                    return Response({"error": "Invalid session"}, status=status.HTTP_401_UNAUTHORIZED)

            # Create new tokens (rotation)
            user = User.objects.get(id=refresh.payload.get('user_id'))
            
            # Simple rotation implementation:
            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()
            
            response = Response({'access_token': str(refresh.access_token)}, status=status.HTTP_200_OK)
            set_refresh_cookie(response, str(refresh))
            return response
            
        except Exception as e:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    @extend_schema(request=PasswordResetRequestSerializer, responses={200: OpenApiTypes.OBJECT})
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email, is_guest=False).first()
        
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = secrets.token_urlsafe(32)
            
            # Store secure one-time token in Redis
            redis_client.setex(
                RedisNamespaces.auth_reset_token(token),
                RedisTTL.AUTH_RESET_TOKEN,
                user.id
            )
            
            reset_link = f"http://localhost:3000/reset-password?uid={uid}&token={token}"
            
            send_mail(
                subject='Password Reset',
                message=f'Use this link to reset your password: {reset_link}',
                from_email='noreply@foudy.com',
                recipient_list=[user.email],
                fail_silently=True,
            )
            
        return Response({"message": "If an account exists, a password reset link has been sent."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=PasswordResetConfirmSerializer, responses={200: OpenApiTypes.OBJECT})
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid_b64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid token or user ID"}, status=status.HTTP_400_BAD_REQUEST)
            
        stored_user_id = redis_client.get(RedisNamespaces.auth_reset_token(token))
        if not stored_user_id or stored_user_id.decode('utf-8') != str(user.id):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        
        # Delete one-time token
        redis_client.delete(RedisNamespaces.auth_reset_token(token))
        
        # Revoke all active sessions
        UserSession.objects.filter(user=user).update(is_revoked=True)
        
        return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)

class EmailVerificationRequestView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'email_verify'

    @extend_schema(request=EmailVerificationRequestSerializer, responses={200: OpenApiTypes.OBJECT})
    def post(self, request):
        serializer = EmailVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        if user.is_email_verified:
            return Response({"message": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)
            
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = secrets.token_urlsafe(32)
        
        redis_client.setex(
            RedisNamespaces.auth_verify_token(token),
            RedisTTL.AUTH_VERIFY_TOKEN,
            user.id
        )
        
        verify_link = f"http://localhost:3000/verify-email?uid={uid}&token={token}"
        
        send_mail(
            subject='Verify your email',
            message=f'Use this link to verify your email: {verify_link}',
            from_email='noreply@foudy.com',
            recipient_list=[user.email],
            fail_silently=True,
        )
        
        return Response({"message": "Verification email sent."}, status=status.HTTP_200_OK)

class EmailVerificationConfirmView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=EmailVerificationConfirmSerializer, responses={200: OpenApiTypes.OBJECT})
    def post(self, request):
        serializer = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid_b64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        
        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid token or user ID"}, status=status.HTTP_400_BAD_REQUEST)
            
        stored_user_id = redis_client.get(RedisNamespaces.auth_verify_token(token))
        if not stored_user_id or stored_user_id.decode('utf-8') != str(user.id):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_email_verified = True
        user.save()
        
        redis_client.delete(RedisNamespaces.auth_verify_token(token))
        
        return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)

class SessionRevokeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={204: None})
    def delete(self, request):
        session_id = request.data.get('session_id')
        if session_id:
            UserSession.objects.filter(id=session_id, user=request.user).update(is_revoked=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
