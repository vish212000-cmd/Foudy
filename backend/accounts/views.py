from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
import uuid
import random

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, GuestUpgradeSerializer
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
    UserSession.objects.create(
        user=user,
        refresh_token_family=uuid.uuid4(),
        device_info=request.META.get('HTTP_USER_AGENT', '')[:255],
        ip_address=get_client_ip(request),
        expires_at=timezone.now() + timezone.timedelta(days=7)
    )
    
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

    @extend_schema(request=LoginSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
        tokens = create_tokens_for_user(user, request)
        response_data = {
            'access_token': tokens['access'],
            'user': UserSerializer(user).data
        }
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
        # We could extract the refresh token from cookie and blacklist it,
        # but simplejwt handles blacklist via token instance.
        # For session, we can just mark all active sessions as revoked?
        # Actually just clear the cookie for the client.
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

class SessionRevokeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={204: None})
    def delete(self, request):
        session_id = request.data.get('session_id')
        if session_id:
            UserSession.objects.filter(id=session_id, user=request.user).update(is_revoked=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
