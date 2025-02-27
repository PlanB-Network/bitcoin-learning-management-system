import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineSearch } from 'react-icons/ai';
import { FiTrash2 } from 'react-icons/fi';
import { MdCheck, MdKeyboardArrowDown } from 'react-icons/md';
import { TbArrowsSort } from 'react-icons/tb';

import { SortDirection, UserRole } from '@blms/constants';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@blms/ui';

import type { FormattedProfessor, UserRoles } from '@blms/types';
import { BiPencil } from 'react-icons/bi';
import { FaRegTrashAlt } from 'react-icons/fa';
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { useDebounce } from '#src/utils/search.ts';
import { trpc } from '#src/utils/trpc.ts';

type Permission =
  | 'bookings'
  | 'careers'
  | 'courses'
  | 'quizzes'
  | 'reduction codes'
  | 'tutorials';

export const RoleAllocationTable = ({ userRole }: { userRole: UserRole }) => {
  const isMobile = useSmaller('md');
  const { i18n } = useTranslation();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [selectedRoles, setSelectedRoles] = useState<{
    [userId: string]: UserRole;
  }>({});

  const [selectedProfessors, setSelectedProfessors] = useState<{
    [userId: string]: string | null;
  }>({});

  const [selectedPermissions, setSelectedPermissions] = useState<{
    // TODO: replace with permissions enum when available
    [userId: string]: Permission[];
  }>({});

  const [editingUsers, setEditingUsers] = useState<{
    [userId: string]: boolean;
  }>({});

  const [sortConfig, setSortConfig] = useState<{
    key: 'username' | 'displayName' | 'role';
    direction: SortDirection;
  }>({
    key: 'username',
    direction: SortDirection.Asc,
  });

  const {
    data: usersPages,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = trpc.user.getUsersRoles.useInfiniteQuery(
    {
      name: debouncedSearch,
      role: userRole === UserRole.Student ? undefined : userRole,
      orderField: sortConfig.key,
      orderDirection: sortConfig.direction,
      limit: 50,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  const users = usersPages?.pages.flatMap((page) => page.users) || [];

  const { data: professors } = trpc.content.getProfessors.useQuery({
    language: i18n.language,
  });

  const { mutate: mutateChangeRoleToProfessor, isPending } =
    trpc.user.changeRoleToProfessor.useMutation({
      onSuccess: () => {
        refetch();
      },
      onError(error) {
        console.log(error.message);
      },
    });

  // Reset users and cursor when search or sortConfig changes
  useEffect(() => {
    refetch();
  }, [debouncedSearch, sortConfig, refetch]);

  // Load more users when the last user is reached
  const loaderRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 },
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) observer.observe(currentLoaderRef);

    return () => {
      if (currentLoaderRef) observer.unobserve(currentLoaderRef);
    };
  }, [fetchNextPage, hasNextPage]);

  // Handle sorting logic
  const handleSorting = (key: typeof sortConfig.key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === SortDirection.Asc
          ? SortDirection.Desc
          : SortDirection.Asc,
    }));
  };

  const handleSelectedRole = (userId: string, role: UserRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleSelectedProfessor = (userId: string, professorId: string) => {
    setSelectedProfessors((prev) => ({
      ...prev,
      [userId]: professorId,
    }));
  };

  const handleSelectedPermission = (userId: string, permission: Permission) => {
    setSelectedPermissions((prev) => {
      const userPermissions = prev[userId] || [];
      const newPermissions = userPermissions.includes(permission)
        ? userPermissions.filter((p) => p !== permission)
        : [...userPermissions, permission];

      return {
        ...prev,
        [userId]: newPermissions,
      };
    });
  };

  const handleUserRoleChange = (user: UserRoles) => {
    if (editingUsers[user.uid]) {
      const selectedRole = selectedRoles[user.uid];
      const newRole = (selectedRole?.toLowerCase() as UserRole) || user.role;
      const isProfessorRole = newRole === UserRole.Professor;
      const wasProfessorRole =
        !selectedRoles[user.uid] && user.role === 'professor';
      const shouldAssignProfessor = isProfessorRole || wasProfessorRole;

      if (
        selectedRole ||
        (user.role === UserRole.Professor && selectedProfessors[user.uid])
      ) {
        mutateChangeRoleToProfessor({
          uid: user.uid,
          role: newRole,
          professorId: shouldAssignProfessor
            ? selectedProfessors[user.uid]
            : null,
        });

        setSelectedRoles((prev) => {
          const { [user.uid]: _, ...rest } = prev;
          return rest;
        });

        refetch();
      }
    }

    toggleUserEditMode(user.uid);
  };

  const toggleUserEditMode = (userId: string) => {
    setEditingUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <>
      {isPending && <Loader size={'s'} />}
      {!isPending && (
        <>
          <div className="relative w-full max-w-[600px] mt-10 mb-5">
            <input
              type="text"
              placeholder={`${t('words.search')} ${t(`words.${userRole}`).toLowerCase()}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-5 pr-12 py-3 rounded-[25px] bg-newGray-5 text-newBlack-1 placeholder:text-newGray-1 body-14px"
            />
            <AiOutlineSearch
              size={24}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-newBlack-1"
            />
          </div>

          <Table
            className={cn(
              'pr-2 md:pr-4',
              userRole !== UserRole.Professor && 'max-md:hidden',
            )}
          >
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow>
                <TableHead
                  onClick={() => handleSorting('username')}
                  className="w-[151px]"
                >
                  <div className="flex justify-between items-center">
                    <span>{t('words.username')}</span>
                    {sortConfig.key === 'username' ? (
                      <MdKeyboardArrowDown
                        className={cn(
                          'shrink-0 transition-all',
                          sortConfig.direction === 'desc'
                            ? '-rotate-180'
                            : 'rotate-0',
                        )}
                        size={24}
                      />
                    ) : (
                      <TbArrowsSort className="shrink-0" size={24} />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className={cn(
                    'w-[163px]',
                    [UserRole.Admin, UserRole.Superadmin].includes(userRole)
                      ? ''
                      : 'max-md:hidden',
                  )}
                  onClick={() => handleSorting('displayName')}
                >
                  <div className="flex justify-between items-center">
                    <span>{t('words.displayName')}</span>
                    {sortConfig.key === 'displayName' ? (
                      <MdKeyboardArrowDown
                        className={cn(
                          'shrink-0 transition-all',
                          sortConfig.direction === 'desc'
                            ? '-rotate-180'
                            : 'rotate-0',
                        )}
                        size={24}
                      />
                    ) : (
                      <TbArrowsSort className="shrink-0" size={24} />
                    )}
                  </div>
                </TableHead>

                {userRole === 'student' && (
                  <>
                    <TableHead
                      className="w-32 md:w-[180px] xl:w-[240px]"
                      onClick={() => handleSorting('role')}
                    >
                      <div className="flex justify-between items-center">
                        <span>{t('words.role')}</span>
                        {sortConfig.key === 'role' ? (
                          <MdKeyboardArrowDown
                            className={cn(
                              'shrink-0 transition-all',
                              sortConfig.direction === 'desc'
                                ? '-rotate-180'
                                : 'rotate-0',
                            )}
                            size={24}
                          />
                        ) : (
                          <TbArrowsSort className="shrink-0" size={24} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center px-1">
                      {t('dashboard.adminPanel.editRole')}
                    </TableHead>
                    <TableHead className="w-32 text-center px-1">
                      {t('dashboard.adminPanel.deleteRole')}
                    </TableHead>
                  </>
                )}

                {userRole === 'professor' && (
                  <>
                    <TableHead className="w-[150px]">
                      {t('dashboard.adminPanel.professorName')}
                    </TableHead>
                    <TableHead className="w-60">
                      {t('dashboard.adminPanel.coursesIndexes')}
                    </TableHead>
                    <TableHead
                      className={cn(
                        'text-center',
                        userRole === 'professor' ? 'w-20' : 'w-48',
                      )}
                    >
                      {t('words.action')}
                    </TableHead>
                  </>
                )}

                {userRole === 'admin' && (
                  <>
                    <TableHead className="w-64">
                      {t('dashboard.adminPanel.accessGranted')}
                    </TableHead>
                    <TableHead className="w-32 text-center px-1">
                      {t('dashboard.adminPanel.editRole')}
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...users]
                .sort((a, b) => {
                  if (userRole === UserRole.Admin) {
                    if (a.role === UserRole.Superadmin) return 1;
                    if (b.role === UserRole.Superadmin) return -1;
                  }
                  return 0;
                })
                .map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell
                      className={cn(
                        userRole === UserRole.Admin && '!align-top',
                      )}
                    >
                      {user.username}
                    </TableCell>
                    <TableCell
                      className={cn(
                        userRole === UserRole.Admin && '!align-top',
                        [UserRole.Admin, UserRole.Superadmin].includes(userRole)
                          ? ''
                          : 'max-md:hidden',
                      )}
                    >
                      {user.displayName}
                    </TableCell>

                    {userRole === UserRole.Student && (
                      <>
                        <TableCell className="flex flex-col gap-2.5">
                          <Select
                            value={
                              selectedRoles[user.uid] ||
                              Object.keys(UserRole).find(
                                (role) => role.toLowerCase() === user.role,
                              ) ||
                              ''
                            }
                            onValueChange={(value) =>
                              handleSelectedRole(user.uid, value as UserRole)
                            }
                            disabled={!editingUsers[user.uid]}
                          >
                            <SelectTrigger
                              className={cn(
                                'w-full',
                                user.role === UserRole.Student &&
                                  !editingUsers[user.uid] &&
                                  'hidden',
                                !editingUsers[user.uid] && 'cursor-not-allowed',
                              )}
                              mode="light"
                            >
                              <SelectValue
                                placeholder={t(
                                  'dashboard.adminPanel.selectRole',
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent mode="light">
                              {Object.keys(UserRole).map((role) => (
                                <SelectItem
                                  key={role}
                                  value={role}
                                  className="text-sm capitalize leading-[120%]"
                                >
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {((selectedRoles[user.uid] &&
                            selectedRoles[user.uid].toLowerCase() ===
                              UserRole.Professor) ||
                            (!selectedRoles[user.uid] &&
                              user.role === 'professor')) && (
                            <Select
                              value={
                                selectedProfessors[user.uid] ||
                                user.professorId ||
                                ''
                              }
                              onValueChange={(value) =>
                                handleSelectedProfessor(user.uid, value)
                              }
                              disabled={!editingUsers[user.uid]}
                            >
                              <SelectTrigger
                                className={cn(
                                  'w-full',
                                  !editingUsers[user.uid] &&
                                    'cursor-not-allowed',
                                )}
                                mode="light"
                              >
                                <SelectValue
                                  placeholder={t(
                                    'dashboard.adminPanel.selectProfessor',
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent mode="light">
                                {professors?.map((professor) => (
                                  <SelectItem
                                    key={professor.id}
                                    value={professor.id}
                                    className="text-sm capitalize leading-[120%]"
                                  >
                                    {professor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="px-1">
                          <Button
                            size={isMobile ? 'xs' : 's'}
                            variant={
                              editingUsers[user.uid] ? 'primary' : 'outline'
                            }
                            onClick={() => {
                              handleUserRoleChange(user);
                            }}
                            className="mx-auto"
                          >
                            <span className="flex items-center gap-2.5">
                              {editingUsers[user.uid] ? (
                                <>
                                  {t('words.save')}
                                  <MdCheck size={16} />
                                </>
                              ) : (
                                <>
                                  {t('words.edit')}
                                  <BiPencil size={16} />
                                </>
                              )}
                            </span>
                          </Button>
                        </TableCell>
                        <TableCell className="px-1">
                          <Button
                            size={isMobile ? 'xs' : 's'}
                            variant={'outline'}
                            onClick={() => {
                              mutateChangeRoleToProfessor({
                                uid: user.uid,
                                role: UserRole.Student,
                                professorId: null,
                              });
                              refetch();
                            }}
                            className="mx-auto "
                          >
                            <span className="flex items-center gap-2.5">
                              {t('words.delete')}
                              <FaRegTrashAlt size={16} />
                            </span>
                          </Button>
                        </TableCell>
                      </>
                    )}

                    {userRole === UserRole.Professor && (
                      <>
                        <TableCell>{user.professorName}</TableCell>
                        <TableCell>
                          {professors
                            ?.find((p) => p.id === user.professorId)
                            ?.coursesIndexes.map((courseId) => (
                              <span className="block uppercase" key={courseId}>
                                {courseId}
                              </span>
                            ))}
                        </TableCell>
                      </>
                    )}

                    {userRole === UserRole.Admin && (
                      <>
                        <TableCell className={'!align-top'}>
                          {user.role === UserRole.Superadmin ? (
                            'Superadmin'
                          ) : (
                            <div className="flex flex-col gap-2">
                              <span className="subtitle-medium-med-16px lowercase">
                                {t('dashboard.adminPanel.hasAccessTo')}
                              </span>
                              <div className="flex flex-col">
                                {[
                                  'bookings',
                                  'careers',
                                  'courses',
                                  'quizzes',
                                  'reduction codes',
                                  'tutorials',
                                ].map((permission) => (
                                  <label
                                    key={permission}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="grid place-items-center">
                                      <input
                                        type="checkbox"
                                        checked={
                                          selectedPermissions[
                                            user.uid
                                          ]?.includes(
                                            permission as Permission,
                                          ) ?? false
                                        }
                                        onChange={() =>
                                          handleSelectedPermission(
                                            user.uid,
                                            permission as Permission,
                                          )
                                        }
                                        disabled={!editingUsers[user.uid]}
                                        className="peer col-start-1 row-start-1 size-3.5 appearance-none rounded-full border bg-transparent checked:bg-darkOrange-5 border-darkOrange-5 shrink-0"
                                      />
                                      <MdCheck
                                        size={12}
                                        className="col-start-1 row-start-1 text-transparent peer-checked:text-white shrink-0 pointer-events-none"
                                      />
                                    </div>
                                    <span className="text-black capitalize">
                                      {permission}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-1 !align-top">
                          <Button
                            size={isMobile ? 'xs' : 's'}
                            variant={
                              editingUsers[user.uid] ? 'primary' : 'outline'
                            }
                            onClick={() => {
                              // TODO: save permissions
                              // if (editingUsers[user.uid]) {
                              // }

                              toggleUserEditMode(user.uid);
                            }}
                            className={cn(
                              'mx-auto',
                              user.role === UserRole.Superadmin && '!hidden',
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              {editingUsers[user.uid] ? (
                                <>
                                  {t('words.save')}
                                  <MdCheck size={16} />
                                </>
                              ) : (
                                <>
                                  {t('words.edit')}
                                  <BiPencil size={16} />
                                </>
                              )}
                            </span>
                          </Button>
                        </TableCell>
                      </>
                    )}

                    {userRole === UserRole.Professor && (
                      <TableCell>
                        <RemoveTeacherDialog
                          onConfirm={() => {
                            mutateChangeRoleToProfessor({
                              uid: user.uid,
                              role: UserRole.Student,
                              professorId: null,
                            });
                          }}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              {hasNextPage && <TableRow ref={loaderRef} />}
            </TableBody>
          </Table>
          {userRole !== UserRole.Professor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-2.5">
              {[...users]
                .sort((a, b) => {
                  if (userRole === UserRole.Admin) {
                    if (a.role === UserRole.Superadmin) return 1;
                    if (b.role === UserRole.Superadmin) return -1;
                  }
                  return 0;
                })
                .map((user) =>
                  userRole === UserRole.Student ? (
                    <StudentMobileCard
                      key={user.uid}
                      user={user}
                      professors={professors}
                      editingUsers={editingUsers}
                      selectedRoles={selectedRoles}
                      selectedProfessors={selectedProfessors}
                      handleSelectedRole={handleSelectedRole}
                      handleSelectedProfessor={handleSelectedProfessor}
                      handleUserRoleChange={handleUserRoleChange}
                      mutateChangeRoleToProfessor={mutateChangeRoleToProfessor}
                      refetch={refetch}
                    />
                  ) : (
                    <AdminMobileCard
                      key={user.uid}
                      user={user}
                      editingUsers={editingUsers}
                      selectedPermissions={selectedPermissions}
                      handleSelectedPermission={handleSelectedPermission}
                      toggleUserEditMode={toggleUserEditMode}
                    />
                  ),
                )}
            </div>
          )}
        </>
      )}
    </>
  );
};

const StudentMobileCard = ({
  user,
  professors,
  editingUsers,
  selectedRoles,
  selectedProfessors,
  handleSelectedRole,
  handleSelectedProfessor,
  handleUserRoleChange,
  mutateChangeRoleToProfessor,
  refetch,
}: {
  user: UserRoles;
  professors: FormattedProfessor[] | undefined;
  editingUsers: { [userId: string]: boolean };
  selectedRoles: { [userId: string]: UserRole };
  selectedProfessors: { [userId: string]: string | null };
  handleSelectedRole: (userId: string, role: UserRole) => void;
  handleSelectedProfessor: (userId: string, professorId: string) => void;
  handleUserRoleChange: (user: UserRoles) => void;
  mutateChangeRoleToProfessor: (options: {
    uid: string;
    role: UserRole;
    professorId: string | null;
  }) => void;
  refetch: () => void;
}) => {
  return (
    <article className="flex flex-col gap-2.5 bg-newGray-6 rounded-xl p-2 body-14px-medium">
      <span>
        Username: <span className="body-14px">{user.username}</span>
      </span>
      <span>
        Display Name: <span className="body-14px">{user.displayName}</span>
      </span>

      <span>Role:</span>

      <Select
        value={
          selectedRoles[user.uid] ||
          Object.keys(UserRole).find(
            (role) => role.toLowerCase() === user.role,
          ) ||
          ''
        }
        onValueChange={(value) =>
          handleSelectedRole(user.uid, value as UserRole)
        }
        disabled={!editingUsers[user.uid]}
      >
        <SelectTrigger
          className={cn(
            'w-full',
            !editingUsers[user.uid] && 'cursor-not-allowed',
          )}
          mode="light"
        >
          <SelectValue placeholder={t('dashboard.adminPanel.selectRole')} />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(UserRole).map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {((selectedRoles[user.uid] &&
        selectedRoles[user.uid].toLowerCase() === UserRole.Professor) ||
        (!selectedRoles[user.uid] && user.role === 'professor')) && (
        <Select
          value={selectedProfessors[user.uid] || user.professorId || ''}
          onValueChange={(value) => handleSelectedProfessor(user.uid, value)}
          disabled={!editingUsers[user.uid]}
        >
          <SelectTrigger
            className={cn(
              'w-full',
              !editingUsers[user.uid] && 'cursor-not-allowed',
            )}
            mode="light"
          >
            <SelectValue
              placeholder={t('dashboard.adminPanel.selectProfessor')}
            />
          </SelectTrigger>
          <SelectContent mode="light">
            {professors?.map((professor) => (
              <SelectItem
                key={professor.id}
                value={professor.id}
                className="text-sm capitalize leading-[120%]"
              >
                {professor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center mt-2.5 gap-2.5">
        <Button
          variant={editingUsers[user.uid] ? 'primary' : 'outline'}
          onClick={() => {
            handleUserRoleChange(user);
          }}
          className="flex items-center gap-2.5"
        >
          {editingUsers[user.uid] ? (
            <>
              {t('words.save')}
              <MdCheck size={16} />
            </>
          ) : (
            <>
              {t('words.edit')}
              <BiPencil size={16} />
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            mutateChangeRoleToProfessor({
              uid: user.uid,
              role: UserRole.Student,
              professorId: null,
            });
            refetch();
          }}
          className="flex items-center gap-2.5"
        >
          {t('words.delete')}
          <FaRegTrashAlt size={16} />
        </Button>
      </div>
    </article>
  );
};

const AdminMobileCard = ({
  user,
  editingUsers,
  selectedPermissions,
  handleSelectedPermission,
  toggleUserEditMode,
}: {
  user: UserRoles;
  editingUsers: { [userId: string]: boolean };
  selectedPermissions: { [userId: string]: string[] };
  handleSelectedPermission: (userId: string, permission: Permission) => void;
  toggleUserEditMode: (userId: string) => void;
}) => {
  return (
    <article className="flex flex-col gap-2.5 bg-newGray-6 rounded-xl p-2 body-14px-medium">
      <span>
        Username: <span className="body-14px">{user.username}</span>
      </span>
      <span>
        Display Name: <span className="body-14px">{user.displayName}</span>
      </span>

      <span className="lowercase">{t('dashboard.adminPanel.hasAccessTo')}</span>

      {user.role === UserRole.Superadmin ? (
        <span>Superadmin</span>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col pl-2 gap-2">
            {[
              'bookings',
              'careers',
              'courses',
              'quizzes',
              'reduction codes',
              'tutorials',
            ].map((permission) => (
              <label key={permission} className="flex items-center gap-2">
                <div className="grid place-items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedPermissions[user.uid]?.includes(
                        permission as Permission,
                      ) ?? false
                    }
                    onChange={() =>
                      handleSelectedPermission(
                        user.uid,
                        permission as Permission,
                      )
                    }
                    disabled={!editingUsers[user.uid]}
                    className="peer col-start-1 row-start-1 size-3.5 appearance-none rounded-full border bg-transparent checked:bg-darkOrange-5 border-darkOrange-5 shrink-0"
                  />
                  <MdCheck
                    size={12}
                    className="col-start-1 row-start-1 text-transparent peer-checked:text-white shrink-0 pointer-events-none"
                  />
                </div>
                <span className="text-black capitalize font-normal">
                  {permission}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center mt-2.5 gap-2.5">
        {user.role !== UserRole.Superadmin && (
          <Button
            variant={editingUsers[user.uid] ? 'primary' : 'outline'}
            onClick={() => toggleUserEditMode(user.uid)}
            className="flex items-center gap-2.5"
          >
            {editingUsers[user.uid] ? (
              <>
                {t('words.save')}
                <MdCheck size={16} />
              </>
            ) : (
              <>
                {t('words.edit')}
                <BiPencil size={16} />
              </>
            )}
          </Button>
        )}
      </div>
    </article>
  );
};

const RemoveTeacherDialog = ({ onConfirm }: { onConfirm: () => void }) => {
  const isMobile = window.innerWidth < 768;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <FiTrash2
          size="24"
          className="cursor-pointer mx-auto text-darkOrange-5"
        />
      </DialogTrigger>
      <DialogContent
        className="!bg-white !shadow-course-navigation !border-[#D1D5DB] !rounded-[20px] !flex !flex-col !w-full max-w-[87.5%] md:!max-w-[530px] !p-4 md:!px-6 md:!py-11 gap-6 md:!gap-12 !items-center"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="hidden">
            {t('dashboard.adminPanel.removeTeacherDescription')}
          </DialogTitle>
          <DialogDescription className="hidden">
            {t('dashboard.adminPanel.removeTeacherDescription')}
          </DialogDescription>
        </DialogHeader>

        <img
          src={PlanBLogoBlack}
          alt="Logo Plan ₿ Network"
          className="w-36 md:w-60 mx-auto"
        />

        <p className="text-darkOrange-5 label-large-20px desktop-h4 text-center px-7">
          {t('dashboard.adminPanel.removeTeacherDescription')}
        </p>

        <div className="!flex gap-4 md:!gap-5 pb-5">
          <DialogClose asChild>
            <Button
              variant="primary"
              size={isMobile ? 's' : 'l'}
              className="!w-fit"
              onClick={onConfirm}
            >
              {t('dashboard.adminPanel.confirmRemoval')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="outline"
              size={isMobile ? 's' : 'l'}
              className="w-fit"
            >
              {t('words.cancel')}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
