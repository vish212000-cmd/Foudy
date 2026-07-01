from django.urls import path
from .views import (
    RegisterView, LoginView, GuestLoginView, LogoutView, RefreshView, 
    SessionRevokeView, GuestUpgradeView, PasswordResetRequestView, 
    PasswordResetConfirmView, EmailVerificationRequestView, 
    EmailVerificationConfirmView, LogoutAllDevicesView,
    GoogleOAuthView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('guest/', GuestLoginView.as_view(), name='guest'),
    path('upgrade/', GuestUpgradeView.as_view(), name='upgrade'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('logout-all/', LogoutAllDevicesView.as_view(), name='logout_all'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('session/', SessionRevokeView.as_view(), name='session_revoke'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('email-verify/', EmailVerificationRequestView.as_view(), name='email_verify_request'),
    path('email-verify/confirm/', EmailVerificationConfirmView.as_view(), name='email_verify_confirm'),
    path('google-login/', GoogleOAuthView.as_view(), name='google_login'),
]
