import React, { useEffect, useState } from 'react';
import { LuPlus, LuRefreshCw } from 'react-icons/lu';
import { CARD_BG } from '../../utils/data';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import SummaryCard from '../../components/Cards/SummaryCard';
import moment from 'moment';
import CreateSessionForm from './CreateSessionForm';
import Modal from '../../components/Loader/Modal';

// Usage Widget Component
const UsageWidget = ({ usageData, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
          <span className="ml-2 text-gray-500">Loading usage...</span>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="text-center text-gray-500 py-4">
          Unable to load usage data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-700 to-gray-400 rounded-lg shadow-md p-6 mb-6 border border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Daily Usage</h3>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-amber-600 transition-colors"
          title="Refresh usage data"
        >
          <LuRefreshCw className="w-4 h-4 text-white hover:animate-spin cursor-pointer" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sessions Usage */}
        <div className="bg-white rounded-lg p-4 shadow-sm hover:animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-600">Sessions</span>
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-800">
              {usageData.sessions.remaining}
            </div>
            <div className="text-sm text-gray-500">
              / {usageData.sessions.limit} left
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usageData.sessions.remaining === 0 ? 'bg-red-400' : 'bg-amber-400'
              }`}
              style={{ 
                width: `${(usageData.sessions.remaining / usageData.sessions.limit) * 100}%` 
              }}
            ></div>
          </div>
          {usageData.sessions.remaining === 0 && (
            <p className="text-xs text-red-500 mt-1">Daily limit reached</p>
          )}
        </div>

        {/* Explanations Usage */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-600">Explanations</span>
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-800">
              {usageData.explanations.remaining}
            </div>
            <div className="text-sm text-gray-500">
              / {usageData.explanations.limit} left
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usageData.explanations.remaining === 0 ? 'bg-red-400' : 'bg-blue-400'
              }`}
              style={{ 
                width: `${(usageData.explanations.remaining / usageData.explanations.limit) * 100}%` 
              }}
            ></div>
          </div>
          {usageData.explanations.remaining === 0 && (
            <p className="text-xs text-red-500 mt-1">Daily limit reached</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-center hover:border-b-2 border-amber-400">
        <p className="text-xs text-white font-semibold">
          Limits reset daily at midnight ⏰
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [session, setSession] = useState([]);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ open: false, data: null });
  const [usageData, setUsageData] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get('/sessions/my-sessions');
      setSession(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsageData = async () => {
    setUsageLoading(true);
    try {
      const response = await axiosInstance.get('/rate-limit/usage'); // You'll need to create this endpoint
      setUsageData(response.data);
    } catch (error) {
      console.log('Error fetching usage data:', error);
      toast.error('Failed to load usage data');
    } finally {
      setUsageLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(`/sessions/${sessionData._id}`);
      toast.success('Session deleted successfully');
      fetchAllSessions();
      // Refresh usage data after deletion
      fetchUsageData();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateSessionSuccess = () => {
    setOpenCreateModal(false);
    fetchAllSessions();
    fetchUsageData(); // Refresh usage data after creating session
  };

  useEffect(() => {
    fetchAllSessions();
    fetchUsageData();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-5 py-10">
        {/* Usage Widget */}
        <UsageWidget 
          usageData={usageData} 
          isLoading={usageLoading} 
          onRefresh={fetchUsageData}
        />

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-7 pb-6">
          {session.map((data, index) => (
            <SummaryCard
              key={data?._id}
              colors={CARD_BG[index % CARD_BG.length].bgcolor}
              role={data?.role || ''}
              experience={data?.experience || ''}
              topicsToFocus={data?.topicsToFocus || ''}
              description={data?.description || ''}
              questions={data?.questions || []}
              lastUpdated={
                data?.updatedAt ? moment(data?.updatedAt).format('DD/MM/YYYY') : ''
              }
              onSelect={() => navigate(`/interview-prep/${data?._id}`)}
              onDelete={() => deleteSession(data)}
            />
          ))}
        </div>

        {/* Add New Session Button */}
        <button
          className={`h-12 flex items-center justify-center rounded-full gap-3 cursor-pointer fixed bottom-10 right-10 pl-3 pr-3 transition-all duration-300 ${
            usageData?.sessions?.remaining === 0 
              ? 'bg-gray-400 cursor-not-allowed hover:cursor-not-allowed' 
              : 'bg-amber-400 hover:bg-black hover:text-white'
          }`}
          onClick={() => {
            if (usageData?.sessions?.remaining === 0) {
              toast.error('Daily session limit reached');
              return;
            }
            setOpenCreateModal(true);
          }}
          disabled={usageData?.sessions?.remaining === 0}
        >
          <LuPlus className="text-2xl text-white" />
          Add New?
        </button>
      </div>

      <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)} hideHeader>
        <CreateSessionForm onSuccess={handleCreateSessionSuccess} />
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;