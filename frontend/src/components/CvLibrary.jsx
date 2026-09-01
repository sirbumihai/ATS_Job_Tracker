import React, { useState, useEffect } from 'react';
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
  Sparkles, 
  RefreshCw,
  ExternalLink,
  ChevronRight
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
        showNotification(`CV-ul "${created.title}" a fost creat cu succes!`);
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
    if (!window.confirm(`Sigur dorești să ștergi CV-ul "${cvTitle}"?`)) return;
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
        showNotification('CV-ul a fost setat ca versiune principală implicită.');
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-gray-900">
      
      {/* ACTION NOTIFICATION PILL */}
      {actionMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* HEADER & CONTROLS TOOLBAR */}
      <div className="bg-white border border-gray-200/90 shadow-sm p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-xl shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight flex items-center gap-2">
                CV-urile Mele (CV Library)
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Gestionează și personalizează multiple versiuni de CV adaptate pentru fiecare domeniu și rol.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Creează CV Nou
            </button>
          </div>
        </div>

        {/* SEARCH BAR & COUNTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Caută în CV-urile tale..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:bg-white transition"
            />
          </div>

          <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
            <span>Total: <strong>{cvList.length}</strong> {cvList.length === 1 ? 'CV' : 'CV-uri'} salvate</span>
          </div>
        </div>
      </div>

      {/* CV CARDS GRID */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-900" />
          <span className="text-xs font-semibold">Se încarcă CV-urile...</span>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredList.map((cv) => (
            <div 
              key={cv.id}
              onClick={() => onEditCvInStudio && onEditCvInStudio(cv.id)}
              className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              
              {/* CARD TOP INFO */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-gray-950 group-hover:text-black transition">
                        {cv.title || "CV Fără Titlu"}
                      </h3>
                      {cv.isPrimary && (
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-2xs">
                          <Star className="w-2.5 h-2.5 fill-current" /> Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      {cv.fullName || "Fără Nume"}
                    </p>
                  </div>

                  {/* QUICK MENU ACTIONS */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    {!cv.isPrimary && (
                      <button
                        onClick={(e) => handleSetPrimary(cv.id, e)}
                        title="Setează ca principal"
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500 transition cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDuplicateCv(cv.id, e)}
                      title="Duplică acest CV"
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCv(cv.id, cv.title, e)}
                      title="Șterge CV-ul"
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SUMMARY SNIPPET */}
                {cv.summary && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {cv.summary}
                  </p>
                )}

                {/* SKILLS PILLS */}
                {cv.skillsLanguages && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cv.skillsLanguages.split(',').slice(0, 4).map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-md">
                        {skill.trim()}
                      </span>
                    ))}
                    {cv.skillsLanguages.split(',').length > 4 && (
                      <span className="text-[10px] text-gray-400 font-medium self-center">
                        +{cv.skillsLanguages.split(',').length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* CARD FOOTER WITH TIMESTAMP & EDIT BUTTON */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{cv.updatedAt ? new Date(cv.updatedAt).toLocaleDateString('ro-RO') : 'Recent'}</span>
                </div>

                <button
                  onClick={() => onEditCvInStudio && onEditCvInStudio(cv.id)}
                  className="px-3 py-1.5 bg-gray-100 group-hover:bg-black text-gray-800 group-hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editează în Studio</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-gray-900">Nu ai niciun CV salvat încă</h3>
            <p className="text-xs text-gray-500 mt-1">
              Creează primul tău CV sau editează un șablon pentru a începe să personalizezi aplicările.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Creează Primul CV
          </button>
        </div>
      )}

      {/* CREATE NEW CV MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-950 flex items-center gap-2">
                <Plus className="w-4 h-4 text-black" />
                Creează o Versiune Nouă de CV
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-black text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Denumire Versiune CV *
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Java Backend Developer, Full Stack Engineer..."
                  value={newCvTitle}
                  onChange={e => setNewCvTitle(e.target.value)}
                  autoFocus
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Poți crea versiuni specifice pentru diferite domenii, companii sau tehnologii.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Anulează
              </button>
              <button
                onClick={handleCreateCv}
                disabled={creatingNew || !newCvTitle.trim()}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {creatingNew ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{creatingNew ? 'Se creează...' : 'Creează și Editează'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
