// Action Types
import {User} from "../../context/login.context";


export const LOGIN_START = 'LOGIN_START';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';


interface LoginStartAction {
    type: typeof LOGIN_START;
}

interface LoginSuccessAction {
    type: typeof LOGIN_SUCCESS;
    payload: User;
}

interface LoginFailureAction {
    type: typeof LOGIN_FAILURE;
    payload: string;
}

interface LogoutAction {
    type: typeof LOGOUT;
}


export const loginStart = (): LoginStartAction => ({
    type: LOGIN_START
});

export const loginSuccess = (user: User): LoginSuccessAction => ({
    type: LOGIN_SUCCESS,
    payload: user
});

export const loginFailure = (error: any): LoginFailureAction => ({
    type: LOGIN_FAILURE,
    payload: error
});

export const logout = (): LogoutAction => ({
    type: LOGOUT
});


export type LoginActionTypes =
    | LoginStartAction
    | LoginSuccessAction
    | LoginFailureAction
    | LogoutAction
