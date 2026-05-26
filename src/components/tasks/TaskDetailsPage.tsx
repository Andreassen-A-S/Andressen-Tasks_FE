"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import TaskDetails from "./taskDetailsView/TaskDetails";
import { adminQueryKeys } from "@/lib/queries/admin";

interface Props {
    paramsPromise: Promise<{ taskId: string }>;
}

export default function TaskDetailsPage({ paramsPromise }: Props) {
    const { taskId } = use(paramsPromise);
    const router = useRouter();
    const queryClient = useQueryClient();

    function handleClose() {
        router.push("/tasks");
    }

    function handleDelete(_deletedTaskId: string) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasksPage });
        router.push("/tasks");
    }

    return (
        <TaskDetails
            taskId={taskId}
            onClose={handleClose}
            onDelete={handleDelete}
            fullPage
        />
    );
}
