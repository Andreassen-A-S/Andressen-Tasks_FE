import PageContainer from "@/components/layout/PageContainer";

interface PageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <PageContainer className="my-6 px-8 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="h1 flex items-center gap-3">{title}</h1>
                    {subtitle && <p className="body-sm">{subtitle}</p>}
                </div>
                {action}
            </div>
        </PageContainer>
    );
}
