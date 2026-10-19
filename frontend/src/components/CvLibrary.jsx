import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Modal from './ui/Modal';
import {
  FileText,
  Plus,
  Search,
  Copy,
  Trash2,
  Star,
  Edit3,
  CheckCircle2,
  Clock,
  Upload,
  RefreshCw,
  X
} from 'lucide-react';

export default function CvLibrary({ 
  currentUser, 
  onEditCvInStudio,
  onNavigateToStudio
}) {
  const [cvList, setCvList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newCvTitle, setNewCvTitle] = useState('');
  const [importingPdf, setImportingPdf] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const DEFAULT_USER_ID = '23fe8bdd-08f4-413d-9985-f99c21040b59';
  const activeUserId = currentUser?.userId || currentUser?.id || DEFAULT_USER_ID;

  // LOAD ALL CV PROFILES FOR USER
  const fetchCvProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/cv/list', {
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const data = await res.json();
        setCvList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Eroare la incarcarea listei de CV-uri:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCvProfiles();
  }, [activeUserId]);

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // IMPORT CV FROM PDF / WORD FILE
  const handleImportCv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeUserId) {
      alert("Autentifică-te înainte să încarci un CV.");
      return;
    }

    setImportingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/resumes', {
        method: 'POST',
        headers: { 'X-User-Id': activeUserId },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        await fetchCvProfiles();
        const createdCvId = data?.parsedProfile?.id;
        showNotification(`CV-ul "${file.name}" a fost importat.`);
        if (createdCvId && onEditCvInStudio) {
          onEditCvInStudio(createdCvId);
        }
      } else {
        alert("Importul fișierului a eșuat. Încearcă din nou.");
      }
    } catch (err) {
      console.error("Eroare la importarea CV-ului:", err);
      alert("Eroare de conexiune cu serverul.");
    } finally {
      setImportingPdf(false);
      if (e.target) e.target.value = '';
    }
  };

  // CREATE NEW CV PROFILE
  const handleCreateCv = async () => {
    if (!newCvTitle.trim()) return;
    setCreatingNew(true);
    try {
      const newCvData = {
        title: newCvTitle.trim(),
        isPrimary: cvList.length === 0,
        fullName: currentUser?.fullName || "Jake Ryan",
        email: currentUser?.email || "jake@su.edu",
        phone: "123-456-7890",
        location: "Georgetown, TX",
        linkedin: "https://linkedin.com/in/jake",
        github: "https://github.com/jake",
        summary: "Computer Science graduate with hands-on software engineering internship experience in building high-performance full-stack web applications and robust REST APIs. Proficient in Java, Spring Boot, React, and cloud workflows with a passion for clean code and scalable architecture.",
        skillsLanguages: "Java, Python, C/C++, SQL (PostgreSQL), JavaScript, TypeScript, HTML/CSS",
        skillsFrameworks: "Spring Boot, React, Node.js, Express, Flask, Tailwind CSS",
        skillsDatabases: "pandas, NumPy, Matplotlib, JUnit, Mockito, Jest",
        skillsDevops: "Git, Docker, Linux, Postman, AWS, VS Code, GitHub Actions",
        workExperienceJson: JSON.stringify([
          {
            id: 1,
            role: "Software Engineering Intern",
            company: "Under Armour",
            period: "June 2020 – August 2020",
            location: "Austin, TX",
            bullets: [
              "Architected and deployed RESTful microservices using Java, Spring Boot, and PostgreSQL, reducing query latency by 20% across high-traffic endpoints.",
              "Collaborated with cross-functional engineering teams in an Agile environment to build scalable data pipelines with 95%+ unit test coverage using JUnit and Mockito.",
              "Optimized database indexes and query plans, achieving sub-second response times for catalog search queries serving 100,000+ daily active users."
            ]
          },
          {
            id: 2,
            role: "Teaching Assistant – Computer Science",
            company: "Southwestern University",
            period: "August 2019 – May 2020",
            location: "Georgetown, TX",
            bullets: [
              "Facilitated weekly lab sessions and debugged code for 50+ undergraduate students in Object-Oriented Programming and Data Structures (Java & C++).",
              "Conducted office hours and code reviews, providing detailed technical feedback on algorithm design, time complexity, and clean code practices."
            ]
          }
        ]),
        projectsJson: JSON.stringify([
          {
            id: 1,
            title: "Git CLI Automation Tool",
            techStack: "Python, Click, Git, REST API",
            period: "June 2020 – July 2020",
            linkUrl: "https://github.com/jake/git-cli",
            linkText: "github.com/jake/git-cli",
            bullets: [
              "Engineered an automated command-line developer tool using Python and Click to streamline multi-repository branch management and PR verification.",
              "Integrated GitHub Webhook events and REST APIs to trigger automated CI/CD builds, saving engineering teams 3+ manual deployment hours per week."
            ]
          },
          {
            id: 2,
            title: "E-Commerce Web Application",
            techStack: "React, Node.js, Express, PostgreSQL, Tailwind CSS",
            period: "January 2020 – May 2020",
            linkUrl: "https://github.com/jake/shop-app",
            linkText: "github.com/jake/shop-app",
            bullets: [
              "Architected a scalable full-stack e-commerce web application with product search, filtering, JWT authentication, and secure Stripe checkout integration.",
              "Optimized frontend performance and bundle size by 35% using React code-splitting and memoization, achieving a 98/100 Google Lighthouse score."
            ]
          }
        ]),
        educationJson: JSON.stringify([
          {
            id: 1,
            school: "Southwestern University",
            degree: "Bachelor of Arts in Computer Science, Minor in Business",
            period: "Aug. 2018 – May 2021",
            location: "Georgetown, TX",
            bullets: [
              "GPA: 3.9 / 4.0",
              "Relevant Coursework: Data Structures & Algorithms, Object-Oriented Programming, Database Systems, Computer Systems, Software Engineering."
            ]
          }
        ]),
        languagePreference: "EN"
      };

      const res = await fetch('/api/v1/cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': activeUserId
        },
        body: JSON.stringify(newCvData)
      });

      if (res.ok) {
        const created = await res.json();
        setShowCreateModal(false);
        setNewCvTitle('');
        await fetchCvProfiles();
        showNotification(`CV-ul "${created.title}" a fost creat.`);
        if (onEditCvInStudio) {
          onEditCvInStudio(created.id);
        }
      }
    } catch (err) {
      console.error('Eroare la crearea CV-ului:', err);
    } finally {
      setCreatingNew(false);
    }
  };

  // DUPLICATE CV
  const handleDuplicateCv = async (cvId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/cv/${cvId}/duplicate`, {
        method: 'POST',
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        const cloned = await res.json();
        await fetchCvProfiles();
        showNotification(`CV-ul a fost duplicat: "${cloned.title}"`);
      }
    } catch (err) {
      console.error('Eroare la duplicarea CV-ului:', err);
    }
  };

  // DELETE CV
  const handleDeleteCv = async (cvId, cvTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Sigur vrei să ștergi CV-ul "${cvTitle}"?`)) return;
    try {
      const res = await fetch(`/api/v1/cv/${cvId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        await fetchCvProfiles();
        showNotification(`CV-ul "${cvTitle}" a fost șters.`);
      }
    } catch (err) {
      console.error('Eroare la stergerea CV-ului:', err);
    }
  };

  // SET PRIMARY CV
  const handleSetPrimary = async (cvId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/cv/${cvId}/primary`, {
        method: 'PATCH',
        headers: { 'X-User-Id': activeUserId }
      });
      if (res.ok) {
        await fetchCvProfiles();
        showNotification('CV-ul este acum CV-ul principal.');
      }
    } catch (err) {
      console.error('Eroare la setarea CV-ului principal:', err);
    }
  };

  const filteredList = cvList.filter(cv => 
    (cv.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cv.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cv.summary || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const secondaryBtn = 'px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-xl font-medium text-xs flex items-center gap-1.5 transition cursor-pointer';
  const primaryBtn = 'px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50';
  const importLabel = (
    <label className={secondaryBtn}>
      {importingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      <span>{importingPdf ? 'Se importă...' : 'Importă CV'}</span>
      <input
        type="file"
        accept=".pdf,.docx,.doc"
        aria-label="Fișier CV pentru import"
        onChange={handleImportCv}
        disabled={importingPdf}
        className="hidden"
      />
    </label>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-neutral-900">
      {actionMessage && (
        <div role="status" className="fixed top-20 right-6 z-50 bg-brand-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      <Card padding="px-4 py-3" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Caută în CV-uri"
              placeholder="Caută în CV-uri"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-500 transition"
            />
          </div>
          <span className="text-xs text-neutral-500 whitespace-nowrap hidden sm:inline">
            {cvList.length} {cvList.length === 1 ? 'versiune' : 'versiuni'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {importLabel}
          <button onClick={() => setShowCreateModal(true)} className={primaryBtn}>
            <Plus className="w-4 h-4" />
            CV nou
          </button>
        </div>
      </Card>

      {loading ? (
        <div role="status" className="py-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
          <span className="text-xs">Se încarcă CV-urile</span>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredList.map((cv) => (
            <Card key={cv.id} data-cv-card={cv.id} className="flex flex-col justify-between gap-4 hover:border-brand-300 transition-colors">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-sans font-medium text-base text-neutral-950">{cv.title || 'CV fără titlu'}</h3>
                      {cv.isPrimary && (
                        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Principal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500">{cv.fullName || 'Fără nume'}</p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {!cv.isPrimary && (
                      <button
                        onClick={(e) => handleSetPrimary(cv.id, e)}
                        title="Setează ca principal"
                        aria-label={`Setează ${cv.title} ca principal`}
                        className="p-1.5 rounded-lg hover:bg-brand-50 text-neutral-400 hover:text-brand-600 transition cursor-pointer"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDuplicateCv(cv.id, e)}
                      title="Duplică"
                      aria-label={`Duplică ${cv.title}`}
                      className="p-1.5 rounded-lg hover:bg-brand-50 text-neutral-400 hover:text-brand-600 transition cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCv(cv.id, cv.title, e)}
                      title="Șterge"
                      aria-label={`Șterge ${cv.title}`}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {cv.summary && (
                  <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">{cv.summary}</p>
                )}

                {cv.skillsLanguages && (
                  <div className="flex flex-wrap gap-1.5">
                    {cv.skillsLanguages.split(',').slice(0, 4).map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-xs rounded-md">
                        {skill.trim()}
                      </span>
                    ))}
                    {cv.skillsLanguages.split(',').length > 4 && (
                      <span className="text-xs text-neutral-400 self-center">+{cv.skillsLanguages.split(',').length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-xs text-neutral-400">
                  <Clock className="w-3 h-3" />
                  {cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString('ro-RO') : 'Recent'}
                </span>
                <button
                  onClick={() => onEditCvInStudio && onEditCvInStudio(cv.id)}
                  className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editează</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center space-y-4">
          <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-sans text-base font-medium text-neutral-900">Niciun CV salvat</h3>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {importLabel}
            <button onClick={() => setShowCreateModal(true)} className={primaryBtn}>
              <Plus className="w-4 h-4" />
              Creează primul CV
            </button>
          </div>
        </Card>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="CV nou"
        icon={Plus}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="new-cv-title" className="block text-xs font-medium text-neutral-700 mb-1.5">Denumire</label>
            <input
              id="new-cv-title"
              type="text"
              placeholder="Ex: Java Backend Developer"
              value={newCvTitle}
              onChange={e => setNewCvTitle(e.target.value)}
              autoFocus
              className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100">
            <span className="text-sm text-neutral-700">Sau pornește de la un fișier</span>
            <label className={`${secondaryBtn} shrink-0`}>
              <Upload className="w-3.5 h-3.5" />
              <span>Importă</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                aria-label="Fișier CV pentru import"
                onChange={(e) => {
                  setShowCreateModal(false);
                  handleImportCv(e);
                }}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <button onClick={() => setShowCreateModal(false)} className={secondaryBtn}>
              Anulează
            </button>
            <button onClick={handleCreateCv} disabled={creatingNew || !newCvTitle.trim()} className={primaryBtn}>
              {creatingNew ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{creatingNew ? 'Se creează...' : 'Creează și editează'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
