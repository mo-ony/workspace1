import axios from "axios";
import { AuthModel, UserModel } from "./_models";

//const API_URL = import.meta.env.REACT_APP_API_URL;

export const LOGIN_URL = `${
	import.meta.env.VITE_API_GATEWAY_URL
	}/v1/b2c/auth/authenticate`;

export const LOGOUT_URL = `${import.meta.env.VITE_API_GATEWAY_URL}/v1/b2c/auth/logout`;

export const VERIFY_TOKEN = `${import.meta.env.VITE_API_GATEWAY_URL
	}/v1/b2c/auth/verify-token`;



export const GET_USER_BY_ACCESSTOKEN_URL = `${
	import.meta.env.VITE_API_GATEWAY_URL
}/v1/b2c/identity/user`;


export const REQUEST_PASSWORD_URL =`${
	import.meta.env.VITE_API_GATEWAY_URL
}/v1/b2c/auth/reset-password`;


export const REQUEST_CHANGE_PASSWORD_URL =`${
	import.meta.env.VITE_API_GATEWAY_URL
}/v1/b2c/auth/change-password`;



/*

export const LOGIN_URL = `http://localhost:9002/v1/b2c/auth/authenticate`;


export const GET_USER_BY_ACCESSTOKEN_URL = `http://localhost:9002/v1/b2c/identity/user`;


export const REQUEST_PASSWORD_URL =  'http://localhost:9002/v1/b2c/auth/reset-password';

export const REQUEST_CHANGE_PASSWORD_URL =  'http://localhost:9002/v1/b2c/auth/change-password';
*/

export async function getUser() {
	const config = {
		withCredentials: true
	};
	return await axios.get<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, config);
}



export async function verifyToken() {
	const config = {
		withCredentials: true
	};
	return await axios.get<boolean>(VERIFY_TOKEN, config);
}



// Server should return AuthModel
export function login(email: string, password: string) {
	return axios.post<AuthModel>(
		LOGIN_URL,
		{
			email,
			password,
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
}

export function logout() {
	return axios.get<void>(LOGOUT_URL, {
		headers: {
			"Content-Type": "application/json",
		},
	});
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
	return axios.post<{result: boolean}>(
		
		REQUEST_PASSWORD_URL,
		{
			email
		
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
}


export function changePasswordRequest(token: string,password:String) {
	return axios.post<{result: boolean}>(
		
		REQUEST_CHANGE_PASSWORD_URL,
		{
			token,
			password
		
		},
		{
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
}


