/**
 * Emotion-Aware Context Manager untuk MyCareAI.
 *
 * Modul ini mengimplementasikan rancangan persona adaptif skripsi:
 * FER emotion_label + confidence_score + user_message + conversation_context
 * -> rule-based persona selection -> persona prompt -> dynamic LLM context.
 *
 * Prinsip penting:
 * - Hasil FER dan klasifikasi emosi teks hanya menjadi sinyal pendukung, bukan diagnosis.
 * - Risiko krisis dari teks selalu memiliki prioritas tertinggi.
 */

const TEXT_EMOTION_LABELS = {
  sadness: 'kesedihan',
  sad: 'kesedihan',
  anger: 'kemarahan',
  angry: 'kemarahan',
  fear: 'ketakutan atau kecemasan',
  fearful: 'ketakutan atau kecemasan',
  suicidal: 'indikasi krisis emosional',
  neutral: 'netral',
  happy: 'positif atau senang',
};

const FACE_EMOTION_LABELS = {
  angry: 'marah atau tegang',
  anger: 'marah atau tegang',
  fear: 'takut atau cemas',
  fearful: 'takut atau cemas',
  happy: 'senang atau positif',
  neutral: 'netral',
  sad: 'sedih',
  sadness: 'sedih',
  uncertain: 'belum terbaca jelas',
};

