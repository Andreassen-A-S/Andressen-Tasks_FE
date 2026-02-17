import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import SingleAvatar from "@/components/common/label/singleAvatar";

interface UserTaskHeaderProps {
    user?: { name?: string; email?: string };
    onLogout: () => void;
}

export default function UserTaskHeader({ user, onLogout }: UserTaskHeaderProps) {
    return (
        <header className="flex-1 bg-[#1B1D22] border-b border-[#E8E6E1] top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                    <h1 className="h3-white truncate">Mine Opgaver</h1>
                    <p className="caption mt-1 truncate">
                        Velkommen, {user?.name || user?.email}
                    </p>
                </div>
                <SingleAvatar
                    size="lg"
                    name={user?.name || "ukendt bruger"}
                />
                {/* <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 btn-md text-[#1B1D22] hover:bg-[#FAFAF7] rounded-lg transition-colors flex-shrink-0 ml-4"
                    aria-label="Log ud"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span className="hidden sm:inline">Log ud</span>
                </button> */}
            </div>
        </header>
    );
}