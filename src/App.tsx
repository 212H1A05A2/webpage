import React from 'react';
import { GameType, GameMode, AIDifficulty, SOSBoardSize, GameSettings, GameStats, UserProfile } from './types';
import { storage } from './services/storage';
import { sound } from './services/sound';
import { authService, AuthUser } from './services/auth';
import { GameCard } from './components/GameCard';
import { SetupScreen } from './components/SetupScreen';
import { OXScreen } from './components/OXScreen';
import { SOSScreen } from './components/SOSScreen';
import { SignInScreen } from './components/SignInScreen';
import { SettingsModal } from './components/modals/SettingsModal';
import { RulesModal } from './components/modals/RulesModal';
import { StatsModal } from './components/modals/StatsModal';
import { AvatarBadge } from './components/ui/Common';
import {
  Trophy,
  BarChart3,
  Settings,
  HelpCircle,
  Flame,
} from 'lucide-react';

export function App() {
  // Auth & Navigation State
  const [authState, setAuthState] = React.useState(() => authService.getAuthState());
  const [currentScreen, setCurrentScreen] = React.useState<'SIGN_IN' | 'HOME' | 'SETUP' | 'OX_PLAY' | 'SOS_PLAY'>(() => {
    return authService.getAuthState().isAuthenticated ? 'HOME' : 'SIGN_IN';
  });
  const [selectedGameType, setSelectedGameType] = React.useState<GameType>('OX');

  // Match Configuration State
  const [matchConfig, setMatchConfig] = React.useState<{
    gameType: GameType;
    mode: GameMode;
    p1Name: string;
    p2Name: string;
    aiDifficulty: AIDifficulty;
    boardSize: SOSBoardSize;
    firstPlayer: 'p1' | 'p2';
  }>({
    gameType: 'OX',
    mode: 'AI',
    p1Name: 'Player 1',
    p2Name: 'Robo AI',
    aiDifficulty: 'HARD',
    boardSize: 5,
    firstPlayer: 'p1',
  });

  // Persistent States
  const [settings, setSettings] = React.useState<GameSettings>(() => storage.getSettings());
  const [profile, setProfile] = React.useState<UserProfile>(() => storage.getProfile());
  const [stats, setStats] = React.useState<GameStats>(() => storage.getStats());

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isRulesOpen, setIsRulesOpen] = React.useState(false);
  const [isStatsOpen, setIsStatsOpen] = React.useState(false);
  const [rulesDefaultTab, setRulesDefaultTab] = React.useState<'OX' | 'SOS'>('OX');

  // Sync settings on start
  React.useEffect(() => {
    sound.setSoundEnabled(settings.soundEnabled);
    sound.setMusicEnabled(settings.musicEnabled);
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [settings]);

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };

  const handleResetStats = () => {
    storage.resetStats();
    setStats(storage.getStats());
  };

  const handleResetAllData = () => {
    storage.resetAllData();
    setSettings(storage.getSettings());
    setProfile(storage.getProfile());
    setStats(storage.getStats());
  };

  const handleStartGameSetup = (gameType: GameType) => {
    setSelectedGameType(gameType);
    setCurrentScreen('SETUP');
  };

  const handleLaunchGame = (config: typeof matchConfig) => {
    setMatchConfig(config);
    if (config.gameType === 'OX') {
      setCurrentScreen('OX_PLAY');
    } else {
      setCurrentScreen('SOS_PLAY');
    }
  };

  const handleOpenRules = (tab: 'OX' | 'SOS' = 'OX') => {
    setRulesDefaultTab(tab);
    setIsRulesOpen(true);
    sound.playClick();
  };

  const handleSignInSuccess = (user: AuthUser) => {
    setAuthState({ isAuthenticated: true, user });
    if (user.name) {
      const updatedProfile = { ...profile, name: user.name };
      setProfile(updatedProfile);
      storage.saveProfile(updatedProfile);
    }
    setCurrentScreen('HOME');
  };

  const handleSignOut = () => {
    sound.playClick();
    authService.signOut();
    setAuthState({ isAuthenticated: false, user: null });
    setCurrentScreen('SIGN_IN');
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 ${
        settings.theme === 'light'
          ? 'bg-slate-100 text-slate-800'
          : 'bg-[#0b0f19] text-slate-100'
      }`}
    >
      {/* Background ambient light effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* ================= TOP NAVBAR ================= */}
        <header className="w-full max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              if (currentScreen !== 'HOME') {
                sound.playClick();
                setCurrentScreen('HOME');
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              OX
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-fredoka tracking-tight text-white flex items-center gap-1.5">
                <span>OX</span>
                <span className="text-pink-500">&</span>
                <span>SOS</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">
                Multiplayer Strategy
              </p>
            </div>
          </div>

          {/* Quick Header Navigation Controls */}
          <div className="flex items-center gap-2">
            {/* User Profile Quick Tag */}
            {authState.isAuthenticated ? (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-800/80 hover:bg-slate-700/80 rounded-full border border-slate-700/60 transition-all text-xs font-bold text-slate-200 cursor-pointer"
              >
                <AvatarBadge avatar={profile.avatar} size="sm" ringColor="ring-indigo-400" />
                <span className="hidden sm:inline max-w-[90px] truncate">{profile.name}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentScreen('SIGN_IN');
                }}
                className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-full transition-all text-xs font-bold cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Stats Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsStatsOpen(true);
              }}
              title="Career Statistics"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 border border-slate-700/60 transition-transform active:scale-90 cursor-pointer"
            >
              <BarChart3 size={18} />
            </button>

            {/* Rules Button */}
            <button
              onClick={() => handleOpenRules('OX')}
              title="Rules & Guide"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-transform active:scale-90 cursor-pointer"
            >
              <HelpCircle size={18} />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                sound.playClick();
                setIsSettingsOpen(true);
              }}
              title="App Settings"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-transform active:scale-90 cursor-pointer"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* ================= MAIN CONTENT VIEWS ================= */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
          {/* SCREEN 0: SIGN IN SCREEN */}
          {currentScreen === 'SIGN_IN' && (
            <SignInScreen onSuccess={handleSignInSuccess} />
          )}

          {/* SCREEN 1: HOME SCREEN */}
          {currentScreen === 'HOME' && (
            <div className="w-full space-y-8 animate-pop-in">
              {/* Hero Banner */}
              <div className="text-center space-y-3 max-w-2xl mx-auto pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                  <Flame size={14} className="text-amber-400" />
                  <span>Win Streak: {stats.streak.current} (Best: {stats.streak.best})</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black font-fredoka text-white tracking-tight">
                  Choose Your Battle Arena
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">
                  Play quick Tic-Tac-Toe rounds or master strategic combo scoring in the full SOS grid game.
                </p>
              </div>

              {/* The Two Main Game Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <GameCard
                  type="OX"
                  title="OX Tic-Tac-Toe"
                  tagline="Fast-paced 3×3 tactical alignment. Beat the minimax master AI or test your friend in 2-player pass & play."
                  badge="Classic Quick Match"
                  themeColor="blue"
                  onPlay={() => handleStartGameSetup('OX')}
                />

                <GameCard
                  type="SOS"
                  title="SOS Strategy Grid"
                  tagline="Form S-O-S in any direction. Chain combos, trigger extra turns, and out-score your rival on custom board sizes."
                  badge="Strategic Combo Game"
                  themeColor="purple"
                  onPlay={() => handleStartGameSetup('SOS')}
                />
              </div>

              {/* Quick Career Stats Bar on Home */}
              <div
                onClick={() => {
                  sound.playClick();
                  setIsStatsOpen(true);
                }}
                className="max-w-2xl mx-auto p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
                    <Trophy size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Career Performance</h4>
                    <p className="text-xs text-slate-400">
                      {stats.totalGames} Total Matches · {stats.ox.wins + stats.sos.wins} Total Wins
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-indigo-400 hover:underline">
                  View Full Records →
                </span>
              </div>
            </div>
          )}

          {/* SCREEN 2: GAME SETUP SCREEN */}
          {currentScreen === 'SETUP' && (
            <SetupScreen
              gameType={selectedGameType}
              player1Name={profile.name}
              onBack={() => setCurrentScreen('HOME')}
              onStartGame={handleLaunchGame}
            />
          )}

          {/* SCREEN 3: OX GAME SCREEN */}
          {currentScreen === 'OX_PLAY' && (
            <OXScreen
              mode={matchConfig.mode}
              difficulty={matchConfig.aiDifficulty}
              p1Name={matchConfig.p1Name}
              p2Name={matchConfig.p2Name}
              firstPlayer={matchConfig.firstPlayer}
              userProfile={profile}
              settings={settings}
              onExit={() => setCurrentScreen('HOME')}
              onStatsUpdate={setStats}
            />
          )}

          {/* SCREEN 4: SOS GAME SCREEN */}
          {currentScreen === 'SOS_PLAY' && (
            <SOSScreen
              mode={matchConfig.mode}
              difficulty={matchConfig.aiDifficulty}
              boardSize={matchConfig.boardSize}
              p1Name={matchConfig.p1Name}
              p2Name={matchConfig.p2Name}
              firstPlayer={matchConfig.firstPlayer}
              userProfile={profile}
              settings={settings}
              onExit={() => setCurrentScreen('HOME')}
              onStatsUpdate={setStats}
            />
          )}
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="w-full text-center py-4 text-xs text-slate-500 border-t border-slate-800/40">
          <p>OX & SOS Board Games · Built for modern web & mobile</p>
        </footer>
      </div>

      {/* ================= MODALS ================= */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onResetStats={handleResetStats}
        onResetAllData={handleResetAllData}
        onOpenRules={() => handleOpenRules('OX')}
        onSignOut={authState.isAuthenticated ? handleSignOut : undefined}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        defaultTab={rulesDefaultTab}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />
    </div>
  );
}
export default App;
