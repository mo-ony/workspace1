import { lazy, FC, Suspense } from 'react'
import { useEffect, useState } from 'react';
import {Route, Routes, Navigate} from 'react-router-dom'
import MenuLayout from '../Components/MenuLayout/MenuLayout'
import React from 'react'
import Dashboard from "../Pages/Dashboard/Dashboard"
import Operation from "../Pages/Dashboard/Operation/Operation"
import Complaint from "../Pages/Complaint/Complaint"
import CancellationN from "../Pages/Nlevel/Cancellation/Cancellation";
import CancellationListN from "../Pages/Nlevel/CancellationList/CancellationList";
import CancellationNPlusOne from "../Pages/NplusOnelevel/Cancellation/Cancellation";
import CancellationListNPlusOne from "../Pages/NplusOnelevel/CancellationList/CancellationList";
import ScreeningListN from "../Pages/Screening/ScreeningList/ScreeningList"
import ScreeningN from "../Pages/Screening/Screening/Screening"
import ScreeningListNPlusOne from "../Pages/ScreeningNplusOnelevel/ScreeningList/ScreeningList"
import ScreeningNPlusOne from "../Pages/ScreeningNplusOnelevel/Screening/Screening"
import { useAuth } from '../Pages/auth/core/Auth';
import ComplaintDetails from '../Pages/Complaint/ComplaintDetails/ComplaintDetails'
import { getUser } from '../Pages/auth/core/_requests';
import { UserModel } from '../Pages/auth/core/_models';

const PrivateRoutes = () => {
    // const { auth, role } = { auth: "", role: "N+1" };
    const [currentUser, setCurrentUser] = useState<UserModel | undefined>(undefined);



    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUser();
                setCurrentUser(response.data);
                console.log("private routes -> current user role is = " + response.data.role);
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };

        fetchUser();
    }, []);


    if (!currentUser) {
        return null; // Optionally return a loading spinner
    }

    const role = currentUser?.role;

    // Define which components to use based on the role
    const CancellationComponent = role === "OPN" ? CancellationN : CancellationNPlusOne;
    const CancellationListComponent = role === "OPN" ? CancellationListN : CancellationListNPlusOne;

    const Screening = role === "OPN" ? ScreeningN : ScreeningNPlusOne;
    const ScreeningList = role === "OPN" ? ScreeningListN : ScreeningListNPlusOne;

  return (
    <Routes>
        {/* Redirect to Dashboard after success login/registartion */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* Pages */}
          <Route path="/dashboard" element={<MenuLayout component={Dashboard} />} />
          <Route path="/Cancellation" element={<MenuLayout component={CancellationListComponent} />} />
        <Route path="/EditCancellation/:cancellationId" element={<MenuLayout component={CancellationComponent} />} />

          <Route path="/Screening" element={<MenuLayout component={ScreeningList} />} />
          <Route path="/Complaint" element={<MenuLayout component={Complaint} />} />

          <Route path="/EditScreening/:screeningId" element={<MenuLayout component={Screening} />} />

          <Route path="/Operation/:operationId/:operation" element={<MenuLayout component={Operation} />} />
          <Route path="/ComplaintDetails/:complaintId" element={<MenuLayout component={ComplaintDetails} />} />
     
       
    </Routes>
  )
}



export {PrivateRoutes}
