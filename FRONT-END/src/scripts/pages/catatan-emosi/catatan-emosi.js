import Storage from "../../utils/storage.js";

export default class CatatanEmosi {
    constructor() {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.emotions = {
            happy: { icon: "😊", color: "bg-green-100 border-green-300" },
            sadness: { icon: "😢", color: "bg-blue-100 border-blue-300" },
            anger: { icon: "😠", color: "bg-red-100 border-red-300" },
            fear: { icon: "😨", color: "bg-purple-100 border-purple-300" },
            suicidal: { icon: "😔", color: "bg-gray-100 border-gray-300" },
            neutral: { icon: "😊", color: "bg-yellow-100 border-yellow-300" },
        };
        this.activeTags = [];
        this.emotionJournals = {};

        this.checkChatbotEmotionData();
    }

    async render() {
        return `
            <div class="container mx-auto px-4 py-8 max-w-7xl">
                <button class="p-2 hover:bg-gray-100 rounded-lg transition" id="backButton">
                    <i class="fas fa-arrow-left text-gray-600"></i>
                </button>
                <h1 class="text-3xl font-bold text-gray-800 mb-6">Catatan Emosi</h1>
                <div class="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-700 mb-3">Tren Emosi</h3>
                    <div class="w-full h-64" id="emotionChart"></div>
                </div>
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center">
                        <h2 id="monthYearDisplay" class="text-2xl font-semibold text-gray-700"></h2>
                    </div>
                    <div class="flex space-x-2">
                        <button id="prevMonth" class="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                            <i class="fas fa-chevron-left text-gray-600"></i>
                        </button>
                        <button id="nextMonth" class="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                            <i class="fas fa-chevron-right text-gray-600"></i>
                        </button>
                        <button id="todayBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                            Hari Ini
                        </button>
                    </div>
                </div>
                <div class="mb-8">
                    <!-- Days of Week Header -->
                    <div class="grid grid-cols-7 gap-2 mb-2">
                        <div class="text-center font-medium text-gray-500">Min</div>
                        <div class="text-center font-medium text-gray-500">Sen</div>
                        <div class="text-center font-medium text-gray-500">Sel</div>
                        <div class="text-center font-medium text-gray-500">Rab</div>
                        <div class="text-center font-medium text-gray-500">Kam</div>
                        <div class="text-center font-medium text-gray-500">Jum</div>
                        <div class="text-center font-medium text-gray-500">Sab</div>
                    </div>
                    <div id="calendarGrid" class="grid grid-cols-7 gap-2"></div>
                </div>
                <div class="mb-8">
                    <h3 class="text-lg font-semibold text-gray-700 mb-3">Filter berdasarkan Emosi</h3>
                    <div class="flex flex-wrap gap-2" id="emotionFilter">
                        ${Object.entries(this.emotions)
                            .map(
                                ([emotion, data]) => `
                            <button class="emotion-filter px-3 py-2 rounded-full border flex items-center space-x-2 hover:bg-gray-50" data-emotion="${emotion}">
                                <span>${data.icon}</span>
                                <span class="capitalize">${emotion}</span>
                            </button>
                        `
                            )
                            .join("")}
                        <button id="clearFilter" class="px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-50">
                            <i class="fas fa-times mr-1"></i> Hapus Filter
                        </button>
                    </div>
                </div>
                <div id="journalFormContainer" class="hidden bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">Catatan Emosi Baru</h3>
                    <form id="emotionJournalForm">
                        <input type="hidden" id="journalDate" name="journalDate">

                        <div class="mb-5">
                            <label class="block text-gray-700 mb-2">Bagaimana perasaanmu hari ini?</label>
                            <div class="grid grid-cols-3 md:grid-cols-6 gap-3" id="emotionSelector">
                                ${Object.entries(this.emotions)
                                    .map(
                                        ([emotion, data]) => `
                                    <label class="emotion-option cursor-pointer flex flex-col items-center p-3 rounded-lg border-2 border-transparent hover:border-gray-300">
                                        <input type="radio" name="emotion" value="${emotion}" class="sr-only">
                                        <span class="text-3xl mb-1">${data.icon}</span>
                                        <span class="text-sm capitalize">${emotion}</span>
                                    </label>
                                `
                                    )
                                    .join("")}
                            </div>
                        </div>

                        <div class="mb-5">
                            <label for="intensitySlider" class="block text-gray-700 mb-2">Seberapa kuat perasaan ini? (1-5)</label>
                            <div class="flex items-center space-x-4">
                                <input type="range" id="intensitySlider" name="intensity" min="1" max="5" value="3" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                                <span id="intensityValue" class="text-lg font-medium">3</span>
                            </div>
                        </div>

                        <div class="mb-5">
                            <label for="journalContent" class="block text-gray-700 mb-2">Catatan Pribadi</label>
                            <textarea id="journalContent" name="content" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Apa yang terjadi hari ini yang membuatmu merasa seperti ini?"></textarea>
                        </div>

                        <div class="mb-6">
                            <label class="block text-gray-700 mb-2">Tambahkan Tag</label>
                            <div class="flex flex-wrap gap-2 mb-2" id="selectedTags"></div>
                            <div class="flex">
                                <input type="text" id="tagInput" class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Tambah tag (misal: Pekerjaan, Keluarga)">
                                <button type="button" id="addTagBtn" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-lg transition">Tambah</button>
                            </div>
                            <div class="mt-2 flex flex-wrap gap-2">
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Pekerjaan</span>
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Keluarga</span>
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Teman</span>
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Hubungan</span>
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Tidur Cukup</span>
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Olahraga</span>
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Sendirian</span>
                                <span class="tag-suggestion px-2 py-1 bg-gray-100 rounded-md text-sm cursor-pointer hover:bg-gray-200">Sosial</span>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button type="button" id="cancelJournalBtn" class="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition">Batal</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Simpan</button>
                        </div>
                    </form>
                </div>
                <div id="journalEntries" class="space-y-4"></div>
                <div class="fixed bottom-6 right-6">
                    <button id="addJournalBtn" class="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition">
                        <i class="fas fa-plus text-xl"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async afterRender() {
        this.loadJournals();
        this.renderCalendar();
        this.renderEmotionChart();
        this.setupEventListeners();
    }

    getJournalStorageKey() {
        return Storage.getScopedKey("emotion-journals");
    }

    getChatStorageKey() {
        return Storage.getScopedKey("chat-history");
    }

    loadJournals() {
        const storedJournals = localStorage.getItem(this.getJournalStorageKey());
        if (storedJournals) {
            this.emotionJournals = JSON.parse(storedJournals);
        }

        this.checkChatbotEmotionData();
    }

    saveJournals() {
        localStorage.setItem(
            this.getJournalStorageKey(),
            JSON.stringify(this.emotionJournals)
        );
    }

    renderCalendar() {
        const backButton = document.getElementById("backButton");
        if (backButton) {
            backButton.addEventListener("click", () => window.history.back());
        }
        const monthYearDisplay = document.getElementById("monthYearDisplay");
        const calendarGrid = document.getElementById("calendarGrid");

        const monthNames = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];

        monthYearDisplay.textContent = `${monthNames[this.currentMonth]} ${
            this.currentYear
        }`;

        calendarGrid.innerHTML = "";

        const firstDay = new Date(
            this.currentYear,
            this.currentMonth,
            1
        ).getDay();
        const daysInMonth = new Date(
            this.currentYear,
            this.currentMonth + 1,
            0
        ).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "h-24 bg-gray-50 rounded-lg";
            calendarGrid.appendChild(emptyCell);
        }

        const today = new Date();
        const isCurrentMonth =
            today.getMonth() === this.currentMonth &&
            today.getFullYear() === this.currentYear;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${this.currentYear}-${
                this.currentMonth + 1
            }-${day}`;
            const hasJournal = this.emotionJournals[dateKey];
            const isToday = isCurrentMonth && today.getDate() === day;

            const dayCell = document.createElement("div");
            dayCell.className = `day-cell min-h-24 p-2 rounded-lg border ${
                isToday ? "border-blue-500 bg-blue-50" : "border-gray-200"
            } relative cursor-pointer hover:bg-gray-50 transition`;
            dayCell.dataset.date = dateKey;

            const dayNumber = document.createElement("div");
            dayNumber.className = `text-sm font-medium ${
                isToday ? "text-blue-600" : "text-gray-700"
            }`;
            dayNumber.textContent = day;
            dayCell.appendChild(dayNumber);

            if (hasJournal) {
                const emotion = hasJournal.emotion;
                const emotionData = this.emotions[emotion] || {
                    icon: "📝",
                    color: "bg-gray-100 border-gray-300",
                };

                const emotionIndicator = document.createElement("div");
                emotionIndicator.className = `mt-1 p-1 ${emotionData.color} rounded-md flex items-center`;
                emotionIndicator.innerHTML = `
                    <span class="mr-1">${emotionData.icon}</span>
                    <span class="text-xs capitalize truncate">${emotion}</span>
                `;
                dayCell.appendChild(emotionIndicator);

                if (hasJournal.tags && hasJournal.tags.length > 0) {
                    const tagsContainer = document.createElement("div");
                    tagsContainer.className = "mt-1 flex flex-wrap gap-1";

                    hasJournal.tags.slice(0, 2).forEach((tag) => {
                        const tagElement = document.createElement("span");
                        tagElement.className =
                            "text-xs bg-gray-100 px-1 rounded";
                        tagElement.textContent = tag;
                        tagsContainer.appendChild(tagElement);
                    });

                    if (hasJournal.tags.length > 2) {
                        const moreTag = document.createElement("span");
                        moreTag.className = "text-xs text-gray-500";
                        moreTag.textContent = `+${hasJournal.tags.length - 2}`;
                        tagsContainer.appendChild(moreTag);
                    }

                    dayCell.appendChild(tagsContainer);
                }
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    renderEmotionChart() {
        const chartContainer = document.getElementById("emotionChart");
        if (!chartContainer) return;

        chartContainer.innerHTML =
            '<div class="text-center text-gray-500">Memuat grafik...</div>';

        setTimeout(() => {
            this.createNewChart();
        }, 200);
    }

    createNewChart() {
        const chartContainer = document.getElementById("emotionChart");
        if (!chartContainer) return;

        if (window.currentEmotionChart) {
            window.currentEmotionChart.destroy();
            window.currentEmotionChart = null;
        }

        chartContainer.innerHTML = "";

        const daysInMonth = new Date(
            this.currentYear,
            this.currentMonth + 1,
            0
        ).getDate();
        const chartData = this.prepareChartData(daysInMonth);

        this.loadChartJsScript()
            .then(() => {
                if (window.Chart) {
                    this.buildChart(chartContainer, chartData);
                } else {
                    chartContainer.innerHTML =
                        '<p class="text-center text-gray-500">Tidak dapat memuat Chart.js</p>';
                }
            })
            .catch((error) => {
                console.error("Error loading Chart.js:", error);
                chartContainer.innerHTML =
                    '<p class="text-center text-gray-500">Error memuat grafik</p>';
            });
    }

    prepareChartData(daysInMonth) {
        const labels = [];
        const emotionColors = {
            happy: "rgba(34, 197, 94, 0.8)",
            sadness: "rgba(59, 130, 246, 0.8)",
            anger: "rgba(239, 68, 68, 0.8)",
            fear: "rgba(139, 92, 246, 0.8)",
            suicidal: "rgba(75, 85, 99, 0.8)",
            neutral: "rgba(34, 197, 94, 0.8)",
        };

        const emotionCounts = {};

        Object.keys(this.emotions).forEach((emotion) => {
            emotionCounts[emotion] = [];
        });

        for (let day = 1; day <= daysInMonth; day++) {
            labels.push(day.toString());

            const dateKey = `${this.currentYear}-${
                this.currentMonth + 1
            }-${day}`;

            Object.keys(this.emotions).forEach((emotion) => {
                emotionCounts[emotion].push(0);
            });

            if (this.emotionJournals[dateKey]) {
                const journal = this.emotionJournals[dateKey];
                if (this.emotions[journal.emotion]) {
                    const lastIndex = emotionCounts[journal.emotion].length - 1;
                    emotionCounts[journal.emotion][lastIndex] =
                        journal.intensity || 3;
                }
            }
        }

        const datasets = Object.keys(this.emotions).map((emotion) => ({
            label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
            data: emotionCounts[emotion],
            backgroundColor:
                emotionColors[emotion] || "rgba(156, 163, 175, 0.8)",
            borderColor: (
                emotionColors[emotion] || "rgba(156, 163, 175, 0.8)"
            ).replace("0.8", "1"),
            borderWidth: 1,
        }));

        return { labels, datasets };
    }

    buildChart(container, chartData) {
        const canvas = document.createElement("canvas");
        canvas.id = `emotionChart_${Date.now()}`; // ID unik
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");

        window.currentEmotionChart = new window.Chart(ctx, {
            type: "bar",
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        title: {
                            display: true,
                            text: "Intensitas",
                        },
                        ticks: {
                            stepSize: 1,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: `${this.getMonthName(this.currentMonth)} ${
                                this.currentYear
                            }`,
                        },
                    },
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            usePointStyle: true,
                            boxWidth: 15,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                return `${
                                    tooltipItems[0].label
                                } ${this.getMonthName(this.currentMonth)} ${
                                    this.currentYear
                                }`;
                            },
                            label: (context) => {
                                if (context.parsed.y > 0) {
                                    return `${context.dataset.label}: ${context.parsed.y}/5`;
                                }
                                return null;
                            },
                        },
                        filter: (tooltipItem) => tooltipItem.parsed.y > 0,
                    },
                },
            },
        });
    }

    getMonthName(monthIndex) {
        const monthNames = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];
        return monthNames[monthIndex];
    }

    loadChartJsScript() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Gagal memuat Chart.js"));
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        document.getElementById("prevMonth").addEventListener("click", () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
            this.renderEmotionChart();
        });

        document.getElementById("nextMonth").addEventListener("click", () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
            this.renderEmotionChart();
        });

        document.getElementById("todayBtn").addEventListener("click", () => {
            const today = new Date();
            this.currentMonth = today.getMonth();
            this.currentYear = today.getFullYear();
            this.renderCalendar();
            this.renderEmotionChart();
        });

        document
            .getElementById("addJournalBtn")
            .addEventListener("click", () => {
                this.showJournalForm(new Date());
            });

        document
            .getElementById("calendarGrid")
            .addEventListener("click", (e) => {
                const dayCell = e.target.closest(".day-cell");
                if (dayCell) {
                    const dateKey = dayCell.dataset.date;
                    if (dateKey) {
                        const [year, month, day] = dateKey
                            .split("-")
                            .map(Number);
                        const date = new Date(year, month - 1, day);

                        if (this.emotionJournals[dateKey]) {
                            this.showJournalEntry(dateKey);
                        } else {
                            this.showJournalForm(date);
                        }
                    }
                }
            });

        // Form jurnal emosi
        const journalForm = document.getElementById("emotionJournalForm");
        if (journalForm) {
            journalForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.saveJournalEntry();
            });
        }

        // Tombol batal pada form
        document
            .getElementById("cancelJournalBtn")
            .addEventListener("click", () => {
                document
                    .getElementById("journalFormContainer")
                    .classList.add("hidden");
            });

        // Slider intensitas
        const intensitySlider = document.getElementById("intensitySlider");
        const intensityValue = document.getElementById("intensityValue");
        intensitySlider.addEventListener("input", () => {
            intensityValue.textContent = intensitySlider.value;
        });

        // Pemilihan emosi
        const emotionOptions = document.querySelectorAll(".emotion-option");
        emotionOptions.forEach((option) => {
            option.addEventListener("click", () => {
                emotionOptions.forEach((opt) =>
                    opt.classList.remove("border-blue-500", "bg-blue-50")
                );
                option.classList.add("border-blue-500", "bg-blue-50");
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
            });
        });

        // Menambahkan tag
        document.getElementById("addTagBtn").addEventListener("click", () => {
            this.addTag();
        });

        document
            .getElementById("tagInput")
            .addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    this.addTag();
                }
            });

        // Tag suggestion
        const tagSuggestions = document.querySelectorAll(".tag-suggestion");
        tagSuggestions.forEach((tag) => {
            tag.addEventListener("click", () => {
                const tagText = tag.textContent.trim();
                if (!this.activeTags.includes(tagText)) {
                    this.activeTags.push(tagText);
                    this.renderTags();
                }
            });
        });

        // Filter emosi
        const emotionFilters = document.querySelectorAll(".emotion-filter");
        emotionFilters.forEach((filter) => {
            filter.addEventListener("click", () => {
                const emotion = filter.dataset.emotion;
                emotionFilters.forEach((f) =>
                    f.classList.remove("bg-blue-100", "border-blue-300")
                );
                filter.classList.add("bg-blue-100", "border-blue-300");
                this.filterJournalsByEmotion(emotion);
            });
        });

        document.getElementById("clearFilter").addEventListener("click", () => {
            emotionFilters.forEach((f) =>
                f.classList.remove("bg-blue-100", "border-blue-300")
            );
            this.renderCalendar();
        });
    }

    showJournalForm(date) {
        const formContainer = document.getElementById("journalFormContainer");
        const form = document.getElementById("emotionJournalForm");
        const dateInput = document.getElementById("journalDate");

        // Reset form
        form.reset();
        this.activeTags = [];
        this.renderTags();

        // Set tanggal
        const dateKey = `${date.getFullYear()}-${
            date.getMonth() + 1
        }-${date.getDate()}`;
        dateInput.value = dateKey;

        // Reset pilihan emosi
        const emotionOptions = document.querySelectorAll(".emotion-option");
        emotionOptions.forEach((opt) =>
            opt.classList.remove("border-blue-500", "bg-blue-50")
        );

        // Tampilkan form
        formContainer.classList.remove("hidden");

        // Scroll ke form
        formContainer.scrollIntoView({ behavior: "smooth" });
    }

    saveJournalEntry() {
        const form = document.getElementById("emotionJournalForm");
        const dateKey = document.getElementById("journalDate").value;
        const emotion = form.querySelector(
            'input[name="emotion"]:checked'
        )?.value;
        const intensity = parseInt(
            document.getElementById("intensitySlider").value
        );
        const content = document.getElementById("journalContent").value.trim();

        if (!emotion) {
            alert("Silakan pilih emosi yang kamu rasakan");
            return;
        }

        // Simpan catatan emosi
        this.emotionJournals[dateKey] = {
            date: dateKey,
            emotion,
            intensity,
            content,
            tags: [...this.activeTags],
            timestamp: new Date().getTime(),
        };

        // Simpan ke localStorage
        this.saveJournals();

        // Sembunyikan form
        document.getElementById("journalFormContainer").classList.add("hidden");

        // Render ulang kalender
        this.renderCalendar();

        // Render ulang grafik setelah menyimpan entri baru
        this.renderEmotionChart();

        // Tampilkan catatan yang baru dibuat
        this.showJournalEntry(dateKey);
    }

    showJournalEntry(dateKey) {
        const journal = this.emotionJournals[dateKey];
        if (!journal) return;

        const entriesContainer = document.getElementById("journalEntries");
        entriesContainer.innerHTML = "";

        const emotionData = this.emotions[journal.emotion] || {
            icon: "📝",
            color: "bg-gray-100 border-gray-300",
        };
        const [year, month, day] = dateKey.split("-");
        const date = new Date(year, month - 1, day);
        const formattedDate = date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        const entryElement = document.createElement("div");
        entryElement.className =
            "bg-white rounded-xl shadow-lg border border-gray-200 p-6";
        entryElement.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">${formattedDate}</h3>
                    <div class="flex items-center mt-2">
                        <span class="text-2xl mr-2">${emotionData.icon}</span>
                        <span class="text-lg capitalize">${
                            journal.emotion
                        }</span>
                        <span class="ml-2 text-gray-500">(Intensitas: ${
                            journal.intensity
                        }/5)</span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button class="edit-journal-btn p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition" data-date="${dateKey}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-journal-btn p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition" data-date="${dateKey}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>

            ${
                journal.content
                    ? `
                <div class="mb-4 text-gray-700 whitespace-pre-line hidden">
                    ${journal.content}
                </div>
            `
                    : ""
            }

            ${
                journal.tags && journal.tags.length > 0
                    ? `
                <div class="flex flex-wrap gap-2 mt-3">
                    ${journal.tags
                        .map(
                            (tag) => `
                        <span class="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">${tag}</span>
                    `
                        )
                        .join("")}
                </div>
            `
                    : ""
            }
        `;

        entriesContainer.appendChild(entryElement);

        // Scroll ke entri
        entriesContainer.scrollIntoView({ behavior: "smooth" });

        // Tambahkan event listener untuk tombol edit dan hapus
        const editBtn = entryElement.querySelector(".edit-journal-btn");
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                this.editJournalEntry(dateKey);
            });
        }

        const deleteBtn = entryElement.querySelector(".delete-journal-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                this.deleteJournalEntry(dateKey);
            });
        }
    }

    editJournalEntry(dateKey) {
        const journal = this.emotionJournals[dateKey];
        if (!journal) return;

        // Set form values
        document.getElementById("journalDate").value = dateKey;
        document.getElementById("journalContent").value = journal.content || "";
        document.getElementById("intensitySlider").value =
            journal.intensity || 3;
        document.getElementById("intensityValue").textContent =
            journal.intensity || 3;

        // Set emotion
        const emotionRadio = document.querySelector(
            `input[name="emotion"][value="${journal.emotion}"]`
        );
        if (emotionRadio) {
            emotionRadio.checked = true;
            const emotionOptions = document.querySelectorAll(".emotion-option");
            emotionOptions.forEach((opt) =>
                opt.classList.remove("border-blue-500", "bg-blue-50")
            );
            emotionRadio
                .closest(".emotion-option")
                .classList.add("border-blue-500", "bg-blue-50");
        }

        // Set tags
        this.activeTags = [...(journal.tags || [])];
        this.renderTags();

        // Show form
        document
            .getElementById("journalFormContainer")
            .classList.remove("hidden");
        document
            .getElementById("journalFormContainer")
            .scrollIntoView({ behavior: "smooth" });
    }

    deleteJournalEntry(dateKey) {
        if (confirm("Apakah kamu yakin ingin menghapus catatan emosi ini?")) {
            delete this.emotionJournals[dateKey];
            this.saveJournals();
            this.renderCalendar();
            this.renderEmotionChart();
            document.getElementById("journalEntries").innerHTML = "";
        }
    }

    addTag() {
        const tagInput = document.getElementById("tagInput");
        const tagText = tagInput.value.trim();

        if (tagText && !this.activeTags.includes(tagText)) {
            this.activeTags.push(tagText);
            this.renderTags();
        }

        tagInput.value = "";
        tagInput.focus();
    }

    renderTags() {
        const selectedTags = document.getElementById("selectedTags");
        selectedTags.innerHTML = "";

        this.activeTags.forEach((tag) => {
            const tagElement = document.createElement("div");
            tagElement.className =
                "px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700 flex items-center";
            tagElement.innerHTML = `
                <span>${tag}</span>
                <button type="button" class="ml-1 text-blue-500 hover:text-blue-700" data-tag="${tag}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedTags.appendChild(tagElement);

            // Tambahkan event listener untuk menghapus tag
            const removeBtn = tagElement.querySelector("button");
            removeBtn.addEventListener("click", () => {
                this.activeTags = this.activeTags.filter((t) => t !== tag);
                this.renderTags();
            });
        });
    }

    filterJournalsByEmotion(emotion) {
        // Reset tampilan kalender
        this.renderCalendar();

        // Jika tidak ada filter, keluar dari fungsi
        if (!emotion) return;

        // Highlight hanya sel dengan emosi yang dipilih
        const dayCells = document.querySelectorAll(".day-cell");
        dayCells.forEach((cell) => {
            const dateKey = cell.dataset.date;
            const journal = this.emotionJournals[dateKey];

            if (!journal || journal.emotion !== emotion) {
                cell.classList.add("opacity-50");
            } else {
                cell.classList.add("ring", "ring-blue-300");
            }
        });
    }

    checkChatbotEmotionData() {
        const chatData = localStorage.getItem(this.getChatStorageKey());
        if (!chatData) return;

        try {
            const parsedData = JSON.parse(chatData);

            if (parsedData && parsedData.classificationFinal) {
                const emotion = parsedData.classificationFinal;
                const sessionTime =
                    parsedData.sessionStartTime || new Date().getTime();

                const sessionDate = new Date(sessionTime);
                const dateKey = `${sessionDate.getFullYear()}-${
                    sessionDate.getMonth() + 1
                }-${sessionDate.getDate()}`;

                if (!this.emotionJournals[dateKey]) {
                    this.emotionJournals[dateKey] = {
                        date: dateKey,
                        emotion: emotion,
                        intensity: 3,
                        content:
                            "Hasil klasifikasi emosi dari sesi chat dengan MyCareAI",
                        tags: [],
                        timestamp: sessionTime,
                        fromChatbot: true,
                    };

                    this.saveJournals();
                }
            }
        } catch (error) {
            console.error("Error processing chatbot emotion data:", error);
        }
    }

    addEmotionJournalFromChatbot(emotion, timestamp = null) {
        const journalTime = timestamp || new Date().getTime();
        const journalDate = new Date(journalTime);

        const dateKey = `${journalDate.getFullYear()}-${
            journalDate.getMonth() + 1
        }-${journalDate.getDate()}`;

        this.emotionJournals[dateKey] = {
            date: dateKey,
            emotion: emotion,
            intensity: 3,
            content: "Hasil klasifikasi emosi dari sesi chat dengan MyCareAI",
            tags: [],
            timestamp: journalTime,
            fromChatbot: true,
        };

        this.saveJournals();

        if (document.getElementById("calendarGrid")) {
            this.renderCalendar();
        }

        return dateKey;
    }
}
