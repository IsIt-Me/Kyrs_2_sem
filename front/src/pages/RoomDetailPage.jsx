import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BedDouble, CalendarCheck, Heart, MessageSquare, Send, Users, Wifi, Wind } from 'lucide-react';

import { hotelApi } from '../api/hotelApi';

function normalizeBoolean(value) {
    return value === true || value === 1;
}

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function RoomDetailPage() {
    const { roomId } = useParams();
    const queryClient = useQueryClient();

    const [checkIn, setCheckIn] = useState(getToday());
    const [checkOut, setCheckOut] = useState('');
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');

    const roomQuery = useQuery({
        queryKey: ['room', roomId],
        queryFn: () => hotelApi.getRoom(roomId),
    });

    const reviewsQuery = useQuery({
        queryKey: ['roomReviews', roomId],
        queryFn: () => hotelApi.getRoomReviews(roomId),
    });

    useEffect(() => {
        const socket = new WebSocket(`ws://127.0.0.1:8001/ws/rooms/${roomId}/reviews/`);

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'review_created') {
                queryClient.setQueryData(['roomReviews', roomId], (oldReviews = []) => {
                    const exists = oldReviews.some((review) => review.id === message.review.id);

                    if (exists) {
                        return oldReviews;
                    }

                    return [message.review, ...oldReviews];
                });
            }
        };

        return () => socket.close();
    }, [queryClient, roomId]);

    const bookingMutation = useMutation({
        mutationFn: hotelApi.createBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            alert('Бронирование создано');
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось создать бронирование');
        },
    });

    const reviewMutation = useMutation({
        mutationFn: hotelApi.createReview,
        onSuccess: (newReview) => {
            queryClient.setQueryData(['roomReviews', roomId], (oldReviews = []) => {
                const exists = oldReviews.some((review) => review.id === newReview.id);
                return exists ? oldReviews : [newReview, ...oldReviews];
            });
            setReviewText('');
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось добавить отзыв');
        },
    });

    const favoriteMutation = useMutation({
        mutationFn: hotelApi.addFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            alert('Номер добавлен в избранное');
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось добавить в избранное');
        },
    });

    const room = roomQuery.data;
    const reviews = reviewsQuery.data || [];

    const averageRating = useMemo(() => {
        if (!reviews.length) {
            return 'нет отзывов';
        }

        const sum = reviews.reduce((acc, review) => acc + Number(review.rating), 0);
        return `${(sum / reviews.length).toFixed(1)} из 5`;
    }, [reviews]);

    function handleBookingSubmit(event) {
        event.preventDefault();

        bookingMutation.mutate({
            roomId: Number(roomId),
            checkIn,
            checkOut,
        });
    }

    function handleReviewSubmit(event) {
        event.preventDefault();

        reviewMutation.mutate({
            roomId: Number(roomId),
            rating: Number(rating),
            text: reviewText,
        });
    }

    if (roomQuery.isLoading) {
        return <div className="state-panel">Загрузка номера...</div>;
    }

    if (roomQuery.isError || !room) {
        return <div className="state-panel error">Номер не найден</div>;
    }

    return (
        <section className="detail-page">
            <Link className="back-link" to="/">
                <ArrowLeft size={18} />
                Назад к каталогу
            </Link>

            <div className="detail-layout">
                <article className="detail-main">
                    <div className="room-card-top">
                        <span className="room-number">№ {room.room_number}</span>
                        <span className={normalizeBoolean(room.is_available) ? 'status available' : 'status unavailable'}>
              {normalizeBoolean(room.is_available) ? 'Доступен' : 'Недоступен'}
            </span>
                    </div>

                    <h1>{room.category_title}</h1>
                    <p className="lead">{room.description || room.category_description}</p>

                    <div className="detail-stats">
            <span>
              <Users size={18} />
              до {room.capacity} гостей
            </span>
                        <span>
              <BedDouble size={18} />
                            {room.floor} этаж
            </span>
                        <span>
              <Wifi size={18} />
                            {normalizeBoolean(room.has_wifi) ? 'Wi-Fi' : 'Без Wi-Fi'}
            </span>
                        <span>
              <Wind size={18} />
                            {normalizeBoolean(room.has_ac) ? 'Кондиционер' : 'Без кондиционера'}
            </span>
                    </div>

                    <div className="detail-price">
                        <strong>{Number(room.price_per_night).toLocaleString('ru-RU')} ₽</strong>
                        <span>за ночь</span>
                    </div>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={() => favoriteMutation.mutate(Number(roomId))}
                    >
                        <Heart size={18} />
                        В избранное
                    </button>
                </article>

                <aside className="booking-panel">
                    <h2>
                        <CalendarCheck size={22} />
                        Бронирование
                    </h2>

                    <form onSubmit={handleBookingSubmit}>
                        <label>
                            Заезд
                            <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
                        </label>

                        <label>
                            Выезд
                            <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
                        </label>

                        <button className="primary-button wide" type="submit" disabled={bookingMutation.isPending}>
                            {bookingMutation.isPending ? 'Создание...' : 'Забронировать'}
                        </button>
                    </form>
                </aside>
            </div>

            <section className="reviews-section">
                <div className="section-title">
                    <div>
                        <h2>Отзывы</h2>
                        <p>{reviews.length} отзывов, средняя оценка {averageRating}</p>
                    </div>
                    <MessageSquare size={24} />
                </div>

                <form className="review-form" onSubmit={handleReviewSubmit}>
                    <select value={rating} onChange={(event) => setRating(event.target.value)}>
                        <option value="5">5 — отлично</option>
                        <option value="4">4 — хорошо</option>
                        <option value="3">3 — нормально</option>
                        <option value="2">2 — плохо</option>
                        <option value="1">1 — очень плохо</option>
                    </select>

                    <input
                        value={reviewText}
                        onChange={(event) => setReviewText(event.target.value)}
                        placeholder="Напишите отзыв"
                    />

                    <button className="primary-button" type="submit" disabled={reviewMutation.isPending}>
                        <Send size={18} />
                        Отправить
                    </button>
                </form>

                <div className="reviews-list">
                    {reviews.map((review) => (
                        <article className="review-item" key={review.id}>
                            <div>
                                <strong>{review.username}</strong>
                                <span>{review.rating}/5</span>
                            </div>
                            <p>{review.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}

export default RoomDetailPage;