import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import Input from '../../components/Inputs/input';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage'
import axiosInstance from '../../utils/axiosInstance';

export const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

const SignUp = ({ setCurrentTab }) => {
  const [profilepic, setProfilepic] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const {updateUser } = useContext(UserContext);
const handleSignUp = async (e) => {
  e.preventDefault();

  const result = signUpSchema.safeParse({ name, email, password });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    setFieldErrors(errors);
    const firstError = Object.values(errors).flat()[0];
    toast.error(firstError);
    return;
  }

  if (!profilepic) {
    toast.error("Image not uploaded");
    return;
  }

  setFieldErrors({});

  try {
    let uploadedImageUrl = "";

    if (profilepic) {
      const imageRes = await uploadImage(profilepic);
      toast.success("Profile picture has been uploaded");
      uploadedImageUrl = imageRes.imageUrl || "";
    }

    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      password,
      profileImageUrl: uploadedImageUrl,  // use the direct URL here
    });

    const { token } = response.data;

    if (token) {
      localStorage.setItem("token", token);
      updateUser(response.data);
      toast.success("Signup successful!");
      navigate("/dashboard");
    }
  } catch (error) {
    toast.error("An error occurred while signing up");
    console.error(error);
  }
};


  return (
    <div className='flex flex-col p-7 justify-center w-full bg-white'>
      <h1 className='text-4xl font-bold'>Create an Account</h1>
      <p className='text-black text-s mb-6'>Please enter your details below to sign up</p>

      <form className='flex flex-col' onSubmit={handleSignUp}>
        <ProfilePhotoSelector
          image={profilepic}
          setImage={setProfilepic}
          previewImage={previewImage}
          setPreviewImage={setPreviewImage}
        />

        <Input
          type="text"
          label="Full Name"
          value={name}
          onChange={({ target }) => setName(target.value)}
          placeholder="Fowzan Mohammed"
          className="border border-gray-300 rounded-md p-2 m-2 mt-4"
        />
        {fieldErrors.name && <p className="text-red-500 text-sm ml-2">{fieldErrors.name[0]}</p>}

        <Input
          type="text"
          label="Email"
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          placeholder="fowzan@exe.com"
          className="border border-gray-300 rounded-md p-2 m-2 mt-4"
        />
        {fieldErrors.email && <p className="text-red-500 text-sm ml-2">{fieldErrors.email[0]}</p>}

        <Input
          type="password"
          label="Password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          placeholder="Minimum 8 characters"
          className="border border-gray-300 rounded-md p-2 m-2 mt-8"
        />
        {fieldErrors.password && <p className="text-red-500 text-sm ml-2">{fieldErrors.password[0]}</p>}

        <button
          type="submit"
          className="bg-black text-white rounded-md p-2 m-2 mt-12 hover:bg-amber-500"
        >
          Sign Up
        </button>

        <p className="text-black text-s mt-4">
          Already have an account?{" "}
          <button
            onClick={() => setCurrentTab("login")}
            className="text-blue-500 cursor-pointer"
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
