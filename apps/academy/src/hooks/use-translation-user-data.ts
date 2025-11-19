import type { UserTranslationDetailsServiceResponse } from '@blms/types';
import { useEffect, useState } from 'react';
import { trpcClient } from '#src/utils/trpc.js';

interface UseTranslationUserDataResult {
  userDetails: UserTranslationDetailsServiceResponse | null;
  languages: Array<{ code: string; name: string }>;
  loading: boolean;
  error: string | null;
  getLanguageName: (code: string) => string;
}

export function useTranslationUserData(
  userId: string,
): UseTranslationUserDataResult {
  const [userDetails, setUserDetails] =
    useState<UserTranslationDetailsServiceResponse | null>(null);
  const [languages, setLanguages] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trpcClient.user.translation.getUserDetails.query({
        userId,
      });
      setUserDetails(data);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const data =
        await trpcClient.user.translation.getAvailableLanguages.query();
      setLanguages(data || []);
    } catch (err) {
      console.error('Error fetching languages:', err);
      setLanguages([]);
    }
  };

  const getLanguageName = (code: string) => {
    return languages.find((lang) => lang.code === code)?.name || code;
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchLanguages();
    }
  }, [userId]);

  return {
    userDetails,
    languages,
    loading,
    error,
    getLanguageName,
  };
}
