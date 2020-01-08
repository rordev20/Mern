import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE
} from '../actions/types';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null
};

export default function(state = initialState, action) {
  const {type, payload} = action;

  switch(type) {
    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: payload
      }
    case AUTH_ERROR:
      if (payload) {
         localStorage.removeItem('token', payload.token);
      }

      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false
      }

    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false
      }
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        repos: [],
        loafing: false
      }
    case REGISTER_FAIL:
    case LOGIN_FAIL:
    case LOGOUT:
      if (payload) {
         localStorage.removeItem('token', payload.token);
      }

      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false
      }

    default:
      return state;

  }


}
