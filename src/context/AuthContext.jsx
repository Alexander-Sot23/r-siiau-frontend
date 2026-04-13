import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user data from localStorage on load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (code, password) => {
        try {
            const formData = new FormData();
            formData.append('sendData', JSON.stringify({ code, password }));

            const response = await api.post('/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            const { token, message, userId, role, firstLogin, lastLogin, email, code: userCode, name } = response.data;

            const userData = {
                userId,
                code: userCode,
                name: name || userCode, // Fallback to code if name is empty
                email,
                role,
                firstLogin,
                lastLogin
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return { success: true, message };
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data?.error || 'Error occurred during login';
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
