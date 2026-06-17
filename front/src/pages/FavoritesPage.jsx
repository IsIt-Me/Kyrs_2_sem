import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BedDouble, CircleAlert, Heart, Trash2, Users } from 'lucide-react';

import { hotelApi } from '../api/hotelApi';

function normalizeBoolean(value) {
    return value === true || value === 1;
}
function getImageUrl(imagePath) {
    if (!imagePath) {
        return '/media/categories/standard.jpg';
    }

    return `/media/${imagePath}`;
}

function FavoritesPage() {
    const queryClient = useQueryClient();

    const favoritesQuery = useQuery({
        queryKey: ['favorites'],
        queryFn: hotelApi.getFavorites,
    });

    const deleteMutation = useMutation({
        mutationFn: hotelApi.deleteFavorite,
        onMutate: async (favoriteId) => {
            await queryClient.cancelQueries({ queryKey: ['favorites'] });

            const previousFavorites = queryClient.getQueryData(['favorites']);

            queryClient.setQueryData(['favorites'], (oldFavorites = []) => (
                oldFavorites.filter((favorite) => favorite.id !== favoriteId)
            ));

            return { previousFavorites };
        },
        onError: (error, favoriteId, context) => {
            queryClient.setQueryData(['favorites'], context.previousFavorites);
            alert(error.response?.data?.detail || 'Не удалось удалить из избранного');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });

    const favorites = favoritesQuery.data || [];

    return (
        <section className="dashboard-page">
            <div className="page-heading compact">
                <div>
                    <p className="eyebrow">Личный кабинет</p>
                    <h1>Избранные номера</h1>
                    <p className="lead">Сохранённые номера, к которым можно быстро вернуться перед бронированием.</p>
                </div>

                <div className="summary-card">
                    <Heart size={24} />
                    <strong>{favorites.length} записей</strong>
                    <span>номера, которые вам понравились</span>
                </div>
            </div>

            {favoritesQuery.isLoading && <div className="state-panel">Загрузка избранного...</div>}

            {favoritesQuery.isError && (
                <div className="state-panel error">
                    <CircleAlert size={18} />
                    Войдите в аккаунт, чтобы увидеть избранное
                </div>
            )}

            {!favoritesQuery.isLoading && !favoritesQuery.isError && favorites.length === 0 && (
                <div className="empty-panel">
                    <Heart size={28} />
                    <h2>Избранное пусто</h2>
                    <p>Откройте страницу номера и добавьте его в избранное.</p>
                </div>
            )}

            <div className="favorite-grid">
                {favorites.map((favorite) => (
                    <article className="favorite-card" key={favorite.id}>
                        <div className="favorite-image">
                            <img src={getImageUrl(favorite.category_image)} alt={favorite.category_title} />
                            <span className="hotel-room-number">№ {favorite.room_number}</span>
                            <span className={normalizeBoolean(favorite.is_available) ? 'hotel-badge available' : 'hotel-badge unavailable'}>
    {normalizeBoolean(favorite.is_available) ? 'Доступен' : 'Недоступен'}
  </span>
                        </div>


                        <h2>{favorite.category_title}</h2>
                        <p>{favorite.description || 'Описание номера будет добавлено позже.'}</p>

                        <div className="room-meta">
              <span>
                <Users size={16} />
                до {favorite.capacity} гостей
              </span>
                            <span>
                <BedDouble size={16} />
                                {favorite.floor} этаж
              </span>
                        </div>

                        <div className="room-card-footer">
                            <div>
                                <span className="price">{Number(favorite.price_per_night).toLocaleString('ru-RU')} ₽</span>
                                <small>за ночь</small>
                            </div>

                            <div className="card-actions">
                                <Link className="primary-button" to={`/rooms/${favorite.room_id}`}>
                                    Открыть
                                </Link>
                                <button
                                    className="icon-danger-button"
                                    type="button"
                                    title="Удалить из избранного"
                                    onClick={() => deleteMutation.mutate(favorite.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default FavoritesPage;