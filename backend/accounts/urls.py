from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    UserRegistrationView, 
    PasswordResetRequestView, 
    PasswordResetConfirmView, 
    UserProfileView,
    UserAdminListCreateAPIView,
    UserAdminDetailAPIView,
    AdminDashboardStatsView,
    MyTokenObtainPairView, # Import the custom view
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), # Use the custom view
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Admin-specific URLs
    path('admin/users/', UserAdminListCreateAPIView.as_view(), name='admin-user-list-create'),
    path('admin/users/<int:pk>/', UserAdminDetailAPIView.as_view(), name='admin-user-detail'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
]