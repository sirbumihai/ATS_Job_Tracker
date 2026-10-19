import React, { useState, useEffect, useMemo } from 'react';
import {
  createPortal
} from 'react-dom';
import Card from './ui/Card';
import PageHeader from './ui/PageHeader';
import {
  SparklesIcon,
  SearchIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  CheckIcon,
  ExternalLinkIcon
} from './animated-icons';

import {
  Brain,
  Cloud,
  Server,
  Database,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Layout,
  Smartphone,
  Cpu,
  Headphones,
  Briefcase,
  Code,
  X,
  ChevronRight,
  Info,
  Target,
  Flame,
  Zap,
  BarChart3,
  SlidersHorizontal,
  Compass,
  Building2,
  MapPin,
  Globe,
  AlertCircle
} from 'lucide-react';

const DOMAIN_ICONS = {
  AI_DATA_SCIENCE: Brain,
  DEVOPS_CLOUD: Cloud,
  BACKEND: Server,
  DATA_ENGINEERING: Database,
  QA_AUTOMATION: CheckCircle2,
  CYBERSECURITY: ShieldCheck,
  FRONTEND: Layout,
  FULLSTACK: Layers,
  EMBEDDED_SYSTEMS: Cpu,
  MOBILE: Smartphone,
  IT_SUPPORT_SYSADMIN: Headphones,
  PRODUCT_BUSINESS_ANALYST: Briefcase,
  GENERAL_SOFTWARE: Code
};

const SKILL_CATEGORIES = [
  { id: 'ALL', label: 'Toate' },
  { id: 'Limbaje de Programare', label: 'Limbaje' },
  { id: 'Frameworks & Web', label: 'Frameworks & Web' },
  { id: 'Baze de Date', label: 'Baze de Date' },
  { id: 'Cloud & DevOps', label: 'Cloud & DevOps' },
  { id: 'AI & Data', label: 'AI & Data Science' },
  { id: 'QA & Testare', label: 'QA & Testare' },
  { id: 'Sisteme & Securitate', label: 'Securitate & Sisteme' },
  { id: 'Unelte & Metodologii', label: 'Unelte & Agile' }
];