const PERSONA_PROFILES = {
  neutral_supportive: {
    conceptualPersona: 'Neutral Supportive Persona',
    operationalPersona: 'neutral_supportive',
    variant: 'neutral_exploration',
    objective: 'Menjaga percakapan tetap nyaman, terbuka, eksploratif, dan tidak menghakimi.',
    responseCharacteristics: ['tenang', 'netral', 'suportif', 'eksploratif'],
    responsePlan: [
      'Akui isi cerita pengguna secara singkat tanpa menebak emosi.',
      'Tunjukkan kesiapan untuk mendengarkan.',
      'Ajukan satu pertanyaan terbuka yang ringan bila sesuai.',
    ],
    avoid: ['diagnosis', 'asumsi emosi yang mutlak', 'ceramah panjang', 'pertanyaan bertubi-tubi'],
    prompt: `
Kamu adalah MyCareAI dengan Neutral Supportive Persona.
Jaga percakapan tetap tenang, terbuka, suportif, dan eksploratif.
Refleksikan cerita pengguna tanpa menebak atau menyimpulkan kondisi psikologisnya.
Berikan ruang untuk bercerita dan ajukan paling banyak satu pertanyaan terbuka yang lembut.
`.trim(),
  },
  positive_reinforcement: {
    conceptualPersona: 'Positive Reinforcement Persona',
    operationalPersona: 'positive_supportive',
    variant: 'positive_reinforcement',
    objective: 'Memberikan penguatan positif dan mempertahankan emosi baik pengguna secara wajar.',
    responseCharacteristics: ['hangat', 'apresiatif', 'positif', 'ringan'],
    responsePlan: [
      'Akui pengalaman atau emosi positif pengguna.',
      'Berikan apresiasi yang spesifik dan tidak berlebihan.',
      'Ajak pengguna mengenali hal yang membantu munculnya perasaan positif tersebut.',
    ],
    avoid: ['toxic positivity', 'pujian berlebihan', 'mengabaikan masalah yang masih disebut pengguna'],
    prompt: `
Kamu adalah MyCareAI dengan Positive Reinforcement Persona.
Tanggapi dengan hangat, apresiatif, positif, dan tetap natural.
Akui hal baik yang dirasakan pengguna dan bantu mereka mengenali faktor yang mendukungnya.
Jangan memaksakan optimisme atau mengabaikan bagian cerita yang masih terasa berat.
`.trim(),
  },
  sadness_support: {
    conceptualPersona: 'Sadness Support Persona',
    operationalPersona: 'distressed_supportive',
    variant: 'sadness_support',
    objective: 'Memberikan validasi emosional dan dukungan lembut ketika pengguna tampak sedih.',
    responseCharacteristics: ['lembut', 'empatik', 'reflektif', 'tidak memaksa'],
    responsePlan: [
      'Refleksikan kesedihan atau beban yang diceritakan dengan hati-hati.',
      'Validasi perasaan tanpa mengecilkan pengalaman pengguna.',
      'Tawarkan kehadiran dan satu pertanyaan lembut, tanpa memaksa solusi.',
    ],
    avoid: ['meminta pengguna segera kuat', 'membandingkan penderitaan', 'solusi instan', 'nada terlalu ceria'],
    prompt: `
Kamu adalah MyCareAI dengan Sadness Support Persona dalam mode distressed_supportive.
Gunakan bahasa yang lembut, empatik, reflektif, dan tidak memaksa.
Validasi kesedihan pengguna tanpa mengecilkan pengalaman atau terburu-buru memberi solusi.
Tawarkan kehadiran, lalu ajukan paling banyak satu pertanyaan lembut jika pengguna tampak siap.
`.trim(),
  },
  fear_grounding: {
    conceptualPersona: 'Fear Grounding Persona',
    operationalPersona: 'distressed_supportive',
    variant: 'fear_grounding',
    objective: 'Membantu pengguna merasa lebih aman dan menurunkan kecemasan tanpa membuat klaim klinis.',
    responseCharacteristics: ['menenangkan', 'hati-hati', 'terstruktur', 'memberi rasa aman'],
    responsePlan: [
      'Akui rasa takut atau cemas tanpa memperkuat ancaman.',
      'Gunakan kalimat pendek dan terstruktur.',
      'Arahkan perhatian pada satu hal aman atau dapat dikendalikan saat ini.',
    ],
    avoid: ['menambah kepanikan', 'kepastian palsu', 'terlalu banyak instruksi', 'klaim bahwa semuanya pasti baik-baik saja'],
    prompt: `
Kamu adalah MyCareAI dengan Fear Grounding Persona dalam mode distressed_supportive.
Gunakan respons yang menenangkan, hati-hati, singkat, dan terstruktur.
Akui kecemasan pengguna tanpa memperkuat ancaman, lalu bantu fokus pada satu hal yang aman atau dapat dikendalikan saat ini.
Jangan memberikan kepastian palsu dan jangan membanjiri pengguna dengan banyak langkah.
`.trim(),
  },
  anger_deescalation: {
    conceptualPersona: 'Anger De-escalation Persona',
    operationalPersona: 'distressed_supportive',
    variant: 'anger_deescalation',
    objective: 'Meredakan intensitas emosi marah dan mencegah respons yang konfrontatif atau berbahaya.',
    responseCharacteristics: ['tenang', 'validatif', 'tidak menyalahkan', 'de-eskalatif'],
    responsePlan: [
      'Validasi rasa kesal atau frustrasi tanpa membenarkan tindakan berbahaya.',
      'Gunakan nada tenang, tidak defensif, dan tidak memihak konflik.',
      'Ajak pengguna berhenti sejenak dan mengurai pemicu secara perlahan.',
    ],
    avoid: ['menantang pengguna', 'membenarkan kekerasan', 'menyalahkan pihak tertentu', 'respons provokatif'],
    prompt: `
Kamu adalah MyCareAI dengan Anger De-escalation Persona dalam mode distressed_supportive.
Validasi kemarahan atau frustrasi tanpa membenarkan kekerasan maupun tindakan berbahaya.
Gunakan nada tenang, tidak defensif, tidak menyalahkan, dan tidak memihak konflik.
Ajak pengguna berhenti sejenak dan mengurai pemicu secara perlahan dengan paling banyak satu pertanyaan.
`.trim(),
  },
  safety_support: {
    conceptualPersona: 'Safety Support Persona',
    operationalPersona: 'safety_support',
    variant: 'crisis_safety',
    objective: 'Memberikan respons aman dan mengarahkan pengguna pada bantuan manusia atau profesional ketika ada risiko tinggi.',
    responseCharacteristics: ['sangat hati-hati', 'suportif', 'langsung', 'berorientasi keselamatan'],
    responsePlan: [
      'Sampaikan kepedulian dan tekankan keselamatan saat ini.',
      'Dorong pengguna menghubungi orang tepercaya atau bantuan profesional/darurat.',
      'Jangan menggali metode, alat, lokasi, atau waktu tindakan berbahaya.',
    ],
    avoid: ['diagnosis', 'detail tindakan berbahaya', 'janji kerahasiaan mutlak', 'meninggalkan pengguna tanpa arahan aman'],
    prompt: `
Kamu adalah MyCareAI dengan Safety Support Persona.
Tanggapi dengan sangat hati-hati, suportif, langsung, dan berorientasi pada keselamatan pengguna maupun orang lain.
Dorong pengguna menghubungi orang tepercaya, tenaga profesional, atau layanan darurat setempat.
Jangan menggali metode atau detail tindakan berbahaya, jangan memberi diagnosis, dan jangan meninggalkan pengguna tanpa arahan aman.
`.trim(),
  },
};

