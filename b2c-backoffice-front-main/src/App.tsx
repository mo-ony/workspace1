import { BrowserRouter as Router, Routes, Route, Outlet} from 'react-router-dom';
import MenuLayout from "./Components/MenuLayout/MenuLayout";
import CancellationN from "./Pages/Nlevel/Cancellation/Cancellation";
import CancellationListN from "./Pages/Nlevel/CancellationList/CancellationList";
import CancellationNPlusOne from "./Pages/NplusOnelevel/Cancellation/Cancellation";
import CancellationListNPlusOne from "./Pages/NplusOnelevel/CancellationList/CancellationList";
import { AuthPage } from './Pages/auth/AuthPage';
import { AuthInit } from './Pages/auth/core/Auth';
//import { useAuth } from "../auth/core/Auth";
import React from 'react';
function App() {





    //const { auth, role } = useAuth();
    const { auth, role } = { auth: "", role: "N+1" };

    // Define which components to use based on the role
    const CancellationComponent = role === "N" ? CancellationN : CancellationNPlusOne;
    const CancellationListComponent = role === "N" ? CancellationListN : CancellationListNPlusOne;

    return (

    <AuthInit>
        <Outlet />
       
      </AuthInit>
/*
        <Router>
            <Routes>
              
                <Route path="/" element={<MenuLayout component={CancellationListComponent} />} />
                <Route path="login" element={<AuthPage />} />
             
                <Route path="/EditCancellation/:cancellationId" element={<MenuLayout component={CancellationComponent} />} />

                <Route path="/Screening" element={<MenuLayout component={ScreeningList} />} />

                <Route path="/EditScreening/:screeningId" element={<MenuLayout component={Screening} />} />

            </Routes>
        </Router>
    */    
    );
}

export default App;