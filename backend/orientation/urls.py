from django.urls import path
from .views import (
    QuestionListView,
    QuestionDetailView,
    OrientationTestStartView,
    TestResponseSubmitView,
    OrientationTestCompleteView,
    OrientationTestResultView,
    UserOrientationTestListView,
)

urlpatterns = [
    path('questions/', QuestionListView.as_view(), name='question-list'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    path('tests/start/', OrientationTestStartView.as_view(), name='test-start'),
    path('tests/<int:test_id>/submit-response/', TestResponseSubmitView.as_view(), name='test-submit-response'),
    path('tests/<int:test_id>/complete/', OrientationTestCompleteView.as_view(), name='test-complete'),
    path('tests/<int:pk>/result/', OrientationTestResultView.as_view(), name='test-result'),
    path('my-tests/', UserOrientationTestListView.as_view(), name='my-tests-list'),
]