import CatatanEmosi from "../catatan-emosi/catatan-emosi.js";
import config from "../../config.js";
import Storage from "../../utils/storage.js";

export default class ChatPageView {
    constructor() {
        this.messageInput = null;
        this.sendButton = null;
        this.messages = [];
        // Nilai "/" dipakai pada Docker agar request /api diproxy Nginx ke backend.
        // Operator nullish menjaga string kosong sebagai same-origin URL yang valid.
        const chatApiBaseUrl = (
            import.meta.env?.VITE_MYCARE_CHAT_API_BASE_URL ??
            import.meta.env?.VITE_MYCARE_API_BASE_URL ??
            config.CHATBOT_API_BASE_URL ??
            "http://localhost:3000"
        ).replace(/\/$/, "");

        this.apiEndpoint = `${chatApiBaseUrl}/api/chat`;
        this.classifyEndpoint = `${chatApiBaseUrl}/api/classify`;
        this.ferEndpoint = `${chatApiBaseUrl}/api/fer/analyze`;
        this.personaPreviewEndpoint = `${chatApiBaseUrl}/api/persona/preview`;
        this.cameraStream = null;
        this.isCameraActive = false;
        this.latestFaceEmotion = null;
        this.faceEmotionHistory = [];
        this.ferAnalysisTimer = null;
        this.isFerAnalyzing = false;
        // Konteks wajah dibentuk dari sinyal stabil, bukan satu frame sesaat.
        this.FER_ANALYSIS_INTERVAL_MS = 1000;
        this.FER_CONTEXT_WINDOW_MS = 5000;
        this.FER_MIN_CONTEXT_DURATION_MS = 5000;
        // Model FER dapat membutuhkan lebih dari satu detik per inferensi.
        // Tiga sampel dalam jendela 5 detik cukup untuk konteks awal yang stabil.
        this.FER_MIN_SAMPLES = 3;
        this.currentTextEmotion = "neutral";
        this.lastPersonaPreviewKey = null;
        this.isLoading = false;
        this.activeChatRequestController = null;
        this.conversationHistory = [];
        this.emotionCounts = {
            sadness: 0,
            happy: 0,
            anger: 0,
            fear: 0,
            suicidal: 0,
            neutral: 0,
        };
        this.lastThreeEmotions = [];
        this.classificationFinal = null;
        this.totalEmotionClassifications = 0;
        this.REQUIRED_CLASSIFICATIONS = 3;
        this.sessionStarted = false;
        this.chatSessions = [];
        this.musicRecommendations = {
            sadness: [
                {
                    title: "Breathe Me",
                    artist: "Sia",
                    url: "https://www.youtube.com/watch?v=ghPcYqn0p4Y",
                    thumbnail:
                        "https://img.youtube.com/vi/SFGvmrJ5rjM/mqdefault.jpg",
                    videoId: "SFGvmrJ5rjM",
                },
                {
                    title: "Fix You",
                    artist: "Coldplay",
                    url: "https://www.youtube.com/watch?v=k4V3Mo61fJM",
                    thumbnail:
                        "https://img.youtube.com/vi/k4V3Mo61fJM/mqdefault.jpg",
                    videoId: "k4V3Mo61fJM",
                },
                {
                    title: "Healing",
                    artist: "Fletcher",
                    url: "https://www.youtube.com/watch?v=5nrxAfpQFnQ",
                    thumbnail:
                        "https://img.youtube.com/vi/5nrxAfpQFnQ/mqdefault.jpg",
                    videoId: "5nrxAfpQFnQ",
                },
            ],
            anger: [
                {
                    title: "Lose Yourself",
                    artist: "Eminem",
                    url: "https://www.youtube.com/watch?v=_Yhyp-_hX2s",
                    thumbnail:
                        "https://img.youtube.com/vi/_Yhyp-_hX2s/mqdefault.jpg",
                    videoId: "_Yhyp-_hX2s",
                },
                {
                    title: "Break Stuff",
                    artist: "Limp Bizkit",
                    url: "https://www.youtube.com/watch?v=ZpUYjpKg9KY",
                    thumbnail:
                        "https://img.youtube.com/vi/ZpUYjpKg9KY/mqdefault.jpg",
                    videoId: "ZpUYjpKg9KY",
                },
                {
                    title: "Stronger",
                    artist: "Kanye West",
                    url: "https://www.youtube.com/watch?v=PsO6ZnUZI0g",
                    thumbnail:
                        "https://img.youtube.com/vi/PsO6ZnUZI0g/mqdefault.jpg",
                    videoId: "PsO6ZnUZI0g",
                },
            ],
            fear: [
                {
                    title: "Weightless",
                    artist: "Marconi Union",
                    url: "https://www.youtube.com/watch?v=UfcAVejslrU",
                    thumbnail:
                        "https://img.youtube.com/vi/UfcAVejslrU/mqdefault.jpg",
                    videoId: "UfcAVejslrU",
                },
                {
                    title: "Electra",
                    artist: "Airstream",
                    url: "https://www.youtube.com/watch?v=zU3ho1kDMRE",
                    thumbnail:
                        "https://img.youtube.com/vi/zU3ho1kDMRE/mqdefault.jpg",
                    videoId: "zU3ho1kDMRE",
                },
                {
                    title: "Pure Shores",
                    artist: "All Saints",
                    url: "https://www.youtube.com/watch?v=dVNdTXEJv1A",
                    thumbnail:
                        "https://img.youtube.com/vi/dVNdTXEJv1A/mqdefault.jpg",
                    videoId: "dVNdTXEJv1A",
                },
            ],
            suicidal: [
                {
                    title: "1-800-273-8255",
                    artist: "Logic",
                    url: "https://www.youtube.com/watch?v=Kb24RrHIbFk",
                    thumbnail:
                        "https://img.youtube.com/vi/Kb24RrHIbFk/mqdefault.jpg",
                    videoId: "Kb24RrHIbFk",
                },
                {
                    title: "Hold On",
                    artist: "Chord Overstreet",
                    url: "https://www.youtube.com/watch?v=8ofCZObsnOo",
                    thumbnail:
                        "https://img.youtube.com/vi/8ofCZObsnOo/mqdefault.jpg",
                    videoId: "8ofCZObsnOo",
                },
                {
                    title: "Alive",
                    artist: "Sia",
                    url: "https://www.youtube.com/watch?v=t2NgsJrrAyM",
                    thumbnail:
                        "https://img.youtube.com/vi/t2NgsJrrAyM/mqdefault.jpg",
                    videoId: "t2NgsJrrAyM",
                },
            ],
            neutral: [
                {
                    title: "Happy",
                    artist: "Pharrell Williams",
                    url: "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
                    thumbnail:
                        "https://img.youtube.com/vi/ZbZSe6N_BXs/mqdefault.jpg",
                    videoId: "ZbZSe6N_BXs",
                },
                {
                    title: "Good Day",
                    artist: "Surfaces",
                    url: "https://www.youtube.com/watch?v=2Zt5cAUPh94",
                    thumbnail:
                        "https://img.youtube.com/vi/2Zt5cAUPh94/mqdefault.jpg",
                    videoId: "2Zt5cAUPh94",
                },
                {
                    title: "Walking On Sunshine",
                    artist: "Katrina & The Waves",
                    url: "https://www.youtube.com/watch?v=iPUmE-tne5U",
                    thumbnail:
                        "https://img.youtube.com/vi/iPUmE-tne5U/mqdefault.jpg",
                    videoId: "iPUmE-tne5U",
                },
            ],
        };
        this.musicPlayer = null;
        this.currentPlayingMusic = null;
        this.sessionStartTime = new Date().getTime();
        this.lastEmotionResetTime = this.sessionStartTime;

        this.emotionResources = {
            fear: {
               articles: [
                {
                    title: "How to manage fear and anxiety",
                    source: "Mental Health Foundation UK",
                    link: "https://www.mentalhealth.org.uk/explore-mental-health/publications/how-overcome-anxiety-and-fear"
                },
                {
                    title: "One habit could reduce your fears of public speaking, criticism, failure and more",
                    source: "VeryWellMind",
                    link: "https://edition.cnn.com/2021/11/04/health/mindfulness-practices-for-fear-benefits-wellness"
                },
                {
                    title: "Anxiety Management: Fear Leads to Worry",
                    source: "The Conover Company",
                    link: "https://www.conovercompany.com/anxiety-management-fear-leads-worry/"
                },
                {
                    title: "Anxiety and Anger: Understand the Relationship",
                    source: "Mind Health Group",
                    link: "https://www.mindhealthgroup.com/blog/anxiety-anger-whats-the-relationship/"
                },
                {
                    title: "Human Emotional Evaluation of Ancestral and Modern Threats",
                    source: "Frontiers in Psychology",
                    link: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1321053/full"
                }
            ],

                journals: [
                    {
                        title: "The Neuroscience of Fear and Its Modulation Through Meditation",
                        source: "Nature Reviews Neuroscience (2020)",
                        link: "https://doi.org/10.1038/s41583-020-0320-6",
                    },
                    {
                        title: "Fear, Anxiety and COVID-19: A Systematic Review",
                        source: "Brain, Behavior, and Immunity (2021)",
                        link: "https://doi.org/10.1016/j.bbi.2020.10.028",
                    },
                    {
                        title: "Fear Extinction and Emotion Regulation in Mindfulness",
                        source: "Biological Psychiatry: Cognitive Neuroscience and Neuroimaging (2022)",
                        link: "https://doi.org/10.1016/j.bpsc.2021.10.004",
                    },
                    {
                        title: "Virtual Reality Exposure Therapy for Fear",
                        source: "Journal of Anxiety Disorders (2020)",
                        link: "https://doi.org/10.1016/j.janxdis.2019.102147",
                    },
                    {
                        title: "Fear Processing in Social Media Exposure",
                        source: "Computers in Human Behavior (2023)",
                        link: "https://doi.org/10.1016/j.chb.2023.107324",
                    },
                ],
                meditations: [
                    {
                        title: "Fear & Anxiety Guided Meditation",
                        source: "Michael Sealey (2023)",
                        link: "https://www.youtube.com/watch?v=2zxJxV4qLug",
                    },
                    {
                        title: "Let Go of Fear",
                        source: "Great Meditation (2024)",
                        link: "https://www.youtube.com/watch?v=1vzv_My2kqI",
                    },
                    {
                        title: "Healing Fear",
                        source: "Sarah Blondin - Insight Timer (2021)",
                        link: "https://insighttimer.com/sarahblondin",
                    },
                    {
                        title: "Fear Release",
                        source: "Tamara Levitt - Calm App",
                        link: "https://www.calm.com/tamara-levitt",
                    },
                    {
                        title: "Facing Fear Daily Meditation",
                        source: "Headspace",
                        link: "https://www.headspace.com/meditation/anxiety",
                    },
                ],
                music: [
                    {
                        title: "Electra",
                        artist: "Airstream",
                        type: "Chill ambient",
                        link: "https://youtu.be/8bS4Y9Od8TI?si=54ueWhBqiOcxqyeD",
                    },
                    {
                        title: "Night Owl",
                        artist: "Galimatias",
                        type: "Chill electronic",
                        link: "https://youtu.be/BOWUM4Qt2J4?si=dmgA6d_Vy-j1pPj6",
                    },
                    {
                        title: "Mellomaniac (Chillout Mix)",
                        artist: "DJ Shah",
                        type: "Chillout",
                        link: "https://youtu.be/EcRXlM6edrM?si=C3jTSOC7ppUuMr2l",
                    },
                    {
                        title: "An Ending (Ascent)",
                        artist: "Brian Eno",
                        type: "Ambient",
                        link: "https://youtu.be/hvzQQOAjuoU?si=yve0Yh4mH3L9eEk5",
                    },
                    {
                        title: "Delta Waves Sleep Music",
                        artist: "Binaural Beats Therapy",
                        type: "Brainwave audio (deep relax)",
                        link: "https://youtu.be/xQ6xgDI7Whc?si=8CTHn-Y_GLqvs2Rg",
                    },
                ],
            },
            sadness: {
                articles: [
                    {
                        title: "Sadness in Psychology: Exploring the Emotional Landscape",
                        source: "NeuroLaunch",
                        link: "https://neurolaunch.com/what-is-sadness-in-psychology/"
                    },
                    {
                        title: "Depression vs. Sadness: How to Tell the Difference",
                        source: "Medical News Today",
                        link: "https://www.medicalnewstoday.com/articles/314418"
                    },
                    {
                        title: "What Is Depression?",
                        source: "American Psychiatric Association",
                        link: "https://www.psychiatry.org/patients-families/depression/what-is-depression"
                    },
                    {
                        title: "Understanding Grief and Loss",
                        source: "help guide",
                        link: "https://www.helpguide.org/mental-health/grief/coping-with-grief-and-loss"
                    }
                ],

                journals: [
                    {
                        title: "The Neuroscience of Fear and Its Modulation Through Meditation",
                        source: "Nature Reviews Neuroscience (2020)",
                        link: "https://doi.org/10.1038/s41583-020-0320-6",
                    },
                    {
                        title: "Fear, Anxiety and COVID-19: A Systematic Review",
                        source: "Brain, Behavior, and Immunity (2021)",
                        link: "https://doi.org/10.1016/j.bbi.2020.10.028",
                    },
                    {
                        title: "Fear Extinction and Emotion Regulation in Mindfulness",
                        source: "Biological Psychiatry: Cognitive Neuroscience and Neuroimaging (2022)",
                        link: "https://doi.org/10.1016/j.bpsc.2021.10.004",
                    },
                    {
                        title: "Virtual Reality Exposure Therapy for Fear",
                        source: "Journal of Anxiety Disorders (2020)",
                        link: "https://doi.org/10.1016/j.janxdis.2019.102147",
                    },
                    {
                        title: "Fear Processing in Social Media Exposure",
                        source: "Computers in Human Behavior (2023)",
                        link: "https://doi.org/10.1016/j.chb.2023.107324",
                    },
                ],
                meditations: [
                    {
                        title: "Fear & Anxiety Guided Meditation",
                        source: "Michael Sealey (2023)",
                        link: "https://www.youtube.com/watch?v=2zxJxV4qLug",
                    },
                    {
                        title: "Let Go of Fear",
                        source: "Great Meditation (2024)",
                        link: "https://www.youtube.com/watch?v=1vzv_My2kqI",
                    },
                    {
                        title: "Healing Fear",
                        source: "Sarah Blondin - Insight Timer (2021)",
                        link: "https://insighttimer.com/sarahblondin",
                    },
                    {
                        title: "Fear Release",
                        source: "Tamara Levitt - Calm App",
                        link: "https://www.calm.com/tamara-levitt",
                    },
                    {
                        title: "Facing Fear Daily Meditation",
                        source: "Headspace",
                        link: "https://www.headspace.com/meditation/anxiety",
                    },
                ],
                music: [
                    {
                        title: "Electra",
                        artist: "Airstream",
                        type: "Chill ambient",
                        link: "https://youtu.be/8bS4Y9Od8TI?si=54ueWhBqiOcxqyeD",
                    },
                    {
                        title: "Night Owl",
                        artist: "Galimatias",
                        type: "Chill electronic",
                        link: "https://youtu.be/BOWUM4Qt2J4?si=dmgA6d_Vy-j1pPj6",
                    },
                    {
                        title: "Mellomaniac (Chillout Mix)",
                        artist: "DJ Shah",
                        type: "Chillout",
                        link: "https://youtu.be/EcRXlM6edrM?si=C3jTSOC7ppUuMr2l",
                    },
                    {
                        title: "An Ending (Ascent)",
                        artist: "Brian Eno",
                        type: "Ambient",
                        link: "https://youtu.be/hvzQQOAjuoU?si=yve0Yh4mH3L9eEk5",
                    },
                    {
                        title: "Delta Waves Sleep Music",
                        artist: "Binaural Beats Therapy",
                        type: "Brainwave audio (deep relax)",
                        link: "https://youtu.be/xQ6xgDI7Whc?si=8CTHn-Y_GLqvs2Rg",
                    },
                ],
            },
            anger: {
                articles: [
                    {
                        title: "mengapa-marah-dan-melepas-emosi-penting",
                        source: "kompas.id",
                        link: "https://www.kompas.id/baca/gaya-hidup/2024/08/04/mengapa-marah-dan-melepas-emosi-penting"
                    },
                    {
                        title: "penyebab-seseorang-bisa-punya-anger-issues",
                        source: "antaranews",
                        link: "https://www.antaranews.com/berita/4791069/penyebab-seseorang-bisa-punya-anger-issues"
                    },
                    {
                        title: "Control anger before it controls you",
                        source: "Mindful.org",
                        link: "https://www.apa.org/topics/anger/control"
                    },
                    {
                        title: "Anxiety and Anger: Exploring the Relationship",
                        source: "Talkspace",
                        link: "https://www.talkspace.com/mental-health/conditions/articles/anxiety-and-anger/"
                    },
                    {
                        title: "Anxiety and Anger: How They're Connected",
                        source: "Discovery Mood & Anxiety Program",
                        link: "https://discoverymood.com/blog/anxiety-and-anger/"
                    }
                ],

                journals: [
                    {
                        title: "The Neuroscience of Fear and Its Modulation Through Meditation",
                        source: "Nature Reviews Neuroscience (2020)",
                        link: "https://doi.org/10.1038/s41583-020-0320-6",
                    },
                    {
                        title: "Fear, Anxiety and COVID-19: A Systematic Review",
                        source: "Brain, Behavior, and Immunity (2021)",
                        link: "https://doi.org/10.1016/j.bbi.2020.10.028",
                    },
                    {
                        title: "Fear Extinction and Emotion Regulation in Mindfulness",
                        source: "Biological Psychiatry: Cognitive Neuroscience and Neuroimaging (2022)",
                        link: "https://doi.org/10.1016/j.bpsc.2021.10.004",
                    },
                    {
                        title: "Virtual Reality Exposure Therapy for Fear",
                        source: "Journal of Anxiety Disorders (2020)",
                        link: "https://doi.org/10.1016/j.janxdis.2019.102147",
                    },
                    {
                        title: "Fear Processing in Social Media Exposure",
                        source: "Computers in Human Behavior (2023)",
                        link: "https://doi.org/10.1016/j.chb.2023.107324",
                    },
                ],
                meditations: [
                    {
                        title: "Fear & Anxiety Guided Meditation",
                        source: "Michael Sealey (2023)",
                        link: "https://www.youtube.com/watch?v=2zxJxV4qLug",
                    },
                    {
                        title: "Let Go of Fear",
                        source: "Great Meditation (2024)",
                        link: "https://www.youtube.com/watch?v=1vzv_My2kqI",
                    },
                    {
                        title: "Healing Fear",
                        source: "Sarah Blondin - Insight Timer (2021)",
                        link: "https://insighttimer.com/sarahblondin",
                    },
                    {
                        title: "Fear Release",
                        source: "Tamara Levitt - Calm App",
                        link: "https://www.calm.com/tamara-levitt",
                    },
                    {
                        title: "Facing Fear Daily Meditation",
                        source: "Headspace",
                        link: "https://www.headspace.com/meditation/anxiety",
                    },
                ],
                music: [
                    {
                        title: "Electra",
                        artist: "Airstream",
                        type: "Chill ambient",
                        link: "https://youtu.be/8bS4Y9Od8TI?si=54ueWhBqiOcxqyeD",
                    },
                    {
                        title: "Night Owl",
                        artist: "Galimatias",
                        type: "Chill electronic",
                        link: "https://youtu.be/BOWUM4Qt2J4?si=dmgA6d_Vy-j1pPj6",
                    },
                    {
                        title: "Mellomaniac (Chillout Mix)",
                        artist: "DJ Shah",
                        type: "Chillout",
                        link: "https://youtu.be/EcRXlM6edrM?si=C3jTSOC7ppUuMr2l",
                    },
                    {
                        title: "An Ending (Ascent)",
                        artist: "Brian Eno",
                        type: "Ambient",
                        link: "https://youtu.be/hvzQQOAjuoU?si=yve0Yh4mH3L9eEk5",
                    },
                    {
                        title: "Delta Waves Sleep Music",
                        artist: "Binaural Beats Therapy",
                        type: "Brainwave audio (deep relax)",
                        link: "https://youtu.be/xQ6xgDI7Whc?si=8CTHn-Y_GLqvs2Rg",
                    },
                ],
            },
            suicidal: {
                articles: [
                    {
                        title: "2024 National Strategy for Suicide Prevention",
                        source: "U.S. Department of Health and Human Services",
                        link: "https://www.hhs.gov/programs/prevention-and-wellness/mental-health-substance-use-disorder/national-strategy-suicide-prevention/index.html"
                    },
                    {
                        title: "Suicide Prevention Month",
                        source: "NAMI",
                        link: "https://www.nami.org/get-involved/awareness-events/suicide-prevention-month/"
                    },
                    {
                        title: "Youth Mental Health Trends in 2025",
                        source: "JED Foundation",
                        link: "https://jedfoundation.org/what-we-expect-in-2025-new-years-trends-in-youth-mental-health/"
                    }
                ],

                journals: [
                    {
                        title: "The Neuroscience of Fear and Its Modulation Through Meditation",
                        source: "Nature Reviews Neuroscience (2020)",
                        link: "https://doi.org/10.1038/s41583-020-0320-6",
                    },
                    {
                        title: "Fear, Anxiety and COVID-19: A Systematic Review",
                        source: "Brain, Behavior, and Immunity (2021)",
                        link: "https://doi.org/10.1016/j.bbi.2020.10.028",
                    },
                    {
                        title: "Fear Extinction and Emotion Regulation in Mindfulness",
                        source: "Biological Psychiatry: Cognitive Neuroscience and Neuroimaging (2022)",
                        link: "https://doi.org/10.1016/j.bpsc.2021.10.004",
                    },
                    {
                        title: "Virtual Reality Exposure Therapy for Fear",
                        source: "Journal of Anxiety Disorders (2020)",
                        link: "https://doi.org/10.1016/j.janxdis.2019.102147",
                    },
                    {
                        title: "Fear Processing in Social Media Exposure",
                        source: "Computers in Human Behavior (2023)",
                        link: "https://doi.org/10.1016/j.chb.2023.107324",
                    },
                ],
                meditations: [
                    {
                        title: "Fear & Anxiety Guided Meditation",
                        source: "Michael Sealey (2023)",
                        link: "https://www.youtube.com/watch?v=2zxJxV4qLug",
                    },
                    {
                        title: "Let Go of Fear",
                        source: "Great Meditation (2024)",
                        link: "https://www.youtube.com/watch?v=1vzv_My2kqI",
                    },
                    {
                        title: "Healing Fear",
                        source: "Sarah Blondin - Insight Timer (2021)",
                        link: "https://insighttimer.com/sarahblondin",
                    },
                    {
                        title: "Fear Release",
                        source: "Tamara Levitt - Calm App",
                        link: "https://www.calm.com/tamara-levitt",
                    },
                    {
                        title: "Facing Fear Daily Meditation",
                        source: "Headspace",
                        link: "https://www.headspace.com/meditation/anxiety",
                    },
                ],
                music: [
                    {
                        title: "Electra",
                        artist: "Airstream",
                        type: "Chill ambient",
                        link: "https://youtu.be/8bS4Y9Od8TI?si=54ueWhBqiOcxqyeD",
                    },
                    {
                        title: "Night Owl",
                        artist: "Galimatias",
                        type: "Chill electronic",
                        link: "https://youtu.be/BOWUM4Qt2J4?si=dmgA6d_Vy-j1pPj6",
                    },
                    {
                        title: "Mellomaniac (Chillout Mix)",
                        artist: "DJ Shah",
                        type: "Chillout",
                        link: "https://youtu.be/EcRXlM6edrM?si=C3jTSOC7ppUuMr2l",
                    },
                    {
                        title: "An Ending (Ascent)",
                        artist: "Brian Eno",
                        type: "Ambient",
                        link: "https://youtu.be/hvzQQOAjuoU?si=yve0Yh4mH3L9eEk5",
                    },
                    {
                        title: "Delta Waves Sleep Music",
                        artist: "Binaural Beats Therapy",
                        type: "Brainwave audio (deep relax)",
                        link: "https://youtu.be/xQ6xgDI7Whc?si=8CTHn-Y_GLqvs2Rg",
                    },
                ],
            },
            neutral: {
                articles: [
                    {
                        title: "How to Work With Fear Today",
                        source: "Mindful.org (2024)",
                        link: "https://www.mindful.org/how-to-deal-with-fear-now/",
                    },
                    {
                        title: "The Role of Mindfulness in Overcoming Fear",
                        source: "VeryWellMind (2023)",
                        link: "https://www.verywellmind.com/mindfulness-and-fear-6500432",
                    },
                    {
                        title: "Facing Modern Fear: From Social Anxiety to AI Panic",
                        source: "Psychology Today (2023)",
                        link: "https://www.psychologytoday.com/us/blog/facing-modern-fears",
                    },
                    {
                        title: "Fear and Digital Overload: What to Do About It",
                        source: "Harvard Health (2022)",
                        link: "https://www.health.harvard.edu/blog/fear-digital-age",
                    },
                    {
                        title: "Is Fear Always Bad? Neuroscientific Insights",
                        source: "Scientific American (2024)",
                        link: "https://www.scientificamerican.com/fear-and-brain-2024",
                    },
                ],
                journals: [
                    {
                        title: "The Neuroscience of Fear and Its Modulation Through Meditation",
                        source: "Nature Reviews Neuroscience (2020)",
                        link: "https://doi.org/10.1038/s41583-020-0320-6",
                    },
                    {
                        title: "Fear, Anxiety and COVID-19: A Systematic Review",
                        source: "Brain, Behavior, and Immunity (2021)",
                        link: "https://doi.org/10.1016/j.bbi.2020.10.028",
                    },
                    {
                        title: "Fear Extinction and Emotion Regulation in Mindfulness",
                        source: "Biological Psychiatry: Cognitive Neuroscience and Neuroimaging (2022)",
                        link: "https://doi.org/10.1016/j.bpsc.2021.10.004",
                    },
                    {
                        title: "Virtual Reality Exposure Therapy for Fear",
                        source: "Journal of Anxiety Disorders (2020)",
                        link: "https://doi.org/10.1016/j.janxdis.2019.102147",
                    },
                    {
                        title: "Fear Processing in Social Media Exposure",
                        source: "Computers in Human Behavior (2023)",
                        link: "https://doi.org/10.1016/j.chb.2023.107324",
                    },
                ],
                meditations: [
                    {
                        title: "Fear & Anxiety Guided Meditation",
                        source: "Michael Sealey (2023)",
                        link: "https://www.youtube.com/watch?v=2zxJxV4qLug",
                    },
                    {
                        title: "Let Go of Fear",
                        source: "Great Meditation (2024)",
                        link: "https://www.youtube.com/watch?v=1vzv_My2kqI",
                    },
                    {
                        title: "Healing Fear",
                        source: "Sarah Blondin - Insight Timer (2021)",
                        link: "https://insighttimer.com/sarahblondin",
                    },
                    {
                        title: "Fear Release",
                        source: "Tamara Levitt - Calm App",
                        link: "https://www.calm.com/tamara-levitt",
                    },
                    {
                        title: "Facing Fear Daily Meditation",
                        source: "Headspace",
                        link: "https://www.headspace.com/meditation/anxiety",
                    },
                ],
                music: [
                    {
                        title: "Electra",
                        artist: "Airstream",
                        type: "Chill ambient",
                        link: "https://youtu.be/8bS4Y9Od8TI?si=54ueWhBqiOcxqyeD",
                    },
                    {
                        title: "Night Owl",
                        artist: "Galimatias",
                        type: "Chill electronic",
                        link: "https://youtu.be/BOWUM4Qt2J4?si=dmgA6d_Vy-j1pPj6",
                    },
                    {
                        title: "Mellomaniac (Chillout Mix)",
                        artist: "DJ Shah",
                        type: "Chillout",
                        link: "https://youtu.be/EcRXlM6edrM?si=C3jTSOC7ppUuMr2l",
                    },
                    {
                        title: "An Ending (Ascent)",
                        artist: "Brian Eno",
                        type: "Ambient",
                        link: "https://youtu.be/hvzQQOAjuoU?si=yve0Yh4mH3L9eEk5",
                    },
                    {
                        title: "Delta Waves Sleep Music",
                        artist: "Binaural Beats Therapy",
                        type: "Brainwave audio (deep relax)",
                        link: "https://youtu.be/xQ6xgDI7Whc?si=8CTHn-Y_GLqvs2Rg",
                    },
                ],
            },
        };
    }

