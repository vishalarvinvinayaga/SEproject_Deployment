from django.urls import path  # type: ignore
from . import views

app_name = "chatbot"

urlpatterns = [
    # Chatbot Query API
    path("query/", views.chatbot_query, name="chatbot_query"),
    # Admin Login API
    path("admin/login/", views.admin_login, name="admin_login"),
    # Admin Logout API
    path("admin/logout/", views.admin_logout, name="admin_logout"),
]
