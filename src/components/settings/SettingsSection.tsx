import { colors } from "@/constants/colors";

interface SettingsSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export default function SettingsSection({ title, description, children }: SettingsSectionProps) {
    return (
        <section className="border-t py-6" style={{ borderColor: colors.border }}>
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div>
                    <h2 className="h4">{title}</h2>
                    <p className="body-sm mt-2" style={{ color: colors.textSecondary }}>
                        {description}
                    </p>
                </div>
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        </section>
    );
}