    async render() {
        return `
      <div class="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div class="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div class="flex items-center space-x-4">
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300" id="backButton" title="Kembali">
              <i class="fas fa-arrow-left"></i>
            </button>
            <img src="/images/Wrapper.png" alt="Logo" class="h-8" />
          </div>
          <div class="flex items-center space-x-3">
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300" id="historyButton" title="Riwayat chat akun">
              <i class="fas fa-clock-rotate-left"></i>
            </button>
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300" id="newChatButton" title="Mulai chat baru">
              <i class="fas fa-pen-to-square"></i>
            </button>
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 hidden" id="cameraToggleButton" title="Aktifkan FER pada sesi curhat">
              <i class="fas fa-video"></i>
            </button>
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300" id="musicButton" title="Musik">
              <i class="fas fa-music"></i>
            </button>
          </div>
        </div>
      </div>

      <div id="chatHistoryPanel" class="hidden fixed inset-0 z-50 bg-black/40 p-4">
        <div class="mx-auto mt-16 max-w-lg rounded-2xl bg-white p-5 shadow-xl">
          <div class="flex items-center justify-between">
            <div><h2 class="font-semibold text-gray-800">Riwayat chat akun ini</h2><p class="text-xs text-gray-500">Tersimpan di perangkat ini untuk akun yang sedang login.</p></div>
            <div class="flex items-center gap-2">
              <button id="clearChatHistoryButton" class="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50" title="Hapus seluruh riwayat chat">Hapus semua</button>
              <button id="closeHistoryButton" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <div id="chatHistoryList" class="mt-4 max-h-96 space-y-2 overflow-y-auto"></div>
        </div>
      </div>

      <div class="chat-container flex h-[calc(100vh-73px)] min-h-0 flex-col overflow-hidden bg-slate-50">
        <div class="order-2 mx-auto mt-3 h-[38vh] min-h-[280px] max-h-[440px] w-[calc(100%-3rem)] max-w-4xl flex-none overflow-y-auto rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm" id="chatMessages">
          <div class="max-w-4xl mx-auto flex items-center justify-center h-full w-full">
            <div class="text-center max-w-2xl mx-auto mb-8">
              <div id="startChatContainer" class="flex justify-center">
                <div>
                  <button id="startChatButton" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <i class="fas fa-comments mr-2"></i>
                    Mulai Curhat Sekarang
                  </button>
                  <p class="mt-3 text-sm text-gray-500">Di sesi curhat, kamu bisa mengaktifkan kamera secara opsional agar persona MyCareAI menyesuaikan respons berdasarkan sinyal FER.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="musicPlayerContainer" class="order-3 hidden px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded overflow-hidden">
                  <img id="musicThumbnail" src="" alt="Thumbnail" class="w-full h-full object-cover">
                </div>
                <div>
                  <p class="font-medium text-gray-800" id="musicTitle">Judul Lagu</p>
                  <p class="text-sm text-gray-600" id="musicArtist">Nama Artis</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <a href="#" target="_blank" id="openYoutubeLink" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700" title="Buka musik">
                  <i class="fab fa-youtube"></i>
                </a>
                <button id="closePlayerButton" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="ferPanel" class="order-1 hidden px-6 pt-4">
          <div class="max-w-4xl mx-auto bg-white border border-blue-100 rounded-2xl p-4 shadow-sm">
            <div class="flex flex-col md:flex-row gap-4 md:items-center">
              <video id="ferVideo" class="h-36 w-full rounded-xl border border-gray-200 bg-gray-100 object-cover md:w-56" autoplay muted playsinline></video>
              <canvas id="ferCanvas" class="hidden"></canvas>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fas fa-face-smile text-blue-600"></i>
                  <p class="font-semibold text-gray-800">FER untuk Sesi Curhat</p>
                </div>
                <p id="ferStatus" class="text-sm text-gray-600">Aktifkan kamera jika kamu nyaman. Setelah aktif, ekspresi dianalisis otomatis setiap 1 detik dan diringkas dari 5 detik terakhir.</p>
                <p class="text-xs text-gray-400 mt-1">Sinyal wajah hanya dipakai sebagai konteks pendukung persona adaptif, bukan diagnosis.</p>
                <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Indikator sinyal emosi">
                  <div class="rounded-xl bg-blue-50 p-3">
                    <div class="flex justify-between gap-2 text-xs font-medium text-blue-900">
                      <span>Emosi dari teks</span><span id="textSignalValue">Belum ada pesan</span>
                    </div>
                    <div class="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                      <div id="textSignalBar" class="h-full rounded-full bg-blue-600 transition-all duration-500" style="width: 0%"></div>
                    </div>
                  </div>
                  <div class="rounded-xl bg-violet-50 p-3">
                    <div class="flex justify-between gap-2 text-xs font-medium text-violet-900">
                      <span>Sinyal wajah realtime</span><span id="faceSignalValue">Kamera nonaktif</span>
                    </div>
                    <div class="mt-2 h-2 overflow-hidden rounded-full bg-violet-100">
                      <div id="faceSignalBar" class="h-full rounded-full bg-violet-600 transition-all duration-500" style="width: 0%"></div>
                    </div>
                  </div>
                  <div class="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div class="flex flex-wrap justify-between gap-2 text-xs font-medium text-slate-700">
                      <span>Konteks respons adaptif</span><span id="personaSignalValue">Menunggu sinyal</span>
                    </div>
                    <p id="signalSafetyNote" class="mt-1 text-xs text-slate-500">Indikator ini membantu menyesuaikan dukungan percakapan; bukan diagnosis atau penilaian kesehatan mental.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-4 px-6 py-3" id="inputContainer" style="display: none;">
          <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div class="flex items-end space-x-4">
                <div class="flex-1">
                  <textarea
                    id="messageInput"
                    class="message-input w-full border-0 resize-none focus:outline-none focus:ring-0 text-gray-700 placeholder-gray-400"
                    placeholder="Ceritakan apa yang sedang kamu rasakan di sini..."
                    rows="1"
                  ></textarea>
                </div>
                <button id="sendButton" class="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex-shrink-0" disabled>
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="musicRecommendationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">Rekomendasi Musik untuk Moodmu</h3>
            <button id="closeModalButton" class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="text-gray-600 mb-4">Kami mendeteksi bahwa kamu mungkin sedang merasa <span id="detectedMood"></span>. Berikut beberapa musik yang mungkin bisa membantu:</p>
          <div id="musicRecommendationList" class="space-y-3">
            <!-- Music recommendations will be inserted here -->
          </div>
        </div>
      </div>
    `;
    }

