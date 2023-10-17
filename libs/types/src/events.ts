export interface ApiEvents {
  'lnurl-auth:logged': (options: { sessionId: string; uid: string }) => void;
}
