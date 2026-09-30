class GoogleLogin extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button class="btn-google">
        <img src="image/google.svg" alt="Google" class="google-icon" />
        Masuk dengan Google
      </button>
    `;
  }
}
customElements.define('google-login', GoogleLogin);
