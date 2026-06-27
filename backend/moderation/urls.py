from django.urls import path
from . import views

urlpatterns = [
    path('block/<int:target_id>/', views.BlockUserView.as_view(), name='block_user'),
    path('unblock/<int:target_id>/', views.UnblockUserView.as_view(), name='unblock_user'),
    path('report/<int:target_id>/', views.ReportUserView.as_view(), name='report_user'),
    path('blocks/', views.BlockedUsersListView.as_view(), name='list_blocks'),
]
