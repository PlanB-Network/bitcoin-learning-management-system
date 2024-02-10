// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { AccountsUid } from './Accounts';
import type { CoursesId } from '../content/Courses';

/** Represents the table users.course_payment */
export default interface CoursePayment {
  uid: AccountsUid;

  course_id: CoursesId;

  payment_status: string;

  amount: number;

  payment_id?: string;

  invoice_url?: string;

  last_updated: number;
}

/** Represents the initializer for the table users.course_payment */
export interface CoursePaymentInitializer {
  uid: AccountsUid;

  course_id: CoursesId;

  payment_status: string;

  amount: number;

  payment_id?: string;

  invoice_url?: string;

  /** Default value: now() */
  last_updated?: number;
}

/** Represents the mutator for the table users.course_payment */
export interface CoursePaymentMutator {
  uid?: AccountsUid;

  course_id?: CoursesId;

  payment_status?: string;

  amount?: number;

  payment_id?: string;

  invoice_url?: string;

  last_updated?: number;
}