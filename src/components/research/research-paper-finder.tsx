
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
import { searchPapersAction } from '@/actions/search-papers';
import { summarizePaperAction } from '@/actions/summarize-paper';
import { Loader2, Search, ExternalLink, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Paper } from '@/services/semantic-scholar';
import { Separator } from '../ui/separator';
import ReactMarkdown from 'react-markdown';

const formSchema = z.object({
  query: z.string().min(3, "Please enter at least 3 characters."),
});

type FormValues = z.infer<typeof formSchema>;

type SearchState = 'idle' | 'searching' | 'summarizing' | 'results' | 'summary' | 'error';

export function ResearchPaperFinder() {
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [summary, setSummary] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  async function onSearchSubmit(values: FormValues) {
    setSearchState('searching');
    setPapers([]);
    setSummary('');
    setSelectedPaper(null);

    const result = await searchPapersAction(values);
    if (result.papers) {
      if (result.papers.length === 0) {
          toast({
              variant: "default",
              title: "No Results",
              description: "Your search did not return any papers. Try a different query.",
          });
          setSearchState('idle');
      } else {
        setPapers(result.papers);
        setSearchState('results');
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error Searching Papers",
        description: result.error || "An unknown error occurred.",
      });
      setSearchState('error');
    }
  }

  async function onPaperSelect(paper: Paper) {
    setSearchState('summarizing');
    setSelectedPaper(paper);

    const result = await summarizePaperAction({ paperId: paper.paperId, title: paper.title });
    if (result.summary) {
        setSummary(result.summary);
        setSearchState('summary');
    } else {
        toast({
            variant: "destructive",
            title: "Error Generating Summary",
            description: result.error || "An unknown error occurred.",
        });
        setSearchState('results'); // Go back to results list
    }
  }
  
  const renderResults = () => {
    switch (searchState) {
        case 'searching':
        case 'summarizing':
            return (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-4 text-muted-foreground">
                    {searchState === 'searching' ? 'Searching papers...' : 'Generating summary...'}
                  </p>
                </div>
            );

        case 'results':
            return (
                <div className="space-y-3 h-full max-h-[70vh] overflow-y-auto">
                    <h3 className="font-bold text-lg font-headline">Select a Paper to Summarize</h3>
                    {papers.map((paper) => (
                        <Card key={paper.paperId} className="hover:bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-base">{paper.title}</CardTitle>
                                <CardDescription className="text-xs">
                                    {paper.authors.map(a => a.name).join(', ')} ({paper.year})
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={() => onPaperSelect(paper)} size="sm">
                                    <FileText className="mr-2"/>
                                    Generate Summary
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        
        case 'summary':
            if (!selectedPaper) return null;
            return (
                <div className="rounded-md border p-6 bg-muted/50 h-full max-h-[70vh] overflow-y-auto">
                    <h3 className="font-bold text-lg mb-4 font-headline">Executive Summary</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-bold mb-6">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                    <Separator className="my-6" />
                    <h4 className="font-semibold mb-2">Evidence</h4>
                    <a href={selectedPaper.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center">
                        View Original Paper <ExternalLink className="h-4 w-4 ml-2"/>
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">{selectedPaper.title}</p>
                </div>
            )

        case 'idle':
        default:
            return (
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center">Find a paper to get started.</p>
                </div>
            );
    }
  }


  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Search for a Paper</CardTitle>
          <CardDescription>
            Enter a research paper title or keyword to search Semantic Scholar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSearchSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paper Title or Keywords</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 'Attention Is All You Need'" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={searchState === 'searching' || searchState === 'summarizing'} className="w-full">
                {searchState === 'searching' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search Papers
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col sticky top-20">
        <CardHeader>
          <CardTitle className="font-headline">Analyzer</CardTitle>
          <CardDescription>
            {
                searchState === 'results' ? 'Select a paper from the list.' 
                : searchState === 'summary' ? 'Here is the AI-generated summary.'
                : 'Search results and summaries will appear here.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow min-h-[400px]">
          {renderResults()}
        </CardContent>
      </Card>
    </div>
  );
}
