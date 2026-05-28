import { getUserRoleLabel, type User } from "@/types/users";
import SingleAvatar from "../common/label/SingleAvatar";
import { colors } from "@/constants/colors";
import Button from "../common/buttons/Button";
import DropdownMenu from "../common/DropdownMenu";
import { Ellipsis, SquarePen, Trash2 } from "lucide-react";

interface EmployeeRowProps {
    employee: User;
    onEdit: (employee: User) => void;
    onDelete: (employeeId: string) => void;
}

export default function EmployeeRow({ employee, onEdit, onDelete }: EmployeeRowProps) {
    return (
        <tr
            className="transition-colors"
            style={{ backgroundColor: colors.white }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.whiteHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.white)}
        >
            <td className="px-6 py-3">
                <div className="flex items-center gap-4">
                    <SingleAvatar name={employee.name} size="md" border imageUrl={employee.profile_picture_url} />
                    <div>
                        <div className="label-lg" style={{ color: colors.textPrimary }}>{employee.name}</div>
                        <div className="mono-xs" style={{ color: colors.textMuted }}>ID: {employee.user_id.slice(0, 8)}...</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <span className="label-md" style={{ color: colors.textPrimary }}>{employee.position?.name || "Ikke angivet"}</span>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <span className="label-md" style={{ color: colors.textPrimary }}>{employee.email}</span>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <span className="label-md" style={{ color: colors.textSecondary }}>{getUserRoleLabel(employee.role)}</span>
            </td>
            <td className="py-3 pr-4 w-px whitespace-nowrap text-right">
                <DropdownMenu
                    trigger={
                        <Button variant="ghost" size="sm" icon={<Ellipsis className="w-4 h-4" />} iconOnly />
                    }
                    items={[
                        { label: "Rediger", icon: <SquarePen className="w-4 h-4" />, onClick: () => onEdit(employee) },
                        { label: "Slet", icon: <Trash2 className="w-4 h-4" />, onClick: () => onDelete(employee.user_id), danger: true, dividerBefore: true },
                    ]}
                />
            </td>
        </tr>
    );
}
