import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';

import { hotelApi } from '../api/hotelApi';

const emptyCategory = {
    title: '',
    description: '',
    price_per_night: '',
    capacity: 2,
    image: '',
};
const emptyRoom = {
    room_number: '',
    floor: 1,
    has_ac: true,
    has_wifi: true,
    is_available: true,
    description: '',
    category_id: '',
};

function AdminPage() {
    const queryClient = useQueryClient();

    const [categoryForm, setCategoryForm] = useState(emptyCategory);
    const [roomForm, setRoomForm] = useState(emptyRoom);

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: hotelApi.getCategories,
    });
    const roomsQuery = useQuery({
        queryKey: ['rooms', { admin: true }],
        queryFn: () => hotelApi.getRooms({ available: '' }),
    });

    const createCategoryMutation = useMutation({
        mutationFn: hotelApi.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setCategoryForm(emptyCategory);
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось создать категорию');
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: hotelApi.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось удалить категорию');
        },
    });
    const createRoomMutation = useMutation({
        mutationFn: hotelApi.createRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setRoomForm(emptyRoom);
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось создать номер');
        },
    });

    const deleteRoomMutation = useMutation({
        mutationFn: hotelApi.deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось удалить номер');
        },
    });

    function handleCategorySubmit(event) {
        event.preventDefault();

        createCategoryMutation.mutate({
            ...categoryForm,
            price_per_night: Number(categoryForm.price_per_night),
            capacity: Number(categoryForm.capacity),
        });
    }
    function handleRoomSubmit(event) {
        event.preventDefault();

        createRoomMutation.mutate({
            ...roomForm,
            floor: Number(roomForm.floor),
            category_id: Number(roomForm.category_id),
        });
    }

    const categories = categoriesQuery.data || [];
    const rooms = roomsQuery.data?.results || [];

    return (
        <section className="admin-page">
            <div className="page-heading compact">
                <div>
                    <p className="eyebrow">Администрирование</p>
                    <h1>Управление категориями</h1>
                    <p className="lead">CRUD-операции выполняются через SQL-запросы backend API.</p>
                </div>

                <div className="summary-card">
                    <ShieldCheck size={24} />
                    <strong>{categories.length} категорий</strong>
                    <span>доступно только администратору</span>
                </div>
            </div>

            <div className="admin-layout">
                <form className="admin-form" onSubmit={handleCategorySubmit}>
                    <h2>
                        <Plus size={20} />
                        Новая категория
                    </h2>

                    <label>
                        Название
                        <input
                            value={categoryForm.title}
                            onChange={(event) => setCategoryForm({ ...categoryForm, title: event.target.value })}
                            required
                        />
                    </label>

                    <label>
                        Описание
                        <textarea
                            value={categoryForm.description}
                            onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
                            rows="4"
                            required
                        />
                    </label>

                    <div className="auth-grid">
                        <label>
                            Цена за ночь
                            <input
                                type="number"
                                value={categoryForm.price_per_night}
                                onChange={(event) => setCategoryForm({ ...categoryForm, price_per_night: event.target.value })}
                                required
                            />
                        </label>

                        <label>
                            Вместимость
                            <input
                                type="number"
                                value={categoryForm.capacity}
                                onChange={(event) => setCategoryForm({ ...categoryForm, capacity: event.target.value })}
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Путь изображения
                        <input
                            value={categoryForm.image}
                            onChange={(event) => setCategoryForm({ ...categoryForm, image: event.target.value })}
                            placeholder="categories/business.jpg"
                        />
                    </label>

                    <button className="primary-button wide" type="submit" disabled={createCategoryMutation.isPending}>
                        {createCategoryMutation.isPending ? 'Создание...' : 'Создать категорию'}
                    </button>
                </form>

                <div className="admin-table">
                    <h2>Список категорий</h2>

                    {categories.map((category) => (
                        <article className="admin-row" key={category.id}>
                            <div>
                                <strong>{category.title}</strong>
                                <span>
                  {Number(category.price_per_night).toLocaleString('ru-RU')} ₽ · до {category.capacity} гостей
                </span>
                            </div>

                            <button
                                className="icon-danger-button"
                                type="button"
                                title="Удалить категорию"
                                onClick={() => deleteCategoryMutation.mutate(category.id)}
                            >
                                <Trash2 size={18} />
                            </button>
                        </article>
                    ))}
                </div>
            </div>
            <div className="admin-layout">
                <form className="admin-form" onSubmit={handleRoomSubmit}>
                    <h2>
                        <Plus size={20} />
                        Новый номер
                    </h2>

                    <div className="auth-grid">
                        <label>
                            Номер
                            <input
                                value={roomForm.room_number}
                                onChange={(event) => setRoomForm({ ...roomForm, room_number: event.target.value })}
                                required
                            />
                        </label>

                        <label>
                            Этаж
                            <input
                                type="number"
                                value={roomForm.floor}
                                onChange={(event) => setRoomForm({ ...roomForm, floor: event.target.value })}
                                required
                            />
                        </label>
                    </div>

                    <label>
                        Категория
                        <select
                            value={roomForm.category_id}
                            onChange={(event) => setRoomForm({ ...roomForm, category_id: event.target.value })}
                            required
                        >
                            <option value="">Выберите категорию</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Описание
                        <textarea
                            value={roomForm.description}
                            onChange={(event) => setRoomForm({ ...roomForm, description: event.target.value })}
                            rows="4"
                        />
                    </label>

                    <div className="checkbox-list">
                        <label>
                            <input
                                type="checkbox"
                                checked={roomForm.has_ac}
                                onChange={(event) => setRoomForm({ ...roomForm, has_ac: event.target.checked })}
                            />
                            Кондиционер
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={roomForm.has_wifi}
                                onChange={(event) => setRoomForm({ ...roomForm, has_wifi: event.target.checked })}
                            />
                            Wi-Fi
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={roomForm.is_available}
                                onChange={(event) => setRoomForm({ ...roomForm, is_available: event.target.checked })}
                            />
                            Доступен
                        </label>
                    </div>

                    <button className="primary-button wide" type="submit" disabled={createRoomMutation.isPending}>
                        {createRoomMutation.isPending ? 'Создание...' : 'Создать номер'}
                    </button>
                </form>

                <div className="admin-table">
                    <h2>Список номеров</h2>

                    {rooms.map((room) => (
                        <article className="admin-row" key={room.id}>
                            <div>
                                <strong>№ {room.room_number} · {room.category_title}</strong>
                                <span>
            {room.floor} этаж · {Number(room.price_per_night).toLocaleString('ru-RU')} ₽ ·{' '}
                                    {room.is_available ? 'доступен' : 'недоступен'}
          </span>
                            </div>

                            <button
                                className="icon-danger-button"
                                type="button"
                                title="Удалить номер"
                                onClick={() => deleteRoomMutation.mutate(room.id)}
                            >
                                <Trash2 size={18} />
                            </button>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AdminPage;