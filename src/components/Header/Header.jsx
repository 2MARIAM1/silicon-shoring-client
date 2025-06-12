// src/components/Header/Header.jsx

import React from "react";
import { logout } from "../../services/LoginService";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
   // const username = localStorage.getItem("username");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const handleToggle = () => {
        const sidebar = document.getElementById("accordionSidebar");
        if (sidebar) {
            sidebar.classList.toggle("toggled");
        }
    };

    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">


            <button id="sidebarToggleTop" className="btn btn-link rounded-circle mr-3"  onClick={handleToggle}>
                <i className="fa fa-bars"></i>
            </button>
            {/* Spacer */}
            <div className="ml-auto d-flex align-items-center">
                {/*<span className="mr-3 text-gray-600 small">👤 {username}</span>*/}
                <button className="btn btn-sm btn-outline-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Header;
