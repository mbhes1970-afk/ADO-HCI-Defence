// ============================================================
// App.tsx — ADO
// Root component. Same structure as CMOFMO App.tsx:
//   ThemeProvider → LanguageContext → Layout → Routes
//
// Adding a new module:
//   1. Import the module component
//   2. Add a <Route> below
//   3. Add a nav item in Sidebar.tsx
// ============================================================

import { useState }             from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider }        from './themes/ThemeProvider';
import { LanguageContext }      from './config/i18n';
import { Layout }               from './components/layout/Layout';
import type { Language }        from './config/types';

// ── Module imports (lazy-load in WP03+ for production) ──────
import DashboardModule    from './modules/dashboard/index';
import MissionBriefModule from './modules/mission-brief/index';
import IntelModule        from './modules/intel-analyst/index';
import FieldReportModule  from './modules/field-report/index';
import TrainingModule     from './modules/training-sim/index';
import ComponentShowcase  from './modules/component-showcase/index';

export default function App() {
  const [lang, setLang] = useState<Language>('nl');

  return (
    <ThemeProvider>
      <LanguageContext.Provider value={{ lang, setLang }}>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* ── Add new module: just add a Route here ── */}
              <Route path="/"              element={<DashboardModule />}    />
              <Route path="/mission-brief" element={<MissionBriefModule />} />
              <Route path="/intel"         element={<IntelModule />}        />
              <Route path="/field-report"  element={<FieldReportModule />}  />
              <Route path="/training"      element={<TrainingModule />}     />
              {/* WP02 showcase — remove after acceptance */}
              <Route path="/components"   element={<ComponentShowcase />}  />
            </Routes>
          </Layout>
        </BrowserRouter>
      </LanguageContext.Provider>
    </ThemeProvider>
  );
}
