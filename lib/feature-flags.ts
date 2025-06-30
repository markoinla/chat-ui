/**
 * Feature flags configuration and utilities
 */

export interface FeatureFlags {
  zengptEnabled: boolean;
}

/**
 * Get feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    zengptEnabled: process.env.ZENGPT_ENABLED === 'true',
  };
}

/**
 * Check if ZenGPT is enabled
 */
export function isZenGPTEnabled(): boolean {
  return getFeatureFlags().zengptEnabled;
}

/**
 * Client-side feature flag check for ZenGPT
 * Uses Next.js public environment variables
 */
export function isZenGPTEnabledClient(): boolean {
  if (typeof window === 'undefined') {
    // Server-side
    return isZenGPTEnabled();
  }

  // Client-side - check for public env var or fallback to server-side value
  return (
    process.env.NEXT_PUBLIC_ZENGPT_ENABLED === 'true' ||
    process.env.ZENGPT_ENABLED === 'true'
  );
}

/**
 * Get ZenGPT configuration
 */
export function getZenGPTConfig() {
  return {
    apiUrl:
      process.env.ZENGPT_API_URL || process.env.NEXT_PUBLIC_ZENGPT_API_URL,
    apiKey:
      process.env.ZENGPT_API_KEY || process.env.NEXT_PUBLIC_ZENGPT_API_KEY,
    enabled: isZenGPTEnabled(),
  };
}

/**
 * Client-side ZenGPT configuration
 */
export function getZenGPTConfigClient() {
  return {
    apiUrl:
      process.env.NEXT_PUBLIC_ZENGPT_API_URL || process.env.ZENGPT_API_URL,
    apiKey:
      process.env.NEXT_PUBLIC_ZENGPT_API_KEY || process.env.ZENGPT_API_KEY,
    enabled: isZenGPTEnabledClient(),
  };
}
