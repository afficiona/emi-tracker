module.exports = {
  reactStrictMode: true,
  output: 'export', // Enables static exports
  basePath: '/emi-tracker', // Set the base path for your application
  assetPrefix: '/emi-tracker/', // Set the asset prefix for static assets
  images: {
    unoptimized: true, // Disable image optimization as it requires a server
  }
};
