// src/screens/LoginPage.jsx

import React, { useState } from "react";
import { authenticate, login } from "../services/LoginService";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (authenticate(username, password)) {
            login(username);
            navigate("/");
        } else {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                /><br />
                <input
                    className="form-control"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br />
                <button className="btn btn-primary" type="submit">Login</button>
                {error && <div className="text-danger mt-2">{error}</div>}
            </form>
        </div>
    );
}

export default LoginPage;
