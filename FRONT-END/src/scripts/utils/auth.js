import { postRequest } from '../../scripts/data/api.js';
import Storage from './storage.js';

// Register API
export const register = async (name, email, password) => {
    const body = { name, email, password };
    return await postRequest('/auth/register', body);
};

// Login API
export const login = async (email, password) => {
    const body = { email, password };
    return await postRequest('/auth/login', body);
};

// Google Login API (redirect to Google)
export const loginWithGoogle = () => {
    window.location.href = 'https://mycare.yusufabdil.my.id/auth/google';
};

// Logout API
export const logout = () => {
    Storage.clearToken();
    localStorage.removeItem('user');
    window.location.href = '/'; // Arahkan ke landing page setelah logout
};
