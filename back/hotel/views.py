from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from . import sql

class CategoryListAPIView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        categories = sql.get_categories()
        return Response(categories)

    def post(self, request):
        title = request.data.get('title')
        description = request.data.get('description')
        price_per_night = request.data.get('price_per_night')
        capacity = request.data.get('capacity')
        image = request.data.get('image')

        if not title or not description or not price_per_night or not capacity:
            return Response(
                {'detail': 'Заполните title, description, price_per_night и capacity'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = sql.create_category(
            title=title,
            description=description,
            price_per_night=price_per_night,
            capacity=capacity,
            image=image,
        )

        return Response(category, status=status.HTTP_201_CREATED)


class CategoryDetailAPIView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, category_id):
        category = sql.get_category_by_id(category_id)

        if category is None:
            return Response(
                {'detail': 'Категория не найдена'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(category)

    def put(self, request, category_id):
        title = request.data.get('title')
        description = request.data.get('description')
        price_per_night = request.data.get('price_per_night')
        capacity = request.data.get('capacity')
        image = request.data.get('image')

        if not title or not description or not price_per_night or not capacity:
            return Response(
                {'detail': 'Заполните title, description, price_per_night и capacity'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = sql.update_category(
            category_id=category_id,
            title=title,
            description=description,
            price_per_night=price_per_night,
            capacity=capacity,
            image=image,
        )

        if category is None:
            return Response(
                {'detail': 'Категория не найдена'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(category)

    def delete(self, request, category_id):
        deleted = sql.delete_category(category_id)

        if not deleted:
            return Response(
                {'detail': 'Категория не найдена'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class RoomListAPIView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        search = request.query_params.get('search')
        category_id = request.query_params.get('category')
        available = request.query_params.get('available')

        if available == 'true':
            available = True
        elif available == 'false':
            available = False
        else:
            available = None

        rooms = sql.get_rooms(
            search=search,
            category_id=category_id,
            available=available,
        )
        return Response(rooms)

    def post(self, request):
        room_number = request.data.get('room_number')
        floor = request.data.get('floor', 1)
        has_ac = request.data.get('has_ac', True)
        has_wifi = request.data.get('has_wifi', True)
        is_available = request.data.get('is_available', True)
        description = request.data.get('description')
        category_id = request.data.get('category_id')

        if not room_number or not category_id:
            return Response(
                {'detail': 'Заполните room_number и category_id'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = sql.get_category_by_id(category_id)
        if category is None:
            return Response(
                {'detail': 'Категория не найдена'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        room = sql.create_room(
            room_number=room_number,
            floor=floor,
            has_ac=has_ac,
            has_wifi=has_wifi,
            is_available=is_available,
            description=description,
            category_id=category_id,
        )

        return Response(room, status=status.HTTP_201_CREATED)


class RoomDetailAPIView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, room_id):
        room = sql.get_room_by_id(room_id)

        if room is None:
            return Response(
                {'detail': 'Номер не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(room)

    def put(self, request, room_id):
        old_room = sql.get_room_by_id(room_id)

        if old_room is None:
            return Response(
                {'detail': 'Номер не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        room_number = request.data.get('room_number')
        floor = request.data.get('floor', 1)
        has_ac = request.data.get('has_ac', True)
        has_wifi = request.data.get('has_wifi', True)
        is_available = request.data.get('is_available', True)
        description = request.data.get('description')
        category_id = request.data.get('category_id')

        if not room_number or not category_id:
            return Response(
                {'detail': 'Заполните room_number и category_id'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category = sql.get_category_by_id(category_id)
        if category is None:
            return Response(
                {'detail': 'Категория не найдена'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        room = sql.update_room(
            room_id=room_id,
            room_number=room_number,
            floor=floor,
            has_ac=has_ac,
            has_wifi=has_wifi,
            is_available=is_available,
            description=description,
            category_id=category_id,
        )

        return Response(room)

    def delete(self, request, room_id):
        deleted = sql.delete_room(room_id)

        if not deleted:
            return Response(
                {'detail': 'Номер не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class BookingListAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.is_staff:
            user_id = request.query_params.get('user_id')
        else:
            user_id = request.user.id

        bookings = sql.get_bookings(user_id=user_id)
        return Response(bookings)

    def post(self, request):
        check_in_raw = request.data.get('check_in')
        check_out_raw = request.data.get('check_out')
        room_id = request.data.get('room_id')
        user_id = request.user.id

        if not check_in_raw or not check_out_raw or not room_id:
            return Response(
                {'detail': 'Заполните check_in, check_out и room_id'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            check_in = datetime.strptime(check_in_raw, '%Y-%m-%d').date()
            check_out = datetime.strptime(check_out_raw, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'detail': 'Дата должна быть в формате YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if check_in >= check_out:
            return Response(
                {'detail': 'Дата заезда должна быть раньше даты выезда'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        room = sql.get_room_by_id(room_id)
        if room is None:
            return Response(
                {'detail': 'Номер не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not room['is_available']:
            return Response(
                {'detail': 'Номер недоступен для бронирования'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if sql.has_booking_conflict(room_id, check_in, check_out):
            return Response(
                {'detail': 'Номер уже забронирован на выбранные даты'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_price = sql.calculate_booking_price(room_id, check_in, check_out)

        booking = sql.create_booking(
            check_in=check_in,
            check_out=check_out,
            room_id=room_id,
            user_id=user_id,
            total_price=total_price,
        )

        return Response(booking, status=status.HTTP_201_CREATED)


class BookingDetailAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, booking_id):
        booking = sql.get_booking_by_id(booking_id)

        if booking is None:
            return Response(
                {'detail': 'Бронирование не найдено'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(booking)

    def patch(self, request, booking_id):
        action = request.data.get('action')

        if action != 'cancel':
            return Response(
                {'detail': 'Доступное действие: cancel'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = sql.cancel_booking(booking_id)

        if booking is None:
            return Response(
                {'detail': 'Бронирование не найдено'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(booking)

    def delete(self, request, booking_id):
        deleted = sql.delete_booking(booking_id)

        if not deleted:
            return Response(
                {'detail': 'Бронирование не найдено'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)

class RoomReviewListAPIView(APIView):
    def get(self, request, room_id):
        room = sql.get_room_by_id(room_id)

        if room is None:
            return Response(
                {'detail': 'Номер не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        reviews = sql.get_reviews(room_id=room_id)
        return Response(reviews)

    def post(self, request, room_id):
        room = sql.get_room_by_id(room_id)

        if room is None:
            return Response(
                {'detail': 'Номер не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Необходимо авторизоваться'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user_id = request.user.id
        rating = request.data.get('rating')
        text = request.data.get('text')

        if not rating or not text:
            return Response(
                {'detail': 'Заполните rating и text'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            rating = int(rating)
        except ValueError:
            return Response(
                {'detail': 'rating должен быть числом'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rating < 1 or rating > 5:
            return Response(
                {'detail': 'rating должен быть от 1 до 5'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        review = sql.create_review(
            room_id=room_id,
            user_id=user_id,
            rating=rating,
            text=text,
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'room_{room_id}_reviews',
            {
                'type': 'review_created',
                'review': review,
            },
        )

        return Response(review, status=status.HTTP_201_CREATED)


class ReviewDetailAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, review_id):
        review = sql.get_review_by_id(review_id)

        if review is None:
            return Response(
                {'detail': 'Отзыв не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(review)

    def put(self, request, review_id):
        old_review = sql.get_review_by_id(review_id)

        if old_review is None:
            return Response(
                {'detail': 'Отзыв не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if old_review['user_id'] != request.user.id and not request.user.is_staff:
            return Response(
                {'detail': 'Можно редактировать только свой отзыв'},
                status=status.HTTP_403_FORBIDDEN,
            )

        rating = request.data.get('rating')
        text = request.data.get('text')

        if not rating or not text:
            return Response(
                {'detail': 'Заполните rating и text'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            rating = int(rating)
        except ValueError:
            return Response(
                {'detail': 'rating должен быть числом'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rating < 1 or rating > 5:
            return Response(
                {'detail': 'rating должен быть от 1 до 5'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        review = sql.update_review(
            review_id=review_id,
            rating=rating,
            text=text,
        )

        if review is None:
            return Response(
                {'detail': 'Отзыв не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(review)

    def delete(self, request, review_id):
        review = sql.get_review_by_id(review_id)

        if review is None:
            return Response(
                {'detail': 'Отзыв не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if review['user_id'] != request.user.id and not request.user.is_staff:
            return Response(
                {'detail': 'Можно удалить только свой отзыв'},
                status=status.HTTP_403_FORBIDDEN,
            )

        sql.delete_review(review_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

class FavoriteListAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user_id = request.user.id
        favorites = sql.get_favorites(user_id=user_id)
        return Response(favorites)

    def post(self, request):
        user_id = request.user.id
        room_id = request.data.get('room_id')

        if not room_id:
            return Response(
                {'detail': 'Заполните room_id'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        room = sql.get_room_by_id(room_id)
        if room is None:
            return Response(
                {'detail': 'Номер не найден'},
                status=status.HTTP_404_NOT_FOUND,
            )

        favorite = sql.create_favorite(
            user_id=user_id,
            room_id=room_id,
        )

        return Response(favorite, status=status.HTTP_201_CREATED)


class FavoriteDetailAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, favorite_id):
        favorite = sql.get_favorite_by_id(favorite_id)

        if favorite is None:
            return Response(
                {'detail': 'Запись избранного не найдена'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(favorite)

    def delete(self, request, favorite_id):
        deleted = sql.delete_favorite(favorite_id)

        if not deleted:
            return Response(
                {'detail': 'Запись избранного не найдена'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)