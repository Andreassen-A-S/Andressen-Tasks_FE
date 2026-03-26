"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Project } from "@/types/project";

interface ProjectCardProps {
    project: Project;
    taskCount: number;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ProjectCard({ project, taskCount, onEdit, onDelete }: ProjectCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 flex flex-col transition-shadow duration-200 hover:shadow-md overflow-hidden">
            {/* Color bar */}
            <div className="h-1.5 w-full" style={{ backgroundColor: project.color ?? "#E8E6E1" }} />

            {/* Body */}
            <div className="px-6 pt-5 pb-4 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {project.color && (
                            <span
                                className="shrink-0 w-3 h-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                            />
                        )}
                        <h3 className="h5 truncate text-gray-900">{project.name}</h3>
                    </div>
                    <span className="label-md text-gray-400 whitespace-nowrap">
                        {taskCount} {taskCount === 1 ? "opgave" : "opgaver"}
                    </span>
                </div>

                {project.description && (
                    <p className="body-xs mt-2 text-gray-400 line-clamp-2">{project.description}</p>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                    onClick={onEdit}
                    className="px-3 py-3 btn-md text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                    title="Rediger projekt"
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={onDelete}
                    className="px-3 py-3 btn-md text-red-500 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                    title="Slet projekt"
                >
                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
