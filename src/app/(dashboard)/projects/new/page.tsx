import { NewProjectForm } from '@/components/projects/new-project-form';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Create New Project</h1>
        <p className="text-muted-foreground">
          Fill in the details below to start a new research project.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
