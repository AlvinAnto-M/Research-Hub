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
import { Loader2, Search, ExternalLink, FileText, Bookmark } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Paper } from '@/services/semantic-scholar';
import { Separator } from '../ui/separator';
import ReactMarkdown from 'react-markdown';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

const formSchema = z.object({
  query: z.string().min(3, "Please enter at least 3 characters."),
});

type FormValues = z.infer<typeof formSchema>;

type SearchState = 'idle' | 'searching' | 'summarizing' | 'results' | 'summary' | 'error';

export function ResearchPaperFinder() {
  const { firestore } = useFirebase();
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [summary, setSummary] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isBookmarking, setIsBookmarking] = useState<string | null>(null);
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
        setSearchState('results');
    }
  }

  async function handleBookmark(paper: Paper) {
    if (!firestore) return;
    setIsBookmarking(paper.paperId);

    try {
      const bookmarksRef = collection(firestore, 'users', 'current-user', 'bookmarks');
      await addDoc(bookmarksRef, {
        paperId: paper.paperId,
        title: paper.title,
        url: paper.url,
        authors: paper.authors.map(a => a.name),
        year: paper.year || null,
        addedAt: serverTimestamp(),
      });

      toast({
        title: "Paper Bookmarked",
        description: `"${paper.title}" has been added to your bookmarks.`,
      });
    } catch (error) {
      console.error("Error bookmarking paper:", error);
      toast({
        variant: "destructive",
        title: "Bookmark Failed",
        description: "Could not save bookmark. Please try again.",
      });
    } finally {
      setIsBookmarking(null);
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
                    <h3 className="font-bold text-lg font-headline">Select a Paper</h3>
                    {papers.map((paper) => (
                        <Card key={paper.paperId} className="hover:bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-base">{paper.title}</CardTitle>
                                <CardDescription className="text-xs">
                                    {paper.authors.map(a => a.name).join(', ')} ({paper.year})
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <Button onClick={() => onPaperSelect(paper)} size="sm">
                                    <FileText className="mr-2 h-4 w-4"/>
                                    Summary
                                </Button>
                                <Button 
                                  onClick={() => handleBookmark(paper)} 
                                  size="sm" 
                                  variant="outline"
                                  disabled={isBookmarking === paper.paperId}
                                >
                                    {isBookmarking === paper.paperId ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Bookmark className="h-4 w-4 mr-2" />
                                    )}
                                    Bookmark
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
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg font-headline">Executive Summary</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleBookmark(selectedPaper)}
                        disabled={isBookmarking === selectedPaper.paperId}
                      >
                         {isBookmarking === selectedPaper.paperId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Bookmark className="h-4 w-4 mr-2" />
                          )}
                        Bookmark
                      </Button>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-bold mb-6">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                    <Separator className="my-6" />
                    <h4 className="font-semibold mb-2">Original Paper</h4>
                    <a href={selectedPaper.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center">
                        View on Semantic Scholar <ExternalLink className="h-4 w-4 ml-2"/>
                    </a>
                </div>
            )

        case 'idle':
        default:
            return (
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground text-center">Search for academic papers to begin analysis.</p>
                </div>
            );
    }
  }


  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Paper Search</CardTitle>
          <CardDescription>
            Search millions of papers and bookmark the most relevant ones.
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
                    <FormLabel>Keywords or Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 'Large Language Models'" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={searchState === 'searching' || searchState === 'summarizing'} className="w-full">
                {searchState === 'searching' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col sticky top-20">
        <CardHeader>
          <CardTitle className="font-headline">Analysis Result</CardTitle>
          <CardDescription>
            AI insights and bookmarking options.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow min-h-[400px]">
          {renderResults()}
        </CardContent>
      </Card>
    </div>
  );
}
