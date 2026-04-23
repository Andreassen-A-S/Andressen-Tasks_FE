"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
import { RecurringTemplate } from "@/types/recuringTemplate";
import { getRecurringTemplates, deleteRecurringTemplate, deactivateTemplate, reactivateTemplate } from "@/lib/api";
import ViewTemplate from "@/components/templates/ViewTemplate";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/common/buttons/Button";
import TemplateFilterTabs, { type TemplateFilter } from "./TemplateFilterTabs";
import TemplateGrid from "./TemplateGrid";
import TemplateCreateModal from "./TemplateCreateModal";
import TemplateEditModal from "./TemplateEditModal";
import PageHeader from "@/components/common/PageHeader";


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
    const [filter, setFilter] = useState<TemplateFilter>("active");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const filterOptions = [
        { key: "active" as const, label: "Aktive", count: templates.filter(t => t.is_active).length },
        { key: "inactive" as const, label: "Inaktive", count: templates.filter(t => !t.is_active).length },
        { key: "all" as const, label: "Alle", count: templates.length },
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

    function handleCloseEditTemplate() {
        setShowEditTemplate(false);
        setSelectedTemplate(null);
    }

    function handleCloseViewTemplate() {
        setShowViewTemplate(false);
        setSelectedTemplate(null);
    }

    function handleTemplateCreated(template: RecurringTemplate) {
        setTemplates([...templates, template]);
        setShowCreateTemplate(false);
    }

    function handleTemplateUpdated(updated: RecurringTemplate) {
        setTemplates(templates.map(t =>
            t.id === updated.id ? updated : t
        ));
        handleCloseEditTemplate();
    }

    const filteredTemplates = templates.filter(template => {
        if (filter === "all") return true;
        if (filter === "active") return template.is_active;
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
            <PageHeader
                title="Gentagende opgaver"
                subtitle="Administrer dine gentagende opgaveskabeloner"
                action={
                    <Button
                        variant="primary"
                        size="lg"
                        icon={faPlus}
                        onClick={() => setShowCreateTemplate(true)}
                    >
                        Opret skabelon
                    </Button>
                }
            />

            <div className="mx-8 mt-3 px-4 sm:px-6 lg:px-8">
                <TemplateFilterTabs
                    activeFilter={filter}
                    options={filterOptions}
                    onFilterChange={setFilter}
                />
            </div>

            <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pb-12">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <TemplateGrid
                    templates={filteredTemplates}
                    filter={filter}
                    onCreateClick={() => setShowCreateTemplate(true)}
                    onViewTemplate={handleViewTemplate}
                    onToggleActive={handleToggleActive}
                    onDeleteTemplate={handleDelete}
                    onEditTemplate={handleEditTemplate}
                />
            </div>

            <TemplateCreateModal
                isOpen={showCreateTemplate}
                loading={createLoading}
                formId={createTemplateFormId}
                onClose={() => setShowCreateTemplate(false)}
                onLoadingChange={setCreateLoading}
                onSuccess={handleTemplateCreated}
            />

            <TemplateEditModal
                template={selectedTemplate}
                isOpen={showEditTemplate}
                loading={editLoading}
                formId={editTemplateFormId}
                onClose={handleCloseEditTemplate}
                onLoadingChange={setEditLoading}
                onSuccess={handleTemplateUpdated}
            />

            {showViewTemplate && selectedTemplate && (
                <ViewTemplate
                    template={selectedTemplate}
                    onClose={handleCloseViewTemplate}
                />
            )}

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
