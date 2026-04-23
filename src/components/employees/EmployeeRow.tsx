import { getUserRoleLabel, type User } from "@/types/users";
import SingleAvatar from "../common/label/SingleAvatar";
import { colors } from "@/constants/colors";
import Button from "../common/buttons/Button";
import DropdownMenu from "../common/DropdownMenu";
import { faEllipsis, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

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
                    <SingleAvatar name={employee.name} size="sm" />
                    <div>
                        <div className="label-lg" style={{ color: colors.textPrimary }}>{employee.name}</div>
                        <div className="mono-xs" style={{ color: colors.textMuted }}>ID: {employee.user_id.slice(0, 8)}...</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-3 whitespace-nowrap">
                <span className="label-md" style={{ color: colors.textPrimary }}>{employee.position || "Ikke angivet"}</span>
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
                        <Button variant="ghost" size="sm" icon={faEllipsis} iconOnly />
                    }
                    items={[
                        { label: "Rediger", icon: faPenToSquare, onClick: () => onEdit(employee) },
                        { label: "Slet", icon: faTrash, onClick: () => onDelete(employee.user_id), danger: true, dividerBefore: true },
                    ]}
                />
            </td>
        </tr>
    );
}
