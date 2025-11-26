from rest_framework import generics, permissions, filters, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Institution, Field, Favorite
from .serializers import InstitutionSerializer, FieldSerializer, FavoriteSerializer
from accounts.permissions import IsAdmin, IsStudent # Import custom permissions

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class InstitutionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdmin] # Admin can create/list, others can only list
    pagination_class = CustomPagination

    def get_permissions(self):
        # Allow any authenticated user to list, but only admin to create
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class InstitutionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdmin] # Admin can update/delete, others can only retrieve

    def get_permissions(self):
        # Allow any authenticated user to retrieve, but only admin to update/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class FieldListCreateAPIView(generics.ListCreateAPIView):
    queryset = Field.objects.all()
    serializer_class = FieldSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['duration_years', 'institutions__city', 'institutions__type']
    search_fields = ['name', 'description', 'career_opportunities', 'required_skills']
    ordering_fields = ['name', 'duration_years', 'tuition_fees_min']
    pagination_class = CustomPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class FieldDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Field.objects.all()
    serializer_class = FieldSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdmin]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticatedOrReadOnly()]

class FavoriteListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    pagination_class = CustomPagination

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Ensure the favorite is created for the logged-in user
        # And prevent duplicate favorites
        field = serializer.validated_data['field']
        if Favorite.objects.filter(user=self.request.user, field=field).exists():
            raise serializers.ValidationError({'field': 'This field is already in your favorites.'})
        serializer.save(user=self.request.user)

class FavoriteDetailAPIView(generics.DestroyAPIView):
    queryset = Favorite.objects.all()
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        # Ensure a user can only delete their own favorites
        return Favorite.objects.filter(user=self.request.user)