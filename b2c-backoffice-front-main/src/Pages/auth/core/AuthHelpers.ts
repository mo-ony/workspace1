import { AuthModel } from "./_models";

const AUTH_COOKIE_NAME = "accessToken";

const getAuth = (): AuthModel | undefined => {
	const cookies = document.cookie.split(';');
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === AUTH_COOKIE_NAME) {
			try {
				const auth: AuthModel = JSON.parse(decodeURIComponent(value));
				if (auth) {
					return auth;
				}
			} catch (error) {
				console.error("AUTH COOKIE PARSE ERROR", error);
			}
		}
	}
};


const setAuth = (auth: AuthModel) => {
	
};

const removeAuth = () => {
	
};

export function setupAxios(axios: any) {
	axios.defaults.headers.Accept = "application/json";
	axios.interceptors.request.use(
		(config: { headers: { Authorization: string } }) => {
			const auth = getAuth();
			if (auth && auth.access_token) {
				config.headers.Authorization = `Bearer ${auth.access_token}`;
			}

			return config;
		},
		(err: any) => Promise.reject(err)
	);
}

export { getAuth, setAuth, removeAuth, AUTH_COOKIE_NAME };
