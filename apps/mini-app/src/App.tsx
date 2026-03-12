import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTonAddress } from '@tonconnect/ui-react';
import { useAppStore } from './stores/appStore';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import TabBar from './components/TabBar';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import SendPaymentScreen from './screens/SendPaymentScreen';
import ScoreBreakdownScreen from './screens/ScoreBreakdownScreen';
import SecurityScreen from './screens/SecurityScreen';
import HistoryScreen from './screens/HistoryScreen';
import ReceiveScreen from './screens/ReceiveScreen';

const TAB_SCREENS = new Set(['dashboard', 'send-payment', 'history', 'security']);

function ScreenRouter() {
  const activeScreen = useAppStore((s) => s.activeScreen);

  const screens: Record<string, JSX.Element> = {
    onboarding: <OnboardingScreen />,
    dashboard: <DashboardScreen />,
    'send-payment': <SendPaymentScreen />,
    'score-breakdown': <ScoreBreakdownScreen />,
    security: <SecurityScreen />,
    history: <HistoryScreen />,
    receive: <ReceiveScreen />,
  };

  const showTabBar = TAB_SCREENS.has(activeScreen);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeScreen}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={showTabBar ? 'min-h-screen pb-20' : 'min-h-screen'}
        >
          {screens[activeScreen] || <OnboardingScreen />}
        </motion.div>
      </AnimatePresence>
      {showTabBar && <TabBar />}
    </>
  );
}

function DisconnectWatcher() {
  const address = useTonAddress();
  const { walletAddress, setWallet, setScreen } = useAppStore();

  useEffect(() => {
    if (!address && walletAddress) {
      setWallet(null);
      setScreen('onboarding');
    }
  }, [address, walletAddress, setWallet, setScreen]);

  return null;
}

function App() {
  useTelegramWebApp();

  return (
    <ErrorBoundary>
      <DisconnectWatcher />
      <Toast />
      <ScreenRouter />
    </ErrorBoundary>
  );
}

export default App;
