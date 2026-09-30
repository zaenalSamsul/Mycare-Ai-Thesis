export default class ArticlePage {
    async render(articleData) {
        return `
      <div class="sticky top-0 z-50 bg-white border border-b border-gray-200">
        <div class="px-16 py-4 flex justify-between items-center">
          <div>
            <img src="./public/images/Wrapper.png" alt="Logo" class="h-10" />
          </div>
          <nav class="flex-1">
            <ul class="flex flex-row justify-center space-x-8 font-medium">
              <li><a href="#" class="text-gray-700 hover:text-blue-700 transition">Pustaka Edukasi</a></li>
              <li><a href="#" class="text-gray-700 hover:text-blue-700 transition">Catatan Emosi</a></li>
              <li><a href="#" class="text-gray-700 hover:text-blue-700 transition">Curhat Sekarang</a></li>
              <li><a href="#" class="text-gray-700 hover:text-blue-700 transition">Tentang</a></li>
            </ul>
          </nav>
          <div>
            <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Daftar Sekarang</button>
          </div>
        </div>
      </div>
      
      <div class="px-20 w-full flex flex-col h-full mt-4 mb-20">
        <div class="h-[600px] w-full">
          <img src="${articleData.imageUrl}" alt="${articleData.title}" class="h-full w-full rounded-xl object-cover" />
        </div>
        <div class="px-10 py-5">
          <div class="flex items-center text-sm text-gray-500 space-x-2 mb-6">
            <a href="/" class="hover:text-blue-600 transition">Home</a>
            <span class="text-gray-400">/</span>
            <a href="/artikel" class="hover:text-blue-600 transition">Artikel</a>
            <span class="text-gray-400">/</span>
            <span class="text-gray-700 font-medium">${articleData.title}</span>
          </div>

          <div class="grid grid-cols-3 gap-8">
            <div class="col-span-2 flex flex-col">
              <h1 class="font-bold text-3xl leading-tight mb-4">${articleData.title}</h1>

              <div class="mt-3 flex items-center space-x-5 mb-6">
                <img src="${articleData.authorAvatar}" alt="Avatar" class="w-16 h-16 rounded-full object-cover" />
                <div class="flex flex-col">
                  <span class="font-bold text-lg">${articleData.author}</span>
                  <div class="flex items-center space-x-4 text-gray-600">
                    <span class="text-sm">${articleData.date}</span>
                    <span class="text-sm">${articleData.readingTime}</span>
                  </div>
                </div>
              </div>
              <div class="prose prose-lg max-w-none">
                <p class="text-gray-700 leading-relaxed">${articleData.content}</p>

                <h3 class="text-xl font-bold text-gray-800 mt-8 mb-4">Dampak Klinis dan Pencegahan</h3>
                <p class="text-gray-700 leading-relaxed">${articleData.prevention}</p>

                <h3 class="text-xl font-bold text-gray-800 mt-8 mb-4">Kesimpulan</h3>
                <p class="text-gray-700 leading-relaxed">${articleData.conclusion}</p>
              </div>
            </div>
            <div class="flex flex-col space-y-6">
              <div class="bg-white rounded-xl p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-4">Bagikan Artikel</h3>
                <div class="flex flex-col space-y-3">
                  <button class="flex items-center space-x-3 w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <i class="fab fa-facebook-f"></i>
                    <span>Facebook</span>
                  </button>
                  <button class="flex items-center space-x-3 w-full p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">
                    <i class="fab fa-twitter"></i>
                    <span>Twitter</span>
                  </button>
                  <button class="flex items-center space-x-3 w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              <div class="p-4">
                <h3 class="font-bold text-lg mb-4">Artikel Terkait</h3>
                <div class="space-y-4">
                  <div class="bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02]">
                    <div class="h-48 overflow-hidden">
                      <img src="${articleData.relatedArticles[0].imageUrl}" alt="Artikel Terkait 1" class="w-full h-full object-cover" />
                    </div>
                    <div class="p-5">
                      <span class="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Kesehatan Mental</span>
                      <h3 class="font-bold text-lg mt-2">${articleData.relatedArticles[0].title}</h3>
                      <p class="text-gray-600 text-sm mt-2 line-clamp-3">${articleData.relatedArticles[0].summary}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    // Fungsi untuk menambahkan event listener atau interaksi setelah halaman selesai dirender
    async afterRender() {
        console.log("=== ARTICLE PAGE: afterRender ===");

        // Menambahkan event listener untuk toggle accordion
        const accordionButtons = document.querySelectorAll(".accordion-button");
        accordionButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const content = this.nextElementSibling;
                const icon = this.querySelector(".fa-chevron-down");

                content.classList.toggle("hidden");
                icon.classList.toggle("rotate-180");
                this.setAttribute("aria-expanded", content.classList.contains("hidden") ? "false" : "true");
            });
        });
    }
}