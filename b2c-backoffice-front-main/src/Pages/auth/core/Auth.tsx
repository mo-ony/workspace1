import { getUser} from "./_requests";
import { AuthModel, UserModel } from "./_models";
import { ReactNode } from "react";
import * as authHelper from "./AuthHelpers";
import React from "react";
import {
	FC,
	useState,
	useEffect,
	createContext,
	useContext,
	useRef,
	Dispatch,
	SetStateAction,
} from "react";

type WithChildren = {
	children?: ReactNode;
};

type AuthContextProps = {
	auth: AuthModel | undefined;
	saveAuth: (auth: AuthModel | undefined) => void;
	authUser: Boolean | undefined;
	setAuthUser: Dispatch<SetStateAction<Boolean | undefined>>;
	currentUser: UserModel | undefined
	setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  
	logout: () => void;
};

const initAuthContextPropsState = {
	auth: authHelper.getAuth(),
	saveAuth: () => {},
	authUser: false,
	setAuthUser: () => {},
	currentUser: undefined,
   setCurrentUser: () => {},

	logout: () => {},
};

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState);

const useAuth = () => {
	return useContext(AuthContext);
};

const AuthProvider: FC<WithChildren> = ({ children }) => {
	const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
	const [authUser, setAuthUser] = useState<Boolean>();
	const [currentUser, setCurrentUser] = useState<UserModel | undefined>()
	const saveAuth = (auth: AuthModel | undefined) => {
		setAuth(auth);
		if (auth) {
			authHelper.setAuth(auth);
		} else {
			authHelper.removeAuth();
		}
	};

	const logout = () => {
		saveAuth(undefined);
		setCurrentUser(undefined)
	};

	return (
		<AuthContext.Provider
		value={{ auth, saveAuth, authUser, setAuthUser,  currentUser, setCurrentUser,logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};

const AuthInit: FC<WithChildren> = ({children}) => {
	const {auth, logout, setCurrentUser} = useAuth()
	const didRequest = useRef(false)

	// We should request user by authToken (IN OUR EXAMPLE IT'S API_TOKEN) before rendering the application
	useEffect(() => {
	  const requestUser = async () => {
		try {
		  if (!didRequest.current) {
			  const auth = authHelper.getAuth();
			  console.log("current auth in auth.tsx: " + auth);
			  if (auth && auth.access_token) {
				  const { data } = await getUser();
				  console.log("current data in requestUser in auth.tsx: " + data);
				  if (data) {
					  setCurrentUser(data);
				  }
			  }
			  else {
				  logout();
			  }

		  }
		} catch (error) {
		  console.error(error)
		  if (!didRequest.current) {
			logout()
		  }
		} 
  
		return () => (didRequest.current = true)
	  }
  
		requestUser()
	  
	  // eslint-disable-next-line
	}, [])
  
	return <>{children}</>
}

export { AuthProvider, useAuth, AuthInit };

