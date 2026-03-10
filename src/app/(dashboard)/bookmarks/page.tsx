"use client";

import { useMemo } from 'react';
import { collection, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { useFirebase, useCollection } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Trash2, Loader2, Bookmark } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function BookmarksPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const bookmarksQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'users', 'current-user', 'bookmarks'),
      orderBy('addedAt', 'desc')
    );
  }, [firestore]);

  const { data: bookmarks, loading, error } = useCollection(bookmarksQuery);

  async function handleDelete(bookmarkId: string) {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', 'current-user', 'bookmarks', bookmarkId));
      toast({
        title: "Bookmark removed",
        description: "The paper has been removed from your list.",
      });
    } catch (e) {
      console.error("Error deleting bookmark:", e);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not remove the bookmark.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Saved Papers</h1>
        <p className="text-muted-foreground">Keep track of interesting research for your upcoming projects.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading bookmarks. Please try again later.</p>
          </CardContent>
        </Card>
      ) : bookmarks && bookmarks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{bookmark.title}</CardTitle>
                <CardDescription className="text-xs">
                  {bookmark.authors?.join(', ')} {bookmark.year ? `(${bookmark.year})` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex justify-between items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Paper
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(bookmark.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">No bookmarked papers yet</h3>
            <p className="text-muted-foreground mb-6">Start searching for papers in the Paper Analyzer and bookmark them here.</p>
            <Button asChild>
              <a href="/research-ahead">Go to Paper Analyzer</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
