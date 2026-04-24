interface PageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="my-6 mx-8 px-4 sm:px-6 lg:px-8 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="h1 flex items-center gap-3">{title}</h1>
                    {subtitle && <p className="body-sm">{subtitle}</p>}
                </div>
                {action}
            </div>
        </div>
    );
}