    // Fungsi untuk otomatis mengubah ukuran input
    autoResize(event) {
        event.target.style.height = "auto";
        event.target.style.height =
            Math.min(event.target.scrollHeight, 200) + "px";
        this.sendButton.disabled = event.target.value.trim() === "";
    }

    // Fungsi untuk menangani penekanan tombol "Enter"
    handleKeyPress(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    getChatStorageKey() {
        return Storage.getScopedKey("chat-history");
    }

    getChatSessionsStorageKey() {
        return Storage.getScopedKey("chat-sessions");
    }

    loadChatSessions() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.getChatSessionsStorageKey()) || "[]");
            this.chatSessions = Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Gagal memuat riwayat chat:", error);
            this.chatSessions = [];
        }
    }

    saveChatSessions() {
        localStorage.setItem(this.getChatSessionsStorageKey(), JSON.stringify(this.chatSessions.slice(0, 20)));
    }

    archiveCurrentChat() {
        if (!this.messages.length) return;
        const firstUserMessage = this.messages.find((message) => message.type === "user")?.content || "Sesi curhat MyCareAI";
        this.chatSessions = [
            {
                id: `${this.sessionStartTime || Date.now()}`,
                savedAt: Date.now(),
                title: firstUserMessage.slice(0, 80),
                messageCount: this.messages.length,
                data: {
                    messages: this.messages,
                    // Pesan user tanpa jawaban LLM tidak dimasukkan sebagai
                    // konteks saat sesi dibuka kembali.
                    conversationHistory: this.getCompletedConversationHistory(),
                    emotionCounts: this.emotionCounts,
                    lastThreeEmotions: this.lastThreeEmotions,
                    classificationFinal: this.classificationFinal,
                    totalEmotionClassifications: this.totalEmotionClassifications,
                    sessionStartTime: this.sessionStartTime,
                    lastEmotionResetTime: this.lastEmotionResetTime,
                    sessionStarted: this.sessionStarted,
                },
            },
            ...this.chatSessions.filter((session) => session.id !== `${this.sessionStartTime || Date.now()}`),
        ];
        this.saveChatSessions();
    }

    renderChatHistory() {
        const list = document.getElementById("chatHistoryList");
        if (!list) return;
        if (!this.chatSessions.length) {
            list.innerHTML = '<p class="py-6 text-center text-sm text-gray-500">Belum ada sesi chat yang diarsipkan.</p>';
            return;
        }
        list.innerHTML = this.chatSessions.map((session) => {
            const date = new Date(session.savedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
            return `<button class="history-session w-full rounded-xl border border-blue-600 bg-blue-600 p-3 text-left text-white shadow-sm transition hover:bg-blue-700" data-session-id="${session.id}">
                <p class="truncate text-sm font-medium text-gray-800">${this.escapeHtml(session.title)}</p>
                <p class="mt-1 text-xs text-blue-100">${date} · ${session.messageCount} pesan</p>
            </button>`;
        }).join("");
        list.querySelectorAll(".history-session").forEach((button) => {
            button.addEventListener("click", () => this.restoreChatSession(button.dataset.sessionId));
        });
    }

    escapeHtml(value) {
        const element = document.createElement("div");
        element.textContent = String(value || "");
        return element.innerHTML;
    }

    restoreChatSession(sessionId) {
        const session = this.chatSessions.find((item) => item.id === sessionId);
        if (!session?.data) return;
        localStorage.setItem(this.getChatStorageKey(), JSON.stringify(session.data));
        window.location.reload();
    }

    startNewChat() {
        this.cancelPendingChatRequest();
        this.archiveCurrentChat();
        localStorage.removeItem(this.getChatStorageKey());
        this.stopCamera();
        window.location.reload();
    }

    getCompletedConversationHistory() {
        const history = Array.isArray(this.conversationHistory)
            ? this.conversationHistory.filter((item) => item && item.content && ["user", "assistant"].includes(item.role))
            : [];
        let lastAssistantIndex = -1;
        history.forEach((item, index) => {
            if (item.role === "assistant") lastAssistantIndex = index;
        });
        return lastAssistantIndex >= 0 ? history.slice(0, lastAssistantIndex + 1) : [];
    }

    cancelPendingChatRequest() {
        if (this.activeChatRequestController) {
            this.activeChatRequestController.abort();
            this.activeChatRequestController = null;
        }
        this.isLoading = false;
        this.hideTypingIndicator();
    }

    clearAllChatHistory() {
        const confirmed = window.confirm("Hapus sesi aktif dan seluruh riwayat chat pada perangkat ini?");
        if (!confirmed) return;

        this.cancelPendingChatRequest();
        this.stopCamera();
        this.chatSessions = [];
        localStorage.removeItem(this.getChatStorageKey());
        localStorage.removeItem(this.getChatSessionsStorageKey());
        window.location.reload();
    }

    // Riwayat chat disimpan khusus untuk akun yang sedang aktif.
    saveToLocalStorage() {
        const chatData = {
            messages: this.messages,
            // Jangan menyimpan request yang masih menunggu jawaban. Saat
            // riwayat dibuka lagi, hanya konteks yang telah selesai dipakai.
            conversationHistory: this.getCompletedConversationHistory(),
            emotionCounts: this.emotionCounts,
            lastThreeEmotions: this.lastThreeEmotions,
            classificationFinal: this.classificationFinal,
            totalEmotionClassifications: this.totalEmotionClassifications,
            sessionStartTime: this.sessionStartTime,
            lastEmotionResetTime: this.lastEmotionResetTime,
            sessionStarted: this.sessionStarted,
        };
        localStorage.setItem(this.getChatStorageKey(), JSON.stringify(chatData));
    }

    // Muat riwayat hanya dari akun yang sedang aktif.
    loadFromLocalStorage() {
        const chatData = localStorage.getItem(this.getChatStorageKey());
        if (chatData) {
            try {
                const parsedData = JSON.parse(chatData);

                // Validasi data sebelum digunakan
                if (parsedData && typeof parsedData === "object") {
                    // Pastikan messages adalah array
                    this.messages = Array.isArray(parsedData.messages)
                        ? parsedData.messages
                        : [];

                    // Pastikan conversationHistory adalah array
                    this.conversationHistory = Array.isArray(
                        parsedData.conversationHistory
                    )
                        ? parsedData.conversationHistory
                        : [];
                    this.conversationHistory = this.getCompletedConversationHistory();

                    // Pastikan emotionCounts adalah objek dengan struktur yang benar
                    if (
                        parsedData.emotionCounts &&
                        typeof parsedData.emotionCounts === "object"
                    ) {
                        this.emotionCounts = {
                            sadness: parsedData.emotionCounts.sadness || 0,
                            happy: parsedData.emotionCounts.happy || 0,
                            anger: parsedData.emotionCounts.anger || 0,
                            fear: parsedData.emotionCounts.fear || 0,
                            suicidal: parsedData.emotionCounts.suicidal || 0,
                            neutral: parsedData.emotionCounts.neutral || 0,
                        };
                    } else {
                        this.emotionCounts = {
                            sadness: 0,
                            happy: 0,
                            anger: 0,
                            fear: 0,
                            suicidal: 0,
                            neutral: 0,
                        };
                    }

                    // Pastikan lastThreeEmotions adalah array
                    this.lastThreeEmotions = Array.isArray(
                        parsedData.lastThreeEmotions
                    )
                        ? parsedData.lastThreeEmotions
                        : [];

                    // Muat classificationFinal jika ada
                    this.classificationFinal =
                        parsedData.classificationFinal || null;

                    // Muat totalEmotionClassifications
                    this.totalEmotionClassifications =
                        typeof parsedData.totalEmotionClassifications ===
                        "number"
                            ? parsedData.totalEmotionClassifications
                            : 0;

                    // Pastikan timestamps adalah angka yang valid
                    this.sessionStartTime =
                        typeof parsedData.sessionStartTime === "number"
                            ? parsedData.sessionStartTime
                            : new Date().getTime();

                    this.lastEmotionResetTime =
                        typeof parsedData.lastEmotionResetTime === "number"
                            ? parsedData.lastEmotionResetTime
                            : this.sessionStartTime;

                    // Muat status sesi
                    this.sessionStarted = parsedData.sessionStarted || false;

                    // Cek apakah perlu mereset emosi (setiap 24 jam)
                    this.checkEmotionReset();

                    // Render pesan yang tersimpan
                    this.renderSavedMessages();

                    // Tampilkan UI sesuai dengan status sesi
                    this.updateUIBasedOnSessionStatus();
                    if (this.classificationFinal) {
                    // Diberi sedikit jeda untuk memastikan DOM pesan lain sudah ter-render
                    setTimeout(() => {
                        this.showComprehensiveRecommendations(this.classificationFinal);
                    }, 100);
                 }
                }
            } catch (error) {
                console.error("Error parsing localStorage data:", error);
                // Jika terjadi error, gunakan nilai default
                this.resetToDefaultValues();
            }
        } else {
            // Jika tidak ada data di localStorage, gunakan nilai default
            this.resetToDefaultValues();
        }
    }

    // Fungsi untuk mereset ke nilai default
    resetToDefaultValues() {
        this.messages = [];
        this.conversationHistory = [];
        this.emotionCounts = {
            sadness: 0,
            happy: 0,
            anger: 0,
            fear: 0,
            suicidal: 0,
            neutral: 0,
        };
        this.lastThreeEmotions = [];
        this.classificationFinal = null;
        this.totalEmotionClassifications = 0;
        this.sessionStarted = false;
        this.sessionStartTime = new Date().getTime();
        this.lastEmotionResetTime = this.sessionStartTime;
    }

    checkEmotionReset() {
        const currentTime = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

        if (currentTime - this.lastEmotionResetTime > oneDay) {
            this.resetEmotionData();
            this.lastEmotionResetTime = currentTime;
            this.saveToLocalStorage();
        }
    }

    // Fungsi untuk mereset data emosi
    resetEmotionData() {
        this.emotionCounts = {
            sadness: 0,
            happy: 0,
            anger: 0,
            fear: 0,
            suicidal: 0,
            neutral: 0,
        };
        this.lastThreeEmotions = [];
    }

    // Fungsi untuk merender pesan yang tersimpan
    renderSavedMessages() {
        const chatMessages = document.getElementById("chatMessages");

        // Bersihkan container pesan
        while (chatMessages.firstChild) {
            if (
                chatMessages.firstChild.classList &&
                chatMessages.firstChild.classList.contains("text-center")
            ) {
                break;
            }
            chatMessages.removeChild(chatMessages.firstChild);
        }

        // Render pesan yang tersimpan
        this.messages.forEach((msg) => {
            const messageElement = document.createElement("div");

            messageElement.className =
                msg.type === "user"
                    ? "flex justify-end mb-4"
                    : "flex justify-start mb-4";

            const bubbleClass =
                msg.type === "user"
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-none py-3 px-4 max-w-[80%]"
                    : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%]";

            messageElement.innerHTML = `
                <div class="${bubbleClass}">
                    <p>${this.formatMessage(msg.message)}</p>
                </div>
            `;

            chatMessages.appendChild(messageElement);
        });

        this.scrollToBottom();
    }

    // Fungsi untuk mengirim pesan
    async sendMessage() {
        if (this.isLoading) return;

        const input = this.messageInput;
        const message = input.value.trim();

        if (message) {
            // Tambahkan pesan pengguna ke tampilan
            this.addMessage(message, "user");

            // Simpan pesan pengguna ke history
            this.conversationHistory.push({
                role: "user",
                content: message,
            });
            // Simpan tampilan pesan segera, tetapi helper penyimpanan hanya
            // menyimpan konteks LLM yang sudah memiliki jawaban assistant.
            this.saveToLocalStorage();

            // Reset input
            input.value = "";
            input.style.height = "auto";
            this.sendButton.disabled = true;

            // Set loading state
            this.isLoading = true;
            const requestController = new AbortController();
            this.activeChatRequestController = requestController;
            this.showTypingIndicator();

            try {
                // Klasifikasi emosi teks pengguna
                const emotion = await this.classifyEmotion(message, requestController.signal);
                if (requestController.signal.aborted) return;

                // Gunakan konteks stabil yang telah dikumpulkan realtime selama 5 detik.
                const faceEmotion = this.getFaceEmotionContext();

                // Kirim pesan ke API dengan konteks teks + FER
                const apiResult = await this.sendMessageToApi(message, emotion, faceEmotion, requestController.signal);
                if (requestController.signal.aborted) return;
                const response = apiResult.reply || "Tidak ada respons dari AI.";

                // Tambahkan respons dari API ke tampilan
                this.hideTypingIndicator();
                this.addMessage(response, "bot");

                // Simpan respons bot ke history
                this.conversationHistory.push({
                    role: "assistant",
                    content: response,
                });

                // Risiko krisis bukan lagi kelas model teks. Aktifkan UI
                // keselamatan hanya dari hasil Context Manager/backend.
                this.applyBackendSafetyContext(apiResult);

                // Simpan data ke localStorage
                this.saveToLocalStorage();

                // Cek apakah perlu menampilkan rekomendasi musik
                this.checkMusicRecommendation();
            } catch (error) {
                if (error.name === "AbortError") return;
                console.error("Error sending message:", error);
                this.hideTypingIndicator();
                this.addMessage(
                    "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
                    "bot error"
                );
            } finally {
                if (this.activeChatRequestController === requestController) {
                    this.activeChatRequestController = null;
                    this.isLoading = false;
                    this.scrollToBottom();
                }
            }
        }
    }

    // Fungsi untuk klasifikasi emosi
    // --- KODE BARU YANG DIPERBAIKI ---
