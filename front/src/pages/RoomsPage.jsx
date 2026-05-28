import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BedDouble, Check, Search, SlidersHorizontal, Users, Wifi, Wind } from 'lucide-react';

import { hotelApi } from '../api/hotelApi';
import { Link } from 'react-router-dom';

function normalizeBoolean(value) {
    return value === true || value === 1;
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

        if (count === 1) {
            return '1 номер найден';
        }

        if (count >= 2 && count <= 4) {
            return `${count} номера найдено`;
        }

        return `${count} номеров найдено`;
    }, [roomsData.count]);

    return (
        <section className="rooms-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">Гостиничный комплекс</p>
                    <h1>Каталог номеров</h1>
                    <p className="lead">
                        Выберите номер, проверьте удобства и оформите бронирование без перезагрузки страницы.
                    </p>
                </div>

                <div className="summary-card">
                    <BedDouble size={24} />
                    <strong>{roomsCountText}</strong>
                    <span>данные загружены из MySQL через Django REST API</span>
                </div>
            </div>

            <div className="filters-panel">
                <label className="search-field">
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

                <label className="select-field">
                    <SlidersHorizontal size={18} />
                    <select value={category} onChange={(event) => {
                        setCategory(event.target.value);
                        setPage(1);
                    }}>
                        <option value="">Все категории</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.title}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="select-field">
                    <Check size={18} />
                    <select value={available} onChange={(event) => {
                        setAvailable(event.target.value);
                        setPage(1);
                    }}>
                        <option value="">Все номера</option>
                        <option value="true">Только доступные</option>
                        <option value="false">Недоступные</option>
                    </select>
                </label>
            </div>

            {roomsQuery.isLoading && <div className="state-panel">Загрузка номеров...</div>}
            {roomsQuery.isError && <div className="state-panel error">Не удалось загрузить номера</div>}

            <div className="rooms-grid">
                {rooms.map((room) => (
                    <article className="room-card" key={room.id}>
                        <div className="room-card-top">
                            <span className="room-number">№ {room.room_number}</span>
                            <span className={normalizeBoolean(room.is_available) ? 'status available' : 'status unavailable'}>
                {normalizeBoolean(room.is_available) ? 'Доступен' : 'Недоступен'}
              </span>
                        </div>

                        <h2>{room.category_title}</h2>
                        <p>{room.description || 'Описание номера будет добавлено позже.'}</p>

                        <div className="room-meta">
              <span>
                <Users size={16} />
                до {room.capacity} гостей
              </span>
                            <span>
                <BedDouble size={16} />
                                {room.floor} этаж
              </span>
                            <span>
                <Wifi size={16} />
                                {normalizeBoolean(room.has_wifi) ? 'Wi-Fi' : 'Без Wi-Fi'}
              </span>
                            <span>
                <Wind size={16} />
                                {normalizeBoolean(room.has_ac) ? 'Кондиционер' : 'Без кондиционера'}
              </span>
                        </div>

                        <div className="room-card-footer">
                            <div>
                                <span className="price">{Number(room.price_per_night).toLocaleString('ru-RU')} ₽</span>
                                <small>за ночь</small>
                            </div>
                            <Link className="primary-button" to={`/rooms/${room.id}`}>
                                Подробнее
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
            {roomsData.total_pages > 1 && (
                <div className="pagination-panel">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((currentPage) => currentPage - 1)}
                    >
                        Назад
                    </button>

                    <span>
      Страница {roomsData.page} из {roomsData.total_pages}
    </span>

                    <button
                        type="button"
                        disabled={page >= roomsData.total_pages}
                        onClick={() => setPage((currentPage) => currentPage + 1)}
                    >
                        Вперёд
                    </button>
                </div>
            )}
        </section>
    );
}

export default RoomsPage;