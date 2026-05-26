interface PageChromeProps {
    header?: React.ReactNode;
    children: React.ReactNode;
}

export default function PageChrome({ header, children }: PageChromeProps) {
    return (
        <div className="min-w-0">
            {header}
            {children}
        </div>
    );
}
