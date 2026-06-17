import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, CircleAlert, RefreshCcw, XCircle } from 'lucide-react';

import { hotelApi } from '../api/hotelApi';

function formatDate(value) {
    return new Date(value).toLocaleDateString('ru-RU');
}

function getStatusText(status) {
    if (status === 'confirmed') {
        return 'Подтверждено';
    }

    if (status === 'cancelled') {
        return 'Отменено';
    }

    if (status === 'completed') {
        return 'Завершено';
    }

    return status;
}

function BookingsPage() {
    const queryClient = useQueryClient();

    const bookingsQuery = useQuery({
        queryKey: ['bookings'],
        queryFn: hotelApi.getBookings,
    });

    const cancelMutation = useMutation({
        mutationFn: hotelApi.cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось отменить бронирование');
        },
    });

    const bookings = bookingsQuery.data || [];

    return (
        <section className="dashboard-page">
            <div className="page-heading compact">
                <div>
                    <p className="eyebrow">Личный кабинет</p>
                    <h1>Мои бронирования</h1>
                    <p className="lead">Здесь собраны ваши активные и отменённые бронирования.</p>
                </div>

                <div className="summary-card">
                    <CalendarCheck size={24} />
                    <strong>{bookings.length} записей</strong>
                    <span>ваши поездки и проживание</span>
                </div>
            </div>

            {bookingsQuery.isLoading && <div className="state-panel">Загрузка бронирований...</div>}

            {bookingsQuery.isError && (
                <div className="state-panel error">
                    <CircleAlert size={18} />
                    Войдите в аккаунт, чтобы увидеть бронирования
                </div>
            )}

            {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 && (
                <div className="empty-panel">
                    <CalendarCheck size={28} />
                    <h2>Бронирований пока нет</h2>
                    <p>Выберите номер в каталоге и оформите первое бронирование.</p>
                </div>
            )}

            <div className="booking-list">
                {bookings.map((booking) => (
                    <article className="booking-item" key={booking.id}>
                        <div>
                            <span className="room-number">№ {booking.room_number}</span>
                            <h2>
                                {formatDate(booking.check_in)} — {formatDate(booking.check_out)}
                            </h2>
                            <p>
                                Статус: <strong>{getStatusText(booking.status)}</strong>
                            </p>
                        </div>

                        <div className="booking-side">
                            <strong>{Number(booking.total_price).toLocaleString('ru-RU')} ₽</strong>
                            {booking.status === 'confirmed' && (
                                <button
                                    className="danger-button"
                                    type="button"
                                    disabled={cancelMutation.isPending}
                                    onClick={() => cancelMutation.mutate(booking.id)}
                                >
                                    {cancelMutation.isPending ? <RefreshCcw size={18} /> : <XCircle size={18} />}
                                    Отменить
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default BookingsPage;