import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Input = ({ value, onChange, type, placeholder, className ,label}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="input-box relative">
            <label className="text-black text-s mb-2">{label}</label>
            <input
                type={type === "password" ? (showPassword ? "text" : "password") : type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none p-2 mb-4 "
            />

            {type === "password" && (
                <div
                    className="absolute right-4  top-1/2 transform -translate-y-1/2 cursor-pointer "
                    onClick={togglePasswordVisibility}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
            )}
        </div>
    );
};

export default Input;
