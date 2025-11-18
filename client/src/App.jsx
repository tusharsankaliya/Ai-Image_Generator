import React, { useContext } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './components/Login'
import { AppContext } from './context/AppContext'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"

const App = () => {

  const {showLogin} = useContext(AppContext)

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-slate-50 text-slate-800'>
    <ToastContainer position='bottom-right'/> 
    <Navbar />
    {showLogin && <Login/>}
      <Routes >
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/buy" element={<BuyCredit />} />
      </Routes>
      <Footer />
  
    </div>
  )
}

export default App