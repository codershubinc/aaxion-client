import { Code2 } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { CodeBlock } from '../ui/CodeBlock';

export const ApiReference = () => {
    return (
        <section id="api-reference">
            <SectionHeading id="api-reference" icon={Code2} title="API Reference" />
            <div className="prose prose-invert max-w-none text-gray-400 mb-10">
                <p>A concise, developer-friendly reference for the aaxion file-service API. Use the examples below to interact with a local server.</p>
                <p className="mt-4">
                    Base URL (local): <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-400">http://localhost:8080/</code>
                </p>
            </div>

            <div className="space-y-16">

                {/* Authentication */}
                <div id="api-auth" className="scroll-mt-24">
                    <h3 className="text-xl font-bold text-white mb-4">🔐 Authentication</h3>
                    <p className="text-gray-400 mb-6">
                        Most endpoints require authentication. You must obtain a token and include it in the `Authorization` header.
                        <br /><br />
                        Header format: <code className="text-blue-400">Authorization: Bearer {'<your_token>'}</code>
                    </p>

                    <h4 className="text-lg text-white font-semibold mt-6 mb-3">Quick examples</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Login:</p>
                            <CodeBlock language="bash" code={`curl -X POST -d '{"username":"your_user","password":"your_pass"}' "http://localhost:8080/auth/login"`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Logout:</p>
                            <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" -X POST "http://localhost:8080/auth/logout"`} />
                        </div>
                    </div>
                </div>

                {/* User Management */}
                <div id="api-user" className="scroll-mt-24 border-t border-gray-800 pt-12">
                    <h3 className="text-xl font-bold text-white mb-6">👤 User Management</h3>

                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">POST</span>
                                <code className="text-base text-gray-200">/auth/register</code>
                            </div>
                            <p className="text-gray-400">Register the first user. Fails if a user already exists.</p>
                            <p className="text-gray-500 text-sm mt-1">Body: <code className="text-gray-400">{`{"username": "...", "password": "..."}`}</code></p>
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Response</p>
                                <CodeBlock language="json" code={`{ "message": "User created successfully" }`} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">POST</span>
                                <code className="text-base text-gray-200">/auth/login</code>
                            </div>
                            <p className="text-gray-400">Authenticate and receive a session token.</p>
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Response</p>
                                <CodeBlock language="json" code={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Files */}
                <div id="api-view" className="scroll-mt-24 border-t border-gray-800 pt-12">
                    <h3 className="text-xl font-bold text-white mb-6">📁 View Files and Folders</h3>
                    <div className="bg-gray-900/40 rounded-xl p-6 border border-gray-800/60">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
                            <code className="text-lg text-gray-200">/files/view?dir={'{directory_path}'}</code>
                        </div>
                        <p className="text-gray-400 mb-4">Return the contents of a directory. <span className="text-yellow-500/80 text-sm ml-2">⚠️ dir must be within monitored root</span></p>

                        <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/files/view?dir=/home/swap/documents"`} />

                        <div className="mt-4">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Response</p>
                            <CodeBlock language="json" code={`[
  {
    "name": "Project-Alpha",
    "is_dir": true,
    "size": 4096,
    "path": "/home/user/docs",
    "raw_path": "/home/user/docs/Project-Alpha"
  },
  {
    "name": "report.pdf",
    "is_dir": false,
    "size": 1048576,
    "path": "/home/user/docs",
    "raw_path": "/home/user/docs/report.pdf"
  }
]`} />
                        </div>
                    </div>

                    <div className="mt-8" id="api-create-dir">
                        <h4 className="text-lg font-bold text-white mb-4">Create Directory</h4>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">POST</span>
                            <code className="text-gray-200">/files/create-directory?path={'{directory_path}'}</code>
                        </div>
                        <p className="text-gray-400 mb-2">Create a new directory at the specified path.</p>
                        <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" -X POST "http://localhost:8080/files/create-directory?path=/home/swap/new_folder"`} />
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Response</p>
                            <CodeBlock language="json" code={`{ "message": "Directory created successfully" }`} />
                        </div>
                    </div>
                </div>

                {/* Upload */}
                <div id="api-upload" className="scroll-mt-24 border-t border-gray-800 pt-12">
                    <h3 className="text-xl font-bold text-white mb-2">📤 Upload System</h3>
                    <p className="text-gray-400 mb-8">Support for both single requests and chunked uploads for large files.</p>

                    <div className="space-y-10">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-200 mb-4">Single File Upload</h4>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">POST</span>
                                <code className="text-gray-200">/files/upload?dir={'{directory_path}'}</code>
                            </div>
                            <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" -F "file=@/tmp/example.txt" "http://localhost:8080/files/upload?dir=/home/swap/documents"`} />
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Response</p>
                                <CodeBlock language="json" code={`{ "message": "File uploaded successfully" }`} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-gray-200 mb-4">Chunked Upload (Large Files)</h4>
                            <div className="space-y-6 pl-4 border-l-2 border-gray-800">
                                <div>
                                    <p className="text-sm font-bold text-blue-400 mb-1">1. Start Session</p>
                                    <code className="block bg-gray-900 px-2 py-1 rounded text-gray-300 text-sm mb-2">POST /files/upload/chunk/start?filename=...</code>
                                    <p className="text-xs text-gray-500 mb-2">Initialize a chunked upload session. Returns session info.</p>
                                    <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" -X POST "http://localhost:8080/files/upload/chunk/start?filename=large.zip"`} />
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Response</p>
                                        <CodeBlock language="json" code={`{ "upload_id": "uid_12345", "chunk_size": 1048576 }`} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-400 mb-1">2. Upload Chunk (Binary Body)</p>
                                    <code className="block bg-gray-900 px-2 py-1 rounded text-gray-300 text-sm mb-2">POST /files/upload/chunk?filename=...&chunk_index=0</code>
                                    <p className="text-xs text-gray-500 mb-2">Upload a single chunk via raw binary body. Increment index from 0.</p>
                                    <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" --data-binary @chunk0.bin "http://localhost:8080/files/upload/chunk?filename=large.zip&chunk_index=0"`} />
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Response</p>
                                        <CodeBlock language="json" code={`{ "status": "chunk_received", "index": 0 }`} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-400 mb-1">3. Complete & Merge</p>
                                    <code className="block bg-gray-900 px-2 py-1 rounded text-gray-300 text-sm mb-2">POST /files/upload/chunk/complete?filename=...&dir=...</code>
                                    <p className="text-xs text-gray-500 mb-2">Merge all uploaded chunks into final file.</p>
                                    <CodeBlock language="bash" code={`curl -H "Authorization: Bearer $TOKEN" -X POST "http://localhost:8080/files/upload/chunk/complete?filename=large.zip&dir=/home/swap/documents"`} />
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Response</p>
                                        <CodeBlock language="json" code={`{ "message": "Upload completed successfully", "path": "/home/swap/documents/large.zip" }`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sharing */}
                <div id="api-share" className="scroll-mt-24 border-t border-gray-800 pt-12">
                    <h3 className="text-xl font-bold text-white mb-6">🔗 Temporary File Sharing</h3>

                    <div className="space-y-8">
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-3">1. Generate Link</h4>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
                                <code className="text-sm text-gray-200">/files/d/r?file_path=...</code>
                            </div>
                            <CodeBlock language="bash" code={`curl "http://localhost:8080/files/d/r?file_path=/home/user/file.txt"`} />
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Response</p>
                                <CodeBlock language="json" code={`{
  "share_link": "/files/d/t/a1b2c3d4e5f6",
  "token": "a1b2c3d4e5f6"
}`} />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-300 mb-3">2. Download via Token</h4>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
                                <code className="text-sm text-gray-200">/files/d/t/{'{token}'}</code>
                            </div>
                            <p className="text-xs text-green-400 mb-2">No Auth Required (Public)</p>
                            <CodeBlock language="bash" code={`curl -O "http://localhost:8080/files/d/t/abcdef..."`} />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div id="api-images" className="scroll-mt-24 border-t border-gray-800 pt-12">
                    <h3 className="text-xl font-bold text-white mb-6">🖼️ Images & Thumbnails</h3>
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
                                <code className="text-gray-200">/files/view-image?path=...</code>
                            </div>
                            <p className="text-gray-400 mb-2">Serve raw image file (supports caching).</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
                                <code className="text-gray-200">/files/thumbnail?path=...</code>
                            </div>
                            <p className="text-gray-400 mb-3">Get resized JPEG thumbnail (max 200px).</p>
                            <p className="text-sm text-gray-500">Supports <code className="text-gray-400">?tkn=</code> param for &lt;img&gt; tags.</p>
                            <CodeBlock language="bash" code={`curl "http://localhost:8080/files/thumbnail?path=...&tkn=$TOKEN"`} />
                        </div>
                    </div>
                </div>

                {/* System */}
                <div id="api-system" className="scroll-mt-24 border-t border-gray-800 pt-12">
                    <h3 className="text-xl font-bold text-white mb-4">System Info</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">GET</span>
                        <code className="text-gray-200">/api/system/get-root-path</code>
                    </div>
                    <CodeBlock language="json" code={`{ "root_path": "/home/swap" }`} />
                </div>

            </div>
        </section>
    );
};
