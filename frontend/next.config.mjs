const isProd = process.env.NODE_ENV === 'production';
const repo = '/OnboardHub';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: isProd ? repo : '',
    assetPrefix: isProd ? repo : '',
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
