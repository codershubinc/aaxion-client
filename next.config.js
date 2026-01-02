/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*',
            },
            {
                source: '/files/:path*',
                destination: 'http://localhost:8080/files/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
