"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/lib/api";
import type { Project } from "@/types/project";
import SelectField from "@/components/common/forms/SelectField";
import { colors } from "@/constants/colors";

interface ProjectPickerCardProps {
  projectId: string;
  onProjectChange: (projectId: string) => void;
}

export default function ProjectPickerCard({ projectId, onProjectChange }: ProjectPickerCardProps) {
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
          <p className="body-sm" style={{ color: colors.red }}>Kunne ikke hente projekter. Prøv at genindlæse siden.</p>
        ) : (
          <SelectField
            id="project_id"
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            required
            disabled={loading || projects.length === 0}
          >
            <option value="" disabled>
              {loading ? "Henter projekter..." : projects.length === 0 ? "Ingen projekter — opret et projekt først" : "Vælg projekt..."}
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