const PERSONA_PROMPTS = Object.fromEntries(
  Object.entries(PERSONA_PROFILES).map(([state, profile]) => [state, profile.prompt])
);

function normalizeTextEmotion(activeEmotion) {
  if (!activeEmotion) return 'neutral';
  const value = String(activeEmotion).toLowerCase().trim();

  const aliases = {
    sad: 'sadness',
    sadness: 'sadness',
    sedih: 'sadness',
    angry: 'anger',
    anger: 'anger',
    marah: 'anger',
    fear: 'fear',
    fearful: 'fear',
    takut: 'fear',
    cemas: 'fear',
    suicidal: 'suicidal',
    suicide: 'suicidal',
    bunuh_diri: 'suicidal',
    neutral: 'neutral',
    netral: 'neutral',
    happy: 'happy',
    senang: 'happy',
    bahagia: 'happy',
  };

  return aliases[value] || 'neutral';
}

function normalizeFaceEmotion(faceEmotionContext) {
  if (!faceEmotionContext || !faceEmotionContext.emotion) {
    return {
      emotion: 'uncertain',
      confidence: 0,
      faceDetected: false,
      raw: faceEmotionContext || null,
    };
  }

  const rawEmotion = String(faceEmotionContext.emotion).toLowerCase().trim();
  const aliases = {
    sadness: 'sad',
    sad: 'sad',
    sedih: 'sad',
    angry: 'angry',
    anger: 'angry',
    marah: 'angry',
    fear: 'fear',
    fearful: 'fear',
    takut: 'fear',
    cemas: 'fear',
    happy: 'happy',
    senang: 'happy',
    bahagia: 'happy',
    neutral: 'neutral',
    netral: 'neutral',
    uncertain: 'uncertain',
  };

  const confidence = Number(faceEmotionContext.confidence || faceEmotionContext.confidence_score || 0);

  return {
    emotion: aliases[rawEmotion] || 'uncertain',
    confidence: Number.isFinite(confidence) ? confidence : 0,
    faceDetected: faceEmotionContext.face_detected !== false,
    raw: faceEmotionContext,
  };
}

function getConversationText(conversationContext = []) {
  if (!Array.isArray(conversationContext)) return '';

  return conversationContext
    .slice(-6)
    .filter((item) => item && item.role === 'user' && item.content)
    .map((item) => String(item.content))
    .join(' ');
}

function detectSafetyRisk(userMessage = '', conversationContext = [], activeEmotion = null) {
  const textEmotion = normalizeTextEmotion(activeEmotion);
  if (textEmotion === 'suicidal') {
    return { detected: true, type: 'self_harm', trigger: 'text_emotion_suicidal' };
  }

  const combinedText = `${userMessage || ''} ${getConversationText(conversationContext)}`.toLowerCase();

  const selfHarmPatterns = [
    /\bbunuh diri\b/i,
    /\bmau mati\b/i,
    /\bpingin mati\b/i,
    /\bingin mati\b/i,
    /\bpengen mati\b/i,
    /\bmending mati\b/i,
    /\bakhiri hidup\b/i,
    /\bmengakhiri hidup\b/i,
    /\btidak mau hidup\b/i,
    /\btak mau hidup\b/i,
    /\bnyakitin diri\b/i,
    /\bmenyakiti diri\b/i,
    /\bmelukai diri\b/i,
    /\bsayat tangan\b/i,
    /\boverdosis\b/i,
    /\bminum racun\b/i,
    /\bgantung diri\b/i,
    /\bloncat dari\b/i,
    /\bsuicide\b/i,
    /\bsuicidal\b/i,
    /\bself[-\s]?harm\b/i,
    /\bkill myself\b/i,
    /\bend my life\b/i,
  ];

  if (selfHarmPatterns.some((pattern) => pattern.test(combinedText))) {
    return { detected: true, type: 'self_harm', trigger: 'text_pattern' };
  }

  const harmToOthersPatterns = [
    /\b(?:ingin|mau|akan|pengen)\s+(?:memukul|menghajar|melukai|menyakiti|membunuh)(?:nya|\s+(?:dia|mereka|orang|seseorang|kamu))\b/i,
    /\b(?:i want to|i will|i am going to)\s+(?:hit|hurt|kill)\s+(?:him|her|them|someone|you)\b/i,
  ];

  if (harmToOthersPatterns.some((pattern) => pattern.test(combinedText))) {
    return { detected: true, type: 'harm_to_others', trigger: 'text_pattern' };
  }

  return { detected: false, type: null, trigger: null };
}

