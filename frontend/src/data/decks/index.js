// Master Registry si Aggregator pentru toate cele 10 Decks de Flashcards Stil Anki
// Preluat din repozitorii GitHub de top (Baeldung, DopplerHQ, sudheerj, donnemartin, devops-exercises, AIMLInterviews, RefactoringGuru)
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

import { JAVA_DECK } from './javaDeck.js';
import { SPRING_DECK } from './springDeck.js';
import { SQL_DECK } from './sqlDeck.js';
import { SYSTEM_DESIGN_DECK } from './systemDesignDeck.js';
import { TESTING_DECK } from './testingDeck.js';
import { REACT_DECK } from './reactDeck.js';
import { DEVOPS_DECK } from './devopsDeck.js';
import { CLOUD_DECK } from './cloudDeck.js';
import { ML_AI_DECK } from './mlAiDeck.js';
import { DESIGN_PATTERNS_DECK } from './designPatternsDeck.js';

// Categorii oficiale cu metadata, iconite si culori
export const TECH_ANKI_CATEGORIES = [
  { id: 'ALL', label: 'Toate Domeniile', icon: 'Layers', badgeColor: 'bg-gray-100 text-gray-800' },
  { id: 'JAVA', label: 'Java Core & JVM', icon: 'Coffee', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'SPRING', label: 'Spring Boot & JPA', icon: 'Leaf', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'SQL', label: 'SQL, Indecsi & Postgres', icon: 'Database', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'SYSTEM_DESIGN', label: 'System Design & Scalare', icon: 'Server', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'TESTING', label: 'Testare (JUnit & Mockito)', icon: 'CheckCircle', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'REACT', label: 'React & Frontend', icon: 'Layout', badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { id: 'DEVOPS', label: 'DevOps & Docker/K8s', icon: 'Cpu', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'CLOUD', label: 'Cloud (AWS & Terraform)', icon: 'Cloud', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'ML_AI', label: 'Machine Learning & AI', icon: 'Sparkles', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'DESIGN_PATTERNS', label: 'Design Patterns & Clean Code', icon: 'Shapes', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' }
];

// Agregare unificata a tuturor cardurilor
export const ALL_TECH_ANKI_CARDS = [
  ...JAVA_DECK,
  ...SPRING_DECK,
  ...SQL_DECK,
  ...SYSTEM_DESIGN_DECK,
  ...TESTING_DECK,
  ...REACT_DECK,
  ...DEVOPS_DECK,
  ...CLOUD_DECK,
  ...ML_AI_DECK,
  ...DESIGN_PATTERNS_DECK
];

// Export separat pe pachete daca este nevoie de incarcare selectiva
export {
  JAVA_DECK,
  SPRING_DECK,
  SQL_DECK,
  SYSTEM_DESIGN_DECK,
  TESTING_DECK,
  REACT_DECK,
  DEVOPS_DECK,
  CLOUD_DECK,
  ML_AI_DECK,
  DESIGN_PATTERNS_DECK
};
