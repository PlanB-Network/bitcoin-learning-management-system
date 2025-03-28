import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  TextTag,
} from '@blms/ui';
import Warning from '#src/assets/icons/warning.svg';

import { AppContext } from '#src/providers/context.tsx';

import { UserPermission, UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import type { CouponCode } from '@blms/types';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useDisclosure } from '#src/hooks/use-disclosure.ts';
import { trpc } from '#src/utils/trpc.ts';

export const Route = createFileRoute(
  '/$lang/dashboard/_dashboard/administration/coupons',
)({
  component: AdminCoupons,
});

function AdminCoupons() {
  const { t } = useTranslation();

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

  const coupons = trpc.content.listCouponCodes.useQuery({
    singleUse:
      filters.has('singleUse') && filters.has('multiUse')
        ? null
        : filters.has('singleUse')
          ? true
          : filters.has('multiUse')
            ? false
            : null,
    limit: 10_000,
    page,
  });

  // Delete modal state
  const [couponToDelete, setCouponToDelete] = useState<CouponCode | null>(null);
  const deleteModal = useDisclosure();

  // Create modal state
  const createModal = useDisclosure();
  const onCreateModalClose = () => {
    createModal.close();
    coupons.refetch();
  };

  const [formIsEvent, setFormIsEvent] = useState<boolean>(false);
  const [formItemId, setFormItemId] = useState<string>('');
  const [formSingleUse, setFormSingleUse] = useState<boolean>(true);
  const [formPercentage, setFormPercentage] = useState<number>(5);
  const [formCode, setFormCode] = useState<string>('');
  const [formNumberOfCodes, setFormNumberOfCodes] = useState<number>(1);
  const [formMaxUses, setFormMaxUses] = useState<number>(1);

  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

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

  return (
    <section className="flex flex-col gap-4 lg:gap-8">
      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5 mb-5 md:mb-11">
          <span className="text-dashboardSectionText text-s text-2xl md:display-small-32px">
            {t('dashboard.adminPanel.discountCodes')}
          </span>
          <TextTag size={'small'} className="uppercase max-w-[60px]">
            {t('words.admin')}
          </TextTag>
        </div>
        <span>{t('dashboard.adminPanel.coupons.explanation')}</span>
      </div>

      <Button
        className="w-fit"
        variant="primary"
        onClick={() => createModal.open()}
      >
        {t('dashboard.adminPanel.coupons.generateNew')}
      </Button>

      <div className="flex flex-wrap gap-2 text-black">
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

      <table>
        <thead className="text-left">
          <tr>
            <th>{t('dashboard.adminPanel.coupons.tableHead.code')}</th>
            <th>{t('dashboard.adminPanel.coupons.tableHead.type')}</th>
            <th>{t('dashboard.adminPanel.coupons.tableHead.name')}</th>
            <th>{t('dashboard.adminPanel.coupons.tableHead.discount')}</th>
            <th>{t('dashboard.adminPanel.coupons.tableHead.uses')}</th>
            <th>{t('dashboard.adminPanel.coupons.tableHead.total')}</th>
            <th>{t('dashboard.adminPanel.coupons.tableHead.owner')}</th>
            <th>{t('dashboard.adminPanel.coupons.tableHead.actions')}</th>
          </tr>
        </thead>

        <tbody>
          {coupons.data?.map((coupon) => {
            return (
              <tr key={coupon.code}>
                <td>{coupon.code}</td>
                <td>
                  {itemsMap.get(coupon.itemId)?.type === 'event'
                    ? t('dashboard.adminPanel.coupons.productEvent')
                    : t('dashboard.adminPanel.coupons.productCourse')}
                </td>
                <td>{itemsMap.get(coupon.itemId)?.name ?? 'unknown'}</td>
                <td>{coupon.reductionPercentage}%</td>
                <td> {coupon.uses} </td>
                <td> {coupon.maxUses} </td>
                <td> {coupon.owner ?? 'unknown'} </td>
                <td>
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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

          <h1 className="text-2xl text-center font-thin text-newOrange-1 my-4 ">
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

      <Dialog open={createModal.isOpen} onOpenChange={onCreateModalClose}>
        <DialogContent
          showCloseButton={true}
          className="flex flex-col items-center gap-3 py-2 px-4 sm:gap-6 sm:p-6"
        >
          <DialogHeader className="hidden">
            <DialogTitle>
              {t('dashboard.adminPanel.coupons.generateDiscountCode')}
            </DialogTitle>
            <DialogDescription> </DialogDescription>
          </DialogHeader>

          <h1 className="text-2xl font-thin text-newOrange-1 my-4 ">
            {t('dashboard.adminPanel.coupons.generateDiscountCode')}
          </h1>

          <fieldset className="w-full">
            <h3>{t('dashboard.adminPanel.coupons.forWhat')}</h3>

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
              <h3>{t('dashboard.adminPanel.coupons.forWhichEvent')}</h3>
            ) : (
              <h3>{t('dashboard.adminPanel.coupons.forWhichCourse')}</h3>
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
            <h3>{t('dashboard.adminPanel.coupons.discountType')}</h3>

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
            <h3>{t('dashboard.adminPanel.coupons.discountValue')}</h3>
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
                onChange={(e) => setFormNumberOfCodes(Number(e.target.value))}
              />
            </fieldset>
          ) : (
            <>
              <fieldset className="w-full">
                <h3>{t('dashboard.adminPanel.coupons.discountCode')}</h3>
                <small className="text-newGray-1">
                  {t('dashboard.adminPanel.coupons.discountCodeExplanation')}
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
                <h3>{t('dashboard.adminPanel.coupons.maximumNumberOfUse')}</h3>
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
          {generatedCodes.length > 0 && (
            <div className="w-full">
              <h3>
                {t(
                  `dashboard.adminPanel.coupons.generatedCode${generatedCodes.length > 1 ? 's' : ''}`,
                )}
                :
              </h3>
              <ul className="border border-newGray-1 rounded-lg p-2">
                {generatedCodes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
            </div>
          )}
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
        </DialogContent>
      </Dialog>
    </section>
  );
}
