const { i18n } = require('./next-i18next.config');

const nextConfig = {
  i18n,
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
};

module.exports = nextConfig;
