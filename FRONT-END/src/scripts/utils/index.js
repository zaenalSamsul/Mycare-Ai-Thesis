/**
 * Buat template loading di dalam status‐container.
 * @param {string} message
 * @returns {string}
 */
export function createLoadingTemplate(message = 'Loading...') {
  return `
    <div class="status-loading">
      <span class="spinner"></span>
      <span class="loading-text">${message}</span>
    </div>
  `;
}

/**
 * Buat template error di dalam status‐container.
 * @param {string} message
 * @returns {string}
 */
export function createErrorTemplate(message) {
  return `
    <div class="status-error">
      <p>${message}</p>
    </div>
  `;
}

/**
 * Buat overlay page‐loading sebelum berpindah halaman.
 * @returns {string}
 */
export function createPageLoadingTemplate() {
  return `
    <div class="page-loading">
      <div class="page-spinner"></div>
    </div>
  `;
}

/**
 * Pembungkus agar bisa melakukan animasi transisi halaman jika perlu.
 * @param {Function} callback – async function yang merender page baru
 */
export async function handlePageTransition(callback) {
  // Jika ingin menambahkan animasi fade‐out, lakukan di sini
  try {
    await callback();
  } catch (err) {
    console.error('Error during page transition:', err);
  }
}