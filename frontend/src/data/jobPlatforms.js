// Platformele de joburi scanate orar de backend (cate un JobScraper in crawler/).
// Sursa unica pentru filtrul din Cautare joburi, pentru site-ul afisat pe fiecare job si pentru cifra de pe landing.
// label = numele din filtru, site = numele scurt al site-ului de pe care e preluat jobul.
export const JOB_PLATFORMS = [
  { id: 'DEVJOB_RO', label: 'DevJob.ro (Tech)', site: 'DevJob.ro' },
  { id: 'LINKEDIN', label: 'LinkedIn Jobs', site: 'LinkedIn' },
  { id: 'GITHUB_COMMUNITY', label: 'GitHub Early Careers (EU & Intl)', site: 'GitHub' },
  { id: 'BESTJOBS', label: 'BestJobs.eu IT', site: 'BestJobs.eu' },
  { id: 'HIPO', label: 'Hipo.ro Trainee & IT', site: 'Hipo.ro' },
  { id: 'STAGIIPEBUNE', label: 'StagiiPeBune.ro', site: 'StagiiPeBune.ro' },
  { id: 'JUNIORS_RO', label: 'Juniors.ro', site: 'Juniors.ro' },
  { id: 'UNDELUCRAM', label: 'UndeLucram.ro', site: 'UndeLucram.ro' },
  { id: 'EJOBS', label: 'eJobs.ro', site: 'eJobs.ro' }
];

// Numele site-ului pentru un sourcePlatform (ex. LINKEDIN -> LinkedIn); sursele necunoscute raman ca atare
export const platformSiteName = (platformId) =>
  JOB_PLATFORMS.find((p) => p.id === platformId)?.site || platformId || '';
