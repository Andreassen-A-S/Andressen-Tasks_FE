"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faCalendarDays,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import { getRecurringTemplates, deleteRecurringTemplate, deactivateTemplate, reactivateTemplate } from "@/lib/api";
import TemplateCard from "@/components/templates/TemplateCard";
import CreateTemplateForm from "@/components/templates/CreateTemplateForm";
import ViewTemplate from "@/components/templates/ViewTemplate";
import Modal from "../modal/Modal";
import UpdateTemplateForm from "./UpdateTemplateForm";


export default function RecurringTemplatesPage() {
    const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateTemplate, setShowCreateTemplate] = useState(false);
    const [showEditTemplate, setShowEditTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<RecurringTemplate | null>(null);
    const [showViewTemplate, setShowViewTemplate] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

    type FilterKey = "all" | "active" | "inactive";

    const filterOptions: { key: FilterKey; label: string; count: number }[] = [
        { key: 'active', label: 'Aktive', count: templates.filter(t => t.is_active).length },
        { key: 'inactive', label: 'Inaktive', count: templates.filter(t => !t.is_active).length },
        { key: 'all', label: 'Alle', count: templates.length },
    ];

    useEffect(() => {
        loadTemplates();
    }, []);

    async function loadTemplates() {
        try {
            setLoading(true);
            const data = await getRecurringTemplates();
            setTemplates(data);
        } catch (err) {
            setError("Kunne ikke indlæse gentagende opgaveskabeloner");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(templateId: string) {
        if (!confirm("Er du sikker på, at du vil slette denne skabelon? Dette vil også slette alle fremtidige instanser.")) {
            return;
        }

        try {
            await deleteRecurringTemplate(templateId);
            setTemplates(templates.filter(t => t.id !== templateId));
        } catch (err) {
            alert("Kunne ikke slette skabelon");
            console.error(err);
        }
    }

    async function handleToggleActive(template: RecurringTemplate) {
        try {
            if (template.is_active) {
                await deactivateTemplate(template.id);
                setTemplates(templates.map(t =>
                    t.id === template.id ? { ...t, is_active: false } : t
                ));
            } else {
                await reactivateTemplate(template.id);
                setTemplates(templates.map(t =>
                    t.id === template.id ? { ...t, is_active: true } : t
                ));
            }
        } catch (err) {
            alert("Kunne ikke ændre skabelonens status");
            console.error(err);
        }
    }

    function handleViewTemplate(template: RecurringTemplate) {
        setSelectedTemplate(template);
        setShowViewTemplate(true);
    }

    function handleEditTemplate(template: RecurringTemplate) {
        setSelectedTemplate(template);
        setShowEditTemplate(true);
    }

    const filteredTemplates = templates.filter(template => {
        if (filter === 'all') return true;
        if (filter === 'active') return template.is_active;
        return !template.is_active;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-teal-600 animate-spin" />
                    <div className="text-sm text-gray-500">Indlæser skabeloner...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="h1 flex items-center gap-3">
                            Gentagende opgaver
                        </h1>
                        <p className="body-sm">
                            Administrer dine gentagende opgaveskabeloner
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateTemplate(true)}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} size="sm" />
                        Opret skabelon
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-2 border-b border-gray-200">
                    {filterOptions.map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === key
                                ? 'border-blue-600 label-lg'
                                : 'border-transparent label-lg-gray hover:text-green-200'
                                }`}
                        >
                            {label} ({count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pb-12">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={faCalendarDays} className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filter === 'active' ? 'Ingen aktive skabeloner' :
                                filter === 'inactive' ? 'Ingen inaktive skabeloner' :
                                    'Ingen skabeloner endnu'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Opret en gentagende opgaveskabelon for at komme i gang
                        </p>
                        {filter === 'active' && (
                            <button
                                onClick={() => setShowCreateTemplate(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Opret Din Første Skabelon
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onView={() => handleViewTemplate(template)}
                                onToggleActive={() => handleToggleActive(template)}
                                onDelete={() => handleDelete(template.id)}
                                onEdit={() => handleEditTemplate(template)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal
                isOpen={showCreateTemplate}
                onClose={() => setShowCreateTemplate(false)}
                title="Opret Ny Skabelon"
                maxWidth="3xl"
            >
                <CreateTemplateForm
                    onCancel={() => setShowCreateTemplate(false)}
                    onSuccess={(template) => {
                        setTemplates([...templates, template]);
                        setShowCreateTemplate(false);
                    }}
                />

            </Modal>

            {/* Edit Modal */}
            {showEditTemplate && selectedTemplate && (
                <Modal
                    isOpen={showEditTemplate}
                    onClose={() => {
                        setShowEditTemplate(false);
                        setSelectedTemplate(null);
                    }}
                    title="Rediger Skabelon"
                    maxWidth="3xl"
                >
                    <UpdateTemplateForm
                        template={selectedTemplate}
                        onCancel={() => {
                            setShowEditTemplate(false);
                            setSelectedTemplate(null);
                        }}
                        onSuccess={(updated) => {
                            setTemplates(templates.map(t =>
                                t.id === updated.id ? updated : t
                            ));
                            setShowEditTemplate(false);
                            setSelectedTemplate(null);
                        }}
                    />
                </Modal>
            )}

            {showViewTemplate && selectedTemplate && (
                <ViewTemplate
                    template={selectedTemplate}
                    onClose={() => {
                        setShowViewTemplate(false);
                        setSelectedTemplate(null);
                    }}
                    onUpdate={(updated) => {
                        setTemplates(templates.map(t =>
                            t.id === updated.id ? updated : t
                        ));
                    }}
                />
            )}
        </div>
    );
}