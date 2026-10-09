import React from 'react';
import { GameSettings, UserProfile } from '../../types';
import { AVATAR_OPTIONS } from '../../services/storage';
import { Modal, Button, AvatarBadge } from '../ui/Common';
import { Volume2, VolumeX, Music, Moon, Sun, Trash2, Info, Heart, LogOut } from 'lucide-react';
import { sound } from '../../services/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetStats: () => void;
  onResetAllData: () => void;
  onOpenRules: () => void;
  onSignOut?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  profile,
  onUpdateProfile,
  onResetStats,
  onResetAllData,
  onOpenRules,
  onSignOut,
}) => {
  const [editingAvatar, setEditingAvatar] = React.useState(false);
  const [profileName, setProfileName] = React.useState(profile.name);
  const [confirmResetStats, setConfirmResetStats] = React.useState(false);
  const [confirmResetAll, setConfirmResetAll] = React.useState(false);

  React.useEffect(() => {
    setProfileName(profile.name);
  }, [profile]);

  const toggleSound = () => {
    const newVal = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: newVal };
    onUpdateSettings(updated);
    sound.setSoundEnabled(newVal);
    if (newVal) sound.playClick();
  };

  const toggleMusic = () => {
    const newVal = !settings.musicEnabled;
    const updated = { ...settings, musicEnabled: newVal };
    onUpdateSettings(updated);
    sound.setMusicEnabled(newVal);
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: nextTheme });
    sound.playClick();
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ ...profile, name: profileName.trim() || 'Player 1' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ Game Settings & Profile" maxWidth="lg">
      <div className="space-y-6">
        {/* User Profile Section */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Player Profile</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setEditingAvatar(!editingAvatar);
                sound.playClick();
              }}
              className="relative group p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              title="Click to change avatar"
            >
              <AvatarBadge avatar={profile.avatar} size="lg" ringColor="ring-indigo-500 hover:ring-indigo-400" />
              <span className="absolute bottom-0 right-0 bg-indigo-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold shadow">
                Edit
              </span>
            </button>

            <div className="flex-1">
              <label className="text-xs text-slate-400 font-medium">Nickname</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  maxLength={15}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onBlur={handleSaveProfile}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                  placeholder="Enter name"
                />
              </div>
            </div>
          </div>

          {/* Avatar selector popup */}
          {editingAvatar && (
            <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-2 font-medium">Choose an avatar:</p>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      onUpdateProfile({ ...profile, avatar: av });
                      setEditingAvatar(false);
                      sound.playClick();
                    }}
                    className={`p-2 rounded-xl text-xl hover:scale-125 transition-transform ${
                      profile.avatar === av ? 'bg-indigo-600/40 ring-2 ring-indigo-500' : 'hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audio & Visuals */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Audio & Experience</h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
                {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-200">Sound Effects</p>
                <p className="text-xs text-slate-400">Tactile placement, combos and win tunes</p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400">
                <Music size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-200">Procedural Ambient Music</p>
                <p className="text-xs text-slate-400">Relaxing background synthesizer chime</p>
              </div>
            </div>
            <button
              onClick={toggleMusic}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                settings.musicEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400">
                {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-200">App Theme</p>
                <p className="text-xs text-slate-400">{settings.theme === 'dark' ? 'Dark Neon Mode' : 'Light Vibrant Mode'}</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={toggleTheme}>
              {settings.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </div>

        {/* Quick Links & Rules */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            icon={<Info size={18} />}
            onClick={() => {
              onClose();
              onOpenRules();
            }}
          >
            How to Play Rules
          </Button>
          {onSignOut && (
            <Button
              variant="outline"
              size="md"
              className="border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-800/60 hover:bg-rose-950/20"
              icon={<LogOut size={16} />}
              onClick={() => {
                onClose();
                onSignOut();
              }}
            >
              Sign Out
            </Button>
          )}
        </div>

        {/* Danger Zone */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-400">Data Management</h3>

          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            {!confirmResetStats ? (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs bg-slate-800 hover:bg-slate-700"
                onClick={() => setConfirmResetStats(true)}
              >
                Reset Stats Only
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 font-semibold">Confirm Reset Stats?</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onResetStats();
                    setConfirmResetStats(false);
                    sound.playClick();
                  }}
                >
                  Yes, Reset
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmResetStats(false)}>
                  Cancel
                </Button>
              </div>
            )}

            {!confirmResetAll ? (
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-rose-800/80 text-rose-300 hover:bg-rose-950/40"
                icon={<Trash2 size={14} />}
                onClick={() => setConfirmResetAll(true)}
              >
                Reset All App Data
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 font-bold">Wipe everything?</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onResetAllData();
                    setConfirmResetAll(false);
                    sound.playClick();
                  }}
                >
                  Confirm Wipe
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmResetAll(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* About App */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <p className="font-semibold text-slate-400">OX & SOS Multiplayer Casual Game v1.0.0</p>
          <p className="flex items-center justify-center gap-1 mt-1 text-slate-500">
            Engineered with <Heart size={12} className="text-rose-500 fill-rose-500" /> & React + WebAudio
          </p>
        </div>
      </div>
    </Modal>
  );
};
