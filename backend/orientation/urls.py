from django.urls import path
from .views import (
    QuestionListView,
    QuestionDetailView,
    OrientationTestStartView,
    TestResponseSubmitView,
    OrientationTestCompleteView,
    OrientationTestResultView,
    UserOrientationTestListView,
    TestResponseListView,
    # OrientationTestNew,
)

urlpatterns = [
    path('questions/', QuestionListView.as_view(), name='question-list'),
    path('questions/<int:pk>/', QuestionDetailView.as_view(), name='question-detail'),
    path('tests/start/', OrientationTestStartView.as_view(), name='test-start'),
    path('tests/<int:test_id>/submit-response/', TestResponseSubmitView.as_view(), name='test-submit-response'),
    path('tests/<int:test_id>/complete/', OrientationTestCompleteView.as_view(), name='test-complete'),
    path('tests/<int:pk>/result/', OrientationTestResultView.as_view(), name='test-result'),
    path('my-tests/', UserOrientationTestListView.as_view(), name='my-tests-list'),
    path('tests/<int:test_id>/responses/', TestResponseListView.as_view(), name='test-responses-list'),
    # path('tests/new', OrientationTestNiew.as_view(), name='new-test');
]