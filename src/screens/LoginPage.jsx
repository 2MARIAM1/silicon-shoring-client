
import React, { useState } from "react";
import { authenticate, login } from "../services/LoginService";
import { useNavigate } from "react-router-dom";
import "./Login.css";

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
        <div className="bg-gradient-primary vh-100 d-flex align-items-center justify-content-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-5 col-lg-6 col-md-8">
                        <div className="card o-hidden border-0 shadow-lg my-5">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h1 className="h4 text-gray-900">Welcome!</h1>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control form-control-user login-form-control"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <input
                                            type="password"
                                            className="form-control form-control-user login-form-control"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-user btn-block custom-login-btn"
                                    >
                                        Login
                                    </button>
                                    {error && (
                                        <div className="text-danger mt-3 text-center">{error}</div>
                                    )}
                                </form>

                                <hr />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
