interface PageContainerProps {
    children: React.ReactNode;
    size?: "default" | "narrow" | "task";
    className?: string;
    disabled?: boolean;
}

export default function PageContainer({ children, size = "default", className = "", disabled = false }: PageContainerProps) {
    if (disabled) {
        return <div className={className}>{children}</div>;
    }

    const maxWidth = {
        default: "max-w-[1600px]",
        narrow: "max-w-5xl",
        task: "max-w-6xl",
    }[size];

    return (
        <div className={`${maxWidth} mx-auto w-full ${className}`}>
            {children}
        </div>
    );
}
