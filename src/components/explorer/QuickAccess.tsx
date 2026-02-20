import { motion } from 'framer-motion';

interface QuickAccessFolder {
    icon: any;
    label: string;
    path: string;
    color: string;
    hoverColor: string;
    bgColor?: string;
}

interface QuickAccessProps {
    folders: QuickAccessFolder[];
    onPathChange: (path: string) => void;
}

export default function QuickAccess({ folders, onPathChange }: QuickAccessProps) {
    return (
        <div className="mb-6 sm:mb-8">
            <h2 className="text-sm sm:text-base font-semibold text-dark-text mb-3 sm:mb-4 px-1">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {folders.map((folder, index) => (
                    <motion.div
                        key={folder.path}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onPathChange(folder.path)}
                        className={`relative bg-dark-surface border-2 border-dark-border rounded-lg sm:rounded-xl p-3 sm:p-4 ${folder.hoverColor} transition-all cursor-pointer hover-lift group`}
                    >
                        <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                            <div className={`p-2 sm:p-3 rounded-lg ${folder.bgColor || ''} ${folder.color}`}>
                                <folder.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                            </div>
                            <p className="text-xs sm:text-sm text-dark-text font-medium text-center">
                                {folder.label}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
