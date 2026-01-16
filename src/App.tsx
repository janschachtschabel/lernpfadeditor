import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Start } from './pages/Start';
import { GeneralSettings } from './pages/GeneralSettings';
import { PatternElements } from './pages/PatternElements';
import { Actors } from './pages/Actors';
import { LearningEnvironments } from './pages/LearningEnvironments';
import { ShoppingCart } from './pages/ShoppingCart';
import { CourseFlow } from './pages/CourseFlow';
import { Preview } from './pages/Preview';
import AIFlowAgent from './pages/AIFlowAgent';
import { Community } from './pages/Community';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Start />} />
            <Route path="/general-settings" element={<GeneralSettings />} />
            <Route path="/pattern-elements" element={<PatternElements />} />
            <Route path="/actors" element={<Actors />} />
            <Route path="/environments" element={<LearningEnvironments />} />
            <Route path="/shopping-cart" element={<ShoppingCart />} />
            <Route path="/course-flow" element={<CourseFlow />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/ai-flow-agent" element={<AIFlowAgent />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}