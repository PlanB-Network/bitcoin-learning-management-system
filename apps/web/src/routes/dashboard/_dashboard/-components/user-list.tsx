import { useContext, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { AppContext } from '#src/providers/context.js';
import { trpc } from '#src/utils/trpc.js';

export const UserList = ({
  userRole,
}: {
  userRole: 'student' | 'professor' | 'community' | 'admin' | 'superadmin';
}) => {
  const [search, setSearch] = useState('');
  const { session } = useContext(AppContext);

  const { data: users } = trpc.user.getUsersRoles.useQuery(
    {
      name: search,
      role: userRole as string,
    },
    { enabled: search.length > 2 },
  );

  const { mutate: mutateChangeRoleToAdmin, isPending } =
    trpc.user.changeRoleToAdmin.useMutation({
      onSuccess: () => {
        setSearch('');
      },
    });

  return (
    <div className="pt-2 md:pt-8">
      {isPending && <Spinner className="size-24 md:size-32 mx-auto" />}
      {!isPending && (
        <>
          <div className="flex flex-col">
            <label htmlFor="searchUser">Search user</label>
            <input
              id="searchUser"
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              onBlur={() => {
                console.log(search);
              }}
              className="rounded-md bg-[#e9e9e9] px-4 py-1 text-gray-400 border border-gray-400/10"
            />
          </div>
          {users && users?.length > 0 && (
            <div className="my-6">
              <p className="font-semibold">Results :</p>
              <table className=" text-left table-fixed">
                <thead>
                  <tr>
                    <th scope="col" className="desktop-h7 pb-5 w-40">
                      Username
                    </th>
                    <th scope="col" className="desktop-h7 pb-5 w-40">
                      Display Name
                    </th>
                    <th scope="col" className="desktop-h7 pb-5">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    return (
                      <tr key={user.uid} className="">
                        <td className="">{user.username}</td>
                        <td className="">{user.displayName}</td>
                        {session?.user.role === 'superadmin' &&
                          userRole === 'student' && (
                            <td className="flex flex-row gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger>
                                  <Button size="s">Make admin</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        mutateChangeRoleToAdmin({
                                          uid: user.uid,
                                        });
                                      }}
                                    >
                                      Continue
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
