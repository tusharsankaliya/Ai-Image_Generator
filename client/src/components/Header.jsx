import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { delay, motion } from "framer-motion"
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {

    const {user, setShowLogin} = useContext(AppContext)
    const navigate = useNavigate()
    const onClickHandler = ()=>{
      if(user){
        navigate('/result')
      }else{
        setShowLogin(true)
      }
    }
  return (
    <motion.div className='flex flex-col justify-center items-center text-center my-20' 
    initial={{opacity:0.2,y:100}}
    transition={{duration:1}}
    whileInView={{opacity:1,y:0}}
    viewport={{once:true}}>

<motion.div className='inline-flex items-center text-center bg-slate-100 text-slate-700 px-6 py-1 rounded-full border border-slate-200'
        initial={{opacity:0,y:-20}}
        animate={{opacity:1,y:0}}
        transition={{delay:0.2,duration:0.8}}
         >
            <p>Create stunning AI art</p>
            <img src={assets.star_icon} alt=""  />
        </motion.div>

<motion.h1 className='text-4xl max-w-[320px] sm:text-7xl sm:max-w-[720px] mx-auto mt-10 text-center font-semibold text-slate-900'
        initial={{opacity:0}}
        animate={{opacity:1}}
        transition={{delay:0.4,duration:2}}
>Turn your words into images in seconds.</motion.h1>

<motion.p className='text-center max-w-xl mx-auto mt-5 text-slate-600'
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{delay:0.6,duration:0.8}}
        >Unleash your creativity with AI. Turn your  imagination into visual art in seconds - just type, and watch the magic happen.</motion.p>

        <motion.button  onClick={onClickHandler} className='sm:text-lg text-white bg-gradient-to-r from-fuchsia-600 to-cyan-500 w-auto mt-8 px-12 py-2.5 flex items-center gap-2 rounded-full shadow-lg'
        whileHover={{scale:1.05}}
        whileTap={{scale:0.95}}
        initial={{opacity:1}}
        animate={{duration:1}}
        transition={{default:{duration:0.5},opacity:{delay:0.8,duration:1}}}
        >Generate Image
          <img className='h-6' src={assets.star_group} alt=""></img>
        </motion.button>

      <motion.div className='flex flex-wrap justify-center mt-16 gap-3'
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
      transition={{delay:1,duration:1}}
      >
         {Array(6).fill('').map((item, index)=>(
           <motion.img 
           whileHover={{scale:1.05,duration:0.1}}
           className='rounded hover:scale-105 transition-all duration-300 cursor-pointer max-sm:w-10 ring-1 ring-white/10 shadow-md' src={index % 2 === 0? assets.sample_img_2 :assets.sample_img_1} alt="" key={index} width={70} />
         ))}
      </motion.div>
         <motion.p
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{delay:1.2,duration:0.8}}
         className='mt-2 text-slate-400 '>Generated with Imagify</motion.p>
    </motion.div>
  )
}

export default Header 