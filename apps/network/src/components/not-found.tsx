import { Navigate } from '@tanstack/react-router';

export function NotFound() {
  return <Navigate to="/" replace={true} />;
}
