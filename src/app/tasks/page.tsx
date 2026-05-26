import type { Metadata } from "next";
import { Suspense } from "react";
import TaskPage from "@/components/tasks/TaskPage";
import TableSkeleton from "@/components/common/loading/TableSkeleton";
import PageContainer from "@/components/layout/PageContainer";

export const metadata: Metadata = { title: "Opgaver" };

export default function Tasks() {
    return (
        <Suspense fallback={<PageContainer className="px-8 pt-10"><TableSkeleton columns={7} rows={8} /></PageContainer>}>
            <TaskPage />
        </Suspense>
    );
}
