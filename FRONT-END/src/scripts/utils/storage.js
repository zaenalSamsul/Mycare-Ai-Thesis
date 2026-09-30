const Storage = {
    saveToken(token) {
        localStorage.setItem('accessToken', token);
        // Modul API lama memakai key `token`; simpan keduanya agar autentikasi konsisten.
        localStorage.setItem('token', token);
    },
    getToken() {
        return localStorage.getItem('accessToken') || localStorage.getItem('token');
    },
    clearToken() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
    },
    getAccountScope() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const identifier = user?.id || user?._id || user?.email || user?.username;
            if (identifier) return `account-${String(identifier).toLowerCase()}`;
        } catch (error) {
            console.warn('Data akun lokal tidak valid:', error);
        }

        try {
            const token = this.getToken();
            const payload = token?.split('.')?.[1];
            if (payload) {
                const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
                const identifier = decoded.sub || decoded.id || decoded.email;
                if (identifier) return `account-${String(identifier).toLowerCase()}`;
            }
        } catch {
            // Token bukan JWT atau payload tidak tersedia; gunakan scope tamu.
        }

        // Pengguna belum login tetap dipisahkan dari akun yang sudah login.
        return 'guest';
    },
    getScopedKey(namespace) {
        return `mycareai:${namespace}:${this.getAccountScope()}`;
    },
};

export default Storage;
