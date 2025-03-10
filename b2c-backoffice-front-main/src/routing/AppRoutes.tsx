import React,{FC} from  'react'
import {Routes, Route, BrowserRouter, Navigate} from 'react-router-dom'
import {PrivateRoutes} from './PrivateRoutes'
import { AuthContext } from './AuthContext';
import {useAuth} from '../Pages/auth/core/Auth'
import { AuthPage } from '../Pages/auth/AuthPage'
import { verifyToken } from '../Pages/auth/core/_requests'; 
import { useEffect, useState } from 'react';

import App from '../App'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */


const AppRoutes: FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const { auth } = useAuth()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                
                const isValid = await verifyToken();
                console.log("verifyToken  in app route=" + isValid.data);
                console.log("auth  in app route=" + auth);
                setIsAuthenticated(isValid.data);

            } catch (error) {
                console.log("error  = " + error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);


    if (isAuthenticated === undefined) {
        // Optionally return a loading spinner or nothing while determining auth state
        return null;
    }



   
  return (
    <BrowserRouter >
      <Routes>
        <Route element={<App />}>

          
                  {(isAuthenticated || auth) ? (
            <>
              <Route path='/*' element={<PrivateRoutes />} />
              <Route index element={<Navigate to='/dashboard' />} /> 
            </>
          ) : (
            <>
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='*' element={<Navigate to='/auth' />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export {AppRoutes}
