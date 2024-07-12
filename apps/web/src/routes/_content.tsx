/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_content')({
  component: AAAA,
});

function AAAA() {
  return (
    <div>
      <h1>HAAAAAAAAAA</h1>
      <Outlet></Outlet>
    </div>
  );
}
