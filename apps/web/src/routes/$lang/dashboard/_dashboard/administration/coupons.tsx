import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DividerSimple,
  TextTag,
  cn,
} from '@blms/ui';
import Warning from '#src/assets/icons/warning_orange.svg';

import { AppContext } from '#src/providers/context.tsx';

import { UserPermission, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import type { CouponCode, CouponCodeWithOwner } from '@blms/types';
import { t } from 'i18next';
import { ChevronDown, PlusIcon } from 'lucide-react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FaSliders } from 'react-icons/fa6';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { trpc } from '#src/utils/trpc.ts';
import SortableTableHeader from '../-components/sortable-table-header.tsx';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/coupons',
)({
  component: AdminCoupons,
});

function AdminCoupons() {
  const isMobile = useSmaller('md');
  const navigate = useNavigate();

  const { session } = useContext(AppContext);

  useEffect(() => {
    if (!session) {
      console.log('session', session);
      navigate({ to: '/' });
    } else if (
      !canAccess(UserRole.Admin, UserPermission.Coupons)(session?.user)
    ) {
      navigate({ to: '/dashboard/courses' });
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

  const items = trpc.content.listEventsAndCourses.useQuery();

  const itemsMap = new Map(items.data?.map((item) => [item.id, item]));

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortKey, setSortKey] = useState<string | null>(null);

  const coupons = trpc.content.listCouponCodes.useQuery({
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
    limit: 10_000,
    page,
  });

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
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);

  const [preventDoubleClick, setPreventDoubleClick] = useState(false);

  // Mutation - create coupon code
  const createCouponCode = trpc.content.createCouponCode.useMutation({
    onSuccess: (response) => {
      console.log('Coupon code created', response);
      setGeneratedCodes(response.map((coupon) => coupon.code));
    },
  });

  // Mutation - delete coupon code
  const deleteCouponCode = trpc.content.deleteCouponCode.useMutation({
    onSuccess: () => {
      console.log('Coupon code deleted');
      coupons.refetch();
    },
  });

  // On form submit
  const handleSubmit = () => {
    const options = {
      reductionPercentage: formPercentage,
      singleUse: formSingleUse,
      itemId: formItemId,
      ...(formSingleUse
        ? {
            numberOfCodes: formNumberOfCodes,
            code: null,
          }
        : {
            maxUses: formMaxUses,
            code: formCode,
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
    <section className="flex flex-col gap-4 lg:gap-8">
      <div className="flex flex-col">
        <div className="flex gap-2.5 md:gap-5 mb-5">
          <h1 className="title-large-24px md:display-small-32px text-dashboardSectionText">
            {t('dashboard.adminPanel.discountCodes')}
          </h1>
          <TextTag
            size={isMobile ? 'verySmall' : 'small'}
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
        {t('dashboard.adminPanel.coupons.generateNew')} <PlusIcon />
      </Button>

      <DividerSimple mode="light" className="lg:hidden" />

      <div className="flex flex-wrap gap-2 items-center text-black">
        <FaSliders className="size-6" />

        <Button
          variant={filters.has('all') ? 'primary' : 'outline'}
          size="s"
          onClick={() => toggle('all')}
          className="focus-visible:border-newOrange-1"
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
              className="focus-visible:border-newOrange-1"
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
          {coupons.data?.map((coupon) => {
            return (
              <tr key={coupon.code} className="*:pt-2">
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
                        setGeneratedCodes([coupon.code]);
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
          {coupons.data?.map((coupon) => {
            return (
              <CouponCard
                key={coupon.code}
                coupon={coupon}
                itemName={itemsMap.get(coupon.itemId)?.name ?? null}
                onViewClick={() => {
                  console.log('View coupon code', coupon);
                  setGeneratedCodes([coupon.code]);
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
            <p className="md:col-span-2 text-center text-newGray-2 py-4">
              {t('dashboard.adminPanel.coupons.noCouponsFound')}
            </p>
          )}
        </div>
      </div>

      <Dialog open={deleteModal.isOpen} onOpenChange={deleteModal.close}>
        <DialogContent
          showCloseButton={true}
          className="flex flex-col items-center gap-3 py-2 px-4 sm:gap-6 sm:p-6"
        >
          <DialogHeader className="hidden">
            <DialogTitle>
              {t('dashboard.adminPanel.coupons.deleteDiscountCode')}
            </DialogTitle>
            <DialogDescription> </DialogDescription>
          </DialogHeader>

          <h1 className="text-2xl text-center text-newOrange-1 my-4 ">
            {t('dashboard.adminPanel.coupons.deleteDiscountCodeConfirm')}
          </h1>

          <img src={Warning} alt="Warning" className="size-16" />

          <p className="text-center">
            {t('dashboard.adminPanel.coupons.deleteDiscountCodeWarning')}
          </p>

          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={() => {
                if (couponToDelete) {
                  deleteCouponCode.mutate(couponToDelete.code);
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
        </DialogContent>
      </Dialog>

      <Dialog open={modal.isOpen} onOpenChange={onCreateModalClose}>
        <DialogContent
          showCloseButton={true}
          className="flex flex-col items-center gap-3 py-2 px-4 sm:gap-6 sm:p-6 max-md:w-full max-md:max-w-[90vw] max-md:mx-auto"
        >
          <DialogHeader className="hidden">
            <DialogTitle variant="orange">
              {t('dashboard.adminPanel.coupons.generateDiscountCode')}
            </DialogTitle>
            <DialogDescription> </DialogDescription>
          </DialogHeader>

          <h1 className="text-2xl font-medium text-darkOrange-5 my-4 w-full min-w-56 md:min-w-96 text-center">
            {generatedCodes?.length
              ? t('dashboard.adminPanel.coupons.generatedCodes')
              : t('dashboard.adminPanel.coupons.generateDiscountCode')}
          </h1>

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
                <small className="text-newGray-1">
                  {t('dashboard.adminPanel.coupons.discountValueExplanation')}
                </small>
                <input
                  className="w-full border border-newGray-1 rounded-lg p-2"
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
                    className="w-full border border-newGray-1 rounded-lg p-2"
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
                    <small className="text-newGray-1">
                      {t(
                        'dashboard.adminPanel.coupons.discountCodeExplanation',
                      )}
                    </small>
                    <input
                      className="w-full border border-newGray-1 rounded-lg p-2"
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
                      className="w-full border border-newGray-1 rounded-lg p-2"
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
                className="my-4 max-w-xl"
                alt="Coupon code"
                src={`/api/coupon-image.png?code=${generatedCodes[0]}`}
              />

              <div className="my-4">
                <form
                  action={
                    generatedCodes.length > 1
                      ? `/api/coupons.zip?codes=${generatedCodes.join(',')}`
                      : `/api/coupon-image.png?code=${generatedCodes[0]}`
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
                <li className="absolute top-0 right-0 text-newGray-3 p-1 rounded-md cursor-pointer">
                  {codeCopied ? (
                    <div className="pt-1 pr-2 text-orange-400">
                      {t('dashboard.adminPanel.coupons.discountCodeCopied')}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="group"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          generatedCodes.join('\n'),
                        );
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 2000);
                      }}
                    >
                      <svg
                        role="img"
                        aria-label="Copy"
                        className="size-8"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.48926 12.2394C6.12259 12.2394 5.8087 12.1089 5.54759 11.8478C5.28648 11.5866 5.15592 11.2728 5.15592 10.9061V2.90609C5.15592 2.53942 5.28648 2.22553 5.54759 1.96442C5.8087 1.70331 6.12259 1.57275 6.48926 1.57275H12.4893C12.8559 1.57275 13.1698 1.70331 13.4309 1.96442C13.692 2.22553 13.8226 2.53942 13.8226 2.90609V10.9061C13.8226 11.2728 13.692 11.5866 13.4309 11.8478C13.1698 12.1089 12.8559 12.2394 12.4893 12.2394H6.48926ZM6.48926 10.9061H12.4893V2.90609H6.48926V10.9061ZM3.82259 14.9061C3.45592 14.9061 3.14204 14.7755 2.88092 14.5144C2.61981 14.2533 2.48926 13.9394 2.48926 13.5728V4.23942H3.82259V13.5728H11.1559V14.9061H3.82259Z"
                          className="fill-black group-hover:fill-orange-500"
                        />
                      </svg>
                    </button>
                  )}
                </li>
                {generatedCodes.map((code) => (
                  <li key={code}>{code}</li>
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
        </DialogContent>
      </Dialog>
    </section>
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
    <article className="p-2 rounded-[10px] flex flex-col gap-1.5 bg-newGray-6 border border-newGray-5 shadow-course-navigation-sm text-newBlack-1">
      <div className="flex justify-between items-center">
        <h3 className="subtitle-medium-med-16px break-all pr-2 max-w-[calc(100%-60px)]">
          {coupon.code}
        </h3>
        <TextTag size="small" variant="grey" mode="light" className="shrink-0">
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
            <span className="body-14px text-newBlack-5">
              {t('dashboard.adminPanel.coupons.tableHead.uses')}:
            </span>
            <span className="body-14px-medium">{coupon.uses}</span>
            <span className="body-14px text-newBlack-5">
              {t('words.total')}:
            </span>
            <span className="body-14px-medium">{coupon.maxUses}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
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
    <div className="lg:hidden w-full bg-white rounded-lg border border-newGray-4 flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex justify-between items-center text-left"
      >
        <span
          className={cn(
            'text-sm ',
            !selectedKey ? 'text-newGray-2' : 'text-newBlack-1',
          )}
        >
          {selectedKey && (
            <span className="text-newGray-2">
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
          <ChevronDown />
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col border-t border-newGray-3">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                onSortFieldSelect(option.key);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-[7px] text-left text-sm flex flex-col justify-center items-start min-h-[32px]
                ${selectedKey === option.key ? 'bg-newGray-6 text-black font-medium' : 'text-black hover:bg-newGray-6'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
