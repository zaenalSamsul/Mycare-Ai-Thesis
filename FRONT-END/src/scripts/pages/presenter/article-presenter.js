export default class ArticlePresenter {
    constructor({ view, articleAPI, authUtils }) {
        this._view = view; // Menyimpan instance dari ArticlePage (view)
        this._articleAPI = articleAPI; // API untuk mengambil data artikel
        this._authUtils = authUtils; // Menyimpan utilitas autentikasi
    }

    async render() {
        try {
            console.log('=== PRESENTER: ARTICLE RENDER START ===');

            // Menampilkan loading saat halaman sedang diproses
            this._view.showLoading();

            // Mendapatkan artikel dari API
            console.log('Fetching article data...');
            const articleData = await this._articleAPI.getArticleById();
            console.log('Fetched article data:', articleData);

            // Merender tampilan artikel
            const content = await this._view.render(articleData);

            // Menyuntikkan konten yang telah dirender ke halaman
            document.getElementById('content').innerHTML = content;

            // Memastikan setelah render, semua interaksi berjalan
            await this.afterRender();

            console.log('=== PRESENTER: ARTICLE RENDER END ===');
        } catch (error) {
            console.error('Error while rendering article:', error);
            this._view.showError('Terjadi kesalahan saat memuat artikel.');
        }
    }

    // Fungsi untuk menangani interaksi setelah halaman selesai dirender
    async afterRender() {
        try {
            console.log('=== PRESENTER: AFTER RENDER ===');

            // Menambahkan event listener atau interaksi lain (misalnya toggle accordion)
            const accordionButtons = document.querySelectorAll('.accordion-button');
            accordionButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const content = this.nextElementSibling;
                    const icon = this.querySelector('.fa-chevron-down');

                    content.classList.toggle('hidden');
                    icon.classList.toggle('rotate-180');
                    this.setAttribute('aria-expanded', content.classList.contains('hidden') ? 'false' : 'true');
                });
            });

            console.log('=== PRESENTER: AFTER RENDER END ===');
        } catch (error) {
            console.error('Error during after render:', error);
            this._view.showError('Terjadi kesalahan saat menambahkan interaksi.');
        }
    }
}