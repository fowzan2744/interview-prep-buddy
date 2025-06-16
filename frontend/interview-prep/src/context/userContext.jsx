import React, { useState, useEffect, createContext } from "react";
import axiosInstance from "../utils/axiosInstance";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get("/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const clearUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem("token", userData.token);
    setUser(userData);
    setLoading(false);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, setLoading, updateUser, clearUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
