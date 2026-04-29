import { Suspense } from "react";
import TaskPage from "@/components/tasks/TaskPage";
import TableSkeleton from "@/components/common/loading/TableSkeleton";

export default function Tasks() {
    return (
        <Suspense fallback={<TableSkeleton columns={7} rows={8} />}>
            <TaskPage />
        </Suspense>
    );
}