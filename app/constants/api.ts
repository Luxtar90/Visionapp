/**
 * API Configuration
 * This file contains environment-specific API configurations
 */

import Constants from 'expo-constants';

// Environment detection
const ENV = {
  dev: 'development',
  prod: 'production',
  staging: 'staging',
};

// Get the current environment
const getEnvVars = () => {
  // For standalone apps, the releaseChannel is set in app.json
  // @ts-ignore - releaseChannel might not be in the type definition but it exists at runtime
  const releaseChannel = Constants.expoConfig?.releaseChannel;
  
  if (releaseChannel === undefined || releaseChannel === 'default') {
    return {
      envName: ENV.dev,
      // Development API URL - replace with your development API
      apiUrl: 'http://192.168.100.129:3000/api',
    };
  } else if (releaseChannel.indexOf('prod') !== -1) {
    return {
      envName: ENV.prod,
      // Production API URL - replace with your production API
      apiUrl: 'https://api.yourproductionserver.com/api',
    };
  } else if (releaseChannel.indexOf('staging') !== -1) {
    return {
      envName: ENV.staging,
      // Staging API URL - replace with your staging API
      apiUrl: 'https://api-staging.yourserver.com/api',
    };
  } else {
    return {
      envName: ENV.dev,
      // Fallback to development
      apiUrl: 'http://192.168.100.129:3000/api',
    };
  }
};

// Export environment variables
const ENV_VARS = getEnvVars();

export const API_URL = ENV_VARS.apiUrl;
export const ENV_NAME = ENV_VARS.envName;

// Default export
export default {
  API_URL,
  ENV_NAME,
};
