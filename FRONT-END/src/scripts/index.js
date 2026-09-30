import App from "./pages/app.js";

document.addEventListener("DOMContentLoaded", async () => {
    const app = new App({
        content: document.querySelector("#app"),
    });
    await app.renderPage();

    window.addEventListener("hashchange", async () => {
        console.log("Hash changed to:", window.location.hash);
        await app.renderPage();
    });
});
