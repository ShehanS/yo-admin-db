import React, { createContext, ReactNode, useContext, useEffect, useReducer, useState } from 'react';
import { initialLoginState, loginReducer, LoginState } from '../state/login/login.reducer';
import { LoginActionTypes, loginFailure, loginStart, loginSuccess, logout } from '../state/login/login.action';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { ResponseMessage } from "../data/data";

export interface User {
    email?: string | null;
    authKey?: string | null;
}

interface DecodedToken {
    exp: number;
    [key: string]: any;
}

interface LoginContextType extends LoginState {
    dispatch: React.Dispatch<LoginActionTypes>;
    loginUser: (user: User) => Promise<void>;
    logoutUser: () => void;
    refreshToken: () => void;
    isInitialized: boolean;
}

export const LoginContext = createContext<LoginContextType>({} as LoginContextType);

export const LoginContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [state, dispatch] = useReducer(loginReducer, initialLoginState);
    const [isInitialized, setIsInitialized] = useState(false);

    const publicRoutes = ['/login', '/'];
    const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

    const isTokenValid = (token: string) => {
        try {
            const decoded: DecodedToken = jwtDecode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp && decoded.exp > currentTime;
        } catch {
            return false;
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        dispatch(logout());
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !isTokenValid(token)) {
            logoutUser();
        } else {
            dispatch(loginSuccess({ email: null, authKey: token }));
            if (location.pathname === '/' || location.pathname === '/login') {
                navigate("/dashboard", { replace: true });
            }
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem("token");
            if (token && !isTokenValid(token)) {
                logoutUser();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isInitialized && !state.isAuthenticated && !isPublicRoute) {
            navigate("/login", { replace: true });
        }
    }, [location.pathname, state.isAuthenticated, isPublicRoute, isInitialized]);

    const loginUser = async (user: User) => {
        dispatch(loginStart());
        try {
            const response = await axios.post('/backend/admin/auth/login', user, { responseType: 'json' });
            const loginResponse = response?.data as ResponseMessage;
            if (loginResponse?.code === "CODE-006") {
                const token = loginResponse.data?.token ?? "";
                localStorage.setItem("token", token);
                dispatch(loginSuccess({ email: user.email, authKey: token }));
                navigate("/dashboard", { replace: true });
            } else {
                dispatch(loginFailure("Invalid login response"));
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            console.error(error);
            dispatch(loginFailure(errorMessage));
        }
    };

    const refreshToken = () => {
        // implement if needed
    };

    const contextValue: LoginContextType = {
        ...state,
        dispatch,
        loginUser,
        logoutUser,
        refreshToken,
        isInitialized
    };

    if (!isInitialized) return <div>Loading...</div>;

    return (
        <LoginContext.Provider value={contextValue}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLogin = (): LoginContextType => {
    const context = useContext(LoginContext);
    if (!context) throw new Error('useLogin must be used within a LoginProvider');
    return context;
};
