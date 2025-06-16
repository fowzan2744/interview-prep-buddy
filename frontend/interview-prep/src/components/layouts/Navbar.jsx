import React, { useEffect, useState } from 'react';
import ProfileInfoCard from '../Cards/ProfileInfoCard';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const Navbar = () => {
  const [userTier, setUserTier] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTier();
  }, []);

  const fetchUserTier = async () => {
    try {
      const res = await axiosInstance.get('/rate-limit/usage');
      if (res.status === 200 && res.data) {
        setUserTier(res.data.tier || 'free');
      }
    } catch (err) {
      console.error('Error fetching user tier:', err);
      setUserTier('free');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = () => {
    window.location.href = '/upgradetier';
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'premium': 
        return <Zap className="w-5 h-5 text-white" />;
      case 'luxury': 
        return <Crown className="w-5 h-5 text-white" />;
      default: 
        return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium': 
        return 'from-blue-500 to-blue-600';
      case 'luxury': 
        return 'from-purple-500 to-purple-600';
      default: 
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case 'premium': 
        return 'Premium';
      case 'luxury': 
        return 'Luxury';
      default: 
        return 'Free';
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-5 mr-3">
      <div className="container mx-auto flex justify-between items-center gap-5 text-black leading-5">
        <Link to="/dashboard">
          <h2 className="text-lg md:text-xl font-medium">INTERVIEW PREP</h2>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!loading && (
          <>

          {userTier === 'free' && (
              <button
                onClick={handleUpgradeClick}
                className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 shadow hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="font-medium">Upgrade</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className={`flex items-center hover:cursor-pointer space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${getTierColor(userTier)} text-white shadow-md`} onClick={
              () => {
                if (userTier !== 'free') {
                window.location.href = '/upgradetier';
              }}}>
              {getTierIcon(userTier)}
              <span className="font-semibold whitespace-nowrap">{getTierName(userTier)} Tier</span>
              
            </div>

            
          </>
        )}

        <ProfileInfoCard />
      </div>
    </div>
  );
};

export default Navbar;