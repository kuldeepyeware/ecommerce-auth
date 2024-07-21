import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().min(1, "Email is Required").email(),
  password: z
    .string()
    .min(1, "Password is Required")
    .min(8, "Password must be at least 8 characters"),
});

export { loginFormSchema };
