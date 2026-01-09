import {
  createGetCalendarEvents,
  createGetUserUidByCalendarToken,
} from '@blms/service-user';
import { generateIcs } from '@blms/shared';
import type { Router } from 'express';

import type { Dependencies } from '#src/dependencies.js';

export const createRestCalendarRoutes = (
  dependencies: Dependencies,
  router: Router,
) => {
  router.get('/calendar/:token.ics', async (req, res) => {
    const { token } = req.params;

    try {
      const user = await createGetUserUidByCalendarToken({
        ...dependencies,
        log: req.log,
      })({ token });

      if (!user) {
        return res.status(404).send('Invalid or expired calendar token');
      }

      const types = req.query.types
        ? (req.query.types as string).split(',')
        : undefined;

      const events = await createGetCalendarEvents({
        ...dependencies,
        log: req.log,
      })({
        uid: user.uid,
        upcomingEvents: false,
        types,
      });

      const icsContent = generateIcs(events);

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="calendar-plan-b-academy.ics"',
      );
      res.setHeader('Cache-Control', 'public, max-age=300');

      res.send(icsContent);
    } catch (error) {
      req.log('Error generating calendar for token', error);
      res
        .status(500)
        .send('Internal Server Error: Failed to generate calendar');
    }
  });
};
