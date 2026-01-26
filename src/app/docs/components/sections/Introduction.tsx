import { Book, Zap, Server, Shield, Cpu } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export const Introduction = () => {
    return (
        <section id="introduction">
            <SectionHeading id="introduction" icon={Book} title="Introduction" />
            <div className="prose prose-invert max-w-none text-gray-400">
                <p className="mb-6">
                    Aaxion is engineered to breathe new life into old hardware. By running a highly optimized Go server, you can transform an old laptop or desktop with spare storage into a dedicated cloud node for your main devices.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 my-8">
                    {[
                        { title: 'Zero-Buffer Streaming', icon: Zap, desc: 'Streams data directly to disk. 10GB transfers use only ~32KB RAM.' },
                        { title: 'Chunked Uploads', icon: Server, desc: 'Split-file upload support handles heavy files on unstable networks.' },
                        { title: 'Secure Sharing', icon: Shield, desc: 'Generate one-time, time-limited secure links for external sharing.' },
                        { title: 'Efficient', icon: Cpu, desc: 'Minimal footprint. Runs on Linux (systemd) and Windows.' },
                    ].map((feat, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all">
                            <feat.icon className="w-6 h-6 text-blue-500 mb-3" />
                            <h3 className="text-white font-semibold mb-1">{feat.title}</h3>
                            <p className="text-sm text-gray-400">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
