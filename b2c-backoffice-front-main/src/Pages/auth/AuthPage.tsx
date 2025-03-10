import { Outlet, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import React
 from "react";
export const toAbsoluteUrl = (pathname: string) =>
	"http://localhost:5173/" + pathname;
import { Login } from "./components/Login";
import { ForgotPassword } from "./components/ForgotPassword";
import "./AuthPage.css";

import { ChangePassword
 } from "./components/ChangePassword";
const AuthLayout = () => {
	return (
		
				
					

<div className="py-3 py-md-5">
  <div className="container">
    <div className="row justify-content-md-center">
      <div className="col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6">
        <div className="bg-white p-4 p-md-5 rounded shadow-sm">
		  <Outlet></Outlet>
         
		  </div>
      </div>
    </div>
  </div>
</div>
				
					
			
		
	);
};

const AuthPage = () => (
	<Routes>
		<Route element={<AuthLayout />}>
			<Route path="login" element={<Login />} />
			<Route path='forgot-password' element={<ForgotPassword />} />
			<Route path='change-password' element={<ChangePassword />} />

			
			<Route index element={<Login />} />
		</Route>
	</Routes>
);

export { AuthPage };
