from django.urls import path
from .views import (
    InstitutionListCreateAPIView,
    InstitutionDetailAPIView,
    FieldListCreateAPIView,
    FieldDetailAPIView,
    FavoriteListCreateAPIView,
    FavoriteDetailAPIView,
)

urlpatterns = [
    path('institutions/', InstitutionListCreateAPIView.as_view(), name='institution-list-create'),
    path('institutions/<int:pk>/', InstitutionDetailAPIView.as_view(), name='institution-detail'),
    path('fields/', FieldListCreateAPIView.as_view(), name='field-list-create'),
    path('fields/<int:pk>/', FieldDetailAPIView.as_view(), name='field-detail'),
    path('favorites/', FavoriteListCreateAPIView.as_view(), name='favorite-list-create'),
    path('favorites/<int:pk>/', FavoriteDetailAPIView.as_view(), name='favorite-detail'),
]