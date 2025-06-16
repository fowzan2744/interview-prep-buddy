import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50, { message: "Password must be less than 50 characters" }),
});


 
export const getInitials = (title) => {
  if (!title) return "";
  const words = title.split(" ");
  const initials = words.map((word) => word.charAt(0).toUpperCase());
  return initials.join("");
};
