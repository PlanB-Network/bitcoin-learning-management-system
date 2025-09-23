// 🍐

export const env = import.meta.env;

console.log('Environment Variables:', { ...env });

export const build = env.VITE_GITHUB_SHA || '';

export const pearEnvironment = env.VITE_PEAR_ENVIRONMENT || undefined;

export const isPearApp = !!pearEnvironment;
