'use server';

import { researchMentorChat } from '@/ai/flows/research-mentor-chat';
import { z } from 'zod';

const chatSchema = z.object({
  reportContext: z.string(),
  userQuery: z.string().min(1, "Question cannot be empty."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});

export async function researchMentorChatAction(values: z.infer<typeof chatSchema>) {
  const parsed = chatSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  try {
    const result = await researchMentorChat(parsed.data);
    return { response: result.response };
  } catch (error) {
    console.error("Chat error:", error);
    return { error: "The mentor is temporarily unavailable. Please try again later." };
  }
}
