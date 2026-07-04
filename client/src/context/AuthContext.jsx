import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );
    const [loading, setLoading] = useState(true);

    // Keep axios and localStorage synchronized with token
    useEffect(() => {

        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
            localStorage.setItem("token", token);
        } else {
            delete api.defaults.headers.common.Authorization;
            localStorage.removeItem("token");
        }

    }, [token]);

    // Keep user details synchronized
    useEffect(() => {

        if (user) {

            localStorage.setItem("userName", user.name);
            localStorage.setItem("role", user.role);
            localStorage.setItem("userId", user._id);

        }

    }, [user]);

    // Validate session on refresh
    useEffect(() => {

        const checkUserSession = async () => {

            if (!token) {
                setLoading(false);
                return;
            }

            try {

                const res = await api.get("/api/auth/me");

                setUser(res.data.user);

            } catch {

                setToken(null);
                setUser(null);

            } finally {

                setLoading(false);

            }

        };

        checkUserSession();

    }, [token]);

    const login = async (email, password) => {

        const res = await api.post(
            "/api/auth/login",
            { email, password }
        );

        setToken(res.data.token);
        setUser(res.data.user);

        return res.data;

    };

    const register = async (userData) => {

        const res = await api.post(
            "/api/auth/register",
            userData
        );

        return res.data;

    };

    const logout = () => {

        setToken(null);
        setUser(null);

        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("isDemo");

    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};