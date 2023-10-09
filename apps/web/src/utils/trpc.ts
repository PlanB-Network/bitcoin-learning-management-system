import { createTRPCReact } from '@trpc/react-query';

/**
 * To get this type we need to add a ref in our app tsconfig
 * With ref we can import only the type
 */
import type { AppRouter } from '@sovereign-university/api/server';

export const trpc = createTRPCReact<AppRouter>();