export default function MarketInsightsPage({ currentUser, onNavigateToJobSearch, onNavigateToSkillRoadmap }) {
  const [levelFilter, setLevelFilter] = useState('JUNIOR'); // JUNIOR, MID, SENIOR, ALL
  const [locationFilter, setLocationFilter] = useState('RO_ONLY'); // RO_ONLY, BUCURESTI, RO_AND_REMOTE, ALL
  const [activeOnly, setActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('OPPORTUNITY'); // OPPORTUNITY, LOW_COMP, VOLUME, NAME
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal stare pentru detalii complete domeniu
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [modalTab, setModalTab] = useState('requirements'); // 'requirements', 'interview', 'roadmap', 'sample_jobs'
  const [modalSkillCategory, setModalSkillCategory] = useState('ALL');

  const activeUserId = currentUser?.userId || currentUser?.id || null;

  const fetchInsights = async (
    level = levelFilter, 
    location = locationFilter, 
    active = activeOnly
  ) => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (activeUserId) {
        headers['X-User-Id'] = activeUserId;
      }
      const userParam = activeUserId ? `&userId=${activeUserId}` : '';
      const res = await fetch(`/api/v1/market-insights?level=${level}&location=${location}&activeOnly=${active}${userParam}`, {
        headers
      });
      if (!res.ok) {
        throw new Error(`Eroare server: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      if (selectedDomain) {
        const updated = json.domains?.find(d => d.id === selectedDomain.id);
        if (updated) setSelectedDomain(updated);
      }
    } catch (err) {
      console.error('Eroare la preluarea cerintelor de piata:', err);
      setError('Nu s-au putut încărca datele pieței. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(levelFilter, locationFilter, activeOnly);
  }, [levelFilter, locationFilter, activeOnly]);

  // Lock scroll si inchidere la tasta Escape cand modalul este deschis
  useEffect(() => {
    if (!selectedDomain || typeof document === 'undefined') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedDomain(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = (prevBodyOverflow === 'hidden' ? '' : prevBodyOverflow);
      document.documentElement.style.overflow = (prevHtmlOverflow === 'hidden' ? '' : prevHtmlOverflow);
    };
  }, [selectedDomain]);

  // Filtrare si sortare domenii
  const filteredDomains = useMemo(() => {
    if (!data?.domains) return [];
    let list = [...data.domains];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.tagLine.toLowerCase().includes(q) ||
        d.topSkills.some(s => s.skill.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'OPPORTUNITY':
        list.sort((a, b) => b.opportunityScore - a.opportunityScore);
        break;
      case 'LOW_COMP':
        list.sort((a, b) => b.lowCompetitionRate - a.lowCompetitionRate);
        break;
      case 'VOLUME':
        list.sort((a, b) => b.levelJobCount - a.levelJobCount);
        break;
      case 'NAME':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return list;
  }, [data, searchQuery, sortBy]);

  const getCompBadge = (rate) => {
    if (rate >= 60) {
      return {
        label: 'Competiție Redusă',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200'
      };
    }
    if (rate >= 45) {
      return {
        label: 'Competiție Medie',
        color: 'text-amber-800 bg-amber-50 border-amber-200'
      };
    }
    return {
      label: 'Competiție Mare',
      color: 'text-neutral-800 bg-neutral-100 border-neutral-300'
    };
  };

  const getOpportunityBadge = (score) => {
    if (score >= 75) {
      return {
        label: 'Oportunitate Ridicată',
        badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-semibold'
      };
    }
    if (score >= 60) {
      return {
        label: 'Oportunitate bună',
        badgeClass: 'text-neutral-900 bg-neutral-100 border-neutral-300 font-semibold'
      };
    }
    return {
      label: 'Oportunitate moderată',
      badgeClass: 'text-neutral-600 bg-neutral-50 border-neutral-200'
    };
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      <Card as="section" padding="px-5 py-4">
        <PageHeader
          as="h2"
          title="Piața IT"
          subtitle={`${data?.totalJobsAnalyzed ? data.totalJobsAnalyzed.toLocaleString() : '...'} poziții analizate în România`}
          actions={
            <>
              <button
                onClick={() => fetchInsights()}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-800 transition border border-neutral-200 cursor-pointer"
              >
                <RefreshCwIcon size={14} className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizează</span>
                <span className="sm:hidden sr-only">Actualizează</span>
              </button>
              {onNavigateToJobSearch && (
                <button
                  onClick={onNavigateToJobSearch}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white transition cursor-pointer"
                >
                  <SearchIcon size={14} className="w-3.5 h-3.5 text-white" />
                  <span className="hidden sm:inline">Joburi</span>
                  <span className="sm:hidden sr-only">Joburi</span>
                </button>
              )}
              {onNavigateToSkillRoadmap && (
                <button
                  onClick={onNavigateToSkillRoadmap}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 transition cursor-pointer"
                >
                  <SparklesIcon size={14} className="w-3.5 h-3.5 text-brand-500" />
                  <span className="hidden sm:inline">Roadmap</span>
                  <span className="sm:hidden sr-only">Roadmap</span>
                </button>
              )}
            </>
          }
        />
      </Card>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card padding="p-4 sm:p-5" className="space-y-1">
          <p className="text-xs text-neutral-500">Poziții analizate</p>
          <p className="font-serif text-3xl text-neutral-950 tabular-nums">{data ? data.totalJobsAnalyzed?.toLocaleString() : '...'}</p>
          <p className="text-xs text-neutral-500">
            {locationFilter === 'BUCURESTI' ? 'București' : locationFilter === 'RO_ONLY' ? 'Toată România' : locationFilter === 'RO_AND_REMOTE' ? 'România și remote' : 'Toate locațiile'}
          </p>
        </Card>

        <Card padding="p-4 sm:p-5" className="space-y-1">
          <p className="text-xs text-neutral-500">Junior și intern</p>
          <p className="font-serif text-3xl text-neutral-950 tabular-nums">{data ? data.totalJuniorJobs?.toLocaleString() : '...'}</p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${data && data.totalJobsAnalyzed > 0 ? (data.totalJuniorJobs * 100) / data.totalJobsAnalyzed : 25}%` }}
              />
            </div>
            <span className="text-xs text-neutral-500 tabular-nums">
              {data && data.totalJobsAnalyzed > 0 ? `${Math.round((data.totalJuniorJobs * 100) / data.totalJobsAnalyzed)}%` : ''}
            </span>
          </div>
        </Card>

        <Card padding="p-4 sm:p-5" className="space-y-1">
          <p className="text-xs text-neutral-500">Competiție redusă</p>
          <p className="font-serif text-3xl text-neutral-950 tabular-nums">{data ? `${data.overallLowCompetitionPct}%` : '...'}</p>
        </Card>

        <Card padding="p-4 sm:p-5" className="space-y-1">
          <p className="text-xs text-neutral-500">Specializări IT</p>
          <p className="font-serif text-3xl text-neutral-950 tabular-nums">{data?.domains ? data.domains.length : '13'}</p>
        </Card>
      </section>

      <Card as="section" padding="p-4 sm:p-5" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs text-neutral-500 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Nivel
            </span>
            <div role="group" aria-label="Nivel" className="flex p-1 bg-neutral-100 rounded-xl w-full overflow-x-auto gap-1">
              {[
                { id: 'JUNIOR', label: 'Junior' },
                { id: 'MID', label: 'Mid' },
                { id: 'SENIOR', label: 'Senior' },
                { id: 'ALL', label: 'Toate' }
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => setLevelFilter(lvl.id)}
                  aria-pressed={levelFilter === lvl.id}
                  className={`flex-1 min-w-[72px] py-2 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap text-center ${
                    levelFilter === lvl.id
                      ? 'bg-white text-brand-700'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Zonă
            </span>
            <div role="group" aria-label="Zonă" className="flex p-1 bg-neutral-100 rounded-xl w-full overflow-x-auto gap-1">
              {[
                { id: 'RO_ONLY', label: 'România', icon: MapPin },
                { id: 'BUCURESTI', label: 'București', icon: Building2 },
                { id: 'RO_AND_REMOTE', label: 'România + remote', icon: Globe },
                { id: 'ALL', label: 'Toate', icon: Compass }
              ].map(loc => {
                const LocIcon = loc.icon;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setLocationFilter(loc.id)}
                    aria-pressed={locationFilter === loc.id}
                    className={`flex-1 min-w-[72px] py-2 px-3 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
                      locationFilter === loc.id
                        ? 'bg-white text-brand-700'
                        : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    <LocIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{loc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-100 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <SearchIcon size={15} className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Caută domeniu sau tehnologie"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută domeniu sau tehnologie"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 cursor-pointer p-1"
                title="Șterge căutarea"
                aria-label="Șterge căutarea"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 justify-between sm:justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sortare"
              className="text-sm bg-white border border-neutral-200 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="OPPORTUNITY">Scor de oportunitate</option>
              <option value="LOW_COMP">Competiție redusă</option>
              <option value="VOLUME">Cerere</option>
              <option value="NAME">Alfabetic</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-neutral-300 accent-brand-500 h-4 w-4 cursor-pointer"
              />
              <span>Doar active</span>
            </label>
          </div>
        </div>
      </Card>

      {data && !loading && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'sweet', title: 'Cel mai bun raport', icon: Target, list: data.topSweetSpots, value: (spot) => `${spot.opportunityScore}/100` },
            { key: 'lowcomp', title: 'Competiție redusă', icon: ShieldCheck, list: data.lowestCompetition, value: (spot) => `${spot.lowCompetitionRate}%` },
            { key: 'demand', title: 'Cerere maximă', icon: Flame, list: data.mostInDemand, value: (spot) => `${spot.levelJobCount} joburi` },
          ].filter((track) => track.list?.length > 0).map((track) => {
            const TrackIcon = track.icon;
            return (
              <Card key={track.key} className="space-y-3">
                <h3 className="font-sans text-sm font-medium text-neutral-950 flex items-center gap-2">
                  <TrackIcon className="w-4 h-4 text-brand-500" />
                  {track.title}
                </h3>
                <div className="space-y-1.5">
                  {track.list?.slice(0, 3).map((spot, i) => (
                    <button
                      type="button"
                      key={spot.id}
                      onClick={() => { setSelectedDomain(spot); setModalTab('requirements'); }}
                      className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 hover:bg-brand-50 transition cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-brand-50 text-brand-700 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-sm text-neutral-900 truncate">{spot.title}</span>
                      </span>
                      <span className="text-xs font-medium text-neutral-700 tabular-nums shrink-0">{track.value(spot)}</span>
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {data?.universalTopSkills && data.universalTopSkills.length > 0 && (
        <Card as="section" padding="p-5" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans text-sm font-medium text-neutral-950 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-500" />
              Competențe cerute
            </h2>
            <span className="text-xs text-neutral-500">Top {Math.min(16, data.universalTopSkills.length)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.universalTopSkills.slice(0, 16).map((sk) => (
              <span
                key={sk.skill}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${sk.userHasSkill ? 'bg-brand-50 text-brand-700' : 'bg-neutral-100 text-neutral-800'}`}
              >
                {sk.userHasSkill && <CheckCircle2Icon size={13} className="w-3.5 h-3.5 shrink-0" />}
                <span className="font-medium">{sk.skill}</span>
                <span className="tabular-nums text-neutral-500">{sk.percentage}%</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-medium text-neutral-950">
            Specializări <span className="text-neutral-400 text-base">({filteredDomains.length})</span>
          </h2>
        </div>

        {loading ? (
          <Card className="py-16 text-center space-y-3" role="status">
            <RefreshCwIcon size={28} className="w-7 h-7 text-brand-500 animate-spin mx-auto" />
            <p className="text-sm text-neutral-700">Se actualizează datele pieței</p>
          </Card>
        ) : filteredDomains.length === 0 ? (
          <Card className="py-14 text-center space-y-3">
            <Info className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-sm text-neutral-900">Nicio specializare pentru filtrele alese.</p>
            <button
              onClick={() => { setSearchQuery(''); setLevelFilter('JUNIOR'); setLocationFilter('RO_ONLY'); setActiveOnly(false); }}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium rounded-xl transition cursor-pointer"
            >
              Resetează filtrele
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDomains.map((domain) => {
              const IconComp = DOMAIN_ICONS[domain.id] || Code;
              const compInfo = getCompBadge(domain.lowCompetitionRate);

              return (
                <Card
                  key={domain.id}
                  data-domain-card={domain.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Detalii ${domain.title}`}
                  onClick={() => { setSelectedDomain(domain); setModalTab('requirements'); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDomain(domain);
                      setModalTab('requirements');
                    }
                  }}
                  className="hover:border-brand-300 transition-colors cursor-pointer flex flex-col gap-4 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-sans font-medium text-neutral-950 text-base leading-tight truncate">{domain.title}</h3>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{domain.tagLine}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md shrink-0 tabular-nums" title="Scor de oportunitate">
                      {domain.opportunityScore}
                    </span>
                  </div>

                  <dl className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-neutral-50 rounded-xl p-2">
                      <dt className="text-xs text-neutral-500">Poziții</dt>
                      <dd className="text-sm font-medium text-neutral-950 mt-0.5 tabular-nums">{domain.levelJobCount}</dd>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-2">
                      <dt className="text-xs text-neutral-500">Competiție</dt>
                      <dd className="text-xs font-medium text-neutral-950 mt-1">{compInfo.label.replace('Competiție ', '')}</dd>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-2 min-w-0">
                      <dt className="text-xs text-neutral-500">Salariu</dt>
                      <dd className="text-xs font-medium text-neutral-950 mt-1 truncate" title={domain.salaryEstimate || 'Conform pieței'}>
                        {domain.salaryEstimate || 'Piață IT'}
                      </dd>
                    </div>
                  </dl>

                  {domain.topSkills && domain.topSkills.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Potrivire cu CV-ul</span>
                        <span className="font-medium text-neutral-800 tabular-nums">
                          {domain.userMatchScore > 0
                            ? `${domain.userMatchScore}%`
                            : `${domain.userMatchingSkills?.length || 0}/${domain.topSkills.length}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {domain.topSkills.slice(0, 5).map((sk) => (
                          <span
                            key={sk.skill}
                            className={`text-xs px-2 py-0.5 rounded-md ${sk.userHasSkill ? 'bg-brand-50 text-brand-700 font-medium' : 'bg-neutral-100 text-neutral-700'}`}
                            title={sk.userHasSkill ? `${sk.skill}: detectat în profil` : `${sk.skill}: de adăugat`}
                          >
                            {sk.skill}
                          </span>
                        ))}
                        {domain.topSkills.length > 5 && (
                          <span className="text-xs text-neutral-500 px-1.5 py-0.5">+{domain.topSkills.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 mt-auto">
                    <div className="flex justify-between text-xs text-neutral-500 tabular-nums">
                      <span>Junior {domain.juniorJobs}</span>
                      <span>Mid {domain.midJobs}</span>
                      <span>Senior {domain.seniorJobs}</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden flex">
                      <div className="bg-brand-500 h-full" style={{ width: `${domain.totalJobs > 0 ? (domain.juniorJobs / domain.totalJobs) * 100 : 0}%` }} title={`Junior: ${domain.juniorJobs}`} />
                      <div className="bg-brand-300 h-full" style={{ width: `${domain.totalJobs > 0 ? (domain.midJobs / domain.totalJobs) * 100 : 0}%` }} title={`Mid: ${domain.midJobs}`} />
                      <div className="bg-brand-100 h-full" style={{ width: `${domain.totalJobs > 0 ? (domain.seniorJobs / domain.totalJobs) * 100 : 0}%` }} title={`Senior: ${domain.seniorJobs}`} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-medium text-brand-600">
                    <span>Detalii</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* COMPREHENSIVE DOMAIN DETAIL DOSSIER (MORPHING MODAL) */}
      {selectedDomain && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedDomain(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-neutral-950/40 backdrop-blur-sm animate-morphing-backdrop"
        >
          <div 
            role="dialog"
            aria-modal="true"
            aria-label={selectedDomain.title}
            className="bg-white rounded-2xl border border-neutral-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden animate-morphing-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-5 sm:p-6 border-b border-neutral-200 flex items-start justify-between bg-white shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  {(() => {
                    const IconComp = DOMAIN_ICONS[selectedDomain.id] || Code;
                    return <IconComp className="w-6 h-6" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl font-medium text-neutral-950 leading-snug">
                      {selectedDomain.title}
                    </h2>
                    <span className="text-xs  px-2.5 py-0.5 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-900 font-semibold">
                      {selectedDomain.opportunityBadge || 'Oportunitate IT'}
                    </span>
                    {selectedDomain.salaryEstimate && (
                      <span className="text-xs px-2.5 py-0.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-700">
                        {selectedDomain.salaryEstimate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl font-sans">
                    {selectedDomain.tagLine}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDomain(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer animate-morphing-close shrink-0"
                title="Închide" aria-label="Închide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL NAVIGATION TABS */}
            <div className="px-5 sm:px-6 border-b border-neutral-200 bg-neutral-50/70 flex gap-2 shrink-0 overflow-x-auto">
              {[
                { id: 'requirements', label: 'Cerințe & Match CV', icon: CheckCircle2 },
                { id: 'interview', label: 'Interviu & Senioritate', icon: Zap },
                { id: 'roadmap', label: 'Roadmap Pregătire', icon: Target },
                { id: 'sample_jobs', label: `Joburi Deschise (${selectedDomain.sampleJobs?.length || 0})`, icon: Briefcase }
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? 'border-brand-500 text-neutral-950 bg-white'
                        : 'border-transparent text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100/50'
                    }`}
                  >
                    <TabIcon className="w-4 h-4 shrink-0 text-neutral-700" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white animate-morphing-content">
              
              {/* TAB 1: REQUIREMENTS & CV MATCH */}
              {modalTab === 'requirements' && (
                <div className="space-y-5">
                  
                  {/* CV MATCH BILATERAL BREAKDOWN */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-neutral-950" />
                          <span>Potrivire cu CV-ul</span>
                        </h3>
                      </div>
                      {selectedDomain.userMatchScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">Potrivire</span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-950">
                            {selectedDomain.userMatchScore}%
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* COLUMN 1: WHAT YOU HAVE */}
                      <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-900  flex items-center gap-1.5">
                            <CheckCircle2Icon size={14} className="w-3.5 h-3.5 text-emerald-700" />
                            <span>În CV ({selectedDomain.userMatchingSkills?.length || 0})</span>
                          </span>
                        </div>

                        {selectedDomain.userMatchingSkills && selectedDomain.userMatchingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedDomain.userMatchingSkills.map((sk) => (
                              <span 
                                key={sk} 
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-neutral-900 border border-neutral-200 flex items-center gap-1.5"
                              >
                                <CheckIcon size={11} className="w-3 h-3 text-emerald-700 shrink-0" />
                                <span>{sk}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-500 italic pt-1">
                            Nicio competență detectată în CV.
                          </p>
                        )}
                      </div>

                      {/* COLUMN 2: WHAT IS MISSING */}
                      <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-900  flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-neutral-700" />
                            <span>De adăugat ({selectedDomain.userMissingSkills?.length || 0})</span>
                          </span>
                        </div>

                        {selectedDomain.userMissingSkills && selectedDomain.userMissingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {selectedDomain.userMissingSkills.map((sk) => (
                              <span 
                                key={sk} 
                                className="px-2.5 py-1 rounded-md text-xs font-medium bg-white text-neutral-800 border border-neutral-200 flex items-center gap-1.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                                <span>{sk}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-900 font-medium pt-1">
                            Excelent! Detii toate cerințele principale detectate în anunturile de angajare.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COMPLETE SKILLS FREQUENCY GRID */}
                  <div className="border-t border-neutral-100 pt-5 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold  text-neutral-600 tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-neutral-900" />
                        <span>Tehnologii cerute</span>
                      </h4>
                      <span className="text-[11px] text-neutral-500">
                        {selectedDomain.topSkills?.length || 0} tehnologii
                      </span>
                    </div>

                    {/* CATEGORY PILLS */}
                    {selectedDomain.topSkills && selectedDomain.topSkills.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 border-b border-neutral-100">
                        {SKILL_CATEGORIES.map((cat) => {
                          const countInCat = cat.id === 'ALL'
                            ? selectedDomain.topSkills.length
                            : selectedDomain.topSkills.filter(s => s.category === cat.id).length;
                          if (countInCat === 0 && cat.id !== 'ALL') return null;
                          const active = modalSkillCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setModalSkillCategory(cat.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                                active
                                  ? 'bg-brand-500 text-white border-brand-500 font-semibold'
                                  : 'bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                              }`}
                            >
                              <span>{cat.label}</span>
                              <span className={`text-[10px] px-1 rounded ${active ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
                                {countInCat}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {selectedDomain.topSkills
                        ?.filter(sk => modalSkillCategory === 'ALL' || sk.category === modalSkillCategory)
                        .map((sk) => (
                          <div 
                            key={sk.skill} 
                            className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                              sk.userHasSkill 
                                ? 'bg-neutral-50/80 border-neutral-300' 
                                : 'bg-white border-neutral-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-semibold text-neutral-900 gap-1">
                                <span className="truncate" title={sk.skill}>{sk.skill}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${
                                  sk.userHasSkill 
                                    ? 'bg-brand-500 text-white' 
                                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                }`}>
                                  {sk.userHasSkill ? (
                                    <>
                                      <CheckIcon size={10} className="w-2.5 h-2.5 text-white" />
                                      <span>În CV</span>
                                    </>
                                  ) : (
                                    <span>De învățat</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                                <span>{sk.category || 'General'}</span>
                                <span className="font-semibold text-neutral-950">{sk.percentage}% din anunțuri</span>
                              </div>
                            </div>
                            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                              <div 
                                className="h-full rounded-full bg-brand-500" 
                                style={{ width: `${Math.min(100, Math.max(8, sk.percentage))}%` }} 
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 mt-1">{sk.count} poziții</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* STRUCTURED REQUIREMENTS CATEGORIES */}
                  {selectedDomain.requirementsChecklist && selectedDomain.requirementsChecklist.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDomain.requirementsChecklist.map((cat, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                            <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                            <h4>{cat.categoryName}</h4>
                          </div>
                          <ul className="space-y-2">
                            {cat.items?.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-xs text-neutral-700 flex items-start gap-2 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: INTERVIEW PROCESS & SENIORITY EXPECTATIONS */}
              {modalTab === 'interview' && (
                <div className="space-y-5">
                  
                  {/* INTERVIEW FORMAT IN ROMANIA */}
                  {selectedDomain.interviewFormat && (
                    <div className="bg-neutral-50/70 border border-neutral-200 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neutral-950" />
                        <h3 className="text-xs font-medium text-neutral-900">
                          Proces de recrutare
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans">
                        {selectedDomain.interviewFormat}
                      </p>
                    </div>
                  )}

                  {/* SENIORITY EXPECTATIONS COMPARISON */}
                  {selectedDomain.seniorityComparison && (
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-neutral-950" />
                          <span>Așteptări pe nivel</span>
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        
                        {/* JUNIOR FOCUS */}
                        <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
                            <span className="text-xs font-semibold  text-neutral-950">Junior & Intern</span>
                            <span className="text-[10px] text-neutral-500">0 - 2 ani</span>
                          </div>
                          <ul className="space-y-2 text-xs text-neutral-700">
                            {(selectedDomain.seniorityComparison.juniorFocus || [
                              'Fundamente algoritmice solide',
                              'Scriere cod curat și respectare conventii',
                              'Lucru fluent cu Git și Pull Requests',
                              'Curiozitate și proiecte practice pe GitHub'
                            ]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckIcon size={12} className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* MID FOCUS */}
                        <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
                            <span className="text-xs font-semibold  text-neutral-950">Mid-Level</span>
                            <span className="text-[10px] text-neutral-500">2 - 5 ani</span>
                          </div>
                          <ul className="space-y-2 text-xs text-neutral-700">
                            {(selectedDomain.seniorityComparison.midFocus || [
                              'Autonomie în livrarea modulelor complete',
                              'Design modular și alegere de structuri optime',
                              'Testare automata integrata (unit/integration)',
                              'Intelegerea constrangerilor de performanta'
                            ]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckIcon size={12} className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* SENIOR FOCUS */}
                        <div className="bg-neutral-50 p-4 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between pb-1 border-b border-neutral-200/60">
                            <span className="text-xs font-semibold  text-neutral-950">Senior & Lead</span>
                            <span className="text-[10px] text-neutral-500">5+ ani</span>
                          </div>
                          <ul className="space-y-2 text-xs text-neutral-700">
                            {(selectedDomain.seniorityComparison.seniorFocus || [
                              'Arhitectura de sistem și analiza trade-offs',
                              'Identificare și rezolvare bottlenecks majore',
                              'Definire standarde tehnice și code review',
                              'Mentorat tehnic și ghidare de echipă'
                            ]).map((item, i) => (
                              <li key={i} className="flex items-start gap-2 leading-relaxed">
                                <CheckIcon size={12} className="w-3.5 h-3.5 text-neutral-950 shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: STEP-BY-STEP ROADMAP */}
              {modalTab === 'roadmap' && (
                <div className="space-y-5">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-950 flex items-center gap-2">
                          <Target className="w-4 h-4 text-neutral-950" />
                          <span>Plan de pregătire</span>
                        </h3>
                      </div>

                      {onNavigateToSkillRoadmap && (
                        <button
                          onClick={() => {
                            setSelectedDomain(null);
                            onNavigateToSkillRoadmap();
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition cursor-pointer active:scale-95"
                        >
                          <SparklesIcon size={14} className="w-3.5 h-3.5 text-amber-300" />
                          <span>Deschide Studio-ul de Roadmap</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      {(selectedDomain.preparationRoadmap || [
                        { stageNumber: 1, stageTitle: 'Fundamente Teoretice & Limbaj de Baza', durationEst: '1 - 1.5 Luni', keyMilestones: ['Stapanire sintaxa și paradigme de programare', 'Structuri de date esențiale și analiza complexității', 'Probleme de logica pe platforme tehnice'] },
                        { stageNumber: 2, stageTitle: 'Baze de Date, SQL & Versionare Git', durationEst: '1 Luna', keyMilestones: ['Interogari SQL și modelare relationala', 'Workflow profesional Git (Branches, PRs, Rebase)', 'Concepte arhitecturale fundamentale'] },
                        { stageNumber: 3, stageTitle: 'Dezvoltare de Proiecte Practice End-to-End', durationEst: '1.5 Luni', keyMilestones: ['Implementare API RESTful complet', 'Teste automate și containerizare Docker', 'Documentatie README profesionala'] },
                        { stageNumber: 4, stageTitle: 'Pregătire Interviu Tehnic & Portofoliu', durationEst: '1 Luna', keyMilestones: ['Simulari de interviu algoritmic sub timp', 'Exersare scenarii de System Design de baza', 'Optimizare CV tehnic și profil LinkedIn'] }
                      ]).map((stage) => (
                        <div 
                          key={stage.stageNumber}
                          className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 hover:bg-white transition space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-brand-500 text-white font-semibold text-xs flex items-center justify-center">
                                {stage.stageNumber}
                              </span>
                              <h4 className="font-semibold text-xs sm:text-sm text-neutral-950 font-sans">
                                {stage.stageTitle}
                              </h4>
                            </div>
                            <span className="text-[11px] text-neutral-600 font-semibold px-2 py-0.5 rounded bg-white border border-neutral-200">
                              {stage.durationEst}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pl-8.5">
                            {stage.keyMilestones?.map((ms, msIdx) => (
                              <span 
                                key={msIdx} 
                                className="text-xs text-neutral-700 bg-white border border-neutral-200/80 px-2.5 py-1 rounded-md flex items-center gap-1.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                                <span>{ms}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SAMPLE ACTIVE JOBS */}
              {modalTab === 'sample_jobs' && (
                <div className="space-y-4">
                  
                  {/* DIRECT SEARCH BANNER */}
                  <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-950  flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neutral-950" />
                        <span>Joburi deschise ({locationFilter === 'BUCURESTI' ? 'București' : locationFilter === 'RO_ONLY' ? 'România' : locationFilter === 'RO_AND_REMOTE' ? 'România & Remote' : 'Toate'})</span>
                      </h4>
                    </div>

                    {onNavigateToJobSearch && (
                      <button
                        onClick={() => {
                          setSelectedDomain(null);
                          onNavigateToJobSearch();
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition cursor-pointer active:scale-95"
                      >
                        <SearchIcon size={14} className="w-3.5 h-3.5 text-white" />
                        <span>Caută în toate joburile</span>
                      </button>
                    )}
                  </div>

                  {selectedDomain.sampleJobs && selectedDomain.sampleJobs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedDomain.sampleJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="bg-white p-4.5 rounded-2xl border border-neutral-200 hover:border-brand-500 transition flex flex-col justify-between text-neutral-900 space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold  text-neutral-600 truncate">
                                {job.companyName}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-neutral-200 bg-neutral-100 text-neutral-800">
                                {job.sourcePlatform}
                              </span>
                            </div>

                            <h4 className="font-semibold text-sm text-neutral-950 leading-snug line-clamp-2" title={job.jobTitle}>
                              {job.jobTitle}
                            </h4>

                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 flex-wrap pt-0.5">
                              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                                <MapPin className="w-3 h-3 text-neutral-500" />
                                <span>{job.location || 'Romania'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md">
                                <Briefcase className="w-3 h-3 text-neutral-500" />
                                <span>{job.workModel || 'Hibrid'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold text-neutral-950 bg-neutral-100 border border-neutral-300 px-2 py-0.5 rounded-md">
                                <span>{job.experienceLevel || 'JUNIOR'}</span>
                              </span>
                            </div>

                            {job.salaryRange && (
                              <p className="text-[11px] text-neutral-500 pt-0.5">
                                {job.salaryRange}
                              </p>
                            )}
                          </div>

                          {job.directApplyUrl && (
                            <div className="pt-2.5 border-t border-neutral-100">
                              <a
                                href={job.directApplyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition cursor-pointer active:scale-95"
                              >
                                <ExternalLinkIcon size={13} className="w-3.5 h-3.5 text-white" />
                                <span>Aplică pe {job.sourcePlatform}</span>
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl space-y-3">
                      <p className="text-xs text-neutral-600">
                        Niciun job pentru filtrul ales.
                      </p>
                      <button
                        onClick={() => setLocationFilter('RO_AND_REMOTE')}
                        className="px-4 py-2 bg-brand-500 text-white text-xs font-semibold rounded-xl hover:bg-brand-600 transition cursor-pointer"
                      >
                        Include remote
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-neutral-500">
                {selectedDomain.totalJobs} poziții: {selectedDomain.juniorJobs} Junior, {selectedDomain.midJobs} Mid, {selectedDomain.seniorJobs} Senior
              </span>
              <button
                onClick={() => setSelectedDomain(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-xl transition cursor-pointer border border-neutral-200 active:scale-95"
              >
                Închide
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
