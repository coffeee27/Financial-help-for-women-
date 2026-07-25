import DreamOnboarding from './components/DreamOnboarding';
import CameraScanner from './components/CameraScanner';
import BudgetCalculator from './components/BudgetCalculator';
import DailyChallenge from './components/DailyChallenge';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>GirlsHack App</h1>
      <DreamOnboarding />
      <CameraScanner />
      <BudgetCalculator />
      <DailyChallenge />
    </div>
  );
}
