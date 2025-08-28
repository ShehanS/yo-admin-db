import {LOGIN_FAILURE, LOGIN_START, LOGIN_SUCCESS, LoginActionTypes, LOGOUT} from './login.action';
import {User} from "../../context/login.context";

export interface LoginState {
    loading: boolean;
    user: User | null;
    error: string | null;
    isAuthenticated: boolean;
}


export const initialLoginState: LoginState = {
    loading: false,
    user: null,
    error: null,
    isAuthenticated: false
};

export function loginReducer(state: LoginState = initialLoginState, action: LoginActionTypes): LoginState {
    switch (action.type) {
        case LOGIN_START:
            return {
                ...state,
                loading: true,
                error: null
            };

        case LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                user: action.payload,
                error: null,
                isAuthenticated: true
            };

        case LOGIN_FAILURE:
            return {
                ...state,
                loading: false,
                user: null,
                error: action.payload,
                isAuthenticated: false
            };

        case LOGOUT:
            return {
                ...state,
                user: null,
                error: null,
                isAuthenticated: false
            };

        default:
            return state;
    }
}
