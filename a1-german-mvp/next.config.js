const { i18n } = require('./next-i18next.config');

const nextConfig = {
  i18n,
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    return config;
  },
};

module.exports = nextConfig;

module.exports = {
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
};
