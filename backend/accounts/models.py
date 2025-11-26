from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Étudiant'),
        ('advisor', 'Conseiller'),
        ('admin', 'Administrateur'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return self.username

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    # Add any additional student-specific fields here
    # For example:
    # date_of_birth = models.DateField(null=True, blank=True)
    # academic_level = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.user.username + "'s profile"