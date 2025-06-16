import React from 'react'

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';

const CreateSessionForm = () => {
    const [formData, setFormData] = useState({
    role: '',
    topicsToFocus: '',
    experience: '',
    description: '',
    questions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);
  const [canCreateSession, setCanCreateSession] = useState(null); // null = checking, true = can create, false = cannot

  const navigate = useNavigate();

  // Check session limit on component mount
  useEffect(() => {
    checkSessionLimit();
  }, []);

  const checkSessionLimit = async () => {
    try {
      const response = await axiosInstance.post('/sessions/check-limit');
      
      if (response.status === 200) {
        setCanCreateSession(true);
        setRateLimitInfo(null);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        
        if (errorData.code === 'DAILY_LIMIT_EXCEEDED') {
          setCanCreateSession(false);
          setRateLimitInfo({
            message: errorData.message,
            limitType: errorData.limitType,
            dailyLimit: errorData.dailyLimit,
            remaining: errorData.remaining
          });
        } else {
          setCanCreateSession(false);
          setRateLimitInfo({
            message: 'Daily limit exceeded. Please try again tomorrow.'
          });
        }
      } else {
        console.error('Error checking session limit:', error);
        // Allow creation if check fails (fallback)
        setCanCreateSession(true);
      }
    }
  };

  const handleChange = (key,value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const { role, topicsToFocus, experience, description } = formData;

    if (!role || !topicsToFocus || !experience) {
      setError('Please fill in all required fields');
      return;
    }

    // Double-check limit before proceeding
    if (!canCreateSession) {
      setError('Cannot create session: Daily limit reached');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Check limit one more time before expensive AI call
      await axiosInstance.post('/sessions/check-limit');
      
      const responseAI = await axiosInstance.post('/ai/generate-questions', {
        role,
        topicsToFocus,
        experience,
        numberOfQuestions: 10,
      });

      const genQ = responseAI.data.data;
      console.log("Generated Questions:", genQ);

      const response = await axiosInstance.post('/sessions/create', {
        ...formData,
        questions: genQ,
      });

      console.log("Session created:", response.data);
      console.log("Response status:", response.status);

      if (response.data?.session?._id) {
        navigate(`/interview-prep/${response.data.session._id}`);
      } else {
        setError('Failed to navigate: Invalid session response');
      }
    } catch (error) {
      console.error(error);
      
      // Check if it's a rate limit error (status 429)
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        
        if (errorData.code === 'DAILY_LIMIT_EXCEEDED') {
          setCanCreateSession(false);
          setRateLimitInfo({
            message: errorData.message,
            limitType: errorData.limitType,
            dailyLimit: errorData.dailyLimit,
            remaining: errorData.remaining
          });
        } else {
          setCanCreateSession(false);
          setRateLimitInfo({
            message: 'Daily limit exceeded. Please try again tomorrow.'
          });
        }
      } else {
        // Handle other errors
        setError(error?.response?.data?.message || 'Failed to create session');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking limit
  if (canCreateSession === null) {
    return (
      <div className='p-7 flex flex-col justify-center gap-4'>
        <div className='flex items-center justify-center py-8'>
          <svg
            className="animate-spin h-8 w-8 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            />
          </svg>
          <span className='ml-2 text-gray-500'>Checking session availability...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-7 flex flex-col justify-center gap-4'>
        <h3 className='text-3xl font-bold'>
            Start a New Interview Journey
        </h3>
        <p className='text-xs text-slate-700'>Fill out a few quick details to get your own personalized set of interview question and answers! </p>
        <hr className='my-1' />

        {/* Rate Limit Warning */}
        {rateLimitInfo && (
          <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-2xl'>⏰</span>
              <h4 className='text-amber-800 font-semibold'>Daily Limit Reached</h4>
            </div>
            <p className='text-amber-700 text-sm mb-2'>{rateLimitInfo.message}</p>
            <div className='flex items-center justify-between mt-3'>
              <p className='text-amber-600 text-xs'>
                Come back tomorrow to create more sessions! ✨
              </p>
              <button
                onClick={checkSessionLimit}
                className='text-amber-700 text-xs underline hover:text-amber-800'
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleCreateSession} className=''>
            <Input
             label='Role'
             type='text'
             value={formData.role}
             onChange={(e) => handleChange('role', e.target.value)}
             placeholder='Enter your role (Frontend Developer, etc...)'
             disabled={!canCreateSession} // Disable if rate limited
             />

             <Input
             label='Topics to Focus'
             type='text'
             value={formData.topicsToFocus}
             onChange={(e) => handleChange('topicsToFocus', e.target.value)}
             placeholder='Enter topics to focus (React, Node.js, etc...)'
             disabled={!canCreateSession}
             />

             <Input
             label='Experience'
             type='number'
             value={formData.experience}
             onChange={(e) => handleChange('experience', e.target.value)}
             placeholder='Enter your experience (0-10 years)'
             disabled={!canCreateSession}
             />

             <Input
             label='Description'
             type='text'
             value={formData.description}
             onChange={(e) => handleChange('description', e.target.value)}
             placeholder='Enter a brief description for this interview QnA session '
             disabled={!canCreateSession}
             />

             {error && <p className='text-red-500'>{error}</p>}

             <button
            type="submit"
            disabled={isLoading || !canCreateSession}
            className={`w-full rounded-2xl font-bold py-2 px-4 transition-colors duration-300 flex items-center justify-center gap-2
                ${isLoading || !canCreateSession ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-amber-400 text-white'}`}
                    >
        {isLoading ? (
            <>
            <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                />
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                />
            </svg>
            Loading...
            </>
        ) : !canCreateSession ? (
            'Daily Limit Reached'
        ) : (
            'Create Session'
        )}
        </button>
     </form>
    </div>
  )
}

export default CreateSessionForm