import { CronJob } from 'cron';

type Fn = () => unknown;

export type Frequency = '1m' | '5m' | 'h' | 'd' | 'm';

export interface CronService {
  addTask: (cronName: Frequency, task: Fn) => void;
  start: () => void;
  stop: () => void;
}

const noFail = async (task: Fn) => {
  try {
    await task();
  } catch (error: unknown) {
    console.error(`Cron job failed`, error);
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

  crons.set('1m', new CronJob('* * * * *', createExecTasks('1m')));
  crons.set('5m', new CronJob('*/5 * * * *', createExecTasks('5m')));
  crons.set('h', new CronJob('0 * * * *', createExecTasks('h')));
  crons.set('d', new CronJob('0 0 * * *', createExecTasks('d')));
  crons.set('m', new CronJob('0 0 1 * *', createExecTasks('m')));

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