async classifyEmotion(message, signal) {
    if (!this.sessionStarted) {
        this.updateTextSignal("neutral", 0);
        return "neutral";
    }

    // === FILTER KATA KUNCI DITAMBAHKAN DI SINI ===
    const lowerCaseMessage = message.toLowerCase();
    const nonEmotionalKeywords = [
         'halo', 'hai', 'siang', 'sore', 'malam',
    'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
    'assalamualaikum', 'apa kabar',
    
    // Pertanyaan Fungsional
    'siapa kamu', 'kamu siapa',
    'apa itu', 'ini aplikasi apa',
    'kamu bisa apa', 'bisa bantu apa', 'apa fungsi kamu',
    'kamu bot ya', 'apakah kamu bot', 'ini robot',
    
    // Permintaan Saran (Non-emosional)
    'kasih saran', 'beri saya saran', 'minta saran', 'butuh saran',
    'rekomendasi', 'jelaskan tentang',
    
    // Penutup & Ucapan Terima Kasih
    'terima kasih', 'makasih',
    'cukup', 'sudah cukup', 'udah dulu',
    'selesai', 'sampai jumpa', 'dah', 'bye',
    
    // Niat & Uji Coba
    'mau curhat', 'cerita', 'saya ingin curhat',
    'tes', 'test', 'testing', 'coba'
    ];

    // Cek apakah pesan mengandung salah satu kata kunci di atas
    const isNonEmotional = nonEmotionalKeywords.some(keyword => lowerCaseMessage.includes(keyword));

     if (isNonEmotional) {
        console.log("Pesan non-emosional terdeteksi, klasifikasi dilewati.");
        this.updateTextSignal("neutral", 0);
        return "neutral"; 
    }
    // --- Akhir Filter ---

    try {
        const response = await fetch(this.classifyEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const detectedEmotion = data.emotion || "neutral";
        this.currentTextEmotion = detectedEmotion;
        this.updateTextSignal(detectedEmotion, data.probability || 0);

        // Model teks hanya menghasilkan sadness, happy, anger, dan fear.
        // Risiko krisis ditentukan setelahnya oleh Context Manager/backend.
        if (detectedEmotion !== 'neutral') {
            if (this.emotionCounts[detectedEmotion] !== undefined) {
                this.emotionCounts[detectedEmotion]++;
                this.totalEmotionClassifications++;
            }

            if (this.totalEmotionClassifications >= this.REQUIRED_CLASSIFICATIONS && !this.classificationFinal) {
                this.determineFinalMusicPreference();
            }
        }
        return detectedEmotion;

    } catch (error) {
        console.error("Klasifikasi emosi error:", error);
        this.updateTextSignal("neutral", 0);
        return "neutral";
    }
}

    // Fungsi baru untuk menentukan preferensi musik final
    determineFinalMusicPreference() {
        // Temukan emosi dominan dari semua interaksi
        let dominantEmotion = null;
        let maxCount = 0;

        for (const [emotion, count] of Object.entries(this.emotionCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantEmotion = emotion;
            }
        }

        // Tetapkan sebagai preferensi musik final
        if (dominantEmotion) {
            this.classificationFinal = dominantEmotion;

            // Tampilkan rekomendasi komprehensif berdasarkan emosi dominan
            this.showComprehensiveRecommendations(dominantEmotion);

            // Simpan data ke localStorage
            this.saveToLocalStorage();

            // Tambahkan entri ke jurnal emosi
            this.saveEmotionToJournal(dominantEmotion);
        }
    }

    // Metode baru untuk menyimpan emosi ke jurnal
    saveEmotionToJournal(emotion) {
        try {
            const catatanEmosi = new CatatanEmosi();

            const dateKey = catatanEmosi.addEmotionJournalFromChatbot(
                emotion,
                this.sessionStartTime
            );

            const chatMessages = document.getElementById("chatMessages");
            if (chatMessages) {
                const messageElement = document.createElement("div");
                messageElement.className = "flex justify-start mb-4";
                messageElement.innerHTML = `
                    <div class="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%]">
                        <p>Emosi dominan Anda telah disimpan ke <a href="#/catatan-emosi" class="text-blue-600 underline">Catatan Emosi</a>. Anda dapat melihat dan mengedit catatan ini nanti.</p>
                    </div>
                `;
                chatMessages.appendChild(messageElement);
                this.scrollToBottom();
            }
        } catch (error) {
            console.error("Error saving emotion to journal:", error);
        }
    }

    applyBackendSafetyContext(apiResult) {
        if (!apiResult?.emotion_fusion?.crisis_detected) return;

        this.currentTextEmotion = "suicidal";
        this.updateTextSignal("suicidal", 0);
        if (this.classificationFinal === "suicidal") return;

        this.classificationFinal = "suicidal";
        this.showComprehensiveRecommendations("suicidal");
        this.saveEmotionToJournal("suicidal");
    }

    // Fungsi untuk menampilkan rekomendasi komprehensif
    showComprehensiveRecommendations(emotion) {
        // Tampilkan pesan notifikasi ke chat
        const chatMessages = document.getElementById("chatMessages");
        const messageElement = document.createElement("div");
        messageElement.className = "flex justify-start mb-4";

        // Dapatkan nama emosi dalam bahasa Indonesia
        const emotionNameMap = {
            sadness: "sedih",
            happy: "senang atau bahagia",
            anger: "marah",
            fear: "cemas atau takut",
            suicidal: "sangat tertekan",
            neutral: "senang atau bahagia",
        };
        const emotionName = emotionNameMap[emotion] || emotion;

        // Cek apakah kita memiliki data untuk emosi ini
        const resources = this.emotionResources[emotion];
        if (!resources) {
            // Jika tidak ada data khusus, tampilkan hanya rekomendasi musik
            messageElement.innerHTML = `
                <div class="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%]">
                    <p>Berdasarkan percakapan kita, saya telah menentukan bahwa kamu mungkin sedang merasa <strong>${emotionName}</strong>. Berikut rekomendasi musik yang mungkin bisa membantu:</p>
                </div>
            `;
            chatMessages.appendChild(messageElement);
            this.scrollToBottom();

            // Tampilkan rekomendasi musik
            this.showMusicRecommendation(emotion);
            return;
        }

        // Jika ada data lengkap, tampilkan card rekomendasi komprehensif
        const cardElement = document.createElement("div");
        cardElement.className = "flex justify-start mb-4";
        cardElement.innerHTML = `
            <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-md p-4 max-w-[90%]">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Rekomendasi untuk Mengelola Perasaan ${emotionName}</h3>
                <p class="text-gray-600 mb-4">Berdasarkan percakapan kita, saya telah mengidentifikasi bahwa kamu mungkin sedang merasa ${emotionName}. Berikut beberapa rekomendasi yang mungkin membantu:</p>

                <div class="space-y-4">
                    <!-- Artikel -->
                    <div class="border-b border-gray-200 pb-4">
                        <h4 class="font-medium text-blue-600 mb-2">Artikel yang Direkomendasikan</h4>
                        <ul class="space-y-2">
                            ${resources.articles
                                .slice(0, 3)
                                .map(
                                    (article) => `
                                <li>
                                    <a href="${article.link}" target="_blank" class="text-gray-700 hover:text-blue-600 flex items-start">
                                        <span class="text-blue-500 mr-2">📄</span>
                                        <span>${article.title} <span class="text-gray-500 text-sm">- ${article.source}</span></span>
                                    </a>
                                </li>
                            `
                                )
                                .join("")}
                        </ul>
                    </div>

                    <!-- Jurnal -->
                    <div class="border-b border-gray-200 pb-4">
                        <h4 class="font-medium text-purple-600 mb-2">Jurnal Penelitian</h4>
                        <ul class="space-y-2">
                            ${resources.journals
                                .slice(0, 2)
                                .map(
                                    (journal) => `
                                <li>
                                    <a href="${journal.link}" target="_blank" class="text-gray-700 hover:text-purple-600 flex items-start">
                                        <span class="text-purple-500 mr-2">📚</span>
                                        <span>${journal.title} <span class="text-gray-500 text-sm">- ${journal.source}</span></span>
                                    </a>
                                </li>
                            `
                                )
                                .join("")}
                        </ul>
                    </div>

                    <!-- Meditasi -->
                    <div class="border-b border-gray-200 pb-4">
                        <h4 class="font-medium text-green-600 mb-2">Meditasi & Mindfulness</h4>
                        <ul class="space-y-2">
                            ${resources.meditations
                                .slice(0, 3)
                                .map(
                                    (meditation) => `
                                <li>
                                    <a href="${meditation.link}" target="_blank" class="text-gray-700 hover:text-green-600 flex items-start">
                                        <span class="text-green-500 mr-2">🧘</span>
                                        <span>${meditation.title} <span class="text-gray-500 text-sm">- ${meditation.source}</span></span>
                                    </a>
                                </li>
                            `
                                )
                                .join("")}
                        </ul>
                    </div>

                    <!-- Musik -->
                    <div>
                        <h4 class="font-medium text-red-600 mb-2">Musik Penenang</h4>
                        <ul class="space-y-2">
                            ${resources.music
                                .slice(0, 3)
                                .map(
                                    (music) => `
                                <li>
                                    <a href="${music.link}" target="_blank" class="text-gray-700 hover:text-red-600 flex items-start">
                                        <span class="text-red-500 mr-2">🎵</span>
                                        <span>${music.title} - ${music.artist} <span class="text-gray-500 text-sm">(${music.type})</span></span>
                                    </a>
                                </li>
                            `
                                )
                                .join("")}
                        </ul>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-t border-gray-200">
                    <button id="showMoreRecommendations" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                        Lihat lebih banyak rekomendasi <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        chatMessages.appendChild(cardElement);
        this.scrollToBottom();

        // Tambahkan event listener untuk tombol "Lihat lebih banyak"
        setTimeout(() => {
            const showMoreButton = document.getElementById(
                "showMoreRecommendations"
            );
            if (showMoreButton) {
                showMoreButton.addEventListener("click", () => {
                    this.showMusicRecommendation(emotion);
                });
            }
        }, 100);
    }

    // Fungsi untuk mengirim pesan ke API
    async sendMessageToApi(message, activeEmotion = null, faceEmotion = null, signal) {
        try {
            const payload = {
                message: message,
                conversation_history: this.conversationHistory,
                active_emotion: activeEmotion,
                face_emotion: faceEmotion,
            };

            const response = await fetch(this.apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(
                    "API response not OK:",
                    response.status,
                    errorText
                );
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Metadata adaptive persona dipakai untuk debugging skripsi, tidak ditampilkan sebagai diagnosis ke user.
            if (data.adaptive_persona || data.emotion_fusion) {
                console.log("Emotion fusion result:", data.emotion_fusion);
                console.log("Adaptive persona state:", data.adaptive_persona);
                this.updatePersonaSignal(data.adaptive_persona, data.emotion_fusion);
            }

            return data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    // Fungsi untuk memeriksa apakah perlu menampilkan rekomendasi musik
    checkMusicRecommendation() {
        // Hanya tampilkan rekomendasi jika sesi sudah dimulai
        if (!this.sessionStarted) {
            return;
        }

        // Jika sudah ada preferensi musik final, gunakan itu
        if (this.classificationFinal) {
            return;
        }

        // Pastikan ada minimal 3 pesan dari pengguna sebelum menampilkan rekomendasi
        const userMessages = this.messages.filter((msg) => msg.type === "user");

        // Jika belum ada cukup pesan dari pengguna, jangan tampilkan rekomendasi
        if (userMessages.length < 3) {
            return;
        }

        // Jika belum mencapai jumlah klasifikasi yang dibutuhkan, gunakan metode lama
        if (this.lastThreeEmotions.length === 3) {
            const emotionCounts = {};
            this.lastThreeEmotions.forEach((emotion) => {
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });

            // Temukan emosi dominan
            let dominantEmotion = null;
            let maxCount = 0;

            for (const [emotion, count] of Object.entries(emotionCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    dominantEmotion = emotion;
                }
            }

            // Jika ada emosi dominan, tampilkan rekomendasi musik
            // Emosi dominan harus muncul minimal 3 kali dari 3 deteksi terakhir
            if (dominantEmotion && maxCount >= 3) {
                this.showMusicRecommendation(dominantEmotion);

                // Reset emosi setelah menampilkan rekomendasi
                this.lastThreeEmotions = [];
                this.saveToLocalStorage();
            }
        }
    }

    // Fungsi untuk menampilkan rekomendasi musik
    showMusicRecommendation(emotion) {
        const modal = document.getElementById("musicRecommendationModal");
        const moodText = document.getElementById("detectedMood");
        const musicList = document.getElementById("musicRecommendationList");

        // Set mood text
        const moodMap = {
            sadness: "sedih",
            happy: "senang atau bahagia",
            anger: "marah",
            fear: "cemas atau takut",
            suicidal: "sangat tertekan",
            neutral: "senang atau bahagia",
        };

        moodText.textContent = moodMap[emotion] || "sedih";

        // Clear previous recommendations
        musicList.innerHTML = "";

        // Add music recommendations
        const recommendationEmotion = this.musicRecommendations[emotion]
            ? emotion
            : "neutral";
        const recommendations = this.musicRecommendations[recommendationEmotion];
        recommendations.forEach((music, index) => {
            const musicItem = document.createElement("div");
            musicItem.className =
                "p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer";
            musicItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-16 h-12 rounded overflow-hidden relative group">
                            <img src="${music.thumbnail}" alt="${music.title}" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i class="fas fa-play text-white"></i>
                            </div>
                        </div>
                        <div>
                            <p class="font-medium">${music.title}</p>
                            <p class="text-sm text-gray-600">${music.artist}</p>
                        </div>
                    </div>
                    <button class="play-music-btn inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700" data-index="${index}" data-emotion="${recommendationEmotion}">
                        <i class="fab fa-youtube"></i>
                    </button>
                </div>
            `;
            musicList.appendChild(musicItem);

            // Add event listener
            const playButton = musicItem.querySelector(".play-music-btn");
            playButton.addEventListener("click", () => {
                this.playMusic(recommendationEmotion, index);
                modal.classList.add("hidden");
            });

            // Make the entire item clickable
            musicItem.addEventListener("click", (e) => {
                if (!e.target.closest(".play-music-btn")) {
                    this.playMusic(recommendationEmotion, index);
                    modal.classList.add("hidden");
                }
            });
        });

        // Show modal
        modal.classList.remove("hidden");
    }

    // Fungsi untuk memutar musik
    playMusic(emotion, index) {
        const musicData = this.musicRecommendations[emotion][index];
        const playerContainer = document.getElementById("musicPlayerContainer");
        const musicTitle = document.getElementById("musicTitle");
        const musicArtist = document.getElementById("musicArtist");
        const musicThumbnail = document.getElementById("musicThumbnail");
        const youtubeLink = document.getElementById("openYoutubeLink");

        // Set music info
        musicTitle.textContent = musicData.title;
        musicArtist.textContent = musicData.artist;
        musicThumbnail.src = musicData.thumbnail;
        youtubeLink.href = musicData.url;

        // Show player
        playerContainer.classList.remove("hidden");

        // Set current playing music
        this.currentPlayingMusic = {
            emotion,
            index,
            isPlaying: true,
        };

        window.open(musicData.url, "_blank");
    }

    closePlayer() {
        const playerContainer = document.getElementById("musicPlayerContainer");
        playerContainer.classList.add("hidden");
        this.currentPlayingMusic = null;
    }

    addMessage(message, type) {
        const chatMessages = document.getElementById("chatMessages");
        const messageElement = document.createElement("div");

        messageElement.className =
            type === "user"
                ? "flex justify-end mb-4"
                : "flex justify-start mb-4";

        const bubbleClass =
            type === "user"
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-none py-3 px-4 max-w-[80%]"
                : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%]";

        messageElement.innerHTML = `
            <div class="${bubbleClass}">
                <p>${this.formatMessage(message)}</p>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        this.messages.push({ message, type });
        this.scrollToBottom();
    }

    formatMessage(message) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return message.replace(
            urlRegex,
            (url) =>
                `<a href="${url}" target="_blank" class="underline">${url}</a>`
        );
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById("chatMessages");
        const typingElement = document.createElement("div");
        typingElement.id = "typingIndicator";
        typingElement.className = "flex justify-start mb-4";
        typingElement.innerHTML = `
            <div class="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none py-3 px-4">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById("typingIndicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    goBack() {
        window.history.back();
    }

    toggleMusic() {
        if (!this.sessionStarted) {
            const chatMessages = document.getElementById("chatMessages");
            const messageElement = document.createElement("div");
            messageElement.className = "flex justify-start mb-4";
            messageElement.innerHTML = `
                <div class="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%]">
                    <p>Silakan mulai sesi curhat terlebih dahulu dengan mengklik tombol "Mulai Curhat Sekarang" untuk mendapatkan rekomendasi musik yang sesuai dengan suasana hatimu.</p>
                </div>
            `;
            chatMessages.appendChild(messageElement);
            this.scrollToBottom();
            return;
        }

        if (this.classificationFinal) {
            this.showComprehensiveRecommendations(this.classificationFinal);
            return;
        }

        if (this.lastThreeEmotions.length === 0) {
            const chatMessages = document.getElementById("chatMessages");
            const messageElement = document.createElement("div");
            messageElement.className = "flex justify-start mb-4";
            messageElement.innerHTML = `
                <div class="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none py-3 px-4 max-w-[80%]">
                    <p>Saya belum bisa mendeteksi suasana hatimu dengan jelas. Silakan ceritakan lebih banyak agar saya bisa merekomendasikan musik yang sesuai.</p>
                </div>
            `;
            chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        } else {
            const lastEmotion =
                this.lastThreeEmotions[this.lastThreeEmotions.length - 1];
            this.showMusicRecommendation(lastEmotion);
        }
    }


    async toggleCamera() {
        if (!this.sessionStarted) {
            this.startChatSession();
        }

        const ferPanel = document.getElementById("ferPanel");
        const ferVideo = document.getElementById("ferVideo");
        const ferStatus = document.getElementById("ferStatus");
        const cameraButton = document.getElementById("cameraToggleButton");

        if (this.isCameraActive) {
            this.stopCamera();
            return;
        }

        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });

            if (ferVideo) {
                ferVideo.srcObject = this.cameraStream;
            }

            this.isCameraActive = true;
            this.faceEmotionHistory = [];
            this.latestFaceEmotion = null;
            this.lastPersonaPreviewKey = null;
            this.updateFaceSignal(null, 0, "Mengaktifkan kamera...");
            this.startRealtimeFaceAnalysis();
            if (ferPanel) ferPanel.classList.remove("hidden");
            if (cameraButton) cameraButton.classList.add("ring-2", "ring-blue-300");
            if (ferStatus) {
                ferStatus.textContent = "Kamera aktif. Mengumpulkan sinyal wajah otomatis selama 5 detik untuk membentuk konteks respons.";
            }
        } catch (error) {
            console.error("Tidak bisa mengaktifkan kamera:", error);
            if (ferStatus) {
                ferStatus.textContent = "Kamera tidak bisa diakses. Pastikan izin kamera sudah diberikan di browser.";
            }
        }
    }

    stopCamera() {
        const ferPanel = document.getElementById("ferPanel");
        const ferVideo = document.getElementById("ferVideo");
        const ferStatus = document.getElementById("ferStatus");
        const cameraButton = document.getElementById("cameraToggleButton");

        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach((track) => track.stop());
        }

        this.cameraStream = null;
        this.isCameraActive = false;
        this.latestFaceEmotion = null;
        this.faceEmotionHistory = [];
        this.lastPersonaPreviewKey = null;
        this.stopRealtimeFaceAnalysis();
        this.updateFaceSignal(null, 0, "Kamera nonaktif");

        if (ferVideo) ferVideo.srcObject = null;
        if (ferPanel && !this.sessionStarted) ferPanel.classList.add("hidden");
        if (cameraButton) cameraButton.classList.remove("ring-2", "ring-blue-300");
        if (ferStatus) {
            ferStatus.textContent = "Kamera nonaktif. Kamu tetap bisa curhat tanpa FER, atau aktifkan lagi jika nyaman.";
        }
    }

    captureCurrentFrame() {
        const ferVideo = document.getElementById("ferVideo");
        const ferCanvas = document.getElementById("ferCanvas");

        if (!this.isCameraActive || !ferVideo || !ferCanvas || !ferVideo.videoWidth) {
            return null;
        }

        ferCanvas.width = ferVideo.videoWidth;
        ferCanvas.height = ferVideo.videoHeight;
        const context = ferCanvas.getContext("2d");
        context.drawImage(ferVideo, 0, 0, ferCanvas.width, ferCanvas.height);
        return ferCanvas.toDataURL("image/jpeg", 0.85);
    }

    mapFaceEmotionLabel(emotion) {
        const labelMap = {
            angry: "marah/tegang",
            fear: "takut/cemas",
            happy: "senang/positif",
            neutral: "netral",
            sad: "sedih",
            uncertain: "belum pasti",
        };
        return labelMap[emotion] || emotion;
    }

    mapTextEmotionLabel(emotion) {
        const labelMap = {
            sadness: "sedih",
            anger: "marah",
            fear: "takut/cemas",
            suicidal: "risiko krisis",
            neutral: "netral",
        };
        return labelMap[emotion] || emotion || "belum ada";
    }

    updateSignalBar(barId, valueId, emotion, confidence, label) {
        const bar = document.getElementById(barId);
        const value = document.getElementById(valueId);
        const percent = Math.max(0, Math.min(100, Math.round((confidence || 0) * 100)));
        if (bar) bar.style.width = `${percent}%`;
        if (value) value.textContent = label || `${emotion} (${percent}%)`;
    }

    updateTextSignal(emotion, confidence = 0) {
        const percent = Math.round((confidence || 0) * 100);
        this.updateSignalBar(
            "textSignalBar",
            "textSignalValue",
            emotion,
            confidence,
            `${this.mapTextEmotionLabel(emotion)}${percent ? ` (${percent}%)` : ""}`
        );
    }

    updateFaceSignal(emotion, confidence = 0, label = null) {
        const percent = Math.round((confidence || 0) * 100);
        this.updateSignalBar(
            "faceSignalBar",
            "faceSignalValue",
            emotion,
            confidence,
            label || `${this.mapFaceEmotionLabel(emotion)}${percent ? ` (${percent}%)` : ""}`
        );
    }

    updatePersonaSignal(persona, fusion = null) {
        const value = document.getElementById("personaSignalValue");
        const note = document.getElementById("signalSafetyNote");
        const state = persona?.state || fusion?.persona_state;
        if (!value || !state) return;

        const labelMap = {
            safety_support: "dukungan keselamatan",
            neutral_supportive: "dukungan netral",
            positive_reinforcement: "penguatan positif",
            sadness_support: "dukungan kesedihan",
            fear_grounding: "dukungan menenangkan",
            anger_deescalation: "dukungan de-eskalasi",
        };
        value.textContent = labelMap[state] || state.replace(/_/g, " ");
        value.title = [persona?.conceptualPersona, persona?.operationalPersona]
            .filter(Boolean)
            .join(" · ");
        if (note) {
            const objective = persona?.objective ? `${persona.objective} ` : "";
            note.textContent = `${objective}Konteks ini mengatur nada respons, bukan diagnosis atau penilaian kesehatan mental.`;
        }
    }

    async refreshAdaptivePersonaPreview(faceEmotion) {
        if (!faceEmotion) return;

        const previewKey = `${this.currentTextEmotion}:${faceEmotion.emotion}`;
        if (previewKey === this.lastPersonaPreviewKey) return;

        const latestUserMessage = [...this.conversationHistory]
            .reverse()
            .find((entry) => entry.role === "user")?.content || "";

        try {
            const response = await fetch(this.personaPreviewEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    active_emotion: this.currentTextEmotion,
                    face_emotion: faceEmotion,
                    user_message: latestUserMessage,
                    conversation_context: this.conversationHistory,
                }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            this.updatePersonaSignal(data.adaptive_persona);
            this.lastPersonaPreviewKey = previewKey;
        } catch (error) {
            console.error("Adaptive persona preview error:", error);
        }
    }

    startRealtimeFaceAnalysis() {
        this.stopRealtimeFaceAnalysis();
        this.analyzeCurrentFrame({ isRealtime: true });
        this.ferAnalysisTimer = window.setInterval(() => {
            this.analyzeCurrentFrame({ isRealtime: true });
        }, this.FER_ANALYSIS_INTERVAL_MS);
    }

    stopRealtimeFaceAnalysis() {
        if (this.ferAnalysisTimer) window.clearInterval(this.ferAnalysisTimer);
        this.ferAnalysisTimer = null;
        this.isFerAnalyzing = false;
    }

    pruneFaceEmotionHistory(now = Date.now()) {
        this.faceEmotionHistory = this.faceEmotionHistory.filter(
            (sample) => now - sample.timestamp <= this.FER_CONTEXT_WINDOW_MS
        );
    }

    getFaceEmotionContext() {
        const now = Date.now();
        this.pruneFaceEmotionHistory(now);

        if (this.faceEmotionHistory.length < this.FER_MIN_SAMPLES) {
            this.latestFaceEmotion = null;
            return null;
        }

        const oldest = this.faceEmotionHistory[0];
        if (now - oldest.timestamp < this.FER_MIN_CONTEXT_DURATION_MS) {
            this.latestFaceEmotion = null;
            return null;
        }

        const grouped = this.faceEmotionHistory.reduce((result, sample) => {
            const entry = result[sample.emotion] || {
                count: 0,
                persona_state: sample.persona_state,
            };
            entry.count += 1;
            result[sample.emotion] = entry;
            return result;
        }, {});
        const [emotion, selected] = Object.entries(grouped).sort(
            ([, left], [, right]) => right.count - left.count
        )[0];

        this.latestFaceEmotion = {
            emotion,
            persona_state: selected.persona_state,
            sample_count: this.faceEmotionHistory.length,
            observation_window_seconds: this.FER_CONTEXT_WINDOW_MS / 1000,
        };
        return this.latestFaceEmotion;
    }

    updateRealtimeFerStatus(message) {
        const ferStatus = document.getElementById("ferStatus");
        if (ferStatus) ferStatus.textContent = message;
    }

    async analyzeCurrentFrame({ isRealtime = false } = {}) {
        if (!this.sessionStarted || !this.isCameraActive) return null;
        if (this.isFerAnalyzing) return this.getFaceEmotionContext();

        const image = this.captureCurrentFrame();
        if (!image) return null;

        try {
            this.isFerAnalyzing = true;
            if (!isRealtime) this.updateRealtimeFerStatus("Menganalisis ekspresi wajah...");

            const response = await fetch(this.ferEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image, model: "fer2013" }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!data.face_detected) {
                this.pruneFaceEmotionHistory();
                this.updateFaceSignal(null, 0, "Wajah belum terdeteksi");
                this.updateRealtimeFerStatus("Wajah belum terdeteksi. Hadapkan wajah ke kamera, gunakan pencahayaan cukup, lalu tunggu analisis berikutnya.");
                return null;
            }

            this.faceEmotionHistory.push({
                emotion: data.emotion,
                persona_state: data.persona_state,
                timestamp: Date.now(),
            });
            const stableContext = this.getFaceEmotionContext();

            if (stableContext) {
                this.updateFaceSignal(stableContext.emotion, 0);
                this.updateRealtimeFerStatus(`Konteks wajah ${this.mapFaceEmotionLabel(stableContext.emotion)} berdasarkan ${stableContext.sample_count} pembacaan selama 5 detik.`);
                this.refreshAdaptivePersonaPreview(stableContext);
            } else {
                this.updateFaceSignal(data.emotion, 0, `Mengumpulkan: ${this.mapFaceEmotionLabel(data.emotion)}`);
                this.updateRealtimeFerStatus(`Mengumpulkan sinyal wajah (${this.faceEmotionHistory.length}/${this.FER_MIN_SAMPLES} pembacaan). Konteks aktif setelah observasi 5 detik.`);
            }
            return stableContext;
        } catch (error) {
            console.error("FER analysis error:", error);
            this.updateRealtimeFerStatus("Analisis FER sementara gagal. Chat tetap bisa digunakan tanpa sinyal wajah.");
            return null;
        } finally {
            this.isFerAnalyzing = false;
        }
    }

    startChatSession() {
        this.sessionStarted = true;

        const startChatContainer =
            document.getElementById("startChatContainer");
        if (startChatContainer) {
            startChatContainer.style.display = "none";
        }

        const inputContainer = document.getElementById("inputContainer");
        if (inputContainer) {
            inputContainer.style.display = "block";
        }

        const ferPanel = document.getElementById("ferPanel");
        if (ferPanel) {
            ferPanel.classList.remove("hidden");
        }

        const cameraToggleButton = document.getElementById("cameraToggleButton");
        if (cameraToggleButton) {
            cameraToggleButton.classList.remove("hidden");
        }

        const ferStatus = document.getElementById("ferStatus");
        if (ferStatus) {
            ferStatus.textContent = "Sesi curhat dimulai. Aktifkan kamera jika nyaman; FER akan mengumpulkan sinyal otomatis selama 5 detik sebagai konteks pendukung, bukan diagnosis.";
        }
        this.updateTextSignal("neutral", 0);
        this.updateFaceSignal(null, 0, "Kamera nonaktif");

        this.addMessage(
            "Halo, aku MyCareAI. Kamu bisa cerita pelan-pelan tentang apa yang sedang kamu rasakan. Kalau kamu nyaman, kamu juga bisa mengaktifkan kamera agar aku bisa menyesuaikan nada respons berdasarkan sinyal ekspresi wajah, tetapi ini sepenuhnya opsional dan bukan diagnosis.",
            "bot"
        );

        setTimeout(() => {
            const messageInput = document.getElementById("messageInput");
            if (messageInput) {
                messageInput.focus();
            }
        }, 500);

        this.resetEmotionData();
        this.totalEmotionClassifications = 0;
        this.classificationFinal = null;

        this.saveToLocalStorage();
    }

    updateUIBasedOnSessionStatus() {
        const startChatContainer =
            document.getElementById("startChatContainer");
        const inputContainer = document.getElementById("inputContainer");
        const ferPanel = document.getElementById("ferPanel");
        const cameraToggleButton = document.getElementById("cameraToggleButton");

        if (this.sessionStarted) {
            if (startChatContainer) startChatContainer.style.display = "none";
            if (inputContainer) inputContainer.style.display = "block";
            if (ferPanel) ferPanel.classList.remove("hidden");
            if (cameraToggleButton) cameraToggleButton.classList.remove("hidden");
        } else {
            if (startChatContainer) startChatContainer.style.display = "flex";
            if (inputContainer) inputContainer.style.display = "none";
            if (ferPanel) ferPanel.classList.add("hidden");
            if (cameraToggleButton) cameraToggleButton.classList.add("hidden");
        }
    }

    async afterRender() {
        // Inisialisasi elemen-elemen setelah render
        this.messageInput = document.getElementById("messageInput");
        this.sendButton = document.getElementById("sendButton");

        // Tambahkan event listeners untuk input dan tombol kirim
        if (this.messageInput) {
            this.messageInput.addEventListener("input", (e) =>
                this.autoResize(e)
            );
            this.messageInput.addEventListener("keydown", (e) =>
                this.handleKeyPress(e)
            );
        }

        if (this.sendButton) {
            this.sendButton.addEventListener("click", () => this.sendMessage());
        }

        // Tambahkan event listeners untuk tombol mulai curhat
        const startChatButton = document.getElementById("startChatButton");
        if (startChatButton) {
            startChatButton.addEventListener("click", () =>
                this.startChatSession()
            );
        }

        // Tambahkan event listeners untuk tombol lainnya
        const backButton = document.getElementById("backButton");
        if (backButton) {
            backButton.addEventListener("click", () => this.goBack());
        }

        const musicButton = document.getElementById("musicButton");
        if (musicButton) {
            musicButton.addEventListener("click", () => this.toggleMusic());
        }

        const cameraToggleButton = document.getElementById("cameraToggleButton");
        if (cameraToggleButton) {
            cameraToggleButton.addEventListener("click", () => this.toggleCamera());
        }

        const historyButton = document.getElementById("historyButton");
        const historyPanel = document.getElementById("chatHistoryPanel");
        const closeHistoryButton = document.getElementById("closeHistoryButton");
        const clearChatHistoryButton = document.getElementById("clearChatHistoryButton");
        if (historyButton) historyButton.addEventListener("click", () => historyPanel?.classList.remove("hidden"));
        if (closeHistoryButton) closeHistoryButton.addEventListener("click", () => historyPanel?.classList.add("hidden"));
        if (clearChatHistoryButton) clearChatHistoryButton.addEventListener("click", () => this.clearAllChatHistory());

        const newChatButton = document.getElementById("newChatButton");
        if (newChatButton) newChatButton.addEventListener("click", () => this.startNewChat());

        // Event listeners untuk modal musik
        const closeModalButton = document.getElementById("closeModalButton");
        if (closeModalButton) {
            closeModalButton.addEventListener("click", () => {
                const modal = document.getElementById(
                    "musicRecommendationModal"
                );
                modal.classList.add("hidden");
            });
        }

        // Event listeners untuk music player
        const playPauseButton = document.getElementById("playPauseButton");
        if (playPauseButton) {
            playPauseButton.addEventListener("click", () =>
                this.togglePlayPause()
            );
        }

        const closePlayerButton = document.getElementById("closePlayerButton");
        if (closePlayerButton) {
            closePlayerButton.addEventListener("click", () =>
                this.closePlayer()
            );
        }

        // Tambahkan CSS untuk animasi typing indicator
        this.addTypingIndicatorStyles();

        // Sembunyikan modal musik saat halaman dimuat
        const musicModal = document.getElementById("musicRecommendationModal");
        if (musicModal) {
            musicModal.classList.add("hidden");
        }

        // Muat riwayat akun, lalu sesi chat aktif untuk akun tersebut.
        this.loadChatSessions();
        this.renderChatHistory();
        this.loadFromLocalStorage();

        // Tambahkan event listener untuk membersihkan localStorage saat halaman ditutup
        // window.addEventListener("beforeunload", () => {
        //     localStorage.removeItem("mycareai_chat_data");
        // });
    }

    // Menambahkan style untuk typing indicator
    addTypingIndicatorStyles() {
        const style = document.createElement("style");
        style.textContent = `
            .typing-indicator {
                display: flex;
                align-items: center;
            }
            .typing-indicator span {
                height: 8px;
                width: 8px;
                background: #606060;
                border-radius: 50%;
                display: inline-block;
                margin-right: 5px;
                animation: bounce 1.5s infinite ease-in-out;
            }
            .typing-indicator span:nth-child(1) {
                animation-delay: 0s;
            }
            .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }
            .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
                margin-right: 0;
            }
            @keyframes bounce {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-5px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}
