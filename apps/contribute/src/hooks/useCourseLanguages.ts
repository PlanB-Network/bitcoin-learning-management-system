import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '#src/utils/trpc.ts';

/**
 * Fetches the set of language codes available for the given course.
 * It first tries the public endpoint so that non-admin users also work on old backends.
 * Falls back to the private endpoint if the public one is missing / guarded.
 */
export function useCourseLanguages(courseId: string) {
  const {
    data: codes = [],
    isLoading,
    error,
    refetch,
  } = useQuery<string[], Error>({
    queryKey: ['courseLanguages', courseId],
    // 5 minutes is enough for most proofreading sessions and prevents refetch on every slide change
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<string[]> => {
      let resp: any;
      try {
        resp = await (trpcClient as any).content.getCourseLanguagesPublic.query(
          {
            id: courseId,
          },
        );
      } catch (_err) {
        // Older backend or admin only – silently fallback
        resp = await (trpcClient as any).content.getCourseLanguages?.query?.({
          id: courseId,
        });
      }

      return Array.isArray(resp?.languages)
        ? resp.languages.map((l: any) => l.code)
        : [];
    },
  });

  return {
    codes,
    loading: isLoading,
    error,
    refetch,
  } as const;
}
