/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config, { dev, isServer }) => {
        // Enable source maps in development
        if (dev) {
            config.devtool = 'source-map';
        }
        return config;
    }
}

module.exports = nextConfig
