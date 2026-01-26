import { Terminal, ExternalLink } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { CodeBlock } from '../ui/CodeBlock';

export const Installation = () => {
    return (
        <section id="installation">
            <SectionHeading id="installation" icon={Terminal} title="Installation" />
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">1. Download Binary</h3>
                    <p className="text-gray-400 mb-2">Get the latest release for your operating system.</p>
                    <a href="https://github.com/codershubinc/aaxion/releases" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
                        Visit Releases Page <ExternalLink size={14} />
                    </a>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">2. Setup & Run</h3>
                    <div className="bg-gray-900/50 rounded-lg p-1 border border-gray-800">
                        <div className="flex gap-2 p-2 border-b border-gray-800 mb-2">
                            <span className="text-xs font-mono text-gray-500">TERMINAL</span>
                        </div>
                        <div className="px-2">
                            <p className="text-sm text-gray-400 mb-2">For Linux/macOS:</p>
                            <CodeBlock language="bash" code={`# Make executable
chmod +x aaxion-linux-amd64

# Run server
./aaxion-linux-amd64`} />

                            <p className="text-sm text-gray-400 mt-4 mb-2">For Windows:</p>
                            <CodeBlock language="powershell" code={`# Just run the executable
.\\aaxion-windows-amd64.exe`} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
