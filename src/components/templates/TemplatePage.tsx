"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { RecurringTemplate } from "@/types/recuringTemplate";
import { deleteRecurringTemplate, deactivateTemplate, reactivateTemplate } from "@/lib/api";
import ViewTemplate from "@/components/templates/ViewTemplate";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/common/buttons/Button";
import TemplateFilterTabs, { type TemplateFilter } from "./TemplateFilterTabs";
import TemplateGrid from "./TemplateGrid";
import TemplateCreateModal from "./TemplateCreateModal";
import TemplateEditModal from "./TemplateEditModal";
import PageHeader from "@/components/common/PageHeader";
import CardGridSkeleton from "@/components/common/loading/CardGridSkeleton";
import { adminQueryKeys, fetchTemplatesPageData, type TemplatesPageData } from "@/lib/queries/admin";
import PageContainer from "@/components/layout/PageContainer";


export default function RecurringTemplatesPage() {
    const createTemplateFormId = "create-template-form";
    const editTemplateFormId = "edit-template-form";
    const queryClient = useQueryClient();
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
    const { data, isPending } = useQuery({
        queryKey: adminQueryKeys.templatesPage,
        queryFn: fetchTemplatesPageData,
    });

    const templates = data?.templates ?? [];

    const filterOptions = [
        { key: "active" as const, label: "Aktive", count: templates.filter(t => t.is_active).length },
        { key: "inactive" as const, label: "Inaktive", count: templates.filter(t => !t.is_active).length },
        { key: "all" as const, label: "Alle", count: templates.length },
    ];

    function handleDelete(templateId: string) {
        setPendingDeleteId(templateId);
        setConfirmOpen(true);
    }

    async function handleConfirmDelete() {
        if (!pendingDeleteId) return;
        setDeleteLoading(true);
        try {
            await deleteRecurringTemplate(pendingDeleteId);
            queryClient.setQueryData<TemplatesPageData>(adminQueryKeys.templatesPage, (current) => {
                if (!current) return current;
                return {
                    ...current,
                    templates: current.templates.filter((template) => template.id !== pendingDeleteId),
                };
            });
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
                queryClient.setQueryData<TemplatesPageData>(adminQueryKeys.templatesPage, (current) => {
                    if (!current) return current;
                    return {
                        ...current,
                        templates: current.templates.map((item) =>
                            item.id === template.id ? { ...item, is_active: false } : item
                        ),
                    };
                });
                toast.success("Skabelon deaktiveret");
            } else {
                await reactivateTemplate(template.id);
                queryClient.setQueryData<TemplatesPageData>(adminQueryKeys.templatesPage, (current) => {
                    if (!current) return current;
                    return {
                        ...current,
                        templates: current.templates.map((item) =>
                            item.id === template.id ? { ...item, is_active: true } : item
                        ),
                    };
                });
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
        queryClient.setQueryData<TemplatesPageData>(adminQueryKeys.templatesPage, (current) => {
            if (!current) return current;
            return {
                ...current,
                templates: [...current.templates, template],
            };
        });
        setShowCreateTemplate(false);
    }

    function handleTemplateUpdated(updated: RecurringTemplate) {
        queryClient.setQueryData<TemplatesPageData>(adminQueryKeys.templatesPage, (current) => {
            if (!current) return current;
            return {
                ...current,
                templates: current.templates.map((template) =>
                    template.id === updated.id ? updated : template
                ),
            };
        });
        handleCloseEditTemplate();
    }

    const filteredTemplates = templates.filter(template => {
        if (filter === "all") return true;
        if (filter === "active") return template.is_active;
        return !template.is_active;
    });

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Gentagende opgaver"
                subtitle="Administrer dine gentagende opgaveskabeloner"
                action={
                    <Button
                        variant="primary"
                        size="lg"
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => setShowCreateTemplate(true)}
                    >
                        Opret skabelon
                    </Button>
                }
            />

            <PageContainer className="mt-3 px-8">
                <TemplateFilterTabs
                    activeFilter={filter}
                    options={filterOptions}
                    onFilterChange={setFilter}
                />
            </PageContainer>

            <PageContainer className="my-6 px-8 pb-12">
                {isPending ? (
                    <CardGridSkeleton />
                ) : (
                    <TemplateGrid
                        templates={filteredTemplates}
                        filter={filter}
                        onCreateClick={() => setShowCreateTemplate(true)}
                        onViewTemplate={handleViewTemplate}
                        onToggleActive={handleToggleActive}
                        onDeleteTemplate={handleDelete}
                        onEditTemplate={handleEditTemplate}
                    />
                )}
            </PageContainer>

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
