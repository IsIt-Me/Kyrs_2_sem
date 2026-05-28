import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Save, UserRound } from 'lucide-react';

import { authApi } from '../api/authApi';

function ProfilePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        bio: '',
    });

    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: authApi.getProfile,
    });

    useEffect(() => {
        if (profileQuery.data) {
            setFormData({
                first_name: profileQuery.data.first_name || '',
                last_name: profileQuery.data.last_name || '',
                phone: profileQuery.data.phone || '',
                bio: profileQuery.data.bio || '',
            });
        }
    }, [profileQuery.data]);

    const updateMutation = useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            alert('Профиль обновлён');
        },
        onError: (error) => {
            alert(error.response?.data?.detail || 'Не удалось обновить профиль');
        },
    });

    function handleSubmit(event) {
        event.preventDefault();
        updateMutation.mutate(formData);
    }

    function handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        queryClient.clear();
        navigate('/login');
        window.location.reload();
    }

    if (profileQuery.isLoading) {
        return <div className="state-panel">Загрузка профиля...</div>;
    }

    if (profileQuery.isError) {
        return (
            <div className="empty-panel">
                <UserRound size={28} />
                <h2>Войдите в аккаунт</h2>
                <p>Профиль доступен только авторизованному пользователю.</p>
            </div>
        );
    }

    const profile = profileQuery.data;

    return (
        <section className="profile-page">
            <div className="page-heading compact">
                <div>
                    <p className="eyebrow">Личный кабинет</p>
                    <h1>Профиль пользователя</h1>
                    <p className="lead">Данные текущего пользователя загружаются через JWT-защищённый endpoint.</p>
                </div>

                <div className="summary-card">
                    <UserRound size={24} />
                    <strong>{profile.username}</strong>
                    <span>{profile.email}</span>
                </div>
            </div>

            <div className="profile-layout">
                <form className="profile-card" onSubmit={handleSubmit}>
                    <label>
                        Имя
                        <input
                            value={formData.first_name}
                            onChange={(event) => setFormData({ ...formData, first_name: event.target.value })}
                        />
                    </label>

                    <label>
                        Фамилия
                        <input
                            value={formData.last_name}
                            onChange={(event) => setFormData({ ...formData, last_name: event.target.value })}
                        />
                    </label>

                    <label>
                        Телефон
                        <input
                            value={formData.phone}
                            onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        />
                    </label>

                    <label>
                        О себе
                        <textarea
                            value={formData.bio}
                            onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                            rows="5"
                        />
                    </label>

                    <button className="primary-button wide" type="submit" disabled={updateMutation.isPending}>
                        <Save size={18} />
                        {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </form>

                <aside className="profile-side">
                    <h2>Аккаунт</h2>
                    <dl>
                        <div>
                            <dt>Логин</dt>
                            <dd>{profile.username}</dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd>{profile.email}</dd>
                        </div>
                        <div>
                            <dt>Роль</dt>
                            <dd>{profile.is_staff ? 'Администратор' : 'Пользователь'}</dd>
                        </div>
                    </dl>

                    <button className="danger-button wide" type="button" onClick={handleLogout}>
                        <LogOut size={18} />
                        Выйти
                    </button>
                </aside>
            </div>
        </section>
    );
}

export default ProfilePage;