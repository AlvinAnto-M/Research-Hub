"use client";

import { useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectContext } from '@/context/ProjectContext';
import { type Project } from '@/lib/placeholder-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProjectDetailsPage() {
  const { getProjectById } = useContext(ProjectContext);
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (typeof params.id === 'string') {
      const foundProject = getProjectById(params.id);
      if (foundProject) {
        setProject(foundProject);
      } else {
        // Optionally, redirect if project not found
        // router.push('/projects');
      }
    }
  }, [params.id, getProjectById, router]);

  if (!project) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading project details or project not found...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Button>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
                <CardTitle className="font-headline text-3xl">{project.name}</CardTitle>
                <CardDescription>Lead by: {project.lead}</CardDescription>
            </div>
            <Badge variant="secondary">{project.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Progress</h3>
            <div className="flex items-center gap-4">
                <Progress value={project.progress} className="w-full" />
                <span className="text-lg font-bold">{project.progress}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Team Members</h3>
            <p className="text-muted-foreground">
              {project.team.length > 0 ? project.team.join(', ') : 'No team members assigned.'}
            </p>
          </div>
          
           <div className="border-t pt-4 mt-4">
                <Button asChild>
                    <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
                </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
