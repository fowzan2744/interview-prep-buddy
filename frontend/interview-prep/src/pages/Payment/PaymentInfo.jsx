import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, Crown, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const PAYMENT_LINKS = {
  premium: import.meta.env.VITE_PREMIUM,
  luxury: import.meta.env.VITE_LUXURY,
};

console.log('PAYMENT_LINKS:', PAYMENT_LINKS);


const SubscriptionManager = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    fetchSubscriptionInfo();
    
    // Check for payment success in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const tier = urlParams.get('tier');
    
    if (sessionId && tier) {
      verifyPayment(sessionId, tier);
    }
  }, []);

  const setFreeTier = async () => {
    try {
      setVerifying(true);
      const response = await axiosInstance.post('/stripe/freetier', { withCredentials: true });
      setSubscriptionInfo(response.data);
    } catch (error) {
      console.error('Failed to set free tier:', error);
      setError('Failed to set free tier');
    } finally {
      setVerifying(false);
    }
  };

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage?.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get('/stripe/subscription-info', { withCredentials: true });
      
      setSubscriptionInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription info:', error);
      setError('Failed to load subscription information');
      
      // Set default free tier if fetch fails
      setSubscriptionInfo({
        tier: 'free',
        subscriptionStatus: null,
        subscriptionEndDate: null,
        isActive: false
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (sessionId, tier) => {
    setVerifying(true);
    try {
      const token = localStorage?.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.post('/stripe/verify-payment', { sessionId, tier }, { withCredentials: true });
      
      // Payment successful, refresh subscription info
      await fetchSubscriptionInfo();
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      alert(`Successfully upgraded to ${tier} tier!`);
    } catch (error) {
      console.error('Payment verification error:', error);
      
      let errorMessage = 'Failed to verify payment';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Payment verification failed: ${errorMessage}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleUpgrade = (tier) => {
    // Simply redirect to payment link (success URL already configured in Stripe Dashboard)
    window.location.href = PAYMENT_LINKS[tier];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your subscription information...</p>
        </div>
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="flex items-center justify-center p-8 min-h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const plans = [
    {
      name: 'Free',
      tier: 'free',
      price: 'QR 0',
      period: 'forever',
      features: ['1 session per day', '3 explanations per day'],
      icon: <CheckCircle className="w-6 h-6" />,
      current: subscriptionInfo?.tier === 'free'
    },
    {
      name: 'Premium',
      tier: 'premium',
      price: 'QR 9.99',
      period: 'month',
      features: ['20 sessions per day', '50 explanations per day', 'Priority support'],
      icon: <Star className="w-6 h-6" />,
      current: subscriptionInfo?.tier === 'premium'
    },
    {
      name: 'Luxury',
      tier: 'luxury',
      price: 'QR 29.99',
      period: 'month',
      features: ['Unlimited sessions', 'Unlimited explanations', 'Premium support', 'Early access to features'],
      icon: <Crown className="w-6 h-6" />,
      current: subscriptionInfo?.tier === 'luxury'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
         <div 
      onClick={() => navigate('/dashboard')}
      className="absolute left-5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 ease-in-out text-lg font-semibold"
    >
      X
    </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
        <div className="text-xl text-gray-600">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchSubscriptionInfo}
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <p>
                Current Plan: <span className="font-semibold capitalize text-blue-600">{subscriptionInfo?.tier || 'Unknown'}</span>
                {subscriptionInfo?.subscriptionStatus && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    subscriptionInfo.subscriptionStatus === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscriptionInfo.subscriptionStatus}
                  </span>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
              plan.current 
                ? 'border-green-500 ring-2 ring-green-200' 
                : 'border-gray-200 hover:border-blue-300'
            } transition-all duration-200`}
          >
            {plan.current && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center">
              <div className="flex justify-center mb-4 text-blue-600">
                {plan.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period !== 'forever' && (
                  <span className="text-gray-600">/{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.tier === 'free' ? (
                plan.current ? (
                  <div className="text-center text-gray-500 font-medium py-3">
                    Your current plan
                  </div>
                ) : (
                  <button
                    onClick={setFreeTier}
                    className="w-full py-3 px-6 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Switch to Free
                  </button>
                )
              ) : plan.current ? (
                <div className="text-center text-green-600 font-medium py-3">
                  ✓ Active Plan
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.tier === 'luxury'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {subscriptionInfo?.subscriptionEndDate && (
        <div className="mt-8 text-center">
          <div className={`inline-block px-4 py-2 rounded-lg ${
            subscriptionInfo.isActive 
              ? 'bg-blue-50 text-blue-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <p>
              Subscription {subscriptionInfo.isActive ? 'active until' : 'ended on'}: {' '}
              <span className="font-semibold">
                {new Date(subscriptionInfo.subscriptionEndDate).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>
      )}
   
    </div>
  );
};

export default SubscriptionManager;
