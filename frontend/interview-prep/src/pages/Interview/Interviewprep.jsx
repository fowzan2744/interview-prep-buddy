import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import { LuCircleAlert, LuListCollapse } from 'react-icons/lu';
import { AnimatePresence, motion } from 'framer-motion';

import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from '../roleInfoHeader';
import QuestionCard from '../../components/Cards/QuestionCard';
import axiosInstance from '../../utils/axiosInstance';
import AIResponsePreview from '../../components/AIresponsePreview';
import Drawer from '../../components/Drawer';
import ClaudeStyleLoading from '../../components/Loader/ClaudeStyleLoader';

const Interviewprep = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false); 

  const fetchSessionDetailsById = async () => {
    try {
      setLoading(true);
      setError(null);  
      const response = await axiosInstance.get(`/sessions/${sessionId}`, { withCredentials: true });
      setSessionData(response.data);
    } catch (error) {
      setError(error.message || 'Error fetching session details');
    } finally {
      setLoading(false);
    }
  };

  const generateConceptExplanation = async (question) => {
    try {
      setError(null);
      setExplanation(null);
      setExplanationLoading(true);  
 
      try {
        await axiosInstance.post('sessions/check-limit', { withCredentials: true });
      } catch (limitError) {
        if (limitError.response?.status === 429) {
          const errorData = limitError.response.data;
          setError(
            <div className="w-full h-full flex flex-col items-center justify-center bg-white text-orange-500 p-6 text-center">
              <h2 className="text-2xl font-bold">TRY AGAIN TOMORROW</h2>
              <p className="text-sm mt-2 max-w-md">
                You've used all 3 explanations for today. Come back tomorrow for more!
              </p>
              <br/><br/>
              <img src="/rose.png" alt="Try Again" className="max-w-[300px] w-full h-auto mb-6" height={screen.height} />
            </div>
            );

          setOpenLearnMoreDrawer(true);
          return;
        }
      }

      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post('/ai/generate-explanation', {
        question: question,
      }, { withCredentials: true });
      
      console.log(response.data);
      if (response.data.data) {
        setExplanation(response.data.data);
      }
    } catch (error) {
      console.log(error);
      setExplanation(null);
      
      if (error.response?.status === 429) {
        const errorData = error.response.data;
        if (errorData.code === 'DAILY_LIMIT_EXCEEDED' && errorData.limitType === 'explanations') {
          setError(
            `Daily limit reached! You've used all ${errorData.dailyLimit} explanations for today. Come back tomorrow for more! ⏰`
          );
        } else {
          setError('Daily limit exceeded. Please try again tomorrow.');
        }
      } else {
        setError(error?.response?.data?.message || error.message || 'Error generating concept explanation');
      }
    } finally {
      setExplanationLoading(false); 
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.put(`/questions/${questionId}/pin-question`, { withCredentials: true });
      console.log(response);

      if (response.data && response.data.question) {
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error('Error toggling question pin status:', error);
      toast.error('Error updating question pin status');
    }
  };

  const uploadMoreQuestions = async () => {
    try {
      setUpdateLoading(true);
      setError(null);

      const responseAI = await axiosInstance.post('/ai/generate-questions', {
        role: sessionData.role,
        topicsToFocus: sessionData.topicsToFocus,
        experience: sessionData.experience,
        numberOfQuestions: 10,
      }, { withCredentials: true });

      const genQ = responseAI.data.data;
      console.log("Generated Questions:", genQ);

      const response = await axiosInstance.put(`/sessions/update/${sessionId}`, {
        questions: genQ,
      }, { withCredentials: true });
      console.log("Session Updated:", response.data);

      if (response.data) {
        toast.success('Uploaded more questions');
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error('Error uploading more questions:', error);
      toast.error('Error uploading more questions');
      setError('Error generating new set of questions! Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true; 

    const fetchData = async () => {
      if (sessionId && isMounted) {
        await fetchSessionDetailsById();
      }
    };

    fetchData();

    return () => {
      isMounted = false;  
    };
  }, [sessionId]);
 

  if (loading && !sessionData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <ClaudeStyleLoading />
        </div>
      </DashboardLayout>
    );
  }
 
  if (!loading && !sessionData && error) {
    return (
      <DashboardLayout>
        <div className="p-4 text-red-600 flex items-center gap-2 justify-center">
          <LuCircleAlert className="text-xl" />
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {sessionData && (
        <RoleInfoHeader
          role={sessionData?.role || ''}
          topicsToFocus={sessionData?.topicsToFocus || ''}
          experience={sessionData?.experience || ''}
          description={sessionData?.description || ''}
          questions={sessionData?.questions || []}
          lastUpdated={
            sessionData?.updatedAt
              ? moment(sessionData.updatedAt).format('DD/MM/YYYY')
              : ''
          }
        />
      )}

      <div className="px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interview Q & A</h2>
        
        {/* Show error at the top if there's one */}
        {error && (
          <div className="mb-4 p-4 text-red-600 flex items-center gap-2 bg-red-50 rounded-lg">
            <LuCircleAlert className="text-xl" />
             `Daily limit reached! You've used all the FREE explanations for today. Come back tomorrow for more! ⏰`
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className={`col-span-12 ${openLearnMoreDrawer ? 'md:col-span-7' : 'md:col-span-8'}`}>
            {sessionData?.questions?.length > 0 ? (
              <AnimatePresence>
                {sessionData.questions.map((data, index) => (
                  <motion.div
                    key={data._id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: 0.4,
                      type: 'spring',
                      stiffness: 100,
                      delay: index * 0.1,
                      damping: 10,
                    }}
                    layout
                    layoutId={`question-${data._id || index}`}
                    className="mb-4"
                  >
                    <QuestionCard
                      question={data?.question}
                      answer={data?.answer}
                      onLearnMore={() => generateConceptExplanation(data?.question)}
                      isPinned={data?.isPinned}
                      onTogglePin={() => toggleQuestionPinStatus(data?._id)}
                    />

                    {/* Show load more button after the last question */}
                    {index === sessionData.questions.length - 1 && (
                      <div className="flex justify-center mt-8">
                        <button 
                          className='flex cursor-pointer bg-black border border-white rounded-2xl text-white p-3 disabled:opacity-50 disabled:cursor-not-allowed' 
                          disabled={loading || updateLoading} 
                          onClick={uploadMoreQuestions}
                        >
                          {updateLoading ? (
                            <div className='flex flex-row items-center'>
                              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
                              Loading... 
                              <ClaudeStyleLoading mode={"update"} />
                            </div>
                          ) : (
                            <div className='flex flex-row items-center'>
                              <LuListCollapse className='mr-2' /> 
                              Load More Questions
                            </div>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No questions available
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Drawer for explanations */}
      <Drawer
        isOpen={openLearnMoreDrawer}
        onClose={() => setOpenLearnMoreDrawer(false)}
        title={explanation?.title}
      >
        {error && (
          <p className='flex gap-2 text-sm text-amber-500 font-medium mb-4'>
            <LuCircleAlert className="text-xl" />
            {error}
          </p>
        )}
        
        {explanationLoading && (
          <ClaudeStyleLoading />
        )}
     
        {!explanationLoading && explanation?.explanation && (
          <AIResponsePreview content={explanation.explanation} />
        )}
      </Drawer>
    </DashboardLayout>
  );
};

export default Interviewprep;
