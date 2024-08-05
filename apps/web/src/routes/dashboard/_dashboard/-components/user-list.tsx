import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const { session } = useContext(AppContext);
  const { i18n } = useTranslation();

  const { data: users } = trpc.user.getUsersRoles.useQuery(
    {
      name: search,
      role: userRole as string,
    },
    { enabled: search.length > 2 },
  );

  const { data: professors } = trpc.content.getProfessors.useQuery({
    language: i18n.language,
  });

  const { mutate: mutateChangeRoleToAdmin, isPending } =
    trpc.user.changeRoleToAdmin.useMutation({
      onSuccess: () => {
        setSearch('');
      },
    });

  const { mutate: mutateChangeRoleToProfessor } =
    trpc.user.changeRoleToProfessor.useMutation({
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
                    {userRole === 'professor' && (
                      <th scope="col" className="desktop-h7 pb-5 w-60">
                        Professor name
                      </th>
                    )}
                    <th scope="col" className="desktop-h7 pb-5 w-60">
                      Actions
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
                        {userRole === 'professor' && (
                          <td className="">{user.professorName}</td>
                        )}
                        {session?.user.role === 'admin' &&
                          userRole === 'student' && (
                            <td className="">
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

                        {session?.user.role === 'admin' &&
                          userRole === 'student' && (
                            <td className="flex flex-col gap-2">
                              <Select
                                value={selectedProfessor}
                                onValueChange={(e) => {
                                  setSelectedProfessor(e);
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Select a professor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {professors?.map((p) => {
                                    return (
                                      <SelectItem
                                        value={p.id.toString()}
                                        key={p.id}
                                      >
                                        {p.name}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>

                              <AlertDialog>
                                <AlertDialogTrigger>
                                  <Button size="s" className="-z-10">
                                    Make professor
                                  </Button>
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
                                        alert(selectedProfessor);
                                        mutateChangeRoleToProfessor({
                                          uid: user.uid,
                                          professorId: selectedProfessor,
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
