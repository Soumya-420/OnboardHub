const isGithubPages = process.env.DEPLOY_TARGET === 'gh-pages';
const repo = '/OnboardHub';

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: isGithubPages ? repo : '',
    assetPrefix: isGithubPages ? repo : '',
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
