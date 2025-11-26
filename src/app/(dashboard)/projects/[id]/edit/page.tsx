"use client";

import { useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProjectContext } from '@/context/ProjectContext';
import { type Project } from '@/lib/placeholder-data';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';


const formSchema = z.object({
  name: z.string().min(1, 'Project name is required.'),
  lead: z.string().min(1, 'Project lead is required.'),
  status: z.enum(['Not Started', 'In Progress', 'On Hold', 'Completed']),
  progress: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProjectPage() {
  const { getProjectById, updateProject } = useContext(ProjectContext);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      lead: '',
      status: 'Not Started',
      progress: 0,
    },
  });

  useEffect(() => {
    if (typeof params.id === 'string') {
      const foundProject = getProjectById(params.id);
      if (foundProject) {
        setProject(foundProject);
        form.reset(foundProject);
        setProgressValue(foundProject.progress);
      } else {
        // router.push('/projects');
      }
    }
  }, [params.id, getProjectById, form, router]);

  if (!project) {
    return <div>Loading...</div>;
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    
    updateProject({
        ...project,
        ...values,
    });

    toast({
        title: "Project Updated",
        description: "Your project has been successfully updated.",
    });

    setIsLoading(false);
    router.push(`/projects/${project.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Edit Project</h1>
        <p className="text-muted-foreground">
          Update the details for "{project.name}".
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Project Details</CardTitle>
          <CardDescription>
            Modify the project information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Lead</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="On Hold">On Hold</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Progress: {progressValue}%</FormLabel>
                            <FormControl>
                                <Slider
                                    defaultValue={[field.value]}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => {
                                        field.onChange(value[0]);
                                        setProgressValue(value[0]);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                  </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
