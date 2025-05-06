import { useContext } from 'react';
import { AppContext } from '#src/providers/context.tsx';

export function UserInfo() {
  const { session, user } = useContext(AppContext);

  return (
    <div className="font-mono text-xs text-left *:my-4">
      <span>Session</span>
      <pre className="bg-gray-50 text-slate-900 p-4">
        <code>{JSON.stringify(session, null, 2)}</code>
      </pre>
      <span>User</span>
      <pre className="bg-gray-50 text-slate-900 p-4">
        <code>{JSON.stringify(user, null, 2)}</code>
      </pre>
    </div>
  );
}
