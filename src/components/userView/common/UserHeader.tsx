import SingleAvatar from "@/components/common/label/singleAvatar";

interface UserHeaderProps {
    user?: { name?: string; email?: string };
    header: string;
    sub?: string;
}

export default function UserHeader({ user, header, sub }: UserHeaderProps) {
    return (
        <header className="flex-1 bg-[#1B1D22] border-b border-[#E8E6E1] top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="h3-white truncate">{header}</h1>
                    {sub && <p className="caption mt-1 truncate">{sub}</p>}
                </div>
                <SingleAvatar
                    size="lg"
                    name={user?.name || "ukendt bruger"}
                />
            </div>
        </header>
    );
}