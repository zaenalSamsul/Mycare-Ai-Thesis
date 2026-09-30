import HomePage from "../pages/home/home-page.js";
import LoginPage from "../pages/login/loginPage.js";
import RegisterPage from "../pages/Register/RegisterPage.js";
import ChatPageView from "../pages/chatbot/chat-page.js";
import CatatanEmosi from "../pages/catatan-emosi/catatan-emosi.js";

const routes = {
    "/": new HomePage(),
    "/login": new LoginPage(),
    "/register": new RegisterPage(),
    "/chat": new ChatPageView(),
    "/catatan-emosi": new CatatanEmosi(),
};

export function getActiveRoute() {
    return window.location.hash.slice(1) || "/";
}

export default routes;
