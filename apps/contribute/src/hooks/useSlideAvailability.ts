import { useQuery } from '@tanstack/react-query';

export type AvailabilityType = 'ppt' | 'transcript';

interface Params {
  courseId: string;
  partId: string;
  chapterId: string;
  slideId: string;
  type: AvailabilityType;
}

/**
 * Returns the list of language codes that **already exist** for a given slide.
 * Uses the public REST endpoints `/translation-downloads/{pptx|transcript}-availability/...`.
 */
export function useSlideAvailability(params: Params) {
  const { courseId, partId, chapterId, slideId, type } = params;

  const endpoint =
    type === 'ppt'
      ? `/api/translation-downloads/pptx-availability/${courseId}/${partId}/${chapterId}/${slideId}`
      : `/api/translation-downloads/transcript-availability/${courseId}/${partId}/${chapterId}/${slideId}`;

  const {
    data: availableCodes = [],
    isLoading,
    error,
    refetch,
  } = useQuery<string[], Error>({
    queryKey: ['slideAvailability', type, courseId, partId, chapterId, slideId],
    // Keep for 2 minutes – availability can change when user uploads / validates PPT or transcript
    staleTime: 2 * 60 * 1000,
    enabled: Boolean(courseId && partId && chapterId && slideId),
    queryFn: async (): Promise<string[]> => {
      const resp = await fetch(endpoint);
      if (!resp.ok) throw new Error('Failed to fetch slide availability');
      const data = (await resp.json()) as { languages: string[] };
      return data.languages ?? [];
    },
  });

  return {
    availableCodes,
    loading: isLoading,
    error,
    refetch,
  } as const;
}
