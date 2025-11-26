from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:
        response.data['status_code'] = response.status_code
    elif isinstance(exc, status.HTTP_400_BAD_REQUEST): # Example for specific custom handling
        response = Response({'detail': str(exc), 'status_code': status.HTTP_400_BAD_REQUEST}, status=status.HTTP_400_BAD_REQUEST)
    else:
        # For unhandled exceptions, return a generic server error
        response = Response({'detail': 'An unexpected error occurred.', 'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response