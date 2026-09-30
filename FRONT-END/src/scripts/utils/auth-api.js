import CONFIG from "../config.js";

const AuthApi = {
    async register({ name, email, password }) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.AUTH_API.REGISTER_URL}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                }
            );

            // Baca respons sebagai teks terlebih dahulu
            const responseText = await response.text();

            // Coba parse sebagai JSON jika memungkinkan
            try {
                const jsonData = JSON.parse(responseText);
                // Backend lama dapat mengembalikan token di root atau di `data`.
                // Normalisasi agar presenter selalu menyimpan token dan identitas akun.
                const data = jsonData.data || (jsonData.token
                    ? { token: jsonData.token, user: jsonData.user || { email } }
                    : null);
                return {
                    error: Boolean(jsonData.error) || !response.ok,
                    success: response.ok && jsonData.success !== false,
                    message: jsonData.message,
                    data,
                };
            } catch (e) {
                // Jika bukan JSON, kembalikan format yang konsisten
                return {
                    error: !response.ok,
                    message: responseText,
                    success: response.ok, // Tambahkan flag success
                    data: null, // Tidak ada data token atau user
                };
            }
        } catch (error) {
            return {
                error: true,
                message:
                    "Gagal terhubung ke server. Periksa koneksi internet Anda.",
                success: false,
                data: null,
            };
        }
    },

    async login({ email, password }) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}${CONFIG.AUTH_API.LOGIN_URL}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            // Baca respons sebagai teks terlebih dahulu
            const responseText = await response.text();

            // Coba parse sebagai JSON jika memungkinkan
            try {
                const jsonData = JSON.parse(responseText);
                const data = jsonData.data || (jsonData.token
                    ? { token: jsonData.token, user: jsonData.user || { email } }
                    : null);
                return {
                    error: Boolean(jsonData.error) || !response.ok,
                    success: response.ok && jsonData.success !== false,
                    message: jsonData.message,
                    data,
                };
            } catch (e) {
                // Jika bukan JSON, kembalikan format yang konsisten
                return {
                    error: !response.ok,
                    message: responseText,
                    success: response.ok, // Tambahkan flag success
                    data: response.ok
                        ? { token: "dummy-token", user: { email } }
                        : null,
                };
            }
        } catch (error) {
            return {
                error: true,
                message:
                    "Gagal terhubung ke server. Periksa koneksi internet Anda.",
                success: false,
                data: null,
            };
        }
    },

    async googleLogin(tokenID) {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}${CONFIG.AUTH_API.GOOGLE_AUTH_URL}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: tokenID }),
            }
        );
        return response.json();
    },

    async logout(token) {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}${CONFIG.AUTH_API.LOGOUT_URL}`,
            {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.json();
    },

    loginWithGoogle() {
        // Simpan URL saat ini sebagai redirect_uri setelah login
        const currentUrl = window.location.href.split("#")[0];
        localStorage.setItem("login_redirect", currentUrl);

        // Tambahkan parameter untuk menangani error
        window.location.href = `${CONFIG.API_BASE_URL}${
            CONFIG.AUTH_API.GOOGLE_AUTH_URL
        }?redirect_uri=${encodeURIComponent(currentUrl)}`;
    },

    // Tambahkan metode untuk menangani callback Google
    handleGoogleCallback() {
        // Periksa apakah ada parameter error di URL
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");

        if (error) {
            return {
                error: true,
                message: `Login dengan Google gagal: ${error}`,
                data: null,
            };
        }

        // Ambil token dari URL jika ada
        const token = urlParams.get("token");
        const userData = urlParams.get("user");

        if (token) {
            try {
                const user = userData
                    ? JSON.parse(decodeURIComponent(userData))
                    : { email: "user@example.com" };
                return {
                    error: false,
                    message: "Login dengan Google berhasil",
                    data: { token, user },
                };
            } catch (e) {
                console.error("Error parsing user data:", e);
                return {
                    error: false,
                    message:
                        "Login dengan Google berhasil, tetapi data pengguna tidak valid",
                    data: { token, user: { email: "user@example.com" } },
                };
            }
        }

        return {
            error: true,
            message: "Login dengan Google gagal. Silakan coba lagi.",
            data: null,
        };
    },
};

export default AuthApi;
