import { CronJob } from 'cron';

type Fn = () => unknown;

export type Frequency =
  | '1min'
  | '5min'
  | '1hour'
  | '1day'
  | '1month'
  | 'sun4pm'
  | 'mar22_17_gmt'
  | 'mar23_11_gmt'
  | 'mar25_15_gmt'
  | 'mar31_12_gmt'
  | 'daily_8_gmt'
  | 'daily_16_gmt'
  | 'monthly_1st_16_gmt';

export interface CronService {
  addTask: (cronName: Frequency, task: Fn) => void;
  start: () => void;
  stop: () => void;
}

const noFail = async (task: Fn) => {
  try {
    await task();
  } catch (error: unknown) {
    console.error('Cron job failed', error);
  }
};

export const createCronService = () => {
  const tasks: Map<Frequency, Fn[]> = new Map();
  const crons: Map<Frequency, CronJob> = new Map();

  const createExecTasks = (name: Frequency) => {
    return async () => {
      const taskList = tasks.get(name) ?? [];
      for (const task of taskList) {
        await noFail(task);
      }
    };
  };

  crons.set('1min', new CronJob('* * * * *', createExecTasks('1min')));
  crons.set('5min', new CronJob('*/5 * * * *', createExecTasks('5min')));
  crons.set('1hour', new CronJob('0 * * * *', createExecTasks('1hour')));
  crons.set('1day', new CronJob('0 0 * * *', createExecTasks('1day')));
  crons.set('1month', new CronJob('0 0 1 * *', createExecTasks('1month')));
  crons.set('sun4pm', new CronJob('0 16 * * 0', createExecTasks('sun4pm')));
  crons.set(
    'mar22_17_gmt',
    new CronJob('0 17 22 3 *', createExecTasks('mar22_17_gmt')),
  );
  crons.set(
    'mar25_15_gmt',
    new CronJob('0 15 25 3 *', createExecTasks('mar25_15_gmt')),
  );
  crons.set(
    'mar23_11_gmt',
    new CronJob('0 11 23 3 *', createExecTasks('mar23_11_gmt')),
  );
  crons.set(
    'mar31_12_gmt',
    new CronJob('0 12 31 3 *', createExecTasks('mar31_12_gmt')),
  );
  crons.set(
    'daily_8_gmt',
    new CronJob('0 8 * * *', createExecTasks('daily_8_gmt')),
  );
  crons.set(
    'daily_16_gmt',
    new CronJob('0 16 * * *', createExecTasks('daily_16_gmt')),
  );
  crons.set(
    'monthly_1st_16_gmt',
    new CronJob('0 16 1 * *', createExecTasks('monthly_1st_16_gmt')),
  );

  return {
    addTask: (every: Frequency, task: Fn) => {
      const existing = tasks.get(every) ?? [];
      tasks.set(every, [...existing, task]);
    },
    start: () => {
      for (const cron of crons.values()) {
        cron.start();
      }
    },
    stop: () => {
      for (const cron of crons.values()) {
        cron.stop();
      }
    },
  };
};
