import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='flex items-center justify-between gap-4 py-4 mt-20 px-4 sm:px-6 rounded-2xl backdrop-blur supports-[backdrop-filter]:bg-white/5 border border-white/10 shadow-lg'>
        <img src={assets.logo} alt="" width={150} />

        <p className='flex-1 border-l border-white/10 pl-4 text-sm text-slate-400 max-sm:hidden'>© TusharSankaliya — All rights reserved.</p>

        <div className='flex gap-2.5'>
          <a href="https://www.facebook.com/sakleya.parkas">
            
            <img src={assets.facebook_icon} alt="" width={35} />
          </a>
          <a href="https://www.linkedin.com/in/tushar-sankaliya/">
            <img src={assets.twitter_icon} alt="" width={35} />
          </a>
          <a href="https://www.linkedin.com/in/tushar-sankaliya/">
          
            <img src={assets.instagram_icon} alt="" width={35} />
          </a>

        </div>
    </div>
  )
}

export default Footer