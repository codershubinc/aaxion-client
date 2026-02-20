import { LucideIcon } from 'lucide-react';

interface SectionHeadingProps {
    id: string;
    icon: LucideIcon;
    title: string;
}

export const SectionHeading = ({ id, icon: Icon, title }: SectionHeadingProps) => (
    <div className="flex items-center space-x-3 mb-6 mt-12 border-b border-gray-800 pb-4" id={id}>
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Icon size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
    </div>
);
