"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/lib/api";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  projectId: string;
  onProjectChange: (projectId: string) => void;
}

export default function ProjectCard({ projectId, onProjectChange }: ProjectCardProps) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="overline pt-1">Projekt</h3>
      <div>
        <label htmlFor="project_id" className="label-lg mb-2 block">
          Projekt
        </label>
        <select
          id="project_id"
          value={projectId}
          onChange={(e) => onProjectChange(e.target.value)}
          required
          className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors bg-white text-[#1B1D22]"
        >
          <option value="" disabled>Vælg projekt...</option>
          {projects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
