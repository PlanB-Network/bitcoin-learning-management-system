import type { NextFunction, Request, Response, Router } from 'express';

import { UserRole } from '@blms/constants';
import { canAccess } from '@blms/shared/auth';
import type { Dependencies } from '#src/dependencies.js';
import { Unauthorized } from '#src/errors.js';

const expectedImageQuery = z.object({
  code: z.string(),
  itemId: z.string(),
});

interface ImageQuery {
  code: string;
  itemId: string;
}

import {
  createGetCouponCode,
  createListEventsAndCourses,
} from '@blms/service-content';

import sharp from 'sharp';
import { z } from 'zod';
import { template } from './coupon-template.js';

export const createRestCouponsRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const couponPermissionMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.session.uid || !req.session.role || !req.session.permissions) {
      throw new Unauthorized('Missing session data');
    }

    const role = req.session.role;
    const permissions = req.session.permissions;

    if (!canAccess(UserRole.Admin)({ role, permissions })) {
      throw new Unauthorized('Insufficient permissions');
    }

    next();
  };

  const getCouponCode = createGetCouponCode(dependencies);
  const listEventsAndCourses = createListEventsAndCourses(dependencies);
  const getCouponCodeSvg = async ({ code, itemId }: ImageQuery) => {
    const couponCode = await getCouponCode(code, itemId);
    if (!couponCode) {
      return null;
    }

    // Find title from course
    const eventsAndCourses = await listEventsAndCourses();
    const eventOrCourse = eventsAndCourses.find(
      (eventOrCourse) => eventOrCourse.id === couponCode.itemId,
    );

    return template({
      reductionPercentage: couponCode.reductionPercentage ?? 0,
      code: couponCode.code,
      title: eventOrCourse?.name || 'unknown',
    });
  };

  router.get(
    '/coupon-image.svg',
    couponPermissionMiddleware,
    async (req, res) => {
      // Validate query
      const parsedQuery = expectedImageQuery.safeParse(req.query);
      if (!parsedQuery.success) {
        res.status(400).json({ error: 'Invalid query parameters' });
        return;
      }

      const svg = await getCouponCodeSvg(parsedQuery.data);
      if (!svg) {
        res.status(404).json({ error: 'Coupon code not found' });
        return;
      }

      res.setHeader('Content-Type', 'image/svg+xml');
      res.write(svg);
      res.end();
    },
  );

  router.get(
    '/coupon-image.png',
    couponPermissionMiddleware,
    async (req, res) => {
      // Validate query
      const parsedQuery = expectedImageQuery.safeParse(req.query);
      if (!parsedQuery.success) {
        res.status(400).json({ error: 'Invalid query parameters' });
        return;
      }

      const svg = await getCouponCodeSvg(parsedQuery.data);
      if (!svg) {
        res.status(404).json({ error: 'Coupon code not found' });
        return;
      }

      const png = await sharp(Buffer.from(svg)).png({}).toBuffer();

      res.setHeader('Content-Type', 'image/png');
      res.write(png);
      res.end();
    },
  );

  router.post('/coupons-zip', couponPermissionMiddleware, async (req, res) => {
    console.log('req.body', req.body);

    res.json(null);
  });
};
