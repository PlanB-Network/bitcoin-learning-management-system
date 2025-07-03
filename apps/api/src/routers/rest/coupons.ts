import { UserRole } from '@blms/constants';
import {
  createGetCouponCode,
  createListEventsAndCourses,
  generateCouponSvg,
} from '@blms/service-content';
import { canAccess } from '@blms/shared/auth';
import type { NextFunction, Request, Response, Router } from 'express';
import JSZip from 'jszip';
import sharp from 'sharp';
import { z } from 'zod';
import type { Dependencies } from '#src/dependencies.js';
import { Unauthorized } from '#src/errors.js';

const expectedImageQuery = z.object({ code: z.string() });
const expectedImagesQuery = z.object({ codes: z.string() });

interface ImageQuery {
  code: string;
}

const zipStream = (zip: JSZip) => {
  return zip.generateNodeStream({
    streamFiles: true,
    type: 'nodebuffer',
  });
};

export const createRestCouponsRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  const couponPermissionMiddleware = (
    req: Request,
    // biome-ignore lint/correctness/noUnusedFunctionParameters: explanation
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.session.uid || !req.session.role || !req.session.permissions) {
      throw new Unauthorized('Missing session data');
    }

    const role = req.session.role;
    const permissions = req.session.permissions;

    if (!canAccess(UserRole.Admin)({ permissions, role })) {
      throw new Unauthorized('Insufficient permissions');
    }

    next();
  };

  const getCouponCode = createGetCouponCode(dependencies);
  const listEventsAndCourses = createListEventsAndCourses(dependencies);
  const getCouponCodeSvg = async ({ code }: ImageQuery) => {
    const couponCode = await getCouponCode(code);
    if (!couponCode) {
      return null;
    }

    // Find title from course
    const eventsAndCourses = await listEventsAndCourses();
    const eventOrCourse = eventsAndCourses.find(
      (eventOrCourse) => eventOrCourse.id === couponCode.itemId,
    );

    return generateCouponSvg({
      code: couponCode.code,
      reductionPercentage: couponCode.reductionPercentage ?? 0,
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

  router.all(
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

      // Convert SVG to PNG
      const png = await sharp(Buffer.from(svg, 'utf-8')).png({}).toBuffer();

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="coupon.png"`);
      res.write(png);
      res.end();
    },
  );

  router.post('/coupons.zip', couponPermissionMiddleware, async (req, res) => {
    // Validate query
    const parsedQuery = expectedImagesQuery.safeParse(req.query);
    if (!parsedQuery.success) {
      res.status(400).json({ error: 'Invalid query parameters' });
      return;
    }

    const eventsAndCourses = await listEventsAndCourses();

    const codes = parsedQuery.data.codes.split(',');
    const couponCodes = await Promise.all(
      codes.map(async (code) => {
        const couponCode = await getCouponCode(code);
        if (!couponCode) {
          return null;
        }

        // Find title from course
        const eventOrCourse = eventsAndCourses.find(
          (eventOrCourse) => eventOrCourse.id === couponCode.itemId,
        );

        return {
          code: couponCode.code,
          reductionPercentage: couponCode.reductionPercentage ?? 0,
          title: eventOrCourse?.name || 'unknown',
        };
      }),
    );

    if (couponCodes.some((code) => code === null)) {
      res.status(404).json({ error: 'Coupon code not found' });
      return;
    }

    const zip = new JSZip();

    for (const couponCode of couponCodes) {
      const svg = generateCouponSvg({
        code: couponCode!.code,
        reductionPercentage: couponCode!.reductionPercentage,
        title: couponCode!.title,
      });

      // Convert SVG to PNG
      const png = await sharp(Buffer.from(svg, 'utf-8')).png({}).toBuffer();

      zip.file(`${couponCode!.code}.png`, png);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="coupons.zip"`);

    zipStream(zip).pipe(res);
  });
};
