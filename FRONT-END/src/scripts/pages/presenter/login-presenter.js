// src/pages/login-presenter.js

export default class LoginPresenter {
    /**
     * @param {object} params
     * @param {object} params.view       – objek dengan method showLoading, showError, showSuccess
     * @param {object} params.authAPI    – referensi ke AuthAPI (Model)
     * @param {object} params.authUtils  – referensi ke util auth { setAuth }
     */
    constructor({ view, authAPI, authUtils }) {
        this._view = view;
        this._authAPI = authAPI;
        this._setAuth = authUtils.setAuth;
    }

    /**
     * Melakukan proses login.
     * @param {{ email: string, password: string }} formData
     */
    async login(formData) {
        // Tampilkan status loading di View
        if (this._view.showLoading) {
            this._view.showLoading();
        }

        // Panggil model (AuthAPI.login)
        try {
            const { error, data, message } = await this._authAPI.login(
                formData
            );

            if (error) {
                // Tampilkan error di View
                this._view.showError(message || "Login gagal.");
                return;
            }

            // Data dari server diasumsikan: { token: '...', user: { name, email, photoUrl? } }
            if (data && data.token) {
                this._setAuth({ token: data.token, user: data.user });
            } else {
                // Fallback jika tidak ada data token
                this._setAuth({
                    token: "temp-token",
                    user: { email: formData.email },
                });
            }

            // Tampilkan success di View (View akan mengatur redirect)
            this._view.showSuccess();
        } catch (error) {
            console.error("Login error:", error);
            this._view.showError(
                "Terjadi kesalahan saat login. Silakan coba lagi."
            );
        }
    }
}
