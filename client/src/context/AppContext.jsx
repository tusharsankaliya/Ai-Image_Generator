import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

export const AppContext = createContext();

// Global axios interceptor: sanitize any raw "Request failed with status code 410" messages
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error && typeof error.message === 'string' && error.message.includes('410')) {
            error.message = 'The request could not be completed. Please try again later.'
        }
        if (error && error.response && error.response.data && typeof error.response.data.message === 'string' && error.response.data.message.includes('410')) {
            error.response.data.message = 'The request could not be completed. Please try again later.'
        }
        return Promise.reject(error)
    }
)

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false)
    const [token, setToken] = useState(localStorage.getItem('token'))

    const [credit, setCredit] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const navigate = useNavigate()

    const localCreditsData = async () =>{
        try {
            const {data} =await axios.get(backendUrl + '/api/user/credits',{headers:{token}})

            

            if(data.success){
                setCredit(data.credits)
                setUser(data.user)
            }
        } catch (error) {
            console.log(error)
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                'Could not load your credits. Please try again.'
            toast.error(message)
        }
    }

const generateImage = async (prompt)=>{
    try {
        const {data} = await axios.post(backendUrl + '/api/image/generate-image', {prompt}, {headers: {token}})
        console.log("-------------- ", data);
        
        if(data.success && data.dataUri){
            // Normal success: return generated image
            localCreditsData()
            return data.dataUri
        } else if (data.success && !data.dataUri) {
            // Backend signalled success but no image: show fallback image, no error text
            return assets.sample_img_2
        } else {
            // Business errors like no credits or backend failures.
            // Never show raw HTTP status texts like "Request failed with status code 410".
            if (data.message) {
                let cleanMessage = data.message
                if (typeof cleanMessage === 'string' && cleanMessage.includes('410')) {
                    cleanMessage = 'The image could not be generated. Please try again later.'
                }
                toast.error(cleanMessage)
            }
            localCreditsData()
            if(data.creditBalance === 0){
                navigate('/buy')
            }
            return assets.sample_img_2
        }
        
    } catch (error) {
        console.error('generateImage error:', error)
        // If the error text contains 410 or similar, do NOT show it, just show fallback image
        const rawMessage = (error && error.message) || ''
        const has410 = typeof rawMessage === 'string' && rawMessage.includes('410')

        if (!has410) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                'Something went wrong while generating the image. Please try again.'
            toast.error(message)
        }

        // Always return a fallback image on error
        return assets.sample_img_2
    }
}

const logout = ()=>{
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
}

useEffect(()=>{
    if(token){
        localCreditsData()
    }
},[token])

    const value ={
        user, setUser,showLogin,setShowLogin, backendUrl,token, setToken,credit,setCredit,localCreditsData,logout,generateImage
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;