function detectCrisisRisk(userMessage = '', conversationContext = [], activeEmotion = null) {
  return detectSafetyRisk(userMessage, conversationContext, activeEmotion).detected;
}

function mapFaceEmotionToPersona(emotionLabel) {
  switch (emotionLabel) {
    case 'happy':
      return 'positive_reinforcement';
    case 'sad':
    case 'sadness':
      return 'sadness_support';
    case 'fear':
      return 'fear_grounding';
    case 'angry':
    case 'anger':
      return 'anger_deescalation';
    case 'neutral':
    default:
      return 'neutral_supportive';
  }
}

function mapTextEmotionToPersona(textEmotion) {
  switch (textEmotion) {
    case 'sadness':
    case 'sad':
      return 'sadness_support';
    case 'fear':
      return 'fear_grounding';
    case 'anger':
    case 'angry':
      return 'anger_deescalation';
    case 'happy':
      return 'positive_reinforcement';
    case 'neutral':
    default:
      return 'neutral_supportive';
  }
}

function getEmotionFamily(emotion) {
  const normalized = String(emotion || '').toLowerCase();
  if (['sad', 'sadness'].includes(normalized)) return 'sadness';
  if (['angry', 'anger'].includes(normalized)) return 'anger';
  if (['fear', 'fearful'].includes(normalized)) return 'fear';
  if (['happy'].includes(normalized)) return 'happy';
  if (['neutral'].includes(normalized)) return 'neutral';
  return 'uncertain';
}

function determineFusionStatus(textEmotion, face) {
  const textFamily = getEmotionFamily(textEmotion);
  const faceFamily = face.faceDetected ? getEmotionFamily(face.emotion) : 'uncertain';

  if (faceFamily === 'uncertain') return 'face_unavailable';
  if (textFamily === 'neutral' && faceFamily !== 'neutral') return 'face_context_only';
  if (textFamily === faceFamily) return 'signals_aligned';
  if (textFamily !== 'neutral' && faceFamily !== 'neutral') return 'signals_conflicting_text_prioritized';
  return 'signals_neutral';
}

function enrichPersona(personaState, values = {}) {
  const profile = PERSONA_PROFILES[personaState] || PERSONA_PROFILES.neutral_supportive;
  return {
    state: personaState,
    conceptualPersona: profile.conceptualPersona,
    operationalPersona: profile.operationalPersona,
    variant: profile.variant,
    objective: profile.objective,
    responseCharacteristics: profile.responseCharacteristics,
    responsePlan: profile.responsePlan,
    avoid: profile.avoid,
    prompt: profile.prompt,
    ...values,
  };
}

function buildReason(personaState, options = {}) {
  const { emotionLabel, crisisDetected, source, textEmotion, riskType } = options;

  if (crisisDetected || personaState === 'safety_support') {
    const riskLabel = riskType === 'harm_to_others' ? 'risiko menyakiti orang lain' : 'risiko menyakiti diri atau krisis emosional';
    return `Teks pengguna atau konteks percakapan menunjukkan ${riskLabel}, sehingga sistem mengaktifkan persona keselamatan.`;
  }

  if (source === 'text_emotion') {
    return `Klasifikasi emosi teks '${textEmotion}' diprioritaskan karena berasal langsung dari narasi pengguna. FER tetap dipakai sebagai konteks pendukung.`;
  }

  if (source === 'text_emotion_fallback') {
    return `Sinyal FER belum tersedia atau belum stabil, sehingga klasifikasi emosi teks '${textEmotion}' dipakai untuk memilih persona '${personaState}'.`;
  }

  return `Label FER '${emotionLabel}' digunakan untuk memilih persona '${personaState}'. Skor confidence tidak dipakai sebagai ambang atau dasar keputusan.`;
}

