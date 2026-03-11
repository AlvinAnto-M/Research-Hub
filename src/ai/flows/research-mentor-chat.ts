'use server';

/**
 * @fileOverview AI mentor chatbot for research report follow-ups.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResearchMentorChatInputSchema = z.object({
  reportContext: z.string().describe('The content of the generated research report.'),
  userQuery: z.string().describe('The user\'s follow-up question or comment.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Conversation history.'),
});

const ResearchMentorChatOutputSchema = z.object({
  response: z.string().describe('The AI mentor\'s helpful response.'),
});

export async function researchMentorChat(input: z.infer<typeof ResearchMentorChatInputSchema>) {
  return researchMentorChatFlow(input);
}

const researchMentorChatFlow = ai.defineFlow(
  {
    name: 'researchMentorChatFlow',
    inputSchema: ResearchMentorChatInputSchema,
    outputSchema: ResearchMentorChatOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: `You are a Research Mentor, an expert academic advisor. 
      You are helping a researcher understand and expand upon a research report that was just generated.
      Use the provided report context to answer questions, suggest methodologies, and provide critical feedback.
      Be encouraging, professional, and intellectually rigorous.
      
      REPORT CONTEXT:
      ${input.reportContext}`,
      prompt: input.userQuery,
      messages: input.history?.map(m => ({
        role: m.role,
        content: [{ text: m.content }]
      })),
    });

    return { response: output?.text || "I'm sorry, I couldn't process that. Please try again." };
  }
);
