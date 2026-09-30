export default class ChatPagePresenter {
    constructor({ view, chatAPI, authUtils }) {
        this._view = view; // Menyimpan tampilan yang akan di-render
        this._chatAPI = chatAPI; // Menyimpan API yang menangani data chat
        this._authUtils = authUtils; // Menyimpan utilitas autentikasi
    }

    // Fungsi untuk merender halaman chat
    async render() {
        try {
            console.log('=== PRESENTER: CHAT RENDER START ===');

            // Menampilkan loading
            this._view.showLoading();

            // Mendapatkan data pengguna (misalnya apakah mereka login)
            const user = await this._authUtils.getAuthUser();
            console.log('User data:', user);

            // Merender tampilan halaman chat
            const chatContent = await this._view.render();
            document.getElementById('app').innerHTML = chatContent;

            // Menyelesaikan interaksi setelah render
            await this.afterRender();

            console.log('=== PRESENTER: CHAT RENDER END ===');
        } catch (error) {
            console.error('Error while rendering chat:', error);
            this._view.showError('Terjadi kesalahan saat memuat halaman chat.');
        }
    }

    // Fungsi untuk menangani interaksi setelah halaman selesai dirender
    async afterRender() {
        console.log('=== PRESENTER: AFTER RENDER ===');

        // Panggil metode afterRender pada view
        await this._view.afterRender();

        // Fokuskan input message setelah halaman dirender
        const messageInput = document.getElementById('messageInput');
        messageInput.focus();

        // Event listener atau logika tambahan bisa ditambahkan di sini
        document.getElementById('sendButton').addEventListener('click', () => {
            this.sendMessage();
        });
    }

    // Fungsi untuk menangani pengiriman pesan
    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (message) {
            console.log("Sending message:", message);

            // Reset input setelah mengirim pesan
            input.value = "";
            input.style.height = "auto";
            document.getElementById('sendButton').disabled = true;
        }
    }
}