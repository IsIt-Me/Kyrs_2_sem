import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, UserPlus } from 'lucide-react';

import { authApi } from '../api/authApi';

function LoginPage() {
    const navigate = useNavigate();

    const [mode, setMode] = useState('login');
    const [loginData, setLoginData] = useState({
        username: '',
        password: '',
    });
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(event) {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const tokens = await authApi.login(loginData);

            localStorage.setItem('accessToken', tokens.access);
            localStorage.setItem('refreshToken', tokens.refresh);

            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.detail || 'Не удалось войти');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRegister(event) {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authApi.register(registerData);

            const tokens = await authApi.login({
                username: registerData.username,
                password: registerData.password,
            });

            localStorage.setItem('accessToken', tokens.access);
            localStorage.setItem('refreshToken', tokens.refresh);

            navigate('/');
            window.location.reload();
        } catch (err) {
            const data = err.response?.data;
            setError(
                data?.username?.[0]
                || data?.email?.[0]
                || data?.password?.[0]
                || data?.detail
                || 'Не удалось зарегистрироваться',
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-heading">
          <span className="brand-mark">
            <Building2 size={24} />
          </span>
                    <div>
                        <h1>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
                        <p>JWT-авторизация для бронирований, отзывов и избранного</p>
                    </div>
                </div>

                <div className="auth-tabs">
                    <button
                        className={mode === 'login' ? 'active' : ''}
                        type="button"
                        onClick={() => setMode('login')}
                    >
                        <LogIn size={18} />
                        Войти
                    </button>
                    <button
                        className={mode === 'register' ? 'active' : ''}
                        type="button"
                        onClick={() => setMode('register')}
                    >
                        <UserPlus size={18} />
                        Создать аккаунт
                    </button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                {mode === 'login' ? (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <label>
                            Логин
                            <input
                                value={loginData.username}
                                onChange={(event) => setLoginData({ ...loginData, username: event.target.value })}
                                placeholder="ivan"
                            />
                        </label>

                        <label>
                            Пароль
                            <input
                                type="password"
                                value={loginData.password}
                                onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
                                placeholder="ivan12345"
                            />
                        </label>

                        <button className="primary-button wide" type="submit" disabled={isLoading}>
                            {isLoading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={handleRegister}>
                        <label>
                            Логин
                            <input
                                value={registerData.username}
                                onChange={(event) => setRegisterData({ ...registerData, username: event.target.value })}
                            />
                        </label>

                        <label>
                            Email
                            <input
                                type="email"
                                value={registerData.email}
                                onChange={(event) => setRegisterData({ ...registerData, email: event.target.value })}
                            />
                        </label>

                        <label>
                            Пароль
                            <input
                                type="password"
                                value={registerData.password}
                                onChange={(event) => setRegisterData({ ...registerData, password: event.target.value })}
                            />
                        </label>

                        <div className="auth-grid">
                            <label>
                                Имя
                                <input
                                    value={registerData.first_name}
                                    onChange={(event) => setRegisterData({ ...registerData, first_name: event.target.value })}
                                />
                            </label>

                            <label>
                                Фамилия
                                <input
                                    value={registerData.last_name}
                                    onChange={(event) => setRegisterData({ ...registerData, last_name: event.target.value })}
                                />
                            </label>
                        </div>

                        <label>
                            Телефон
                            <input
                                value={registerData.phone}
                                onChange={(event) => setRegisterData({ ...registerData, phone: event.target.value })}
                            />
                        </label>

                        <button className="primary-button wide" type="submit" disabled={isLoading}>
                            {isLoading ? 'Создание...' : 'Зарегистрироваться'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}

export default LoginPage;