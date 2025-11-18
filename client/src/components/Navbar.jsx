import React, { useContext } from 'react'
import { assets } from '../assets/assets.js'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'

const Navbar = () => {

    const {user, setShowLogin,logout,credit} = useContext(AppContext)


    const navigate = useNavigate()
  return (

    <div className='flex items-center justify-between py-4 mt-4 px-4 sm:px-6 rounded-2xl bg-white border border-slate-200 shadow'>
        <Link to='/'>
        <img src={assets.logo} alt='' className='w-28 sm:w-32 lg:w-40'/>
        </Link>


    <div>
        {
        user ? 
        <div className='flex items-center gap-2 sm:gap-3'>
            <button onClick={()=>navigate('/buy')} className='flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 sm:py-3 hover:bg-slate-200/60 transition-all duration-200 rounded-full'>
                <img className='w-5' src={assets.credit_star} alt=''/>
                <p className='text-xs sm:text-sm font-medium text-slate-700'>Credit left:{credit}</p>
            </button>
            <p className='text-slate-700 max-sm:hidden pl-4'>Hi, {user.name}</p>
            <div className='relative group'>
                <img src={assets.profile_icon} className='w-10 drop-shadow'alt=""/>
                <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                    <ul className='list-none m-0 p-2 bg-white border border-slate-200 rounded-md text-sm text-slate-800'>
                        <li onClick={logout} className='py-1 px-2 cursor-pointer pr-10 hover:bg-white/10 rounded'>Logout</li>
                    </ul>
                </div>
            </div> 
        </div>
        :
        <div className='flex items-center gap-2 sm:gap-5'>
            <p onClick={()=>navigate('/buy')} className='cursor-pointer text-slate-800 hover:text-slate-900'>Pricing</p>
            <button onClick={()=>setShowLogin(true)} className='bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-2 sm:px-10 text-sm rounded-full shadow-sm transition'>Login</button>
        </div>
        }
         
         
    </div>
    </div>

  )
}

export default Navbar