class LoginForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form class="form-login">
        <div class="input-group">
          <input type="text" placeholder="Username" class="input" required />
          <span class="fa-solid fa-user icon-fa" style="color: #000000;"></span>
        </div>
        <div class="input-group">
          <input type="password" placeholder="Kata Sandi" class="input" required />
          <span class="fa-solid fa-key icon-fa" style="color: #000000;"></span>
        </div>
        <a href="#" class="forgot">Lupa Kata Sandi ?</a>
        <button type="submit" class="btn-login">Masuk</button>
      </form>
    `;
  }
}
customElements.define('login-form', LoginForm);
