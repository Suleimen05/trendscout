/**
 * Centralized configuration for the application
 */

/**
 * Get API base URL from environment variables
 * Supports localhost and production deployment
 */
export const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Auto-detect based on current location
  const { protocol, hostname } = window.location;

  // Production (Render, Netlify, etc.)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}/api`;
  }

  // Development fallback
  return 'http://localhost:8000/api';
};

/**
 * Get WebSocket URL from environment variables
 * Properly handles ws:// and wss:// protocols
 */
export const getWsUrl = (): string => {
  const { protocol, hostname } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

  // Production
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${wsProtocol}//${hostname}/ws`;
  }

  // Development - use backend WebSocket port
  return `${wsProtocol}//localhost:8000/ws`;
};

/**
 * API configuration object
 */
export const apiConfig = {
  baseUrl: getApiBaseUrl(),
  wsUrl: getWsUrl(),
  timeout: 120000, // 2 minutes
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Storage keys
 */
export const AUTH_STORAGE_KEY = 'rizko_auth';
export const THEME_STORAGE_KEY = 'rizko_theme';

/**
 * App metadata
 */
export const appMeta = {
  name: 'Rizko.ai',
  version: '2.0.0',
  description: 'AI-powered TikTok trend analysis platform',
};

/**
 * Feature flags (can be controlled via environment variables)
 */
export const features = {
  pwa: true,
  hapticFeedback: true,
  swipeGestures: true,
  offlineMode: true,
  webSocket: true,
  notifications: true,
};
