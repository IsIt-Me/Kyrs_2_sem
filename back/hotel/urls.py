from django.urls import path


from .views import (
    CategoryDetailAPIView,
    CategoryListAPIView,
    RoomDetailAPIView,
    RoomListAPIView,
    BookingDetailAPIView,
    BookingListAPIView,
    ReviewDetailAPIView,
    RoomReviewListAPIView,
    FavoriteDetailAPIView,
    FavoriteListAPIView,
)

urlpatterns = [
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('categories/<int:category_id>/', CategoryDetailAPIView.as_view(), name='category-detail'),

    path('rooms/', RoomListAPIView.as_view(), name='room-list'),
    path('rooms/<int:room_id>/', RoomDetailAPIView.as_view(), name='room-detail'),

    path('bookings/', BookingListAPIView.as_view(), name='booking-list'),
    path('bookings/<int:booking_id>/', BookingDetailAPIView.as_view(), name='booking-detail'),

    path('rooms/<int:room_id>/reviews/', RoomReviewListAPIView.as_view(), name='room-review-list'),
    path('reviews/<int:review_id>/', ReviewDetailAPIView.as_view(), name='review-detail'),

    path('favorites/', FavoriteListAPIView.as_view(), name='favorite-list'),
    path('favorites/<int:favorite_id>/', FavoriteDetailAPIView.as_view(), name='favorite-detail'),
]