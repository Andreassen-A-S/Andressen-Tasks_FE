import type { Metadata } from "next";
import EmployeePage from "@/components/employees/EmployeePage";

export const metadata: Metadata = { title: "Medarbejdere" };

export default function Employees() {
    return <EmployeePage />;
}