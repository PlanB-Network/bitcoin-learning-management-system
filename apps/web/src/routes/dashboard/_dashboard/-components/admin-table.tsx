import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineSearch } from 'react-icons/ai';
import { FiTrash2 } from 'react-icons/fi';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { TbArrowsSort } from 'react-icons/tb';

import type { UserRole } from '@blms/types';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from '@blms/ui';

import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { useDebounce } from '#src/utils/search.ts';
import { trpc } from '#src/utils/trpc.ts';

export const AdminTable = ({ userRole }: { userRole: UserRole }) => {
  const { i18n } = useTranslation();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [selectedProfessors, setSelectedProfessors] = useState<{
    [userId: string]: number | null;
  }>({});

  const [sortConfig, setSortConfig] = useState<{
    key: 'username' | 'displayName';
    direction: 'asc' | 'desc';
  }>({
    key: 'username',
    direction: 'asc',
  });

  const {
    data: usersPages,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = trpc.user.getUsersRoles.useInfiniteQuery(
    {
      name: debouncedSearch,
      role: userRole,
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
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectedProfessor = (userId: string, professorId: string) => {
    setSelectedProfessors((prev) => ({
      ...prev,
      [userId]: +professorId,
    }));
  };

  const isMobile = useSmaller('md');

  return (
    <>
      {isPending && <Loader size={'s'} />}
      {!isPending && (
        <>
          <div className="relative w-full max-w-[600px] mt-10 mb-5">
            <input
              type="text"
              placeholder={`${t('words.search')} ${t('words.' + userRole).toLowerCase()}`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-5 pr-12 py-3 rounded-[25px] bg-newGray-5 text-newBlack-1 placeholder:text-newGray-1 body-14px"
            />
            <AiOutlineSearch
              size={24}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-newBlack-1"
            />
          </div>

          <Table maxHeightClass="max-h-[720px]">
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
                    ['admin', 'superadmin'].includes(userRole)
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
                  <TableHead className="w-32 md:w-[180px] -xl:w-[246px]">
                    {t('dashboard.adminPanel.selectProfessor')}
                  </TableHead>
                )}
                {userRole === 'professor' && (
                  <>
                    <TableHead className="w-[150px]">
                      {t('dashboard.adminPanel.professorName')}
                    </TableHead>
                    <TableHead className="w-60">
                      {t('dashboard.adminPanel.coursesIds')}
                    </TableHead>
                  </>
                )}
                {userRole === 'admin' && (
                  <TableHead className="w-32">{t('words.role')}</TableHead>
                )}

                {['student', 'professor'].includes(userRole) && (
                  <TableHead
                    className={cn(
                      'text-center',
                      userRole === 'professor' ? 'w-20' : 'w-48',
                    )}
                  >
                    {t('words.action')}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell
                    className={cn(
                      ['admin', 'superadmin'].includes(userRole)
                        ? ''
                        : 'max-md:hidden',
                    )}
                  >
                    {user.displayName}
                  </TableCell>

                  {userRole === 'student' && (
                    <TableCell>
                      {/* TODO: fix perf of <Select> shadcn component on large data collection -> Tried for hours to make it better performance wise as it was tanking perf, even with react-window (improved perf but not enough), but couldn't get it to be nearly as fast as vanilla select */}
                      {/* <Select
                        value={String(selectedProfessors[user.uid] || '')}
                        onValueChange={(e) =>
                          handleSelectedProfessor(user.uid, e)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full md:min-w-[180px] -xl:min-w-[246px]',
                            selectedProfessors[user.uid]
                              ? 'text-newBlack-1'
                              : 'text-newGray-1',
                          )}
                        >
                          <SelectValue placeholder="Select a professor">
                            {professors?.find(
                              (p) => p.id === selectedProfessors[user.uid],
                            )?.name || 'Select a professor'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <FixedSizeList
                            width={'100%'}
                            height={350}
                            itemCount={professors.length}
                            itemData={professors}
                            itemSize={30}
                          >
                            {({ index, style, data }) => (
                              <SelectItem
                                value={data[index].id.toString()}
                                key={data[index].id}
                                style={style}
                              >
                                {data[index].name}
                              </SelectItem>
                            )}
                          </FixedSizeList>
                        </SelectContent>
                      </Select> */}
                      <select
                        value={selectedProfessors[user.uid] || ''}
                        onChange={(e) =>
                          handleSelectedProfessor(user.uid, e.target.value)
                        }
                        className={cn(
                          'w-full px-4 py-2 cursor-pointer no-scrollbar overflow-hidden text-ellipsis text-sm leading-[120px] rounded-md bg-commentTextBackground border border-gray-500/10',
                          selectedProfessors[user.uid]
                            ? 'text-newBlack-1'
                            : 'text-newGray-1',
                        )}
                      >
                        <option value="" className="text-newGray-1" disabled>
                          {t('dashboard.adminPanel.selectProfessor')}
                        </option>
                        {professors?.map(
                          (option: { id: number; name: string }) => (
                            <option
                              key={option.id}
                              value={option.id}
                              className="text-newBlack-1"
                            >
                              {option.name}
                            </option>
                          ),
                        )}
                      </select>
                    </TableCell>
                  )}

                  {userRole === 'professor' && (
                    <>
                      <TableCell>{user.professorName}</TableCell>
                      <TableCell>
                        {professors
                          ?.find((p) => p.id === user.professorId)
                          ?.coursesIds.map((courseId) => (
                            <span className="block uppercase" key={courseId}>
                              {courseId}
                            </span>
                          ))}
                      </TableCell>
                    </>
                  )}

                  {userRole === 'admin' && (
                    <TableCell
                      className={cn(
                        'capitalize',
                        user.role === 'superadmin' && 'font-medium',
                      )}
                    >
                      {user.role}
                    </TableCell>
                  )}

                  {userRole === 'student' && (
                    <TableCell>
                      <Button
                        size={isMobile ? 'xs' : 'm'}
                        onClick={() => {
                          const selectedProfessor =
                            selectedProfessors[user.uid];
                          if (selectedProfessor) {
                            mutateChangeRoleToProfessor({
                              uid: user.uid,
                              professorId: selectedProfessor,
                            });
                            refetch();
                          }
                        }}
                        className="mx-auto"
                      >
                        {t('dashboard.adminPanel.makeProfessor')}
                      </Button>
                    </TableCell>
                  )}

                  {userRole === 'professor' && (
                    <TableCell>
                      <RemoveTeacherDialog
                        onConfirm={() => {
                          mutateChangeRoleToProfessor({
                            uid: user.uid,
                            role: 'student',
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
        </>
      )}
    </>
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
          alt="Logo Plan B Network"
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
