import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    BedDouble,
    Check,
    Search,
    SlidersHorizontal,
    Users,
    Wifi,
    Wind,
} from 'lucide-react';

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

function RoomsPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [available, setAvailable] = useState('true');
    const [page, setPage] = useState(1);

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: hotelApi.getCategories,
    });

    const roomsQuery = useQuery({
        queryKey: ['rooms', { search, category, available, page }],
        queryFn: () => hotelApi.getRooms({ search, category, available, page, pageSize: 6 }),
    });

    const categories = categoriesQuery.data || [];

    const roomsData = roomsQuery.data || {
        count: 0,
        page: 1,
        page_size: 6,
        total_pages: 1,
        results: [],
    };

    const rooms = roomsData.results;

    const roomsCountText = useMemo(() => {
        const count = roomsData.count;

        if (count === 1) return '1 номер найден';
        if (count >= 2 && count <= 4) return `${count} номера найдено`;

        return `${count} номеров найдено`;
    }, [roomsData.count]);

    return (
        <section className="rooms-page hotel-redesign">
            <section className="hotel-hero">
                <div className="hotel-hero-overlay" />

                <div className="hotel-hero-content">
                    <p className="hotel-kicker">Банно-гостиничный комплекс</p>
                    <h1>Каталог номеров</h1>
                    <p>
                        Выберите подходящий номер, проверьте удобства и оформите бронирование онлайн.
                    </p>
                </div>

                <div className="hotel-hero-stat">
                    <BedDouble size={28} />
                    <strong>{roomsCountText}</strong>
                    <span>подберите номер под свой отдых</span>
                </div>
            </section>

            <div className="hotel-filters">
                <label className="hotel-search">
                    <Search size={18} />
                    <input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder="Поиск по номеру, категории или описанию"
                    />
                </label>

                <label className="hotel-select">
                    <SlidersHorizontal size={18} />
                    <select
                        value={category}
                        onChange={(event) => {
                            setCategory(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Все категории</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.title}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="hotel-select">
                    <Check size={18} />
                    <select
                        value={available}
                        onChange={(event) => {
                            setAvailable(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Все номера</option>
                        <option value="true">Только доступные</option>
                        <option value="false">Недоступные</option>
                    </select>
                </label>
            </div>

            {roomsQuery.isLoading && <div className="state-panel">Загрузка номеров...</div>}
            {roomsQuery.isError && <div className="state-panel error">Не удалось загрузить номера</div>}

            <div className="hotel-room-grid">
                {rooms.map((room) => (
                    <article className="hotel-room-card" key={room.id}>
                        <div className="hotel-room-image">
                            <img src={getImageUrl(room.category_image)} alt={room.category_title} />
                            <span className="hotel-room-number">№ {room.room_number}</span>
                            <span className={normalizeBoolean(room.is_available) ? 'hotel-badge available' : 'hotel-badge unavailable'}>
                {normalizeBoolean(room.is_available) ? 'Доступен' : 'Недоступен'}
              </span>
                        </div>

                        <div className="hotel-room-body">
                            <h2>{room.category_title}</h2>
                            <p>{room.description || 'Описание номера будет добавлено позже.'}</p>

                            <div className="hotel-room-meta">
                                <span><Users size={16} /> до {room.capacity} гостей</span>
                                <span><BedDouble size={16} /> {room.floor} этаж</span>
                                <span><Wifi size={16} /> {normalizeBoolean(room.has_wifi) ? 'Wi-Fi' : 'Без Wi-Fi'}</span>
                                <span><Wind size={16} /> {normalizeBoolean(room.has_ac) ? 'Кондиционер' : 'Без кондиционера'}</span>
                            </div>

                            <div className="hotel-room-footer">
                                <div>
                                    <strong>{Number(room.price_per_night).toLocaleString('ru-RU')} ₽</strong>
                                    <small>за ночь</small>
                                </div>

                                <Link className="hotel-button" to={`/rooms/${room.id}`}>
                                    Подробнее
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {roomsData.total_pages > 1 && (
                <div className="pagination-panel">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                        Назад
                    </button>

                    <span>Страница {roomsData.page} из {roomsData.total_pages}</span>

                    <button
                        type="button"
                        disabled={page >= roomsData.total_pages}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        Вперёд
                    </button>
                </div>
            )}
        </section>
    );
}

export default RoomsPage;