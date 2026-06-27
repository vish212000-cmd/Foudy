from django.urls import path
from .views import CurrentUserView, AvatarUploadView

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('me/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
]
