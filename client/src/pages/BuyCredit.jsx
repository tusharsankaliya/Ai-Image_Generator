import React, { useContext } from 'react'
import { assets, plans } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Currency } from 'lucide-react'

const BuyCredit = () => {
  const {user, backendUrl,localCreditsData, token, setShowLogin} = useContext(AppContext)

  const navigate = useNavigate()

  const initpay = async (order)=>{
    const options ={
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      Currency: order.Currency,
      name: ' Credits payment',
      description: ' Credits payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async(response)=>{
         try {
          const {data} = await axios.post(backendUrl +'/api/user/verify-razor', response, {headers:{token}})
          if(data.success){
            localCreditsData();
            navigate('/')
            toast.success('Credit Added')
          }
         } catch (error) {
          let message =
            (error.response && error.response.data && error.response.data.message) ||
            'Could not verify your payment. If money was deducted, please contact support.'

          if (typeof message === 'string' && message.includes('410')) {
            message = 'Could not verify your payment right now. Please try again later.'
          }

          toast.error(message)
         }
      }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const paymentRazorpay = async (planId)=>{
    try {
      if(!user){
        setShowLogin(true)
      }
      const {data}=await axios.post(backendUrl + '/api/user/pay-razor', {planId},{headers :{token}})

      if(data.success){
        initpay(data.order)
      }
    } catch (error) {
      let message =
        (error.response && error.response.data && error.response.data.message) ||
        'Could not start the payment. Please check your connection and try again.'

      if (typeof message === 'string' && message.includes('410')) {
        message = 'Could not start the payment right now. Please try again later.'
      }

      toast.error(message)
    }
  }

  return (
    <motion.div
     initial={{opacity:0.2,y:100}}
     transition={{duration:1}}
     whileInView={{opacity:1,y:0}}
     viewport={{once:true}}
     className='min-h-[80vh] text-center pt-14 mb-10'>
      <button className='border border-gray-400 px-10 py-2 rounded-full mb-6'>Our Plans</button>
      <h1 className='text-center text-3xl font-medium mb-6 sm:mb-10'>Choose the plan</h1>

      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {plans.map((item, index) => (

          <div key={index} className='bg-white drop-shadow-sm border-amber-100 rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500'>
            <img width={40} src={assets.logo_icon} alt="" />
            <p className='mt-3 mb-1 font-semibold'>{item.id}</p>
            <p className='text-sm'>{item.desc}</p>
            <p className='mt-6'><span className='text-3xl font-medium'>Rs.{item.price}</span> / {item.credits} credits</p>
            <button onClick={()=>paymentRazorpay(item.id)} className='w-full bg-gray-800 text-white mt-8 text-sm  rounded-md py-2.5  min-w-52'>{user ? 'Purchase' :'Get Started'}</button>
          </div>
        ))}
      </div>

    </motion.div>
  )
}

export default BuyCredit