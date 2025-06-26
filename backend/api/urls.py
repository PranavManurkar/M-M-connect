from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from api.views import *

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('id/', UserIDView.as_view(), name='get-id'),
    path('userdetails/', UserDetailsView.as_view(), name='get-user-details'),
    path('signup/', UserSignupView.as_view(), name='user-signup'),
    path('appointments/', MenteeAppointmentView.as_view(), name='mentee-appointments'),
    path('mentor-appointments/', MentorAppointmentView.as_view(), name='mentor-appointments'),
    path('appointments/<int:mentor_id>/', get_matching_appointments, name='matching-appointments'),
    path('mentor-details/<int:pk>/', MentorDetailsViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update', 'delete': 'destroy'}), name='mentor-detail'),
    path('mentor/<int:mentor_id>/reviews/', MentorReviewView.as_view(), name='mentor-reviews'),
    path('mentor/<int:mentor_id>/reviews/check/', check_review, name='check_review'),
    path('favorites/', favorite_mentor_details, name='get_favorites'),
    path('favorites/<int:mentor_id>/', FavoritesView.as_view(), name='modify_favorites'),
    path('favorites/<int:mentor_id>/check/', check_favorite, name='check_favorite'),
    path('chat/history/<str:room_name>/', get_chat_history, name='chat-history'),
    path('chat/details/<str:room_id>/', get_chat_details, name='chat-details'),
    path('chat/usernames/<str:room_id>/', get_usernames, name='chat-usernames'),
    path('mentor-list/<str:specialization>/', get_mentor_list, name='mentor-list'),
]