"use client";

import { useCallback, useEffect, useState } from "react";
import { getProjects } from "@/lib/api";
import type { Project } from "@/types/project";
import SelectField from "@/components/common/forms/SelectField";
import InlineLoadingState from "@/components/common/loading/InlineLoadingState";
import Banner from "@/components/common/Banner";
import Button from "@/components/common/buttons/Button";

interface ProjectPickerCardProps {
  projectId: string;
  onProjectChange: (projectId: string) => void;
}

export default function ProjectPickerCard({ projectId, onProjectChange }: ProjectPickerCardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  return (
    <div className="space-y-4">
      <h3 className="overline pt-1">Projekt</h3>
      <div>
        <label htmlFor="project_id" className="label-lg mb-2 block">
          Projekt
        </label>
        {error ? (
          <Banner
            variant="warning"
            title="Projekter kunne ikke indlæses"
            action={<Button variant="secondary" onClick={() => void loadProjects()}>Prøv igen</Button>}
          >
            Kunne ikke hente projekter.
          </Banner>
        ) : loading ? (
          <InlineLoadingState label="Indlæser projekter..." />
        ) : (
          <SelectField
            id="project_id"
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            required
            disabled={projects.length === 0}
          >
            <option value="" disabled>
              {projects.length === 0 ? "Ingen projekter — opret et projekt først" : "Vælg projekt..."}
            </option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.name}
              </option>
            ))}
          </SelectField>
        )}
      </div>
    </div>
  );
}
