class RegisterForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="form-login">
        <div class="input-group">
          <input type="text" placeholder="Masukan Username" class="input" required />
        </div>
        <div class="input-group">
          <input type="email" placeholder="Masukan Email" class="input" required />
        </div>
        <div class="input-group">
          <input type="password" placeholder="Masukan Kata Sandi" class="input" required />
        </div>
        <div class="input-group">
          <input type="password" placeholder="Konfirmasi Kata Sandi" class="input" required />
        </div>
        <button type="submit" class="btn-login">Daftar</button>
      </form>
    `;
  }
}
customElements.define('register-form', RegisterForm);
