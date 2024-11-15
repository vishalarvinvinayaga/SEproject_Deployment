from django.urls import path # type: ignore
from . import views

app_name = 'chatbot'

urlpatterns = [
    path('', views.chatbot_home, name='chatbot_home'),  # Homepage
    path('index/', views.index, name='index'),  # Main chatbot page
    path('api/query/', views.chatbot_query, name='chatbot_query'),  # Endpoint for chatbot query
    path('api/handle_query/', views.query_view, name='handle_query'),  # Endpoint for handling user queries
]
