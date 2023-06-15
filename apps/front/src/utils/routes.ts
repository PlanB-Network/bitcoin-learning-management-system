import { useParams } from 'react-router-dom';

export const useRequiredParams = <T extends Record<string, string>>() =>
  useParams() as T;
