from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    """
    Custom permission to only allow students to access it.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'

class IsAdvisor(permissions.BasePermission):
    """
    Custom permission to only allow advisors to access it.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'advisor'

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow administrators to access it.
    Also allows Django superusers.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_superuser)