from django.shortcuts import render, redirect  # type: ignore
from django.http import JsonResponse  # type: ignore
from django.contrib.auth import authenticate, login, logout  # type: ignore
from django.contrib.auth.decorators import login_required  # type: ignore
from django.contrib import messages  # type: ignore
from django.contrib.auth.models import User
from .query_handler import get_response
from django.views.decorators.csrf import csrf_exempt  # type: ignore
import json
from rest_framework_simplejwt.tokens import RefreshToken


@csrf_exempt
def chatbot_query(request):
    if request.method == "POST":
        try:
            # Parse JSON body
            data = json.loads(request.body)

            # Extract 'user_input' from JSON
            user_query = data.get("user_input")

            if user_query:
                # Get chat history from session
                chat_history = request.session.get("chat_history", [])

                # Process the query
                response = get_response(user_query, chat_history)

                # Update chat history
                chat_history.append({"user": user_query, "assistant": response})

                # Save updated chat history in session
                request.session["chat_history"] = chat_history
                return JsonResponse({"response": response})

            return JsonResponse({"error": "No input provided"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=400)


@csrf_exempt
def admin_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
            if not username or not password:
                return JsonResponse(
                    {"error": "Username and password are required."}, status=400
                )

            # Authenticate admin user
            user = authenticate(request, username=username, password=password)
            if user and user.is_staff:  # Check if the user is an admin
                refresh = RefreshToken.for_user(user)
                return JsonResponse(
                    {
                        "token": str(refresh.access_token),
                        "refresh": str(refresh),
                        "username": user.username,
                    }
                )
            else:
                return JsonResponse(
                    {"error": "Invalid credentials or not an admin."}, status=401
                )
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=400)


@csrf_exempt
def admin_logout(request):
    if request.method == "POST":
        return JsonResponse({"message": "Logged out successfully."}, status=200)

    return JsonResponse({"error": "Invalid request method."}, status=400)
