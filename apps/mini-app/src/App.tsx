import { useAppStore } from "./stores/appStore";
import OnboardingScreen from "./screens/OnboardingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SendPaymentScreen from "./screens/SendPaymentScreen";
import ScoreBreakdownScreen from "./screens/ScoreBreakdownScreen";
import SecurityScreen from "./screens/SecurityScreen";

function App() {
  const activeScreen = useAppStore((s) => s.activeScreen);

  switch (activeScreen) {
    case "onboarding":
      return <OnboardingScreen />;
    case "dashboard":
      return <DashboardScreen />;
    case "send-payment":
      return <SendPaymentScreen />;
    case "score-breakdown":
      return <ScoreBreakdownScreen />;
    case "security":
      return <SecurityScreen />;
    default:
      return <OnboardingScreen />;
  }
}

export default App;
