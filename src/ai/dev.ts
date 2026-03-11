import { config } from 'dotenv';
config({ path: `.env.local` });
config();

import '@/ai/flows/summarize-paper';
import '@/ai/flows/generate-project-report.ts';
import '@/ai/flows/generate-report-from-pdf.ts';
import '@/ai/flows/research-mentor-chat.ts';
