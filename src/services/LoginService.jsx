// src/services/LoginService.js

const USERNAME = "wemanity";
const PASSWORD = "wemanity";

export function authenticate(username, password) {
    return username === USERNAME && password === PASSWORD;
}

export function isAuthenticated() {
    return localStorage.getItem("authenticated") === "true";
}

export function login(username) {
    localStorage.setItem("authenticated", "true");
    localStorage.setItem("username", username);
}

export function logout() {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("username");
}

