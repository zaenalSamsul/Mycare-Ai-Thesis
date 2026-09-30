import AuthAPI from "../../data/api";
import Storage from "../../utils/storage";

class AuthPresenter {
    static async doRegister(name, email, password) {
        const { error, data, message } = await AuthAPI.register({ name, email, password });
        if (error) {
            alert(message);
            return false;
        }
        Storage.saveToken(data.token);
        return true;
    }

    static async doLogin(email, password) {
        const { error, data, message } = await AuthAPI.login({ email, password });
        if (error) {
            alert(message);
            return false;
        }
        Storage.saveToken(data.token);
        return true;
    }
    static doLoginWithGoogle() {
        AuthAPI.loginWithGoogle();
    }

    static async doLogout() {
        await AuthAPI.logout();
        Storage.clearToken();
    }
}