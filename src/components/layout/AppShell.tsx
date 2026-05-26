import Sidebar from "@/components/sidebar/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="min-h-screen min-w-0 ml-75">
                {children}
            </main>
        </div>
    );
}
