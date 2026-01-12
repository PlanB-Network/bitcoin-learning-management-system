import { UserPermission, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import type { CouponCode, CouponCodeWithOwner } from '@blms/types';
import { BasicModal, Button, cn, DividerSimple, TextTag } from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { t } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FaSliders } from 'react-icons/fa6';
import { LuChevronDown, LuPlus } from 'react-icons/lu';
import { TbChevronsDown, TbCopy, TbCopyCheck } from 'react-icons/tb';
import Warning from '#src/assets/icons/warning_orange.svg';
import { PageLayout } from '#src/components/page-layout.tsx';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { AppContext } from '#src/providers/context.tsx';
import { trpc } from '#src/utils/trpc.ts';
import SortableTableHeader from '../-components/sortable-table-header.tsx';

export const Route = createFileRoute('/$lang/dashboard/administration/coupons')(
  {
    component: AdminCoupons,
  },
);

function AdminCoupons() {
  const isMobile = useSmaller('md');
  const navigate = useNavigate();

  const { session } = useContext(AppContext);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      console.log('session', session);
      navigate({ to: '/' });
    } else if (
      !canAccess(UserRole.Admin, UserPermission.Coupons)(session?.user)
    ) {
      navigate({ to: '/my-courses' });
    }
  }, [session, navigate]);

  const availableFilters = ['singleUse', 'multiUse'];

  const [page] = useState(1);
  const [filters, setFilters] = useState<Set<string>>(new Set(['all']));
  const toggle = (item: string) => {
    if (item === 'all') {
      setFilters(new Set(['all']));
    } else {
      setFilters(new Set([item]));
    }
  };

  const items = useQuery(trpc.content.listEventsAndCourses.queryOptions());

  const itemsMap = new Map(items.data?.map((item) => [item.id, item]));

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortKey, setSortKey] = useState<string | null>(null);

  const [maxShown, setMaxShown] = useState(100);

  useEffect(() => {
    setMaxShown(100);
  }, [filters, sortKey, sortDirection]);

  const coupons = useQuery(
    trpc.content.listCouponCodes.queryOptions({
      limit: 10_000,
      page,
      singleUse:
        filters.has('singleUse') && filters.has('multiUse')
          ? null
          : filters.has('singleUse')
            ? true
            : filters.has('multiUse')
              ? false
              : null,
      sortBy: sortKey ?? 'createdAt',
      sortDirection,
    }),
  );

  // Delete modal state
  const [couponToDelete, setCouponToDelete] = useState<CouponCode | null>(null);
  const deleteModal = useDisclosure();

  // Create modal state
  const modal = useDisclosure();
  const resetForm = () => {
    // Reset form
    setFormIsEvent(false);
    setFormItemId('');
    setFormSingleUse(true);
    setFormPercentage(5);
    setFormCode('');
    setFormNumberOfCodes(1);
    setFormMaxUses(1);
    setGeneratedCodes([]);
  };

  const onCreateModalClose = () => {
    modal.close();
    coupons.refetch();
    resetForm();
  };

  const [formIsEvent, setFormIsEvent] = useState<boolean>(false);
  const [formItemId, setFormItemId] = useState<string>('');
  const [formSingleUse, setFormSingleUse] = useState<boolean>(true);
  const [formPercentage, setFormPercentage] = useState<number>(5);
  const [formCode, setFormCode] = useState<string>('');
  const [formNumberOfCodes, setFormNumberOfCodes] = useState<number>(1);
  const [formMaxUses, setFormMaxUses] = useState<number>(1);

  const [codeCopied, setCodeCopied] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<CouponCode[] | null>(
    null,
  );

  const [preventDoubleClick, setPreventDoubleClick] = useState(false);

  // Mutation - create coupon code
  const createCouponCode = useMutation(
    trpc.content.createCouponCode.mutationOptions({
      onSuccess: (response) => {
        console.log('Coupon code created', response);
        setGeneratedCodes(response);
      },
    }),
  );

  // Mutation - delete coupon code
  const deleteCouponCode = useMutation(
    trpc.content.deleteCouponCode.mutationOptions({
      onSuccess: () => {
        console.log('Coupon code deleted');
        coupons.refetch();
      },
    }),
  );

  // On form submit
  const handleSubmit = () => {
    const options = {
      itemId: formItemId,
      reductionPercentage: formPercentage,
      singleUse: formSingleUse,
      ...(formSingleUse
        ? {
            code: null,
            numberOfCodes: formNumberOfCodes,
          }
        : {
            code: formCode,
            maxUses: formMaxUses,
          }),
    };

    createCouponCode.mutate(options);

    setPreventDoubleClick(true);
    setTimeout(() => setPreventDoubleClick(false), 1000);
  };

  const mobileSortDefinitions = [
    {
      baseKey: 'code',
      labelBase: t('dashboard.adminPanel.coupons.tableHead.code'),
      sortType: 'alpha' as const,
    },
    {
      baseKey: 'name',
      labelBase: t('dashboard.adminPanel.coupons.tableHead.name'),
      sortType: 'alpha' as const,
    },
    {
      baseKey: 'reductionPercentage',
      labelBase: t('dashboard.adminPanel.coupons.tableHead.discount'),
      sortType: 'numeric' as const,
    },
    {
      baseKey: 'uses',
      labelBase: t('dashboard.adminPanel.coupons.tableHead.uses'),
      sortType: 'numeric' as const,
    },
    {
      baseKey: 'maxUses',
      labelBase: t('dashboard.adminPanel.coupons.tableHead.maxUses'),
      sortType: 'numeric' as const,
    },
    {
      baseKey: 'username',
      labelBase: t('dashboard.adminPanel.coupons.tableHead.owner'),
      sortType: 'alpha' as const,
    },
  ];

  const mobileDropdownOptions: MobileSortFieldOption[] =
    mobileSortDefinitions.map((def) => ({
      key: def.baseKey,
      label: def.labelBase,
      sortType: def.sortType,
    }));

  const handleMobileSortFieldSelect = (fieldKey: string) => {
    if (sortKey === fieldKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(fieldKey);
      const definition = mobileSortDefinitions.find(
        (d) => d.baseKey === fieldKey,
      );
      if (definition?.sortType === 'numeric') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  return (
    <PageLayout
      layoutSize="wide"
      title={t('dashboard.adminPanel.discountCodes')}
      hideTitle
    >
      <section className="flex flex-col gap-4 lg:gap-8">
        <div className="flex flex-col">
          <div className="flex gap-2.5 md:gap-5 mb-5">
            <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText">
              {t('dashboard.adminPanel.discountCodes')}
            </h1>
            <TextTag
              size={isMobile ? 'small' : 'base'}
              mode="light"
              variant="grey"
              className="uppercase"
            >
              {t('words.admin')}
            </TextTag>
          </div>
          <span>{t('dashboard.adminPanel.coupons.explanation')}</span>
        </div>

        <Button
          className="w-fit gap-1"
          variant="primary"
          onClick={() => modal.open()}
        >
          {t('dashboard.adminPanel.coupons.generateNew')} <LuPlus />
        </Button>

        <DividerSimple className="lg:hidden" />

        <div className="flex flex-wrap gap-2 items-center text-black">
          <FaSliders className="size-6" />

          <Button
            variant={filters.has('all') ? 'primary' : 'outline'}
            size="s"
            onClick={() => toggle('all')}
            className="focus-visible:border-orange-500"
          >
            {`${t('dashboard.adminPanel.coupons.filters.all')}`}
          </Button>

          {availableFilters.map((filter) => {
            return (
              <Button
                key={filter}
                variant={filters.has(filter) ? 'primary' : 'outline'}
                size="s"
                onClick={() => toggle(filter)}
                className="focus-visible:border-orange-500"
              >
                {`${t(`dashboard.adminPanel.coupons.filters.${filter}`)}`}
              </Button>
            );
          })}
        </div>

        <table className="max-lg:hidden">
          <thead className="text-left">
            <SortableTableHeader
              onSort={({ key, direction }) => {
                setSortKey(key);
                setSortDirection(direction);
              }}
              items={[
                {
                  key: 'code',
                  label: t('dashboard.adminPanel.coupons.tableHead.code'),
                  sortable: true,
                },
                {
                  key: 'type',
                  label: t('dashboard.adminPanel.coupons.tableHead.type'),
                  sortable: false,
                },
                {
                  key: 'name',
                  label: t('dashboard.adminPanel.coupons.tableHead.name'),
                  sortable: true,
                },
                {
                  key: 'reductionPercentage',
                  label: t('dashboard.adminPanel.coupons.tableHead.discount'),
                  sortable: true,
                },
                {
                  key: 'uses',
                  label: t('dashboard.adminPanel.coupons.tableHead.uses'),
                  sortable: true,
                },
                {
                  key: 'maxUses',
                  label: t('dashboard.adminPanel.coupons.tableHead.maxUses'),
                  sortable: true,
                },
                {
                  key: 'username',
                  label: t('dashboard.adminPanel.coupons.tableHead.owner'),
                  sortable: true,
                },
                {
                  key: 'actions',
                  label: t('dashboard.adminPanel.coupons.tableHead.actions'),
                  sortable: false,
                },
              ]}
            />
          </thead>

          <tbody>
            {coupons.data?.slice(0, maxShown).map((coupon) => {
              return (
                <tr key={coupon.code + coupon.itemId} className="*:pt-2">
                  <td>{coupon.code}</td>
                  <td>
                    {itemsMap.get(coupon.itemId)?.type === 'event'
                      ? t('dashboard.adminPanel.coupons.productEvent')
                      : t('dashboard.adminPanel.coupons.productCourse')}
                  </td>
                  <td> {itemsMap.get(coupon.itemId)?.name ?? 'unknown'} </td>
                  <td> {coupon.reductionPercentage}% </td>
                  <td> {coupon.uses} </td>
                  <td> {coupon.maxUses} </td>
                  <td> {coupon.owner ?? 'unknown'} </td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="s"
                        onClick={() => {
                          console.log('View coupon code', coupon);
                          setGeneratedCodes([coupon]);
                          modal.open();
                        }}
                      >
                        {t('words.view')}
                      </Button>

                      <Button
                        variant="outline"
                        size="s"
                        onClick={() => {
                          setCouponToDelete(coupon);
                          deleteModal.open();
                        }}
                      >
                        <FaRegTrashAlt />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="lg:hidden flex flex-col gap-4">
          <MobileSortDropdown
            options={mobileDropdownOptions}
            selectedKey={sortKey}
            currentSortDirection={sortDirection}
            onSortFieldSelect={handleMobileSortFieldSelect}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.data?.slice(0, maxShown).map((coupon) => {
              return (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  itemName={itemsMap.get(coupon.itemId)?.name ?? null}
                  onViewClick={() => {
                    console.log('View coupon code', coupon);
                    setGeneratedCodes([coupon]);
                    modal.open();
                  }}
                  onDeleteClick={() => {
                    setCouponToDelete(coupon);
                    deleteModal.open();
                  }}
                />
              );
            })}
            {coupons.data?.length === 0 && !coupons.isLoading && (
              <p className="md:col-span-2 text-center text-neutral-400 py-4">
                {t('dashboard.adminPanel.coupons.noCouponsFound')}
              </p>
            )}
          </div>
        </div>

        {coupons.data && coupons.data.length > maxShown && (
          <Button
            variant="newTertiary"
            size="xl"
            className="mx-auto mt-5 sm:mt-10 flex items-center gap-4"
            onClick={() => setMaxShown((v) => v + 100)}
          >
            {t('dashboard.adminPanel.coupons.showMore')}
            <TbChevronsDown size={24} />
          </Button>
        )}

        <BasicModal
          title={t('dashboard.adminPanel.coupons.deleteDiscountCodeConfirm')}
          content={
            <p>{t('dashboard.adminPanel.coupons.deleteDiscountCodeWarning')}</p>
          }
          iconSrc={Warning}
          open={deleteModal.isOpen}
          onOpenChange={deleteModal.close}
        >
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={() => {
                if (couponToDelete) {
                  deleteCouponCode.mutate({
                    code: couponToDelete.code,
                    itemId: couponToDelete.itemId,
                  });
                }

                deleteModal.close();
              }}
              className="w-1/2"
            >
              {t('dashboard.adminPanel.coupons.delete')}
            </Button>

            <Button
              variant="outline"
              onClick={deleteModal.close}
              className="w-1/2"
            >
              {t('dashboard.adminPanel.coupons.cancel')}
            </Button>
          </div>
        </BasicModal>

        <BasicModal
          title={
            generatedCodes?.length
              ? t('dashboard.adminPanel.coupons.generatedCodes')
              : t('dashboard.adminPanel.coupons.generateDiscountCode')
          }
          open={modal.isOpen}
          onOpenChange={onCreateModalClose}
        >
          {!generatedCodes?.length && (
            <>
              <fieldset className="w-full">
                <h3 className="subtitle-medium-med-16px">
                  {t('dashboard.adminPanel.coupons.forWhat')}
                </h3>

                <div className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name="product"
                    value="event"
                    id="is_event"
                    checked={formIsEvent}
                    onChange={() => setFormIsEvent(true)}
                  />
                  <label htmlFor="is_event">
                    {t('dashboard.adminPanel.coupons.productEvent')}
                  </label>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name="product"
                    value="course"
                    id="is_course"
                    checked={!formIsEvent}
                    onChange={() => setFormIsEvent(false)}
                  />
                  <label htmlFor="is_course">
                    {t('dashboard.adminPanel.coupons.productCourse')}
                  </label>
                </div>
              </fieldset>
              <fieldset className="w-full">
                {formIsEvent ? (
                  <h3 className="subtitle-medium-med-16px">
                    {t('dashboard.adminPanel.coupons.forWhichEvent')}
                  </h3>
                ) : (
                  <h3 className="subtitle-medium-med-16px">
                    {t('dashboard.adminPanel.coupons.forWhichCourse')}
                  </h3>
                )}
                <select
                  className="border p-2 rounded-lg w-full"
                  onChange={(e) => setFormItemId(e.target.value)}
                >
                  <option value="" selected={formItemId === ''}>
                    {t(
                      `dashboard.adminPanel.coupons.${formIsEvent ? 'selectEvent' : 'selectCourse'}`,
                    )}
                  </option>
                  {(items.data ?? [])
                    .filter(
                      (target) =>
                        target.type === (formIsEvent ? 'event' : 'course'),
                    )
                    .map((target) => {
                      return (
                        <option
                          key={target.id}
                          value={target.id}
                          selected={formItemId === target.id}
                        >
                          {target.name}
                        </option>
                      );
                    })}
                </select>
              </fieldset>
              {/*  */}
              <fieldset className="w-full">
                <h3 className="subtitle-medium-med-16px">
                  {t('dashboard.adminPanel.coupons.discountType')}
                </h3>

                <div className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name="discount"
                    value="unique"
                    id="is_unique"
                    checked={formSingleUse}
                    onChange={() => setFormSingleUse(true)}
                  />
                  <label htmlFor="is_unique">
                    {t('dashboard.adminPanel.coupons.discountSingleUse')}
                  </label>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name="discount"
                    value="multi"
                    id="is_multi"
                    checked={!formSingleUse}
                    onChange={() => setFormSingleUse(false)}
                  />
                  <label htmlFor="is_multi">
                    {t('dashboard.adminPanel.coupons.discountMultiUse')}
                  </label>
                </div>
              </fieldset>
              {/*  */}
              <fieldset className="w-full">
                <h3 className="subtitle-medium-med-16px">
                  {t('dashboard.adminPanel.coupons.discountValue')}
                </h3>
                <small className="text-neutral-500">
                  {t('dashboard.adminPanel.coupons.discountValueExplanation')}
                </small>
                <input
                  className="w-full border border-neutral-500 rounded-lg p-2"
                  type="number"
                  step="5"
                  min="5"
                  max="100"
                  value={formPercentage}
                  onChange={(e) => setFormPercentage(Number(e.target.value))}
                />
              </fieldset>
              {formSingleUse ? (
                <fieldset className="w-full">
                  <h3>{t('dashboard.adminPanel.coupons.numberOfCodes')}</h3>
                  <input
                    className="w-full border border-neutral-500 rounded-lg p-2"
                    type="number"
                    min="1"
                    value={formNumberOfCodes}
                    onChange={(e) =>
                      setFormNumberOfCodes(Number(e.target.value))
                    }
                  />
                </fieldset>
              ) : (
                <>
                  <fieldset className="w-full">
                    <h3 className="subtitle-medium-med-16px">
                      {t('dashboard.adminPanel.coupons.discountCode')}
                    </h3>
                    <small className="text-neutral-500">
                      {t(
                        'dashboard.adminPanel.coupons.discountCodeExplanation',
                      )}
                    </small>
                    <input
                      className="w-full border border-neutral-500 rounded-lg p-2"
                      type="text"
                      value={formCode}
                      placeholder={t(
                        'dashboard.adminPanel.coupons.discountCodePlaceholder',
                      )}
                      onChange={(e) => setFormCode(e.target.value)}
                    />
                  </fieldset>

                  <fieldset className="w-full">
                    <h3 className="subtitle-medium-med-16px">
                      {t('dashboard.adminPanel.coupons.maximumNumberOfUse')}
                    </h3>
                    <input
                      className="w-full border border-neutral-500 rounded-lg p-2"
                      type="number"
                      step="1"
                      min="1"
                      max="1000"
                      value={formMaxUses}
                      onChange={(e) => setFormMaxUses(Number(e.target.value))}
                    />
                  </fieldset>
                </>
              )}
            </>
          )}

          {generatedCodes && generatedCodes.length > 0 && (
            <div className="w-full">
              <img
                className="my-4 w-full"
                alt="Coupon code"
                src={`/api/coupon-image.png?id=${generatedCodes[0].id}`}
              />

              <div className="my-4">
                <form
                  action={
                    generatedCodes.length > 1
                      ? `/api/coupons.zip?ids=${generatedCodes.map((c) => c.id).join(',')}`
                      : `/api/coupon-image.png?id=${generatedCodes[0].id}`
                  }
                  method="POST"
                  target="_blank"
                >
                  <Button className="w-full" variant="primary" type="submit">
                    {generatedCodes.length > 1
                      ? t('dashboard.adminPanel.coupons.downloadImages')
                      : t('dashboard.adminPanel.coupons.downloadImage')}
                  </Button>
                </form>
              </div>

              <ul className="relative border rounded-lg p-2">
                <li className="absolute top-0 right-0 text-neutral-300 p-1 rounded-md cursor-pointer">
                  <button
                    type="button"
                    className="group text-black hover:text-orange-500"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        generatedCodes.map((c) => c.code).join('\n'),
                      );
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                  >
                    {codeCopied ? (
                      <TbCopyCheck className="size-8" />
                    ) : (
                      <TbCopy className="size-8" />
                    )}
                  </button>
                </li>
                {generatedCodes.map((coupon) => (
                  <li key={coupon.id}>{coupon.code}</li>
                ))}
              </ul>
            </div>
          )}

          {!generatedCodes?.length ? (
            <Button
              className="w-full"
              variant="primary"
              onClick={handleSubmit}
              disabled={!formItemId || preventDoubleClick}
            >
              {t(
                `dashboard.adminPanel.coupons.${
                  formNumberOfCodes > 1 ? 'generateCodes' : 'generateCode'
                }`,
              )}
            </Button>
          ) : (
            <div className="flex gap-4 w-full">
              <Button
                className="w-full"
                variant="outline"
                size={'s'}
                onClick={onCreateModalClose}
              >
                {t('dashboard.adminPanel.coupons.close')}
              </Button>

              <Button
                className="w-full"
                variant="primary"
                size={'s'}
                onClick={resetForm}
              >
                {t('dashboard.adminPanel.coupons.generateNewCodes')}
              </Button>
            </div>
          )}
        </BasicModal>
      </section>
    </PageLayout>
  );
}

interface CouponCardProps {
  coupon: CouponCodeWithOwner;
  itemName: string | null;
  onViewClick: () => void;
  onDeleteClick: () => void;
}

function CouponCard({
  coupon,
  itemName,
  onViewClick,
  onDeleteClick,
}: CouponCardProps) {
  return (
    <article className="p-2 rounded-[10px] flex flex-col gap-1.5 bg-neutral-50 border border-neutral-100 shadow-course-navigation-sm text-neutral-1000">
      <div className="flex justify-between items-center">
        <h3 className="subtitle-medium-med-16px break-all pr-2 max-w-[calc(100%-60px)]">
          {coupon.code}
        </h3>
        <TextTag size="base" variant="grey" mode="light" className="shrink-0">
          {coupon.reductionPercentage}%
        </TextTag>
      </div>

      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1 flex-grow">
          <p className="body-14px break-words overflow-hidden max-w-full">
            {itemName}
          </p>
          <p className="body-14px-medium truncate">{coupon.owner}</p>
          <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
            <span className="body-14px text-neutral-600">
              {t('dashboard.adminPanel.coupons.tableHead.uses')}:
            </span>
            <span className="body-14px-medium">{coupon.uses}</span>
            <span className="body-14px text-neutral-600">
              {t('words.total')}:
            </span>
            <span className="body-14px-medium">{coupon.maxUses}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 items-end shrink-0">
          <Button
            variant="outline"
            size="s"
            onClick={onDeleteClick}
            aria-label={t('dashboard.adminPanel.coupons.delete')}
          >
            <FaRegTrashAlt />
          </Button>
          <Button variant="primary" size="s" onClick={onViewClick}>
            {t('words.view')}
          </Button>
        </div>
      </div>
    </article>
  );
}
export interface MobileSortFieldOption {
  key: string;
  label: string;
  sortType: 'alpha' | 'numeric';
}

interface MobileSortDropdownProps {
  options: MobileSortFieldOption[];
  selectedKey: string | null;
  currentSortDirection: 'asc' | 'desc';
  onSortFieldSelect: (fieldKey: string) => void;
}

function MobileSortDropdown({
  options,
  selectedKey,
  currentSortDirection,
  onSortFieldSelect,
}: MobileSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayLabel = () => {
    if (!selectedKey) {
      return t('dashboard.adminPanel.coupons.mobileSort.sortBy');
    }
    const selectedOptionMeta = options.find((opt) => opt.key === selectedKey);
    if (!selectedOptionMeta) {
      return t('dashboard.adminPanel.coupons.mobileSort.sortBy');
    }

    let directionSuffix = '';
    if (currentSortDirection === 'asc') {
      directionSuffix =
        selectedOptionMeta.sortType === 'alpha'
          ? t('dashboard.adminPanel.coupons.mobileSort.az')
          : t('dashboard.adminPanel.coupons.mobileSort.lowHigh');
    } else {
      directionSuffix =
        selectedOptionMeta.sortType === 'alpha'
          ? t('dashboard.adminPanel.coupons.mobileSort.za')
          : t('dashboard.adminPanel.coupons.mobileSort.highLow');
    }
    return `${selectedOptionMeta.label} (${directionSuffix})`;
  };

  return (
    <div className="lg:hidden w-full bg-white rounded-lg border border-neutral-200 flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex justify-between items-center text-left"
      >
        <span
          className={cn(
            'text-sm ',
            !selectedKey ? 'text-neutral-400' : 'text-neutral-1000',
          )}
        >
          {selectedKey && (
            <span className="text-neutral-400">
              {t('dashboard.adminPanel.coupons.mobileSort.sortBy')}:{' '}
            </span>
          )}
          {getDisplayLabel()}
        </span>
        <div
          className={`text-black transition-transform duration-200 ${
            isOpen ? '-rotate-180' : ''
          }`}
        >
          <LuChevronDown />
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col border-t border-neutral-300">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                onSortFieldSelect(option.key);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm flex flex-col justify-center items-start min-h-8
                ${selectedKey === option.key ? 'bg-neutral-50 text-black font-medium' : 'text-black hover:bg-neutral-50'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
