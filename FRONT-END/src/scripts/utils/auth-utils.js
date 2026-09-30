import Storage from "./storage.js";

/**
 * Menyimpan data autentikasi (token dan user) ke storage
 * @param {{ token: string, user: object }} authData
 */
export function setAuth(authData) {
    if (authData && authData.token) {
        Storage.saveToken(authData.token);
        localStorage.setItem("user", JSON.stringify(authData.user || {}));
    }
}

/**
 * Mengambil data user dari storage
 * @returns {object|null}
 */
export function getUser() {
    try {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error("Error parsing user data:", e);
        return null;
    }
}

/**
 * Mengecek apakah user sudah login
 * @returns {boolean}
 */
export function isLoggedIn() {
    return !!Storage.getToken();
}

/**
 * Menghapus data autentikasi dari storage
 */
export function clearAuth() {
    Storage.clearToken();
    localStorage.removeItem("user");
}
