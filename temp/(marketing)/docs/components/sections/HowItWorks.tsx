import { Zap } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export const HowItWorks = () => {
    return (
        <section id="how-it-works">
            <SectionHeading id="how-it-works" icon={Zap} title="How It Works" />
            <div className="prose prose-invert max-w-none text-gray-400">
                <p>
                    Aaxion operates by serving a file system tree over a RESTful JSON API. Security is handled via path sanitization to prevent directory traversal. The server automatically filters out hidden files (dotfiles) to keep the view clean.
                </p>
                <ul className="mt-4 space-y-2">
                    <li className="flex items-start gap-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span><strong>Systemd Integration:</strong> Designed to run as a background service on Linux.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span><strong>Low Resource Mode:</strong> Idle memory usage is ~10MB.</span>
                    </li>
                </ul>
            </div>
        </section>
    );
};
