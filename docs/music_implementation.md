# Music Implementation Guide

This document outlines the architecture, data structures, and API usage for the Music module in Aaxion Client.

## Overview

The application handles music playback globally using an invisible `<audio>` element managed by `GlobalMusicPlayer.tsx` and state handled by `MusicContext.tsx`. Everything communicates with our central Go server.

## 1. Core Data Models

The core music object used throughout the frontend is the `Track` interface:

```typescript
export interface Track {
  id?: string; // Unique identifier for the track
  title: string; // Track title
  artist: string; // Artist name
  album?: string; // Associated album name
  duration?: number; // Duration in seconds
  release_year?: number; // Year of release
  file_path: string; // Server-side path to the audio file
  imagePath?: string; // Server-side path to the embedded cover art
  size?: number; // File size in bytes
}
```

## 2. API Endpoints

All metadata API requests are routed through `apiClient` using standard JWT Bearer tokens, while streaming/media requests use query parameters (`tkn=...`) since they are loaded directly inside HTML native elements (`<img>`, `<audio>`).

### Fetching Metadata

**File**: `src/services/musicService.ts`

| Action                    | Endpoint        | Method | Params Required                               | Description                                                                                                             |
| :------------------------ | :-------------- | :----- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Get All Tracks**        | `/music/all`    | GET    | None                                          | Retrieves a complete Array of `Track` objects.                                                                          |
| **Search Tracks**         | `/music/search` | GET    | `q` (string)                                  | Query used to filter/search for specific tracks.                                                                        |
| **Add Track**             | `/music/add`    | POST   | `uri` (string, both query param and formdata) | Parses file at `uri`, extracts its ID3 tags, downloads/caches Cover Art (if missing), and registers it to the database. |
| **Get Connected Devices** | `/api/devices`  | GET    | None                                          | Retrieves a list of other active instances of Aaxion web/desktop for sending commands.                                  |

### Streaming & Media Endpoints

Because these are injected into HTML, the `Authorization` header cannot be sent directly. Instead, we append a token parameter (`&tkn={token}`).

#### 1. Audio Streaming (`streamUrl`)

**Endpoint**: `/music/stream`

- **Method**: `GET`
- **Query Params Required**:
  - `id` = The `Track.id` string.
  - `tkn` = The current user token (`getToken()`).
- **Usage**: Sourced into the `<audio src="...">` tag.

#### 2. Avatar / Cover Art Image (`imageUrl`)

**Endpoint**: `/files/view-image`

- **Method**: `GET`
- **Query Params Required**:
  - `path` = URL-encoded `Track.imagePath` (`encodeURIComponent(track.imagePath)`).
  - `tkn` = The current user token (`getToken()`).
- **Usage**: Sourced into `<img src="...">` and the MediaSession Metadata.

> **Note**: Tracks don't have dedicated avatar endpoints. The music scanner extracts the embedded album art during `/music/add`, saves it as a file on the server, and sets `Track.imagePath`. The client then streams this cover art directly using the standard file viewer endpoint.

## 3. Real-Time Sync (WebSocket)

The application attempts to connect to the backend WebSocket to listen for live updates (e.g., when a track is added elsewhere or device commands are sent).

- **URL**: `ws://{server_url}/ws`
- **Params**: `deviceId` (string), `deviceName` (string)

**Supported Incoming Events:**

- `TRACK_ADDED`: Returns `msg.state.track` containing the newly added music, automatically adding it to the client's internal queue.

## 4. Hardware Integrations

The global player (`GlobalMusicPlayer.tsx`) connects to system-level APIs:

- **`navigator.mediaSession`**: Interacts with the OS lock screen, media hubs, and Bluetooth controls by registering metadata (Title, Artist, Album, Cover Art URL) and setting action handlers for play, pause, next, and previous buttons.
