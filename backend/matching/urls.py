from django.urls import path
from .views import JoinQueueView, LeaveQueueView

urlpatterns = [
    path('join/', JoinQueueView.as_view(), name='join-queue'),
    path('leave/', LeaveQueueView.as_view(), name='leave-queue'),
]
