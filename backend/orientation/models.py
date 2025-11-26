from django.db import models
from accounts.models import User # Import the custom User model
from catalog.models import Field # Import Field model for recommendations

class Question(models.Model):
    CATEGORY_CHOICES = (
        ('academic_interests', 'Intérêts académiques'),
        ('perceived_skills', 'Compétences perçues'),
        ('professional_values', 'Valeurs professionnelles'),
        ('work_preferences', 'Préférences de travail'),
    )
    TYPE_CHOICES = (
        ('mcq', 'Multiple Choice'),
        ('likert', 'Likert Scale (1-5)'),
        ('ranking', 'Ranking Preferences'),
    )
    text = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    question_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='mcq')
    options = models.JSONField(default=list, blank=True) # For MCQ and Ranking

    def __str__(self):
        return self.text[:50] # Display first 50 chars of the question

class OrientationTest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orientation_tests')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    # Store raw scores per category or a summary
    scores_data = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Test for {self.user.username} (Completed: {self.is_completed})"

class TestResponse(models.Model):
    orientation_test = models.ForeignKey(OrientationTest, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.JSONField() # Can be a string, list, or dict based on question type

    def __str__(self):
        return f"Response for {self.orientation_test.user.username} - {self.question.text[:30]}"

class Recommendation(models.Model):
    orientation_test = models.OneToOneField(OrientationTest, on_delete=models.CASCADE, related_name='recommendation')
    recommended_fields = models.JSONField() # List of recommended Field IDs or detailed Field data
    compatibility_scores = models.JSONField(default=dict) # Scores for recommended fields
    justification = models.TextField(blank=True) # Explanation for recommendations
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for {self.orientation_test.user.username}"