import { User } from "@/types/users";
import SingleAvatar from "../common/label/singleAvatar";

interface EmployeeRowProps {
    employee: User;
    onEdit: (employee: User) => void;
    onDelete: (employeeId: string) => void;
}

export default function EmployeeRow({ employee, onEdit, onDelete }: EmployeeRowProps) {

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <SingleAvatar
                        name={employee.name}
                        size="sm"
                        className="mr-4"
                    />
                    <div>
                        <div className="label-lg text-gray-900">{employee.name}</div>
                        <div className="mono-xs text-gray-500">ID: {employee.user_id.slice(0, 8)}...</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="label-md text-gray-900">{employee.position}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="label-md text-gray-900">{employee.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="badge bg-green-100 text-green-800 rounded-full px-3 py-1">Aktiv</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap label-md font-medium">
                <div className="flex gap-2">
                    <button className="link" onClick={() => onEdit(employee)}>
                        Rediger
                    </button>
                    <button className="link-danger" onClick={() => onDelete(employee.user_id)}>
                        Slet
                    </button>
                </div>
            </td>
        </tr>
    );
}