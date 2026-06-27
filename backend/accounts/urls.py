from django.urls import path
from .views import RegisterView, LoginView, GuestLoginView, LogoutView, RefreshView, SessionRevokeView, GuestUpgradeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('guest/', GuestLoginView.as_view(), name='guest'),
    path('upgrade/', GuestUpgradeView.as_view(), name='upgrade'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
    path('session/', SessionRevokeView.as_view(), name='session_revoke'),
]
