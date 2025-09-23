import { z } from "zod";

export const userSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  parent_id: z.number().int().nullable().optional(),
  created_at: z.date().optional(), 
});
