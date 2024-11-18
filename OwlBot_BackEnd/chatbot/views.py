from django.shortcuts import render, redirect  # type: ignore
from django.http import JsonResponse  # type: ignore
from django.contrib.auth import authenticate, login, logout  # type: ignore
from django.contrib.auth.decorators import login_required  # type: ignore
from django.contrib import messages  # type: ignore
from .query_handler import get_response

from django.views.decorators.csrf import csrf_exempt
import json

# # Example in chatbot/views.py
# return redirect('chatbot:index')  # Use the namespace 'chatbot' when redirecting to the index


# def chatbot_home(request):
#     return render(request, 'chatbot/home.html')

# def chatbot_query(request):
#     # This function handles AJAX POST requests with user queries
#     if request.method == 'POST':
#         user_query = request.POST.get('user_input')  # Get user input from POST data
#         if user_query:
#             chat_history = request.session.get("chat_history", [])  # Get chat history from session
#             response = get_response(user_query, chat_history)  # Process the query
#             chat_history.append({"user": user_query, "assistant": response})  # Update chat history
#             request.session["chat_history"] = chat_history  # Save updated chat history in session
#             return JsonResponse({"response": response})
#         return JsonResponse({'error': 'No input provided'}, status=400)
#     return JsonResponse({'error': 'Invalid request method.'}, status=400)

# def login_view(request):
#     if request.method == "POST":
#         username = request.POST.get('username')
#         password = request.POST.get('password')
#         user = authenticate(request, username=username, password=password)
#         if user is not None:
#             login(request, user)
#             return redirect('chatbot:index')
#         else:
#             messages.error(request, "Invalid username or password")
#     return render(request, 'chatbot/login.html')

# def logout_view(request):
#     logout(request)
#     return redirect('login')

# @login_required
# def index(request):
#     return render(request, 'chatbot/index.html')  # Render your chatbot's main template

# # Create your views here.
# @login_required
# def query_view(request):
#     if request.method == "POST":
#         user_query = request.POST.get("query")  # Get the query from POST data
#         if user_query:
#             chat_history = request.session.get("chat_history", [])  # Retrieve chat history from session
#             response = get_response(user_query, chat_history)  # Get response from the handler
#             chat_history.append({"user": user_query, "assistant": response})  # Update chat history
#             request.session["chat_history"] = chat_history  # Save updated history in session
#             return JsonResponse({"response": response})  # Return JSON response
#         return JsonResponse({'error': 'No query provided'}, status=400)
#     return JsonResponse({'error': 'Invalid request method.'}, status=400)

user_history = {}


@csrf_exempt
def chat(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_query = data.get("query", "")
            user_id = data.get("user_id", "default")  # Identify the user

            # Initialize history for the user if not present
            if user_id not in user_history:
                user_history[user_id] = []

            # Get response from the chatbot
            assistant_response = get_response(user_query, user_history[user_id])

            # Update the user's conversation history
            user_history[user_id].append(
                {"user": user_query, "assistant": assistant_response}
            )

            return JsonResponse({"response": assistant_response}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)
