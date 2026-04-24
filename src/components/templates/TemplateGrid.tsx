"use client";

import { faCalendarDays, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { RecurringTemplate } from "@/types/recuringTemplate";
import Button from "@/components/common/buttons/Button";
import TemplateCard from "@/components/templates/TemplateCard";
import type { TemplateFilter } from "./TemplateFilterTabs";

interface TemplateGridProps {
    templates: RecurringTemplate[];
    filter: TemplateFilter;
    onCreateClick: () => void;
    onViewTemplate: (template: RecurringTemplate) => void;
    onToggleActive: (template: RecurringTemplate) => void;
    onDeleteTemplate: (templateId: string) => void;
    onEditTemplate: (template: RecurringTemplate) => void;
}

export default function TemplateGrid({
    templates,
    filter,
    onCreateClick,
    onViewTemplate,
    onToggleActive,
    onDeleteTemplate,
    onEditTemplate,
}: TemplateGridProps) {
    if (templates.length === 0) {
        return (
            <div className="text-center py-12">
                <FontAwesomeIcon icon={faCalendarDays} className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {filter === "active" ? "Ingen aktive skabeloner" :
                        filter === "inactive" ? "Ingen inaktive skabeloner" :
                            "Ingen skabeloner endnu"}
                </h3>
                <p className="text-gray-500 mb-6">
                    Opret en gentagende opgaveskabelon for at komme i gang
                </p>
                {filter === "active" && (
                    <div className="flex justify-center">
                        <Button
                            variant="primary"
                            size="md"
                            icon={faPlus}
                            onClick={onCreateClick}
                        >
                            Opret Din Første Skabelon
                        </Button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map(template => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    onView={() => onViewTemplate(template)}
                    onToggleActive={() => onToggleActive(template)}
                    onDelete={() => onDeleteTemplate(template.id)}
                    onEdit={() => onEditTemplate(template)}
                />
            ))}
        </div>
    );
}
