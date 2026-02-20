import { Smartphone } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export const Usage = () => {
    return (
        <section id="usage">
            <SectionHeading id="usage" icon={Smartphone} title="Usage Guide" />
            <div className="bg-blue-500/5 rounded-2xl p-6 border border-blue-500/10">
                <h3 className="text-lg font-semibold text-white mb-4">Connect via Mobile App</h3>
                <ol className="space-y-4">
                    {[
                        "Download the Aaxion Mobile App from the release page.",
                        "Launch the app and go to Settings tab.",
                        "Enter your server IP (e.g., 192.168.1.x) and Port (8080).",
                        "Save configuration and start browsing your files."
                    ].map((step, i) => (
                        <li key={i} className="flex gap-4">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                            <span className="text-gray-300">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
};
