"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faRepeat,
    faCalendarDays,
    faTrash,
    faPause,
    faPlay,
    faEdit,
    faEye,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import { getRecurringTemplates, deleteRecurringTemplate, deactivateTemplate, reactivateTemplate } from "@/lib/api";
import TemplateCard from "@/components/templates/TemplateCard";
import CreateTemplateModal from "@/components/templates/CreateTemplateModal";
import ViewTemplateModal from "@/components/templates/ViewTemplateModal";

export default function RecurringTemplatesPage() {
    const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<RecurringTemplate | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

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
        setShowViewModal(true);
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FontAwesomeIcon icon={faRepeat} className="text-blue-600" />
                                Gentagende Opgaver
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Administrer dine gentagende opgaveskabeloner
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Opret Skabelon
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === 'active'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Aktive ({templates.filter(t => t.is_active).length})
                    </button>
                    <button
                        onClick={() => setFilter('inactive')}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === 'inactive'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Inaktive ({templates.filter(t => !t.is_active).length})
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${filter === 'all'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Alle ({templates.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Opret Din Første Skabelon
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map(template => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onView={() => handleViewTemplate(template)}
                                onToggleActive={() => handleToggleActive(template)}
                                onDelete={() => handleDelete(template.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateTemplateModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={(template) => {
                        setTemplates([...templates, template]);
                        setShowCreateModal(false);
                    }}
                />
            )}

            {showViewModal && selectedTemplate && (
                <ViewTemplateModal
                    template={selectedTemplate}
                    onClose={() => {
                        setShowViewModal(false);
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