/**
 * Fungsi utama sesuai rancangan:
 * select_persona(emotion_label, confidence_score, user_message)
 *
 * Ditulis sebagai object parameter agar cocok dengan payload project saat ini.
 */
function selectPersona({
  emotionLabel = 'neutral',
  confidenceScore = 0,
  userMessage = '',
  conversationContext = [],
  activeEmotion = null,
} = {}) {
  const normalizedTextEmotion = normalizeTextEmotion(activeEmotion);
  const normalizedFace = normalizeFaceEmotion({
    emotion: emotionLabel,
    confidence: confidenceScore,
    face_detected: emotionLabel !== 'uncertain',
  });

  const safetyRisk = detectSafetyRisk(userMessage, conversationContext, normalizedTextEmotion);
  const crisisDetected = safetyRisk.detected;
  const fusionStatus = determineFusionStatus(normalizedTextEmotion, normalizedFace);

  if (crisisDetected) {
    return enrichPersona('safety_support', {
      priority: 'critical',
      source: 'text_crisis_detection',
      textEmotion: normalizedTextEmotion,
      emotionLabel: normalizedFace.emotion,
      confidenceScore: normalizedFace.confidence,
      confidenceLevel: 'not_applicable',
      crisisDetected: true,
      riskType: safetyRisk.type,
      riskTrigger: safetyRisk.trigger,
      fusionStatus,
      sensitivityIncreased: true,
      reason: buildReason('safety_support', {
        crisisDetected: true,
        riskType: safetyRisk.type,
      }),
    });
  }

  const hasMeaningfulTextEmotion = normalizedTextEmotion !== 'neutral';
  const hasStableFaceEmotion = normalizedFace.faceDetected && normalizedFace.emotion !== 'uncertain';
  const source = hasMeaningfulTextEmotion
    ? 'text_emotion'
    : hasStableFaceEmotion
      ? 'fer_label'
      : 'text_emotion_fallback';
  const personaState = hasMeaningfulTextEmotion
    ? mapTextEmotionToPersona(normalizedTextEmotion)
    : hasStableFaceEmotion
      ? mapFaceEmotionToPersona(normalizedFace.emotion)
      : mapTextEmotionToPersona(normalizedTextEmotion);
  const sensitivityIncreased = ['sadness_support', 'fear_grounding', 'anger_deescalation'].includes(personaState);

  return enrichPersona(personaState, {
    priority: sensitivityIncreased ? 'medium' : 'low',
    source,
    textEmotion: normalizedTextEmotion,
    emotionLabel: normalizedFace.emotion,
    confidenceScore: normalizedFace.confidence,
    confidenceLevel: 'not_used_for_decision',
    crisisDetected: false,
    riskType: null,
    riskTrigger: null,
    fusionStatus,
    sensitivityIncreased,
    reason: buildReason(personaState, {
      emotionLabel: normalizedFace.emotion,
      confidenceScore: normalizedFace.confidence,
      source,
      textEmotion: normalizedTextEmotion,
    }),
  });
}

/**
 * Backward-compatible wrapper untuk server.js versi sebelumnya.
 * Bisa dipanggil dengan:
 * - determineAdaptivePersona(activeEmotion, faceEmotionContext, userMessage, conversationContext)
 * - determineAdaptivePersona({ activeEmotion, faceEmotionContext, userMessage, conversationContext })
 */
