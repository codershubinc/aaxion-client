# Aaxion Web Client

A modern, responsive web client for the Aaxion file storage system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Beautiful Dark Theme** - Modern, eye-friendly dark interface with smooth animations
- 📁 **File Management** - Browse, upload, download, and organize files
- 🔄 **Drag & Drop Upload** - Easy file uploads with progress tracking
- 📤 **Large File Support** - Automatic chunked uploads for files over 100MB
- 🔗 **Share Links** - Generate temporary sharing links for files
- 📊 **Grid & List Views** - Switch between different viewing modes
- ⚡ **Real-time Updates** - Instant refresh and feedback
- 🎭 **Smooth Animations** - Framer Motion powered transitions

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **File Upload:** React Dropzone
- **Notifications:** React Hot Toast

## Getting Started

### Prerequisites

- Bun 1.0+ (Install: `curl -fsSL https://bun.sh/install | bash`)
- Aaxion backend server running on `http://localhost:8080`

### Installation

1. Navigate to the web directory:

```bash
cd web
```

2. Run the setup script:

```bash
./setup.sh
```

Or manually install:

```bash
bun install
```

3. Start the development server:

```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
web/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── layout.tsx    # Root layout with theme
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── FileExplorer.tsx  # Main file browsing interface
│   │   ├── UploadModal.tsx   # File upload modal
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   └── TopBar.tsx        # Top navigation bar
│   ├── services/         # API services
│   │   └── api.ts        # Backend API calls
│   ├── types/            # TypeScript types
│   │   └── index.ts      # Type definitions
│   └── utils/            # Utility functions
│       └── fileUtils.ts  # File formatting utilities
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## API Integration

The web client connects to the Aaxion backend API through proxy configuration in `next.config.js`. All API calls are proxied to `http://localhost:8080`.

### Available Endpoints

- `GET /api/files/view` - List files in directory
- `POST /files/create-directory` - Create new folder
- `POST /files/upload` - Upload single file
- `POST /files/upload/chunk/*` - Chunked upload for large files
- `GET /files/download` - Download file
- `GET /files/d/r` - Request temporary share link
- `GET /api/system/get-root-path` - Get system root path

## Building for Production

```bash
bun run build
bun start
```

## Docker Deployment

The project includes a multi-stage Dockerfile for containerized deployment.

### Building the Docker Image

```bash
docker build -t aaxion-web .
```

### Running the Container

```bash
docker run -p 3000:3000 aaxion-web
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Docker Build Process

1. **Stage 1 (Builder):** Uses `oven/bun:1-alpine` to install dependencies and build the Next.js application. The build outputs static files to the `/out` directory.

2. **Stage 2 (Runner):** Uses `node:18-alpine` with the `serve` library to serve the static files from the `/out` directory on port 3000.

### Custom Port

To run on a different port:

```bash
docker run -p 8080:3000 aaxion-web
```

This maps port 8080 on your host to port 3000 in the container.

## Configuration

### Backend URL

To change the backend URL, update the proxy configuration in `next.config.js`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'YOUR_BACKEND_URL/api/:path*',
    },
    // ...
  ];
}
```

### Theme Customization

Modify colors and styles in `tailwind.config.ts`:

```typescript
colors: {
  dark: {
    bg: '#0a0a0a',        // Background
    surface: '#141414',   // Surface elements
    hover: '#1f1f1f',     // Hover states
    border: '#2a2a2a',    // Borders
    text: '#e5e5e5',      // Primary text
    muted: '#a3a3a3',     // Secondary text
  },
  accent: {
    blue: '#3b82f6',      // Primary accent
    purple: '#8b5cf6',    // Secondary accent
    green: '#10b981',     // Success states
  },
}
```

## Features in Detail

### File Upload

- Drag and drop files onto the upload area
- Support for multiple files simultaneously
- Progress tracking for each file
- Automatic chunking for files > 100MB
- Real-time upload status updates

### File Management

- Browse directories with breadcrumb navigation
- Create new folders inline
- Download files with one click
- Generate temporary share links
- Switch between grid and list views

### User Experience

- Smooth page transitions
- Loading states and animations
- Toast notifications for actions
- Responsive design for all devices
- Keyboard navigation support

## Troubleshooting

### Backend Connection Issues

- Ensure the backend server is running on port 8080
- Check the proxy configuration in `next.config.js`
- Verify CORS settings in the backend

### Upload Failures

- Check file size limits
- Ensure proper directory permissions
- Verify the destination path is within the allowed root

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
