from django.urls import path

from .consumers import RoomReviewConsumer

websocket_urlpatterns = [
    path('ws/rooms/<int:room_id>/reviews/', RoomReviewConsumer.as_asgi()),
]