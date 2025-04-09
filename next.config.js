// Create this file at the root level (next.config.js)
module.exports = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}
// Configure static generation
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // Remove pages that require authentication from static export
    delete defaultPathMap['/'];
    delete defaultPathMap['/promoters/dashboard'];
    delete defaultPathMap['/users/dashboard'];
    
    return defaultPathMap;
  }
};
