#!/usr/bin/env node

/**
 * Sonar EDM Platform - Setup Script
 * 
 * This script guides users through the initial setup process for the Sonar EDM Platform.
 * It handles:
 * 1. Creating configuration files
 * 2. Setting up environment variables
 * 3. Validating credentials
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Print a styled header to the console
 * @param {string} text - Header text
 */
function printHeader(text) {
  console.log('\n' + colors.bright + colors.magenta + '='.repeat(text.length + 4) + colors.reset);
  console.log(colors.bright + colors.magenta + '| ' + text + ' |' + colors.reset);
  console.log(colors.bright + colors.magenta + '='.repeat(text.length + 4) + colors.reset + '\n');
}

/**
 * Print a success message to the console
 * @param {string} text - Success message
 */
function printSuccess(text) {
  console.log(colors.green + '✓ ' + text + colors.reset);
}

/**
 * Print an error message to the console
 * @param {string} text - Error message
 */
function printError(text) {
  console.log(colors.red + '✗ ' + text + colors.reset);
}

/**
 * Print an info message to the console
 * @param {string} text - Info message
 */
function printInfo(text) {
  console.log(colors.blue + 'ℹ ' + text + colors.reset);
}

/**
 * Ask a question and get user input
 * @param {string} question - Question to ask
 * @param {boolean} isRequired - Whether the input is required
 * @param {string} defaultValue - Default value if user input is empty
 * @returns {Promise<string>} User input
 */
function askQuestion(question, isRequired = true, defaultValue = '') {
  return new Promise((resolve) => {
    const defaultText = defaultValue ? ` (default: ${defaultValue})` : '';
    rl.question(colors.yellow + question + defaultText + ': ' + colors.reset, (answer) => {
      if (!answer && isRequired && !defaultValue) {
        printError('This field is required. Please try again.');
        resolve(askQuestion(question, isRequired, defaultValue));
      } else {
        resolve(answer || defaultValue);
      }
    });
  });
}

/**
 * Main function to run the setup script
 */
async function main() {
  try {
    printHeader('Sonar EDM Platform - Setup');
    
    printInfo('This script will guide you through the setup process for the Sonar EDM Platform.');
    printInfo('You will need to provide credentials for Spotify API, MongoDB, and other services.');
    
    // Spotify API credentials
    printHeader('Spotify API Credentials');
    printInfo('To obtain Spotify API credentials:');
    printInfo('1. Go to https://developer.spotify.com/dashboard/');
    printInfo('2. Log in with your Spotify account');
    printInfo('3. Create a new application');
    printInfo('4. Set the redirect URI to http://localhost:3000/api/auth/callback/spotify');
    printInfo('5. Copy the Client ID and Client Secret');
    
    const spotifyClientId = await askQuestion('Spotify Client ID');
    const spotifyClientSecret = await askQuestion('Spotify Client Secret');
    
    // MongoDB connection
    printHeader('MongoDB Connection');
    printInfo('To obtain a MongoDB connection string:');
    printInfo('1. Create an account at https://www.mongodb.com/cloud/atlas');
    printInfo('2. Create a new cluster (the free tier is sufficient)');
    printInfo('3. Create a database user with read/write permissions');
    printInfo('4. Add your IP address to the IP access list');
    printInfo('5. Click "Connect" and choose "Connect your application"');
    printInfo('6. Copy the connection string and replace <password> with your database user password');
    
    const mongodbUri = await askQuestion('MongoDB URI (e.g., mongodb+srv://...)');
    
    // NextAuth secret
    printHeader('Authentication');
    const generateSecret = await askQuestion('Generate a random NextAuth secret? (y/n)', true, 'y');
    
    let nextAuthSecret;
    if (generateSecret.toLowerCase() === 'y') {
      nextAuthSecret = crypto.randomBytes(32).toString('hex');
      printSuccess(`Generated NextAuth secret: ${nextAuthSecret.substring(0, 8)}...`);
    } else {
      nextAuthSecret = await askQuestion('NextAuth Secret');
    }
    
    // Create .env file
    printHeader('Creating Configuration Files');
    
    const envContent = `# Sonar EDM Platform - Environment Variables
# Generated by setup script

# Application settings
APP_NAME=Sonar EDM Platform
NODE_ENV=development
PORT=3000

# Spotify API credentials
SPOTIFY_CLIENT_ID=${spotifyClientId}
SPOTIFY_CLIENT_SECRET=${spotifyClientSecret}
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify

# MongoDB connection
MONGODB_URI=${mongodbUri}
MONGODB_DB_NAME=sonar-edm

# NextAuth configuration
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000

# Feature flags (set to 'false' to disable)
FEATURE_PROMOTER_ANALYTICS=true
FEATURE_USER_MUSIC_TASTE=true
FEATURE_ARTIST_PREDICTION=true
FEATURE_EVENT_FORECASTING=true
FEATURE_TICKET_PRICING=true
FEATURE_GENRE_TRENDS=true
FEATURE_CITY_AUDIENCE=true
FEATURE_SIMILAR_ARTISTS=true
FEATURE_EVENT_MATCHING=true
FEATURE_TRENDING_ARTISTS=true
FEATURE_LOCATION_RECOMMENDATIONS=true`;

    fs.writeFileSync('.env', envContent);
    printSuccess('Created .env file with your configuration');
    
    // Validate configuration
    printHeader('Validating Configuration');
    
    // Load config to validate
    try {
      const config = require('../config');
      const validation = config.validateConfig();
      
      if (validation.isValid) {
        printSuccess('Configuration is valid!');
      } else {
        printError('Configuration is invalid. Missing:');
        validation.missingConfigs.forEach(missing => {
          printError(`- ${missing}`);
        });
      }
    } catch (error) {
      printError(`Failed to validate configuration: ${error.message}`);
    }
    
    // Next steps
    printHeader('Setup Complete');
    printSuccess('Sonar EDM Platform has been successfully set up!');
    printInfo('Next steps:');
    printInfo('1. Install dependencies: npm install');
    printInfo('2. Start the development server: npm run dev');
    printInfo('3. For deployment, run: node scripts/deploy.js');
    
  } catch (error) {
    printError(`Setup failed: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the script
main();
