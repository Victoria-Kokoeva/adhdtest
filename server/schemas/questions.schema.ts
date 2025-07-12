import {z} from 'zod'

export const questionSchema = z.object({
  id: z.number().min(1),
  question: z.string().min(1, "Question cannot be empty"),
});

type Question = z.infer<typeof questionSchema>;
export type { Question };