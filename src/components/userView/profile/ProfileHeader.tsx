import SingleAvatar from "@/components/common/label/singleAvatar";
import { User } from "@/types/users";

interface ProfileHeaderProps {
    user: User;
    position?: string;
}

export default function ProfileHeader({ user, position }: ProfileHeaderProps) {
    return (
        <div className="bg-[#1B1D22] px-5 pt-12 pb-6">
            <div className="max-w-[430px] mx-auto">
                <div className="sidebar-brand-sub mb-3">
                    Andreassen A/S · Task Management
                </div>
                <div className="flex items-center gap-3">
                    <SingleAvatar name={user.name} size="lg" />
                    <div className="flex-1 min-w-0">
                        <h1 className="h3-white truncate">
                            {user.name || "Ukendt bruger"}
                        </h1>
                        <p className="body-sm-white opacity-80 truncate">
                            {position || "Ukendt position"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}