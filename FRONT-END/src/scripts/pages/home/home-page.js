import { isLoggedIn, getUser, clearAuth } from "../../utils/auth-utils.js";

export default class HomePage {
    async render() {
        const userLoggedIn = isLoggedIn();
        const userData = getUser();

        const articles = [
            {
                id: 1,
                category: "anger",
                categoryLabel: "Anger",
                categoryColor: "red",
                title: "mengapa-marah-dan-melepas-emosi-penting",
                source: "kompas.id",
                description:
                    "Artikel ini membahas pentingnya meluapkan emosi seperti kemarahan agar tidak menumpuk akibat tekanan sehari-hari. Disoroti pula berbagai cara menyalurkan emosi secara sehat, seperti melalui aktivitas fisik atau ruang pelampiasan seperti Breakroom",
                date: "2022",
                image: "https://picsum.photos/seed/anger1/400/300",
                link: "https://www.kompas.id/baca/gaya-hidup/2024/08/04/mengapa-marah-dan-melepas-emosi-penting",
            },
            {
                id: 2,
                category: "anger",
                categoryLabel: "Anger",
                categoryColor: "red",
                title: "penyebab-seseorang-bisa-punya-anger-issues",
                source: "antaranews",
                description:
                    "Berbagai faktor seperti trauma masa lalu, stres, gangguan mental, dan kehilangan dapat menyebabkan seseorang mengalami anger issues atau kesulitan mengendalikan amarah.",
                date: "2023",
                image: "https://picsum.photos/seed/anger2/400/300",
                link: "https://www.antaranews.com/berita/4791069/penyebab-seseorang-bisa-punya-anger-issues",
            },
            {
                id: 3,
                category: "anger",
                categoryLabel: "Anger",
                categoryColor: "red",
                title: "Control anger before it controls you",
                source: "Mindful.org",
                description:
                    "Artikel dari American Psychological Association ini menjelaskan cara mengenali, mengelola, dan mengendalikan kemarahan agar tidak berdampak negatif pada kesehatan mental dan hubungan sosial. Disertai dengan teknik relaksasi, restrukturisasi kognitif, dan pemahaman ilmiah tentang penyebab kemarahan.",
                date: "2023",
                image: "https://picsum.photos/seed/anger3/400/300",
                link: "https://www.apa.org/topics/anger/control",
            },
            {
                id: 4,
                category: "anger",
                categoryLabel: "Anger",
                categoryColor: "red",
                title: "Anxiety and Anger: Exploring the Relationship",
                source: "Talkspace",
                description:
                    "Talkspace membahas keterampilan mengatasi yang membantu mengatur emosi dan mengelola stres yang menyebabkan kecemasan dan kemarahan.",
                date: "2024",
                image: "https://picsum.photos/seed/anger4/400/300",
                link: "https://www.talkspace.com/mental-health/conditions/articles/anxiety-and-anger/",
            },
            {
                id: 5,
                category: "anger",
                categoryLabel: "Anger",
                categoryColor: "red",
                title: "Anxiety and Anger: How They're Connected",
                source: "Discovery Mood & Anxiety Program",
                description:
                    "Discovery Mood & Anxiety Program menjelaskan bagaimana terapi untuk gangguan kecemasan dapat membantu mengungkap alasan kemarahan seseorang.",
                date: "2024",
                image: "https://picsum.photos/seed/anger5/400/300",
                link: "https://discoverymood.com/blog/anxiety-and-anger/",
            },
            // Artikel Fear
            {
                id: 6,
                category: "fear",
                categoryLabel: "Fear",
                categoryColor: "purple",
                title: "How to manage fear and anxiety",
                source: "Mental Health Foundation UK",
                description:
                    "Panduan lengkap untuk memahami perbedaan antara rasa takut dan cemas, jenis-jenis kecemasan, serta langkah praktis untuk mengelola dan menghadapinya.",
               date: "2024",
                image: "https://picsum.photos/seed/fear1/400/300",
                link: "https://www.mentalhealth.org.uk/explore-mental-health/publications/how-overcome-anxiety-and-fear",
            },
            {
                id: 7,
                category: "fear",
                categoryLabel: "Fear",
                categoryColor: "purple",
                title: "One habit could reduce your fears of public speaking, criticism, failure and more",
                source: "VeryWellMind",
                description:
                    "Artikel ini mengulas bagaimana praktik mindfulness secara signifikan dapat membantu mengatasi rasa takut seperti berbicara di depan umum, kritik, dan kegagalan. Dengan contoh nyata dari Jeena Cho, seorang pengacara yang mengalami kecemasan sosial, dijelaskan bagaimana mindfulness membantunya mengubah cara merespons rasa takut..",
                date: "2023",
                image: "https://picsum.photos/seed/fear2/400/300",
                link: "https://edition.cnn.com/2021/11/04/health/mindfulness-practices-for-fear-benefits-wellness",
            },
            {
                id: 8,
                category: "fear",
                categoryLabel: "Fear",
                categoryColor: "purple",
                title: "Anxiety Management: Fear Leads to Worry",
                source: "The Conover Company",
                description:
                    "The Conover Company membahas bagaimana ketakutan dapat mengarah pada kemarahan dan kebencian, serta strategi mengelola kecemasan.",
                date: "2024",
                image: "https://picsum.photos/seed/fear3/400/300",
                link: "https://www.conovercompany.com/anxiety-management-fear-leads-worry/",
            },
            {
                id: 9,
                category: "fear",
                categoryLabel: "Fear",
                categoryColor: "purple",
                title: "Anxiety and Anger: Understand the Relationship",
                source: "Mind Health Group",
                description:
                    "Mind Health Group menjelaskan bagaimana Cognitive Behavioral Therapy (CBT) efektif dalam mengatasi gangguan kecemasan dan kemarahan yang tidak terkontrol.",
                date: "2024",
                image: "https://picsum.photos/seed/fear4/400/300",
                link: "https://www.mindhealthgroup.com/blog/anxiety-anger-whats-the-relationship/",
            },
            {
                id: 10,
                category: "fear",
                categoryLabel: "Fear",
                categoryColor: "purple",
                title: "Human Emotional Evaluation of Ancestral and Modern Threats",
                source: "Frontiers in Psychology",
                description:
                    "Frontiers in Psychology menyajikan penelitian tentang respon emosional manusia terhadap ancaman modern dan kuno dalam konteks ketakutan.",
                date: "2024",
                image: "https://picsum.photos/seed/fear5/400/300",
                link: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1321053/full",
            },
            // Artikel Sadness
            {
                id: 11,
                category: "sadness",
                categoryLabel: "Sadness",
                categoryColor: "blue",
                title: "Sadness in Psychology: Exploring the Emotional Landscape",
                source: "NeuroLaunch",
                description:
                    "NeuroLaunch menjelaskan perspektif psikologi tentang kesedihan dan pola pikir negatif yang mempengaruhi kondisi emosional.",
                date: "2024",
                image: "https://picsum.photos/seed/sadness1/400/300",
                link: "https://neurolaunch.com/what-is-sadness-in-psychology/",
            },
            {
                id: 12,
                category: "sadness",
                categoryLabel: "Sadness",
                categoryColor: "blue",
                title: "Depression vs. Sadness: How to Tell the Difference",
                source: "Medical News Today",
                description:
                    "Medical News Today membahas perbedaan antara depresi dan kesedihan biasa, dimana kesedihan adalah emosi yang semua orang alami sedangkan depresi adalah kondisi yang berbeda.",
                date: "2024",
                image: "https://picsum.photos/seed/sadness2/400/300",
                link: "https://www.medicalnewstoday.com/articles/314418",
            },
            {
                id: 13,
                category: "sadness",
                categoryLabel: "Sadness",
                categoryColor: "blue",
                title: "What Is Depression?",
                source: "American Psychiatric Association",
                description:
                    "American Psychiatric Association menjelaskan gejala depresi termasuk perasaan sedih, mudah tersinggung, kehilangan minat atau kesenangan dalam aktivitas.",
                date: "2024",
                image: "https://picsum.photos/seed/sadness3/400/300",
                link: "https://www.psychiatry.org/patients-families/depression/what-is-depression",
            },
            {
                id: 14,
                category: "sadness",
                categoryLabel: "Sadness",
                categoryColor: "blue",
                title: "Understanding Grief and Loss",
                source: "help guide",
                description:
                    "Artikel HelpGuide ini membahas tahapan kesedihan, proses berduka, dan cara-cara sehat untuk mengatasi kehilangan, termasuk mitos umum, gejala emosional, serta pentingnya dukungan dan perawatan diri.",
                 date: "2024",
                image: "https://picsum.photos/seed/sadness4/400/300",
                link: "https://www.helpguide.org/mental-health/grief/coping-with-grief-and-loss",
            },
            // Artikel Suicidal
            {
                id: 15,
                category: "suicidal",
                categoryLabel: "Suicidal",
                categoryColor: "yellow",
                title: "2024 National Strategy for Suicide Prevention",
                source: "U.S. Department of Health and Human Services",
                description:
                    "Strategi nasional 10 tahun yang komprehensif untuk pencegahan bunuh diri dengan rekomendasi konkret untuk mengatasi kesenjangan dalam bidang pencegahan bunuh diri.",
                date: "2024",
                image: "https://picsum.photos/seed/suicidal1/400/300",
                link: "https://www.hhs.gov/programs/prevention-and-wellness/mental-health-substance-use-disorder/national-strategy-suicide-prevention/index.html",
            },
            {
                id: 16,
                category: "suicidal",
                categoryLabel: "Suicidal",
                categoryColor: "yellow",
                title: "Suicide Prevention Month",
                source: "NAMI",
                description:
                    "NAMI menyajikan informasi tentang Bulan September sebagai Bulan Pencegahan Bunuh Diri untuk meningkatkan kesadaran dan berbagi informasi penting.",
                date: "2024",
                image: "https://picsum.photos/seed/suicidal2/400/300",
                link: "https://www.nami.org/get-involved/awareness-events/suicide-prevention-month/",
            },
            {
                id: 17,
                category: "suicidal",
                categoryLabel: "Suicidal",
                categoryColor: "yellow",
                title: "Youth Mental Health Trends in 2025",
                source: "JED Foundation",
                description:
                    "JED Foundation menunjukkan bahwa remaja LGBTQIA+ tiga kali lebih mungkin mengalami masalah kesehatan mental dibanding yang non-LGBTQIA+.",
                date: "2025",
                image: "https://picsum.photos/seed/suicidal3/400/300",
                link: "https://jedfoundation.org/what-we-expect-in-2025-new-years-trends-in-youth-mental-health/",
            },
        ];

        // **PERBAIKAN UNTUK WARNA DINAMIS TAILWIND**
        const categoryColorMap = {
            red: "text-red-600 bg-red-100",
            purple: "text-purple-600 bg-purple-100",
            blue: "text-blue-600 bg-blue-100",
            yellow: "text-yellow-600 bg-yellow-100",
        };

        // Fungsi untuk membuat kartu artikel
        const renderArticleCard = (article) => {
            return `
                <div class="bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:scale-[1.02]" data-category="${
                    article.category
                }">
                    <div class="h-48 overflow-hidden">
                        <img src="${article.image}" alt="${
                article.title
            }" class="w-full h-full object-cover" />
                    </div>
                    <div class="p-5">
                        <span class="text-xs font-semibold px-2 py-1 rounded-full ${
                            categoryColorMap[article.categoryColor] ||
                            "text-gray-600 bg-gray-100"
                        }">
                            ${article.categoryLabel}
                        </span>
                        <h3 class="font-bold text-lg mt-2">${article.title}</h3>
                        <p class="text-gray-600 text-sm mt-2 line-clamp-3">${
                            article.description
                        }</p>
                        <div class="mt-4 flex justify-between items-center">
                            <span class="text-xs text-gray-500">${
                                article.date
                            }</span>
                            <a href="${
                                article.link
                            }" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-blue-600 hover:text-blue-800">Baca selengkapnya</a>
                        </div>
                    </div>
                </div>
            `;
        };

        return `
            <div class="flex flex-col">
                <div class="sticky top-0 z-50 bg-white border-b border-gray-200">
                    <div class="px-4 md:px-16 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div class="w-full md:w-auto flex justify-between items-center">
                            <img src="/images/Wrapper.png" alt="Logo" class="h-10" />
                            <button id="mobile-menu-button" class="md:hidden text-gray-700">
                                <i class="fas fa-bars text-xl"></i>
                            </button>
                        </div>
                        <nav class="w-full md:w-auto hidden md:block" id="mobile-menu">
                            <ul class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8 font-medium">
                                <li class="w-full md:w-auto text-center"><a href="#" class="block py-2 text-gray-700 hover:text-blue-700 transition">Pustaka Edukasi</a></li>
                                <li class="w-full md:w-auto text-center"><a href="#/catatan-emosi" class="block py-2 text-gray-700 hover:text-blue-700 transition">Catatan Emosi</a></li>
                                <li class="w-full md:w-auto text-center"><a href="#/chat" class="block py-2 text-gray-700 hover:text-blue-700 transition">Curhat Sekarang</a></li>
                            </ul>
                        </nav>
                        <div class="w-full md:w-auto md:block">
                            ${
                                userLoggedIn
                                    ? `
                                <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                                    <span class="text-gray-700 font-medium text-center">Halo, ${
                                        userData?.name ||
                                        userData?.email?.split("@")[0] ||
                                        "Pengguna"
                                    }</span>
                                    <button id="btn-logout" type="button" class="w-full md:w-auto text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5">Logout</button>
                                </div>`
                                    : `
                                <a href="#/login" class="block w-full md:w-auto text-center text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5">Login</a>`
                            }
                        </div>
                    </div>
                </div>

                <div class="flex flex-col lg:flex-row items-center justify-between pl-4 md:pl-8 lg:pl-20 py-10 md:py-20 gap-10">
                    <div class="flex flex-col w-full lg:w-1/2 space-y-6">
                        <h1 class="font-bold text-2xl sm:text-3xl lg:text-4xl leading-snug">
                            Saat Inovasi Bertemu Empati: Bentuk Baru Dukungan Kesehatan Mental
                            <span class="text-blue-600 font-bold block mt-2">Powered by AI</span>
                        </h1>
                        <p class="text-base md:text-lg lg:text-xl text-gray-700">
                            Website kesehatan mental berbasis AI yang mendampingi generasi muda mengenali, memahami, dan menangani kondisi emosional secara aman dan personal.
                        </p>
                    </div>
                    <div class="w-full lg:w-1/2 h-[250px] sm:h-[300px] lg:h-[410px] flex justify-center">
                        <img src="/images/background-hero.png" alt="Background Hero" class="h-full w-full object-cover rounded-xl" />
                    </div>
                </div>

                <div class="w-full flex justify-center items-center py-10 px-4">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 md:gap-20">
                        ${Array(8)
                            .fill(0)
                            .map(
                                (_, i) =>
                                    `<div class="h-[60px] sm:h-[80px] md:h-[100px]"><img src="/images/${
                                        (i % 3) + 4
                                    }.png" alt="" class="w-full h-full object-contain" /></div>`
                            )
                            .join("")}
                    </div>
                </div>

                <div class="flex flex-col items-center px-4 py-10 text-lg md:text-[20px] font-semibold bg-[#F2F2F2] mx-4 md:mx-10 lg:mx-20">
                    <h2 class="text-center mb-5">Masih Bingung Tentang MyCare?</h2>
                    <div class="flex flex-col lg:flex-row w-full gap-10 items-start justify-center">
                        <div class="w-full lg:w-1/2 flex justify-center">
                            <img src="/images/background-faq.png" alt="FAQ Image" class="w-full object-contain max-w-sm"/>
                        </div>
                        <div class="w-full lg:w-1/2 space-y-4" id="accordion">
                            <div class="border border-gray-200 rounded-lg overflow-hidden">
                                <button type="button" class="accordion-button flex items-center justify-between w-full p-4 font-medium text-left text-gray-900 bg-white hover:bg-gray-100">
                                    <span>Apa itu MyCare?</span>
                                    <i class="fas fa-chevron-down transition-transform"></i>
                                </button>
                                <div class="accordion-content hidden p-4 bg-white text-gray-700 text-[16px] leading-relaxed">MyCare adalah sebuah platform digital inovatif yang dirancang untuk menjadi teman Anda dalam perjalanan kesehatan mental.
                        Kami memanfaatkan kekuatan kecerdasan buatan (AI) untuk menyediakan ruang yang aman, suportif, dan personal bagi siapa saja yang ingin memahami dan mengelola kondisi emosional mereka.
                        Fitur utama kami meliputi chatbot AI yang empatik, pustaka edukasi, dan fitur catatan emosi untuk membantu Anda mengenali pola perasaan.</div>
                            </div>
                            <div class="border border-gray-200 rounded-lg overflow-hidden">
                                <button type="button" class="accordion-button flex items-center justify-between w-full p-4 font-medium text-left text-gray-900 bg-white hover:bg-gray-100">
                                    <span>Apa itu Healthcare dalam konteks ini?</span>
                                    <i class="fas fa-chevron-down transition-transform"></i>
                                </button>
                                <div class="accordion-content hidden p-4 bg-white text-gray-700 text-[16px] leading-relaxed">Healthcare, atau layanan kesehatan, tidak hanya terbatas pada kesehatan fisik. Kesehatan mental adalah bagian fundamental dari kesejahteraan Anda secara keseluruhan.
                                Di MyCare, kami memahami 'healthcare' sebagai sebuah pendekatan holistik.
                                Platform kami berfungsi sebagai alat pendukung di ranah kesehatan mental, membantu Anda membangun kesadaran diri dan ketahanan emosional.</div>
                            </div>
                            <div class="border border-gray-200 rounded-lg overflow-hidden">
                                <button type="button" class="accordion-button flex items-center justify-between w-full p-4 font-medium text-left text-gray-900 bg-white hover:bg-gray-100">
                                    <span>Bagaimana cara menggunakannya?</span>
                                    <i class="fas fa-chevron-down transition-transform"></i>
                                </button>
                                <div class="accordion-content hidden p-4 bg-white text-gray-700 text-[16px] leading-relaxed">
                                    <ol class="list-decimal list-inside space-y-2">
                                        <li><strong>Mulai Curhat:</strong> Klik tombol 'Curhat Sekarang' untuk memulai percakapan dengan asisten AI kami. Ceritakan apa saja yang Anda rasakan, chatbot kami dirancang untuk mendengarkan tanpa menghakimi.</li>
                                        <li><strong>Jelajahi Pustaka Edukasi:</strong> Kunjungi bagian Pustaka untuk membaca artikel terpercaya mengenai berbagai topik emosi seperti kecemasan, kesedihan, dan cara mengelola amarah.</li>
                                        <li><strong>Gunakan Catatan Emosi:</strong> Manfaatkan fitur Catatan Emosi untuk melacak suasana hati Anda dari hari ke hari. Fitur ini membantu Anda mengenali pola dan pemicu emosi Anda seiring waktu.</li>
                                        <li><strong>Dapatkan Rekomendasi:</strong> Semakin sering Anda berinteraksi, MyCare akan semakin memahami Anda dan dapat memberikan rekomendasi yang lebih personal dan relevan.</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-10 md:mt-20 px-4 md:px-10 lg:px-20 pb-10 md:pb-20">
                    <div class="flex flex-col items-center text-center w-full max-w-4xl mx-auto space-y-4 mb-8 md:mb-12">
                        <h1 class="font-bold text-2xl md:text-3xl lg:text-4xl">Dirancang Sepenuhnya untuk Kecerdasan Emosional.</h1>
                        <span class="text-sm md:text-base lg:text-lg font-semibold text-gray-700">myCare menghadirkan infrastruktur AI paling canggih untuk kesehatan emosional.</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div class="p-6 shadow-lg bg-white rounded-lg border border-gray-200 space-y-4 transition hover:shadow-xl hover:-translate-y-1">
                            <div class="flex items-center justify-between"><h2 class="text-xl font-semibold">Percakapan Empatik</h2><i class="text-blue-500 text-2xl fas fa-comments"></i></div>
                            <p class="text-gray-600 text-base">Bicaralah dengan asisten AI kami yang dilatih untuk memahami nuansa emosi dan memberikan respons yang suportif, kapan pun Anda butuhkan.</p>
                        </div>
                        <div class="p-6 shadow-lg bg-white rounded-lg border border-gray-200 space-y-4 transition hover:shadow-xl hover:-translate-y-1">
                            <div class="flex items-center justify-between"><h2 class="text-xl font-semibold">Analisis Mood & Insight</h2><i class="text-green-500 text-2xl fas fa-chart-line"></i></div>
                            <p class="text-gray-600 text-base">Lacak perjalanan emosional Anda. AI kami membantu Anda mengenali pola, memahami pemicu, dan memberikan wawasan berharga untuk kesadaran diri.</p>
                        </div>
                        <div class="p-6 shadow-lg bg-white rounded-lg border border-gray-200 space-y-4 transition hover:shadow-xl hover:-translate-y-1">
                            <div class="flex items-center justify-between"><h2 class="text-xl font-semibold">Rekomendasi Personal</h2><i class="text-yellow-500 text-2xl fas fa-lightbulb"></i></div>
                            <p class="text-gray-600 text-base">Berdasarkan suasana hati, MyCare secara cerdas merekomendasikan konten yang relevan—mulai dari artikel, musik, hingga meditasi.</p>
                        </div>
                        <div class="p-6 shadow-lg bg-white rounded-lg border border-gray-200 space-y-4 transition hover:shadow-xl hover:-translate-y-1">
                            <div class="flex items-center justify-between"><h2 class="text-xl font-semibold">Privasi & Keamanan</h2><i class="text-red-500 text-2xl fas fa-shield-alt"></i></div>
                            <p class="text-gray-600 text-base">Cerita Anda aman bersama kami. Kami menerapkan standar keamanan dan privasi yang tinggi untuk memastikan semua data Anda bersifat rahasia.</p>
                        </div>
                    </div>
                </div>

                <div class="mt-10 md:mt-20 px-4 md:px-10 lg:px-20 pb-10 md:pb-20">
                    <div class="flex flex-col items-center text-center w-full max-w-4xl mx-auto space-y-4 mb-8 md:mb-12">
                        <h1 class="font-bold text-2xl md:text-3xl lg:text-4xl">Kemampuan kami</h1>
                        <span class="text-sm md:text-base lg:text-lg font-semibold text-gray-700">Nikmati berbagai kemampuan AI dari myCare.</span>
                    </div>
                    <div class="h-auto sm:h-[400px] md:h-[500px] lg:h-[541px] bg-[#E4E4E7] rounded-xl px-4 sm:pl-8 py-6">
                        <div class="flex flex-col sm:flex-row items-center justify-between h-full gap-4">
                            <div class="flex flex-col items-start w-full sm:max-w-[300px] space-y-3 md:space-y-4 text-center sm:text-left">
                                <h1 class="text-xl md:text-2xl font-bold">Memahami Emosi Lewat Percakapan</h1>
                                <span class="text-gray-700 text-xs sm:text-sm leading-relaxed">MyCare menggunakan teknologi AI canggih untuk memahami konteks dan perasaan di balik cerita Anda. Ini memungkinkan kami memberikan dukungan yang relevan dan membantu Anda merasa benar-benar didengar.</span>
                            </div>
                            <div class="w-full sm:w-[300px] md:w-[400px] lg:w-[541px] h-[250px] sm:h-[300px] md:h-[400px] lg:h-[519px]">
                                <img src="/images/capabilities.png" alt="AI Capability" class="w-full h-full object-cover rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-16 px-6 md:px-20">
                     <div class="flex flex-col items-center text-center w-full max-w-4xl mx-auto space-y-4 mb-12">
                         <h1 class="font-bold text-3xl md:text-4xl">Bagaimana kami bisa membantu?</h1>
                         <span class="text-base md:text-lg font-semibold text-gray-700">Jangan ragu untuk menghubungi kami jika Anda memiliki pertanyaan.</span>
                     </div>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                         <div class="bg-white border border-gray-200 rounded-xl shadow-md p-6 flex items-start space-x-4">
                            <div class="bg-blue-100 text-blue-600 p-3 rounded-full mt-1"><i class="fas fa-life-ring text-2xl"></i></div>
                             <div>
                                 <h3 class="font-bold text-lg">Dukungan Pengguna</h3>
                                 <p class="text-gray-600 mt-1">Punya pertanyaan, masukan, atau butuh bantuan terkait aplikasi? Tim kami siap membantu Anda.</p>
                                 <a href="mailto:dukungan@mycare.ai" class="text-blue-600 font-medium mt-2 inline-block">dukungan@mycare.ai</a>
                             </div>
                         </div>
                         <div class="bg-white border border-gray-200 rounded-xl shadow-md p-6 flex items-start space-x-4">
                            <div class="bg-green-100 text-green-600 p-3 rounded-full mt-1"><i class="fas fa-handshake text-2xl"></i></div>
                             <div>
                                 <h3 class="font-bold text-lg">Kerja Sama & Media</h3>
                                 <p class="text-gray-600 mt-1">Tertarik untuk berkolaborasi, menjadi partner, atau ingin meliput MyCare? Hubungi tim partnership kami.</p>
                                 <a href="mailto:partnership@mycare.ai" class="text-green-600 font-medium mt-2 inline-block">partnership@mycare.ai</a>
                             </div>
                         </div>
                     </div>
                     <div class="flex justify-center">
                         <a href="#/contact" class="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition">Hubungi Kami Sekarang</a>
                     </div>
                 </div>

                <div class="mt-10 md:mt-16 px-4 md:px-10 lg:px-20 pb-10 md:pb-16">
                    <div class="flex flex-col items-center text-center w-full max-w-4xl mx-auto space-y-4 mb-8">
                        <h1 class="font-bold text-2xl md:text-3xl lg:text-4xl">Pustaka Edukasi</h1>
                        <span class="text-sm md:text-base lg:text-lg font-semibold text-gray-700">Temukan berbagai artikel informatif tentang kesehatan mental</span>
                    </div>
                    <div class="flex justify-center mb-6 md:mb-8 overflow-x-auto">
                        <div class="inline-flex p-1 bg-gray-100 rounded-full flex-nowrap whitespace-nowrap">
                            <button class="tab-button px-4 md:px-6 py-1 md:py-2 text-xs md:text-sm font-medium rounded-full bg-blue-600 text-white" data-tab="semua">Semua</button>
                            <button class="tab-button px-4 md:px-6 py-1 md:py-2 text-xs md:text-sm font-medium rounded-full text-gray-700 hover:bg-gray-200" data-tab="anger">Anger</button>
                            <button class="tab-button px-4 md:px-6 py-1 md:py-2 text-xs md:text-sm font-medium rounded-full text-gray-700 hover:bg-gray-200" data-tab="fear">Fear</button>
                            <button class="tab-button px-4 md:px-6 py-1 md:py-2 text-xs md:text-sm font-medium rounded-full text-gray-700 hover:bg-gray-200" data-tab="sadness">Sadness</button>
                            <button class="tab-button px-4 md:px-6 py-1 md:py-2 text-xs md:text-sm font-medium rounded-full text-gray-700 hover:bg-gray-200" data-tab="suicidal">Suicidal</button>
                        </div>
                    </div>
                    <div id="articles-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        ${articles
                            .map((article) => renderArticleCard(article))
                            .join("")}
                    </div>
                    <div class="flex justify-center mt-6 md:mt-8">
                        <button class="px-6 md:px-8 py-2 md:py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition text-sm md:text-base">Lihat Lebih Banyak</button>
                    </div>
                </div>
                <footer class="bg-blue-700 text-white py-10 md:py-16">
                    <div class="container mx-auto px-6 md:px-20">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                            <div class="space-y-4">
                                <img src="/images/Wrapper.png" alt="MyCare Logo" class="h-10 bg-white p-1 rounded">
                                <p class="text-gray-300 text-sm">Teman digital untuk kesehatan mental, menyediakan ruang aman untuk berbagi dan bertumbuh dengan bantuan AI.</p>
                                <div class="flex space-x-4"><a href="#" class="text-gray-300 hover:text-white"><i class="fab fa-facebook-f"></i></a><a href="#" class="text-gray-300 hover:text-white"><i class="fab fa-twitter"></i></a><a href="#" class="text-gray-300 hover:text-white"><i class="fab fa-instagram"></i></a></div>
                            </div>
                            <div>
                                <h4 class="font-bold text-white mb-4">Navigasi</h4>
                                <ul class="space-y-2">
                                    <li><a href="#" class="text-gray-300 hover:text-white transition">Beranda</a></li>
                                    <li><a href="#/articles" class="text-gray-300 hover:text-white transition">Pustaka</a></li>
                                    <li><a href="#/chat" class="text-gray-300 hover:text-white transition">Curhat Sekarang</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-bold text-white mb-4">Sumber Daya</h4>
                                <ul class="space-y-2">
                                    <li><a href="#/articles" class="text-gray-300 hover:text-white transition">Artikel Kemarahan</a></li>
                                    <li><a href="#/articles" class="text-gray-300 hover:text-white transition">Artikel Kecemasan</a></li>
                                    <li><a href="#/articles" class="text-gray-300 hover:text-white transition">Bantuan Darurat</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-bold text-white mb-4">Dukungan</h4>
                                <ul class="space-y-2">
                                    <li><a href="#/faq" class="text-gray-300 hover:text-white transition">FAQ</a></li>
                                    <li><a href="#/privacy" class="text-gray-300 hover:text-white transition">Kebijakan Privasi</a></li>
                                    <li><a href="#/terms" class="text-gray-300 hover:text-white transition">Syarat & Ketentuan</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-10 pt-8 border-t border-blue-600 text-center text-sm text-gray-300">
                            © 2025 MyCare AI. Dibuat dengan ❤️ oleh Tim CF025 - CC011.
                        </div>
                    </div>
                </footer>
            </div>
        `;
    }

    async afterRender() {
        const mobileMenuButton = document.getElementById("mobile-menu-button");
        const mobileMenu = document.getElementById("mobile-menu");

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener("click", () => {
                mobileMenu.classList.toggle("hidden");
                mobileMenu.classList.toggle("flex");
                mobileMenu.classList.toggle("flex-col");
            });
        }

        const logoutButton = document.getElementById("btn-logout");
        if (logoutButton) {
            logoutButton.addEventListener("click", async () => {
                try {
                    clearAuth();
                    document.dispatchEvent(new Event("authChanged"));
                    window.location.reload();
                } catch (error) {
                    console.error("Error during logout:", error);
                }
            });
        }

        const accordionButtons = document.querySelectorAll(".accordion-button");
        accordionButtons.forEach((button) => {
            button.onclick = null;
            button.addEventListener("click", function () {
                // Tutup semua accordion terlebih dahulu
                accordionButtons.forEach((otherButton) => {
                    if (otherButton !== this) {
                        const otherContent = otherButton.nextElementSibling;
                        const otherIcon =
                            otherButton.querySelector(".fa-chevron-down");
                        otherContent.classList.add("hidden");
                        otherIcon.classList.remove("rotate-180");
                    }
                });

                // Buka atau tutup accordion yang diklik
                const content = this.nextElementSibling;
                const icon = this.querySelector(".fa-chevron-down");
                content.classList.toggle("hidden");
                icon.classList.toggle("rotate-180");
            });
        });

        // Article filtering
        const filterArticles = (category) => {
            const articlesContainer =
                document.getElementById("articles-container");
            if (!articlesContainer) return;
            const articles =
                articlesContainer.querySelectorAll("[data-category]");
            articles.forEach((article) => {
                if (
                    category === "semua" ||
                    article.dataset.category === category
                ) {
                    article.style.display = "block";
                } else {
                    article.style.display = "none";
                }
            });
        };

        const tabButtons = document.querySelectorAll(".tab-button");
        tabButtons.forEach((button) => {
            button.addEventListener("click", function () {
                tabButtons.forEach((btn) => {
                    btn.classList.remove("bg-blue-600", "text-white");
                    btn.classList.add("text-gray-700", "hover:bg-gray-200");
                });
                this.classList.add("bg-blue-600", "text-white");
                this.classList.remove("text-gray-700", "hover:bg-gray-200");
                const category = this.getAttribute("data-tab");
                filterArticles(category);
            });
        });

        // Tampilkan semua artikel saat pertama kali load
        filterArticles("semua");
    }
}
// ===== AKHIR KODE LENGKAP UNTUK home-page.js =====
