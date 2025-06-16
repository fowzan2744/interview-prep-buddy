import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import axiosInstance from '../../utils/axiosInstance';
import { useContext } from 'react';
import {UserContext } from '../../context/userContext';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

const Login = ({ setCurrentTab }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const {updateUser} = useContext(UserContext);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
      });

      if (fieldErrors.email?.[0]) {
        toast.error(fieldErrors.email[0], {
          duration: 3000,
          style: {
            fontSize: "1rem",
            fontWeight: "semi-bold",
            color: "red",
          }
        });
      }

      if (fieldErrors.password?.[0]) {
        toast.error(fieldErrors.password[0], {
          duration: 3000,
          style: {
            fontSize: "1rem",
            fontWeight: "semi-bold",
            color: "red",
            width: "fit-content",
          }
        });
      }

      return;
    }

    setErrors({ email: "", password: "" });
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        updateUser(response.data);
        toast.success("Login successful!");
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || "An unexpected error occurred.";
      toast.error(message);
      console.error("Login error:", err);
      setPassword(""); // Clear password on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col p-7 justify-center w-full bg-white'>
      <h1 className='text-4xl font-bold'>Welcome Back!</h1>
      <p className='text-black text-s mb-6'>Please enter your details to log in</p>

      <form className='flex flex-col' onSubmit={handleLogin}>
        <Input
          type="text"
          label="Email"
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          placeholder="fowzan@exe.com"
          className="border border-gray-300 rounded-md p-2 m-2 mt-4"
        />
        {errors.email && <p className="text-red-500 text-sm ml-2">{errors.email}</p>}

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          placeholder="Minimum 8 characters"
          className="border border-gray-300 rounded-md p-2 m-2 mt-4"
        />
        {errors.password && <p className="text-red-500 text-sm ml-2">{errors.password}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`bg-black text-white rounded-md p-2 m-2 mt-12 hover:bg-amber-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-black text-s mt-4">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => setCurrentTab("signup")}
            className="text-blue-500 cursor-pointer"
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
