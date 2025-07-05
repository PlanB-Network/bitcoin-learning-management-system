export const LANGUAGES_MAP: { [key: string]: string } = {
  cs: 'Čeština',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  et: 'Eesti keel',
  fa: 'فارسی',
  fi: 'Suomi',
  fr: 'Français',
  hi: 'हिंदी',
  id: 'Bahasa indonesia',
  it: 'Italiano',
  ja: '日本語',
  nbno: 'Norsk bokmål',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  srlatn: 'Srpski',
  sv: 'Svenska',
  sw: 'Kiswahili',
  vi: 'Tiếng Việt',
  zhhans: '简体中文',
  zhhant: '繁體中文',
};

export const BTC101ID = '2b7dc507-81e3-4b70-88e6-41ed44239966';
export const BTC402ID = '0b71eea1-4811-4601-a6ad-38d043b52dca';
export const BIZ225ID = 'c762773a-9017-4129-bc0e-06adf86050ef';
export const BIZ999ID = '576ac496-a4fd-471a-b022-e0da1ab89a29';

export const COURSES_CAREER_ACCESS = [BTC402ID, BIZ225ID, BIZ999ID];
// Course status utilities
export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'reviewed':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-orange-800 text-white';
    case 'ready_for_review':
      return 'bg-orange-400 text-white';
    case 'in_progress':
      return 'bg-orange-100 text-orange-800';
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (
  status: string,
  t: (key: string) => string,
): string => {
  switch (status) {
    case 'published':
      return t('dashboard.adminPanel.translationPanel.status.published');
    case 'reviewed':
      return t('dashboard.adminPanel.translationPanel.status.reviewed');
    case 'under_review':
      return t('dashboard.adminPanel.translationPanel.status.underReview');
    case 'ready_for_review':
      return t('dashboard.adminPanel.translationPanel.status.readyForReview');
    case 'in_progress':
      return t('dashboard.adminPanel.translationPanel.status.inProgress');
    case 'todo':
      return t('dashboard.adminPanel.translationPanel.status.todo');
    default:
      return t('dashboard.adminPanel.translationPanel.status.todo');
  }
};

export const isLanguageClickable = (status: string): boolean => {
  return ['ready_for_review', 'under_review', 'reviewed', 'published'].includes(
    status,
  );
};

export const getProgressPercentage = (status: string): string => {
  if (status === 'reviewed' || status === 'published') {
    return '100%';
  }
  if (status === 'in_progress') {
    return '50%';
  }
  return '0%';
};
