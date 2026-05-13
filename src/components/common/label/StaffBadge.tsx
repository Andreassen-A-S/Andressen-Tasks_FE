import { colors } from "@/constants/colors";

export default function StaffBadge() {
    return (
        <span className="mono-xs inline-flex items-center h-5 px-2 rounded-md border" style={{ color: colors.blue, backgroundColor: colors.blue + "1A", borderColor: colors.blue + "33" }}>
            STAFF
        </span>
    );
}
