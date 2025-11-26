"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { type Project } from '@/lib/placeholder-data';

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  updateProject: (updatedProject: Project) => void;
  getProjectById: (projectId: string) => Project | undefined;
}

export const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  addProject: () => {},
  removeProject: () => {},
  updateProject: () => {},
  getProjectById: () => undefined,
});

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
    } catch (error) {
      console.error("Failed to load projects from local storage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('projects', JSON.stringify(projects));
      } catch (error) {
        console.error("Failed to save projects to local storage", error);
      }
    }
  }, [projects, isLoaded]);

  const addProject = (project: Project) => {
    setProjects(prevProjects => [...prevProjects, project]);
  };

  const removeProject = (projectId: string) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
  };
  
  const updateProject = (updatedProject: Project) => {
    setProjects(prevProjects => 
      prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
  };

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, removeProject, updateProject, getProjectById }}>
      {children}
    </ProjectContext.Provider>
  );
};
