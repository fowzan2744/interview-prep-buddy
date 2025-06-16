import React, { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';

const ProfileInfoCard = () => {
  const { user, loading, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  if (loading) return <div>Loading profile...</div>;

  if (!user) return <div>Please log in</div>;

  const handleLogout = () => {
    localStorage.removeItem("token");
    clearUser();
    navigate("/");
  };

  return (
    <div className="flex items-center mr-5 ml-5">
      <img
        src={user.profileImageUrl}
        alt={user.name ? `${user.name}'s profile` : "Profile picture"}
        className="w-12 h-12 bg-gray-200 rounded-full  border-2 border-pink-400 mr-3 object-cover hover:scale-500" 
      />
      <div>
        <div className="text-[15px] text-black font-bold leading-3">
          {user.name || ""}
        </div>
        <button
          className="text-amber-600 text-sm font-semibold cursor-pointer hover:underline"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
