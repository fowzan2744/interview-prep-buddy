import React, { useContext } from 'react'
import { TiFlash } from "react-icons/ti";
import { FaStar } from "react-icons/fa";
import {app_features} from '../utils/data'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../components/Loader/Modal';
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import { UserContext } from '../context/userContext';
import ProfileInfoCard from '../components/Cards/ProfileInfoCard';

const LandingPage = () => {

    const navigate = useNavigate()
    const [openAuthmodal, setOpenAuthmodal] = useState(false);
    const [currentTab, setCurrentTab] = useState("login");

    const {user} = useContext(UserContext);
    

      const handleTabChange = (tab) => {
        if(!user)
        {
          setOpenAuthmodal(true);
        }
        else
        {
          navigate("/dashboard");
        }
    };

 
  return (
    <>
    
        <div className='w-full min-h-full'>
        <div className='w-[500px] h-[500px]  bg-red-400/25 blur-[65px] absolute top-0 left-0' />
            <div className='container mx-auto px-5 py-10 relative z-10'> 


                <header className='flex justify-between items-center mb-16 '>
                    <div className='text-2xl font-bold from-blue-900 to-gray-700 bg-clip-text text-transparent bg-gradient-to-r'>
                        INTERVIEW PREP BUDDY : {")"}
                    </div>
                    {user ? (
                      <ProfileInfoCard/>
                    ) :
                    (
                    <button className='bg-amber-400 rounded-2xl font-semibold text-white px-7 py-2.5 cursor-pointer hover:bg-black hover:text-white border border-white transition-colors ' onClick={() => setOpenAuthmodal(true)}>
                        Login/Signup
                    </button>
                    )
                  }
                </header>

                <div className='flex flex-col gap-10 md:flex-row items-center '>
                <div className='w-full md:w-1/2 pr-4 m-8 md:mb-0'>
                    <div className='flex items-center justify-left mb-2'>
                        <div className='flex items-center gap-2 text-[14px] text-blue-900 font-semibold bg-amber-200/50 rounded-full px-2 py-1'>
                            <TiFlash /> AI POWERED
                        </div>
                    </div>

                    <h1 className='text-4xl md:text-5xl font-bold mb-4 leading-tight'>
                        Ace Interviews wth <br/>
                        <span className='text-7xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-700 animate-pulse hover:animate-shine '>
                            AI-POWERED 
                        </span>{" "}
                        Learning...
                    </h1>
                </div>

                <div className='w-full md:w-1/2'>
                    <p className='text-[17px] leading-7 text-gray-900 mr-0 md:mr-20 mb-6'>
                        " Prepare for your next interview with confidence using our intelligent, AI-driven platform.
    Practice real-world, role-specific interview questions designed to help you master every stage of the hiring process.
    Access expertly crafted answers to common and advanced questions across various domains.
    Whether you're a beginner or an experienced professional, our platform is your all-in-one destination for comprehensive interview preparation.
    Sharpen your skills, boost your confidence, and walk into your next interview fully prepared. "
    </p>
                    <button className='bg-black text-white font-semibold text-sm px-7 py-2.5 rounded-2xl hover:animate-pulse cursor-pointer' onClick={handleTabChange}>
                    Get Started
                    </button>
                </div>

            </div>
        </div>
        </div>

       <div className="bg-white">
  <div className="bg-white">

    <div className="container mx-auto px-5 py-16">
  <div className="flex flex-col items-center space-y-10">
    <img
      src="/imgdashboard.png"
      alt="Image 1"
      className="w-full max-w-6xl rounded-xl shadow-md object-cover"
    />
   
    <img
      src="/imgplans.png"
      alt="Image 2"
      className="w-full max-w-6xl rounded-xl shadow-md object-cover"
    />

      <img
      src="/imgQ.png"
      alt="Image 1"
      className="w-full max-w-6xl rounded-xl shadow-md object-cover"
    />
  </div>
</div>

  <div>
    <section className="container mx-auto px-5 py-16">
      <h2 className="text-center text-4xl font-extrabold mb-16 text-gray-800 tracking-tight">
        Features That Make Us Stand Out
      </h2>

      <div className="flex flex-col col-span-3 gap-12 md:flex-row md:gap-8 items-stretch justify-center">
        {app_features.map((feature) => (
          <div
            key={feature.id}
            className="w-full md:w-1/3 relative overflow-hidden bg-white with shadow-xl and border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center transition-transform duration-300 ease-in-out transform hover:scale-105 shine-card"
          >
            <h3 className="text-2xl font-semibold text-amber-500 mb-4">
              {feature.title}
            </h3>
            <p className="text-[17px] leading-7 text-gray-700">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  </div>
</div>

        </div>

        <div className='text-center py-16'>
            Made by <span className='font-bold'>Fowzan</span> with ❤️
        </div>
        

        <Modal isOpen={openAuthmodal}
         onClose={() => {setOpenAuthmodal(false);
          setCurrentTab("login");
        }}
        hideheader
        >
          <div>
            {currentTab === "login" && (
              <Login setCurrentTab={setCurrentTab} />
            )}
            {currentTab === "signup" && (
              <SignUp setCurrentTab={setCurrentTab} />
              )}
          </div>
        
        </Modal>
    

    </>
  )
}

export default LandingPage
