from django.db import models

class Institution(models.Model):
    TYPE_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
    )
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    logo = models.ImageField(upload_to='institution_logos/', null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Field(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    duration_years = models.IntegerField()
    career_opportunities = models.JSONField(default=list) # List of strings for job titles
    required_skills = models.JSONField(default=list) # List of strings for skills
    institutions = models.ManyToManyField(Institution, related_name='fields')
    admission_criteria = models.TextField(blank=True)
    tuition_fees_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tuition_fees_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    def __str__(self):
        return self.name

class Favorite(models.Model):
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='favorites')
    field = models.ForeignKey(Field, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'field') # A user can favorite a field only once

    def __str__(self):
        return f"{self.user.username} favorites {self.field.name}"