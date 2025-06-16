
import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";


import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Home/Dashboard";
import Interviewprep from "./pages/interview/Interviewprep";
import SubscriptionManager from "./pages/Payment/PaymentInfo";

import UserContextProvider from "./context/userContext";
import PaymentSuccessHandler from "./pages/Payment/Success";

function App() {
   
  return (
    <UserContextProvider>
    <div>
       <Router>
       <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview-prep/:sessionId" element={<Interviewprep />} />
        <Route path="/upgradetier" element={<SubscriptionManager />} />
        <Route path="/payment-success" element={<PaymentSuccessHandler />} />

    
       </Routes>
       </Router>

       <Toaster toastOptions={{
        className: "toast",
        duration: 3000,
        style: {
          fontSize: "1.8rem",
        },
      }} />
    </div>
    </UserContextProvider>
  )
}

export default App
