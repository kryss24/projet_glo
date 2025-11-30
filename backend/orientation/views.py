from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Question, OrientationTest, TestResponse, Recommendation
from .serializers import QuestionSerializer, OrientationTestSerializer, TestResponseSerializer, RecommendationSerializer
from accounts.permissions import IsAdmin, IsStudent
from catalog.models import Field
import random # For basic recommendation placeholder

class QuestionListView(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAdmin] # Admin can CRUD, others can only list

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.AllowAny()] # Allow anyone to list questions for a test without logging in initially

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

class OrientationTestStartView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request):
        user = request.user
        # Optional: Check if an active test already exists for the user
        active_test = OrientationTest.objects.filter(user=user, is_completed=False).first()
        if active_test:
            return Response({"detail": "An active test already exists. Complete it or clear it first."},
                            status=status.HTTP_400_BAD_REQUEST)

        orientation_test = OrientationTest.objects.create(user=user)
        serializer = OrientationTestSerializer(orientation_test)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TestResponseSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, test_id):
        orientation_test = get_object_or_404(OrientationTest, pk=test_id, user=request.user, is_completed=False)
        question_id = request.data.get('question_id')
        answer_data = request.data.get('answer')

        question = get_object_or_404(Question, pk=question_id)

        # Optional: Validate answer_data format based on question.question_type
        # For simplicity, we just save it as is
        
        test_response, created = TestResponse.objects.update_or_create(
            orientation_test=orientation_test,
            question=question,
            defaults={'answer': answer_data}
        )
        serializer = TestResponseSerializer(test_response)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrientationTestCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, test_id):
        orientation_test = get_object_or_404(OrientationTest, pk=test_id, user=request.user, is_completed=False)
        
        # Mark test as completed
        orientation_test.is_completed = True
        orientation_test.completed_at = timezone.now() # Import timezone
        orientation_test.save()

class OrientationTestCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, test_id):
        orientation_test = get_object_or_404(OrientationTest, pk=test_id, user=request.user, is_completed=False)
        
        # Mark test as completed
        orientation_test.is_completed = True
        orientation_test.completed_at = timezone.now()
        orientation_test.save()

        # --- Recommendation Algorithm Placeholder (Simplified) ---
        user_scores = {
            'academic_interests': 0,
            'perceived_skills': 0,
            'professional_values': 0,
            'work_preferences': 0,
        }
        
        # Iterate through responses to calculate user scores
        for response in orientation_test.responses.all():
            question = response.question
            answer = response.answer # Assuming answer is a simple value for calculation
            
            # Simple scoring logic (needs refinement based on actual question types and options)
            if question.question_type == 'likert' and isinstance(answer, (int, float)):
                if question.category in user_scores:
                    user_scores[question.category] += answer
            elif question.question_type == 'mcq':
                # For MCQ, assume answer is a string and some options are "stronger" indicators
                # This is a very basic placeholder; real scoring would be more complex
                if isinstance(answer, str) and 'science' in answer.lower() and question.category == 'academic_interests':
                     user_scores[question.category] += 2
                elif isinstance(answer, str) and 'math' in answer.lower() and question.category == 'perceived_skills':
                     user_scores[question.category] += 2
                # More detailed scoring logic needed here

        # Normalize scores (simple division by count or max possible score for each category)
        # For this simplified example, let's just make them between 0 and 1
        for category in user_scores:
            user_scores[category] = min(1, user_scores[category] / 5) # Assuming max score of 5 per category for simplicity

        orientation_test.scores_data = user_scores
        orientation_test.save()

        # --- Matching with Fields ---
        all_fields = Field.objects.all()
        field_compatibility = {}

        for field in all_fields:
            compatibility_score = 0
            
            # Match academic interests (simple keyword matching)
            if 'academic_interests' in user_scores and user_scores['academic_interests'] > 0.5:
                if any(keyword.lower() in field.description.lower() for keyword in ['science', 'tech', 'informatique', 'ingénierie']):
                    compatibility_score += user_scores['academic_interests'] * 0.4
            
            # Match perceived skills (simple keyword matching)
            if 'perceived_skills' in user_scores and user_scores['perceived_skills'] > 0.5:
                if any(skill.lower() in field.required_skills for skill in ['mathématiques', 'programmation', 'analyse']):
                    compatibility_score += user_scores['perceived_skills'] * 0.3

            # Add other matching criteria based on professional_values, work_preferences and field attributes
            # For example, if user values high salary, fields with high tuition_fees_max might indicate higher earning potential
            
            # Max compatibility is 1.0 (100%)
            field_compatibility[field.id] = min(1.0, compatibility_score)
        
        # Sort fields by compatibility and get top 5
        sorted_fields = sorted(field_compatibility.items(), key=lambda item: item[1], reverse=True)[:5]
        
        recommended_fields_ids = [field_id for field_id, score in sorted_fields]
        compatibility_scores_dict = {str(field_id): round(score * 100, 2) for field_id, score in sorted_fields} # Convert to percentage

        justification_text = "Cette recommandation est basée sur l'analyse de vos intérêts académiques et compétences perçues. Les filières proposées correspondent le mieux à votre profil."
        if not recommended_fields_ids:
            justification_text = "Nous n'avons pas pu trouver de recommandations précises pour vous. Veuillez réessayer le test ou contacter un conseiller."


        recommendation, created = Recommendation.objects.update_or_create(
            orientation_test=orientation_test,
            defaults={
                'recommended_fields': recommended_fields_ids,
                'compatibility_scores': compatibility_scores_dict,
                'justification': justification_text
            }
        )

        serializer = OrientationTestSerializer(orientation_test)
        return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = OrientationTestSerializer(orientation_test)
        return Response(serializer.data, status=status.HTTP_200_OK)

from django.utils import timezone # Import timezone

class OrientationTestResultView(generics.RetrieveAPIView):
    queryset = OrientationTest.objects.all()
    serializer_class = OrientationTestSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_object(self):
        obj = get_object_or_404(OrientationTest, pk=self.kwargs['pk'], user=self.request.user, is_completed=True)
        return obj

class UserOrientationTestListView(generics.ListAPIView):
    serializer_class = OrientationTestSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return OrientationTest.objects.filter(user=self.request.user).order_by('-started_at')
    
class TestResponseListView(generics.ListAPIView):
    serializer_class = TestResponseSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get_queryset(self):
        test_id = self.kwargs['test_id']
        orientation_test = get_object_or_404(OrientationTest, pk=test_id, user=self.request.user)
        return TestResponse.objects.filter(orientation_test=orientation_test)
    
# class OrientationTestNew()