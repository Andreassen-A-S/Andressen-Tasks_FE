import type { Metadata } from "next";
import TaskDetailsPage from "@/components/tasks/TaskDetailsPage";

export const metadata: Metadata = { title: "Opgave" };

export default function TaskDetailRoute({ params }: { params: Promise<{ taskId: string }> }) {
    return <TaskDetailsPage paramsPromise={params} />;
}
