import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader, AlertCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const PaymentSuccessHandler = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [tierInfo, setTierInfo] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const tier = urlParams.get('tier');

    setDebugInfo({
      sessionId,
      tier,
      hasToken: !!localStorage.getItem('token'),
      url: window.location.search
    });

    if (sessionId && tier) {
      verifyPayment(sessionId, tier);
    } else {
      setStatus('error');
      setMessage('Missing payment information in URL');
    }
  }, []);

  const verifyPayment = async (sessionId, tier) => {
    try {
      setStatus('processing');
      setMessage('Verifying your payment...');

      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('error');
        setMessage('Authentication required. Please log in again.');
        return;
      }

      const response = await axiosInstance.post('/stripe/verify-payment', { sessionId, tier });
      const data = response.data;
       
      setDebugInfo(prev => ({
        ...prev,
        responseStatus: response.status,
        responseData: data
      }));

      if (response.status === 200) {
        setStatus('success');
        setMessage(data.message || `Successfully upgraded to ${tier} tier!`);
        setTierInfo({
          tier: data.tier,
          subscriptionStatus: data.subscriptionStatus
        });

        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || `Payment verification failed (${response.status})`);
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage(`Network error: ${error.message}`);
      setDebugInfo(prev => ({
        ...prev,
        networkError: error.message
      }));
    }
  };

  const getTierDisplayInfo = (tier) => {
    const tierInfo = {
      premium: {
        name: 'Premium',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        features: ['20 sessions per day', '50 explanations per day', 'Priority support']
      },
      luxury: {
        name: 'Luxury',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        features: ['Unlimited sessions', 'Unlimited explanations', 'Premium support', 'Early access']
      }
    };
    return tierInfo[tier] || {};
  };

  const displayInfo = getTierDisplayInfo(tierInfo?.tier);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        
        {status === 'processing' && (
          <div className="text-center">
            <Loader className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {tierInfo && (
              <div className={`${displayInfo.bgColor} rounded-lg p-4 mb-6`}>
                <h3 className={`text-lg font-semibold ${displayInfo.color} mb-2`}>
                  Welcome to {displayInfo.name}!
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {displayInfo.features?.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/support'}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
 
        <div className="mt-6 p-3 bg-gray-100 rounded text-xs space-y-2">
          <div><strong>Debug Info:</strong></div>
          <div>Status: <span className="font-mono">{status}</span></div>
          <div>Session ID: <span className="font-mono text-green-600">{debugInfo.sessionId ? '✓' : '✗'}</span></div>
          <div>Tier: <span className="font-mono">{debugInfo.tier}</span></div>
          <div>Has Auth Token: <span className="font-mono text-green-600">{debugInfo.hasToken ? '✓' : '✗'}</span></div>
        
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessHandler;