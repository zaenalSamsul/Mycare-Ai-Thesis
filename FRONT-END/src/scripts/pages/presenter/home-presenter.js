export default class HomePagePresenter {
    constructor({ view, authUtils, lucideAPI }) {
        this._view = view; // Menyimpan view untuk memperbarui tampilan
        this._authUtils = authUtils; // Menyimpan utils untuk autentikasi
        this._lucideAPI = lucideAPI; // Menyimpan API untuk lucide icons
    }

    // Fungsi untuk merender halaman
    async render() {
        try {
            console.log('=== PRESENTER: RENDER START ===');

            // Menampilkan loading selama proses render
            this._view.showLoading();

            // Mendapatkan status login pengguna
            const user = await this._authUtils.getAuthUser();
            console.log('User status:', user);

            // Render semua bagian halaman
            const landingContent = this._view.renderLandingSection();
            const ctaContent = this._view.renderCtaSection(user);
            const partnerContent = this._view.renderPartnerSection();
            const faqContent = this._view.renderFaqSection();
            const featuresContent = this._view.renderFeaturesSection();
            const footerContent = this._view.renderFooterSection();

            // Gabungkan dan tampilkan halaman
            this._view.render(
                landingContent,
                ctaContent,
                partnerContent,
                faqContent,
                featuresContent,
                footerContent
            );

            // Menambahkan interaktivitas setelah halaman selesai dirender
            this._afterRender();

            console.log('=== PRESENTER: RENDER END ===');
        } catch (error) {
            console.error('Error while rendering:', error);
            this._view.showError('Terjadi kesalahan saat memuat halaman.');
        }
    }

    // Menambahkan event listener dan pengelolaan interaksi lainnya setelah render
    async _afterRender() {
        try {
            // Membuat ikon dengan menggunakan lucide
            await this._lucideAPI.createIcons();

            // Menambahkan event listener untuk toggle accordion
            document.addEventListener('DOMContentLoaded', () => {
                const accordionButtons = document.querySelectorAll('.accordion-button');

                accordionButtons.forEach((button) => {
                    button.addEventListener('click', (e) => {
                        const content = e.target.nextElementSibling;
                        const icon = e.target.querySelector('.fa-chevron-down');

                        // Toggle visibility
                        content.classList.toggle('hidden');
                        icon.classList.toggle('rotate-180');

                        // Update aria-expanded attribute for accessibility
                        const isExpanded = content.classList.contains('hidden') ? 'false' : 'true';
                        e.target.setAttribute('aria-expanded', isExpanded);
                    });
                });
            });

            console.log('=== PRESENTER: AFTER RENDER END ===');
        } catch (error) {
            console.error('Error during after render:', error);
            this._view.showError('Terjadi kesalahan saat menambahkan interaksi.');
        }
    }

    // Fungsi untuk menangani event klik pada tombol Daftar Sekarang
    async handleRegisterClick() {
        try {
            console.log('=== PRESENTER: HANDLE REGISTER CLICK ===');

            // Tampilkan loading saat proses berlangsung
            this._view.showLoading();

            // Proses registrasi (misalnya mengarahkan ke halaman pendaftaran)
            console.log('Mengalihkan ke halaman pendaftaran...');
            window.location.href = '#/register';

            console.log('=== PRESENTER: HANDLE REGISTER CLICK END ===');
        } catch (error) {
            console.error('Error during handleRegisterClick:', error);
            this._view.showError('Gagal mengalihkan ke halaman pendaftaran.');
        }
    }
}