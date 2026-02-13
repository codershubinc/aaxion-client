/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
    images: {
        remotePatterns: [

            { hostname: "m.media-amazon.com" }


        ]
    },
};

module.exports = nextConfig;
