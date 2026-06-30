from django.urls import path
from .views import NotificationListView, NotificationReadView, NotificationMarkAllReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/read/', NotificationReadView.as_view(), name='notification-read'),
    path('mark_all_read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
]
