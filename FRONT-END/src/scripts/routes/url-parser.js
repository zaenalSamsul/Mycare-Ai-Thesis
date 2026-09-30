export function getActiveRoute() {
    const url = window.location.hash.slice(1) || "/";
    return url;
}
