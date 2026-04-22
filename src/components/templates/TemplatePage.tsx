"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import ConfirmModal from "@/components/common/ConfirmModal";
import { colors } from "@/constants/colors";
import Button from "@/components/common/buttons/Button";


export default function RecurringTemplatesPage() {
    const createTemplateFormId = "create-template-form";
    const editTemplateFormId = "edit-template-form";
    const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateTemplate, setShowCreateTemplate] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [showEditTemplate, setShowEditTemplate] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<RecurringTemplate | null>(null);
    const [showViewTemplate, setShowViewTemplate] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

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

    function handleDelete(templateId: string) {
        setPendingDeleteId(templateId);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteId) return;
        setDeleteLoading(true);
        try {
            await deleteRecurringTemplate(pendingDeleteId);
            setTemplates(templates.filter(t => t.id !== pendingDeleteId));
            toast.success("Skabelon slettet");
            setConfirmOpen(false);
            setPendingDeleteId(null);
        } catch (err) {
            toast.error("Kunne ikke slette skabelon");
            console.error(err);
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleToggleActive(template: RecurringTemplate) {
        try {
            if (template.is_active) {
                await deactivateTemplate(template.id);
                setTemplates(templates.map(t =>
                    t.id === template.id ? { ...t, is_active: false } : t
                ));
                toast.success("Skabelon deaktiveret");
            } else {
                await reactivateTemplate(template.id);
                setTemplates(templates.map(t =>
                    t.id === template.id ? { ...t, is_active: true } : t
                ));
                toast.success("Skabelon aktiveret");
            }
        } catch (err) {
            toast.error("Kunne ikke ændre skabelonens status");
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
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-[#0f6e56]" />
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
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateTemplate(true)}
                    >
                        Opret skabelon
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-2 border-b border-gray-200">
                    {filterOptions.map(({ key, label, count }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`label-lg px-4 py-2 transition-colors border-b-2 ${filter === key
                                ? 'border-blue-600'
                                : 'border-transparent hover:text-green-200'
                                }`}
                            style={filter === key ? undefined : { color: colors.textSecondary }}
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
                            <div className="flex justify-center">
                                <Button
                                    variant="primary"
                                    size="md"
                                    icon={faPlus}
                                    onClick={() => setShowCreateTemplate(true)}
                                >
                                    Opret Din Første Skabelon
                                </Button>
                            </div>
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
                footer={
                    <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                        <Button
                            type="submit"
                            form={createTemplateFormId}
                            loading={createLoading}
                            variant="primary"
                            size="md"
                        >
                            Opret gentagende opgave
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setShowCreateTemplate(false)}
                            disabled={createLoading}
                            variant="secondary"
                            size="md"
                        >
                            Annuller
                        </Button>
                    </div>
                }
            >
                <CreateTemplateForm
                    formId={createTemplateFormId}
                    onLoadingChange={setCreateLoading}
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
                    footer={
                        <div className="flex flex-col-reverse gap-2 sm:flex-row-reverse">
                            <Button
                                type="submit"
                                form={editTemplateFormId}
                                loading={editLoading}
                                variant="primary"
                                size="md"
                            >
                                Gem ændringer
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowEditTemplate(false);
                                    setSelectedTemplate(null);
                                }}
                                disabled={editLoading}
                                variant="secondary"
                                size="md"
                            >
                                Annuller
                            </Button>
                        </div>
                    }
                >
                    <UpdateTemplateForm
                        formId={editTemplateFormId}
                        onLoadingChange={setEditLoading}
                        template={selectedTemplate}
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
                />
            )}

            {/* Delete Template Confirm Modal */}
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
                onConfirm={handleConfirmDelete}
                title="Slet skabelon"
                description="Er du sikker på, at du vil slette denne skabelon?"
                confirmLabel="Slet"
                cancelLabel="Annuller"
                danger
                loading={deleteLoading}
            />
        </div>
    );
}