function determineAdaptivePersona(activeEmotionOrOptions = null, faceEmotionContext = null, userMessage = '', conversationContext = []) {
  const options =
    typeof activeEmotionOrOptions === 'object' &&
    activeEmotionOrOptions !== null &&
    !Array.isArray(activeEmotionOrOptions) &&
    (Object.prototype.hasOwnProperty.call(activeEmotionOrOptions, 'activeEmotion') ||
      Object.prototype.hasOwnProperty.call(activeEmotionOrOptions, 'faceEmotionContext') ||
      Object.prototype.hasOwnProperty.call(activeEmotionOrOptions, 'userMessage'))
      ? activeEmotionOrOptions
      : {
          activeEmotion: activeEmotionOrOptions,
          faceEmotionContext,
          userMessage,
          conversationContext,
        };

  const face = normalizeFaceEmotion(options.faceEmotionContext);

  return selectPersona({
    emotionLabel: face.emotion,
    confidenceScore: face.confidence,
    userMessage: options.userMessage || '',
    conversationContext: options.conversationContext || [],
    activeEmotion: options.activeEmotion || null,
  });
}

function buildEmotionAwareContext(activeEmotionOrOptions = null, faceEmotionContext = null, userMessage = '', conversationContext = []) {
  const options =
    typeof activeEmotionOrOptions === 'object' &&
    activeEmotionOrOptions !== null &&
    !Array.isArray(activeEmotionOrOptions) &&
    (Object.prototype.hasOwnProperty.call(activeEmotionOrOptions, 'activeEmotion') ||
      Object.prototype.hasOwnProperty.call(activeEmotionOrOptions, 'faceEmotionContext') ||
      Object.prototype.hasOwnProperty.call(activeEmotionOrOptions, 'userMessage'))
      ? activeEmotionOrOptions
      : {
          activeEmotion: activeEmotionOrOptions,
          faceEmotionContext,
          userMessage,
          conversationContext,
        };

  const persona = determineAdaptivePersona(options);
  const textLabel = TEXT_EMOTION_LABELS[persona.textEmotion] || persona.textEmotion;
  const faceLabel = FACE_EMOTION_LABELS[persona.emotionLabel] || persona.emotionLabel;
  const sensitivityRule = persona.sensitivityIncreased
    ? 'Aktif: respons dibuat lebih sensitif, tidak bercanda, tidak menghakimi, dan tidak menyederhanakan masalah.'
    : 'Tidak khusus: respons tetap suportif dan hati-hati.';

  const contextBlock = `
[EMOTION-AWARE CONTEXT MANAGER]
Sistem menentukan persona adaptif berdasarkan rancangan berikut:
- Input FER emotion_label: ${persona.emotionLabel} (${faceLabel})
- Klasifikasi emosi teks/chatbot: ${persona.textEmotion} (${textLabel})
- Persona konseptual: ${persona.conceptualPersona}
- Persona operasional: ${persona.operationalPersona}
- Varian respons: ${persona.variant}
- State kompatibilitas aplikasi: ${persona.state}
- Sumber keputusan: ${persona.source}
- Status fusion multimodal: ${persona.fusionStatus}
- Alasan keputusan: ${persona.reason}
- Tujuan persona: ${persona.objective}
- Karakter respons: ${persona.responseCharacteristics.join(', ')}
- Peningkatan sensitivitas: ${sensitivityRule}

[PERSONA PROMPT AKTIF]
${persona.prompt}

[RENCANA RESPONS]
${persona.responsePlan.map((step, index) => `${index + 1}. ${step}`).join('\n')}

[HAL YANG HARUS DIHINDARI]
${persona.avoid.map((item) => `- ${item}`).join('\n')}

[ATURAN AMAN]
1. Gunakan hasil FER dan klasifikasi teks sebagai konteks pendukung, bukan diagnosis.
2. Jangan mengatakan bahwa ekspresi wajah membuktikan kondisi mental pengguna.
3. Skor confidence FER tidak digunakan sebagai ambang atau dasar pemilihan persona.
4. Jika persona aktif safety_support, prioritaskan keselamatan dan rujukan bantuan nyata.
5. Untuk sad, fear, atau angry, hindari candaan berlebihan, nada menghakimi, atau kalimat yang mengecilkan masalah.
`.trim();

  return {
    persona,
    contextBlock,
  };
}

module.exports = {
  PERSONA_PROFILES,
  PERSONA_PROMPTS,
  buildEmotionAwareContext,
  determineAdaptivePersona,
  selectPersona,
  detectSafetyRisk,
  detectCrisisRisk,
  normalizeTextEmotion,
  normalizeFaceEmotion,
};
