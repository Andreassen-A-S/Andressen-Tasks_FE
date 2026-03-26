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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="overline pt-1">Projekt</h3>
      <div>
        <label htmlFor="project_id" className="label-lg mb-2 block">
          Projekt
        </label>
        {error ? (
          <p className="body-sm text-[#D64545]">Kunne ikke hente projekter. Prøv at genindlæse siden.</p>
        ) : (
          <select
            id="project_id"
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            required
            disabled={loading || projects.length === 0}
            className="block w-full rounded-lg border border-[#E8E6E1] px-4 py-3 body-md focus:border-[#2D9F6F] focus:ring-2 focus:ring-[#2D9F6F]/30 focus:outline-none transition-colors bg-white text-[#1B1D22] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {loading ? "Henter projekter..." : projects.length === 0 ? "Ingen projekter — opret et projekt først" : "Vælg projekt..."}
            </option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
