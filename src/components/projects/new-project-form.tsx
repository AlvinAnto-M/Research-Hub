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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { createProjectAction } from '@/actions/create-project';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required.'),
  projectDescription: z.string().min(1, 'Project description is required.'),
  projectLead: z.string().min(1, 'Project lead is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function NewProjectForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      projectDescription: '',
      projectLead: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    const result = await createProjectAction(values);
    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Error Creating Project",
        description: result.error,
      });
      setIsLoading(false);
    } else {
        toast({
            title: "Project Created",
            description: "Your new project has been successfully created.",
        });
        // The action handles the redirect on success
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline">Project Details</CardTitle>
        <CardDescription>
          Provide the necessary information for your new project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Entanglement in Macro Systems" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the goals and scope of your project."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectLead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Lead</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Evelyn Reed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                    <Link href="/projects">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Project
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
