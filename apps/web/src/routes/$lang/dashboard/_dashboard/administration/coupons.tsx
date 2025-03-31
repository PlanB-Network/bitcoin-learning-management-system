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
    createModal.close();
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

          <h1 className="text-2xl font-thin text-newOrange-1 my-4 w-full min-w-96 text-center">
            {t('dashboard.adminPanel.coupons.generateDiscountCode')}
          </h1>

          {!generatedCodes?.length && (
            <>
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
                    onChange={(e) =>
                      setFormNumberOfCodes(Number(e.target.value))
                    }
                  />
                </fieldset>
              ) : (
                <>
                  <fieldset className="w-full">
                    <h3>{t('dashboard.adminPanel.coupons.discountCode')}</h3>
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
                    <h3>
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

          {generatedCodes.length > 0 && (
            <div className="w-full">
              <h3>
                {t(
                  `dashboard.adminPanel.coupons.generatedCode${generatedCodes.length > 1 ? 's' : ''}`,
                )}
                :
              </h3>
              <ul className="relative border rounded-lg p-2">
                <li className="absolute top-0 right-0 text-newGray-3 p-1 rounded-md cursor-pointer">
                  <button
                    type="button"
                    className="group"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCodes.join('\n'));
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
