// src/pages/register-presenter.js

export default class RegisterPresenter {
    /**
     * @param {object} params
     * @param {object} params.view      – objek dengan method showLoading, showError, showSuccess
     * @param {object} params.authAPI   – referensi ke AuthAPI (Model)
     * @param {object} params.authUtils – referensi berisi { setAuth }
     */
    constructor({ view, authAPI, authUtils }) {
        this._view = view;
        this._authAPI = authAPI;
        this._setAuth = authUtils.setAuth;
    }

    /**
     * @param {{ username: string, email: string, password: string, confirmPassword: string }} formData
     */
    async register(formData) {
        this._view.showLoading();

        // Validasi sederhana: password dan confirmPassword harus sama
        if (formData.password !== formData.confirmPassword) {
            this._view.showError("Kata sandi dan konfirmasi tidak cocok.");
            return;
        }

        // Panggil Model untuk register
        const result = await this._authAPI.register({
            name: formData.username,
            email: formData.email,
            password: formData.password,
        });

        // Jika ada error atau respons tidak sukses
        if (result.error) {
            this._view.showError(result.message || "Registrasi gagal.");
            return;
        }

        // Jika respons berhasil tapi tidak ada data token (respons "User registered")
        // Langsung tampilkan sukses tanpa menyimpan token
        this._view.showSuccess();
    }
}
