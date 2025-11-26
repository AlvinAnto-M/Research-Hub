import { ProjectList } from "@/components/projects/project-list";
import { ProjectStatusChart } from "@/components/projects/project-status-chart";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline">My Projects</h1>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle />
            New Project
          </Link>
        </Button>
      </div>
      
      <ProjectStatusChart />
      
      <ProjectList />
    </div>
  );
}
