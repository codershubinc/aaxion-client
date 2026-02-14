import { Command } from '@tauri-apps/plugin-shell';
import { API_BASE, getToken } from './api';

const VLC_PWD = "aaxion_secret";
const VLC_PORT = "9090";

// 👇 Updated interface to accept posterPath
export async function launchVlc(
    id: number,
    title: string,
    type: 'movie' | 'episode' = 'movie',
    posterPath?: string
) {
    console.log("VLC launch info logs", "Title", title);

    const token = getToken();
    const endpoint = type === 'episode' ? '/api/stream/episode' : '/api/stream/movie';
    const streamUrl = `${API_BASE}${endpoint}?id=${id}&tkn=${token}`;

    // Sanitize title to prevent command injection issues
    const cleanTitle = title.replace(/["']/g, "");

    console.log(`[DEBUG] Launching VLC for ${type}: ${cleanTitle}`);

    const args = [
        streamUrl,
        "--extraintf", "http",
        "--http-host", "127.0.0.1",
        "--http-port", VLC_PORT,
        "--http-password", VLC_PWD,
        "--fullscreen",
        "--one-instance",
        "--meta-title", cleanTitle
    ];

    try {
        const command = Command.create('vlc', args);

        // This captures the actual text VLC prints when it crashes
        command.stderr.on('data', data => {
            console.error(`VLC Terminal Error: ${data}`);
        });

        command.stdout.on('data', data => {
            console.log(`VLC Terminal Log: ${data}`);
        });

        command.on('error', error => console.error(`Command failed: ${error}`));

        // 3. Listen for process termination
        command.on('close', data => {
            console.log(`VLC process exited with code ${data.code} and signal ${data.signal} ${JSON.stringify(data)}`);
        });

        // 4. Start listening for errors (Tauri v2 event names are 'close' or 'error')
        command.on('error', error => {
            console.error(`[VLC ERROR]: ${error}`);
        });

        const child = await command.spawn();
        console.log('[DEBUG] VLC Started PID:', child.pid);
        return true;
    } catch (err) {
        console.error("Failed to launch VLC:", err);
        return false;
    }
}