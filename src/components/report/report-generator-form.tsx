"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateReportFromPdfAction } from '@/actions/generate-report-from-pdf';
import { researchMentorChatAction } from '@/actions/research-mentor-chat';
import { Loader2, Wand2, MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  pdfFile: z
    .any()
    .refine(files => files?.length > 0, "A PDF file is required.")
    .refine(files => files?.[0]?.type === "application/pdf", "Only PDF files are allowed."),
});

type FormValues = z.infer<typeof formSchema>;

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function ReportGeneratorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  
  const fileRef = form.register("pdfFile");

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setReport('');
    setChatHistory([]);

    try {
        const pdfFile = values.pdfFile[0];
        const pdfDataUri = await fileToDataUri(pdfFile);

        const result = await generateReportFromPdfAction({
            pdfDataUri: pdfDataUri
        });

        if (result.report) {
            setReport(result.report);
        } else {
            toast({
                variant: "destructive",
                title: "Error Generating Report",
                description: result.error || "An unknown error occurred.",
            });
        }
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Error Processing File",
            description: "There was a problem reading the PDF file.",
        });
    }

    setIsLoading(false);
  }

  async function handleChat() {
    if (!chatInput.trim() || !report) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    const result = await researchMentorChatAction({
      reportContext: report,
      userQuery: userMsg,
      history: chatHistory,
    });

    if (result.response) {
      setChatHistory(prev => [...prev, { role: 'model', content: result.response! }]);
    } else {
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: result.error,
      });
    }
    setIsChatLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Future Research Report</CardTitle>
            <CardDescription>
              Upload a research paper to generate a report on its future work suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="pdfFile"
                  render={() => (
                    <FormItem>
                      <FormLabel>Research Paper (PDF)</FormLabel>
                      <FormControl>
                        <Input type="file" accept="application/pdf" {...fileRef} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Future Work Report
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col sticky top-20">
          <CardHeader>
            <CardTitle className="font-headline">Generated Report</CardTitle>
            <CardDescription>
              The AI-generated report on future research directions will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : report ? (
              <div className="rounded-md border p-6 bg-muted/50 h-full max-h-[65vh] overflow-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-bold">
                  <ReactMarkdown>{report}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground text-center">Your report is waiting to be generated.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {report && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-xl font-headline">Research Mentor Chat</CardTitle>
              <CardDescription>Ask follow-up questions about this report.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/20">
              <div className="space-y-4">
                {chatHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ask me anything about the methodologies or findings in the report!
                  </p>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border text-card-foreground shadow-sm'
                    }`}>
                      <ReactMarkdown className="prose prose-sm dark:prose-invert">{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input 
                placeholder="Ask the mentor a follow-up..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              />
              <Button onClick={handleChat} disabled={isChatLoading || !chatInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
