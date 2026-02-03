import { Command } from '@tauri-apps/plugin-shell';
import { API_BASE, getToken } from './api';

const VLC_PWD = "aaxion_secret";
const VLC_PORT = "9090";

// 👇 Update interface to accept title
export async function launchVlc(movieId: number, movieTitle: string) {
    const token = getToken();
    const streamUrl = `${API_BASE}/api/stream/movie?id=${movieId}&tkn=${token}`;

    // Sanitize title to prevent command injection issues (remove quotes)
    const cleanTitle = movieTitle.replace(/["']/g, "");

    console.log(`[DEBUG] Launching VLC for: ${cleanTitle}`);

    const args = [
        streamUrl,
        "--extraintf", "http",
        "--http-host", "127.0.0.1",
        "--http-port", VLC_PORT,
        "--http-password", VLC_PWD,
        "--fullscreen",
        "--one-instance",
        // 👇 THIS FORCE-OVERRIDES THE METADATA
        "--meta-title", cleanTitle
    ];

    try {
        const command = Command.create('vlc', args);
        const child = await command.spawn();
        console.log('[DEBUG] VLC Started PID:', child.pid);
        return true;
    } catch (err) {
        console.error("Failed to launch VLC:", err);
        return false;
    }
}