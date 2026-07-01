from django.urls import path
from .views import CurrentUserView, AvatarUploadView, StatsView

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('me/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    path('me/stats/', StatsView.as_view(), name='user_stats'),
]
