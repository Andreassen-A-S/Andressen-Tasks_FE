import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Juridisk – MesterPlan",
};

const documents = [
    {
        href: "/legal/privacy",
        title: "Privacy Policy",
        description: "How we collect, use and protect your personal information.",
    },
];

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-[#F9F9F8] px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="mb-10">
                    <p className="text-sm text-[#6B7280] mb-2">MesterPlan</p>
                    <h1 className="text-3xl font-semibold text-[#111827]">Juridisk</h1>
                </div>
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <Link
                            key={doc.href}
                            href={doc.href}
                            className="block bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 hover:border-[#D1D5DB] transition-colors"
                        >
                            <p className="text-sm font-medium text-[#111827]">{doc.title}</p>
                            <p className="text-sm text-[#6B7280] mt-0.5">{doc.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
