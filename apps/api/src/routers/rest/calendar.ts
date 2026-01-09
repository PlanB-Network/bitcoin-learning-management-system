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
        return res.status(404).send('User not found');
      }

      const events = await createGetCalendarEvents({
        ...dependencies,
        log: req.log,
      })({
        uid: user.uid,
        upcomingEvents: false,
      });

      const icsContent = generateIcs(events);

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="calendar.ics"');
      res.setHeader('Cache-Control', 'no-cache');

      res.send(icsContent);
    } catch (error) {
      console.error('Error generating calendar:', error);
      res.status(500).send('Internal Server Error');
    }
  });
};
