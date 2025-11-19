export const env = import.meta.env;

export const build = env.VITE_GITHUB_SHA || '';

export const pearEnvironment = env.VITE_PEAR_ENVIRONMENT || undefined;

// Hyperdrive source key for videos
export const pearSourceKey = env.VITE_PEAR_SOURCE_KEY || undefined;

export const isPearApp = !!pearEnvironment;
