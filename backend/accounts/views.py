from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.db.models.fields import BLANK_CHOICE_DASH
from django.shortcuts import get_object_or_404


from .serializers import UserRegistrationSerializer, UserSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer, MyTokenObtainPairSerializer
from .models import User
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # You might want to return JWT tokens here after successful registration
        # For simplicity, returning user data for now
        response_data = {
            "message": "User registered successfully.",
            "user": UserSerializer(user).data
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()

        if user:
            # Generate token and UID
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # Construct reset link (frontend responsibility to consume this)
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

            # In a real application, send an email here. For now, print to console.
            print(f"Password reset link for {user.email}: {reset_link}")
            
            # Example of how to send an email (requires email configuration in settings.py)
            # mail_subject = "Password Reset Requested"
            # message = render_to_string('accounts/password_reset_email.html', {
            #     'user': user,
            #     'reset_link': reset_link,
            # })
            # send_mail(mail_subject, message, settings.DEFAULT_FROM_EMAIL, [email])

        return Response({"detail": "Password reset if email is registered."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']

        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "The reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

from .permissions import IsAdmin
from .serializers import UserAdminSerializer
from orientation.models import OrientationTest
from catalog.models import Field, Institution
from django.db.models import Count

class UserAdminListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

class UserAdminDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

class AdminDashboardStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        total_users = User.objects.count()
        users_by_role = User.objects.values('role').annotate(count=Count('role'))
        total_tests_completed = OrientationTest.objects.filter(is_completed=True).count()
        tests_started = OrientationTest.objects.count()

        # Top 10 recommended/consulted fields (placeholder, requires actual tracking)
        # For now, just a count of fields/institutions
        total_fields = Field.objects.count()
        total_institutions = Institution.objects.count()

        data = {
            "total_users": total_users,
            "users_by_role": list(users_by_role),
            "total_tests_completed": total_tests_completed,
            "tests_started": tests_started,
            "total_academic_fields": total_fields,
            "total_institutions": total_institutions,
            # Add more stats as needed, e.g., top 10 recommended fields, etc.
        }
        return Response(data, status=status.HTTP_200_OK)