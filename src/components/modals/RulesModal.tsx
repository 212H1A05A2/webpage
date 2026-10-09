import React from 'react';
import { Modal, Button } from '../ui/Common';
import { Trophy, Flame } from 'lucide-react';
import { sound } from '../../services/sound';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'OX' | 'SOS';
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'OX',
}) => {
  const [activeTab, setActiveTab] = React.useState<'OX' | 'SOS'>(defaultTab);

  React.useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📖 Game Rules & Visual Guide" maxWidth="lg">
      <div className="space-y-5">
        {/* Tab switch */}
        <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => {
              setActiveTab('OX');
              sound.playClick();
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'OX'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⭕❌ OX (Tic-Tac-Toe)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('SOS');
              sound.playClick();
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'SOS'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔤 SOS Strategy Game</span>
          </button>
        </div>

        {/* Tab 1: OX Rules */}
        {activeTab === 'OX' ? (
          <div className="space-y-4 animate-fade-in text-slate-300 text-sm">
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2 text-base">
                <Trophy size={18} className="text-amber-400" /> Objective
              </h4>
              <p>
                Be the first player to line up <strong>3 identical symbols (O or X)</strong> in a row on the 3×3 grid.
              </p>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-white text-base">Winning Alignments</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* Visual horizontal */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                  <div className="grid grid-cols-3 gap-1 w-20 h-20 mb-2">
                    <span className="bg-emerald-500/30 text-emerald-400 font-bold rounded flex items-center justify-center">X</span>
                    <span className="bg-emerald-500/30 text-emerald-400 font-bold rounded flex items-center justify-center">X</span>
                    <span className="bg-emerald-500/30 text-emerald-400 font-bold rounded flex items-center justify-center">X</span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Horizontal</span>
                </div>

                {/* Visual vertical */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                  <div className="grid grid-cols-3 gap-1 w-20 h-20 mb-2">
                    <span className="bg-blue-500/30 text-blue-400 font-bold rounded flex items-center justify-center">O</span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-blue-500/30 text-blue-400 font-bold rounded flex items-center justify-center">O</span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-blue-500/30 text-blue-400 font-bold rounded flex items-center justify-center">O</span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Vertical</span>
                </div>

                {/* Visual diagonal */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
                  <div className="grid grid-cols-3 gap-1 w-20 h-20 mb-2">
                    <span className="bg-indigo-500/30 text-indigo-400 font-bold rounded flex items-center justify-center">X</span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-indigo-500/30 text-indigo-400 font-bold rounded flex items-center justify-center">X</span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-slate-800 rounded"></span>
                    <span className="bg-indigo-500/30 text-indigo-400 font-bold rounded flex items-center justify-center">X</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Diagonal</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-white text-base">Draw Conditions</h4>
              <p>If all 9 cells are filled and neither player has achieved 3-in-a-row, the game is a Draw.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in text-slate-300 text-sm">
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2 text-base">
                <Trophy size={18} className="text-pink-400" /> SOS Objective & Turn Flow
              </h4>
              <p>
                Players take turns placing either <strong>S</strong> or <strong>O</strong> on any empty square. The goal is to form the sequence <strong>S - O - S</strong>.
              </p>
            </div>

            <div className="p-4 bg-purple-950/30 rounded-2xl border border-purple-800/50 space-y-2">
              <h4 className="font-bold text-purple-200 flex items-center gap-2 text-base">
                <Flame size={18} className="text-amber-400" /> The Golden Extra Turn Rule!
              </h4>
              <p className="text-purple-100">
                Whenever your move creates one or more <strong>“SOS”</strong> sequences:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-200 pl-2">
                <li>You receive <strong>1 point per SOS formed</strong>.</li>
                <li><strong>You get an immediate extra turn!</strong></li>
                <li>You keep playing until you make a move that produces zero new SOS.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <h4 className="font-bold text-white text-base">Combo Multipliers</h4>
              <p>
                A single placed letter (especially an <strong>‘O’</strong> in the intersection or an <strong>‘S’</strong> completing multiple lines) can create 2, 3, or even 4 SOS simultaneously!
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-around">
                <div className="text-center">
                  <div className="font-bold text-purple-400 text-lg">S · O · S</div>
                  <div className="text-xs text-slate-400">Horizontal / Vertical</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-pink-400 text-lg">↖ S · O · S ↘</div>
                  <div className="text-xs text-slate-400">Diagonal Main & Anti</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
              <h4 className="font-bold text-white text-base">End of Game</h4>
              <p>
                The game continues until the entire board is full. The player with the highest total score wins the match!
              </p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button variant="primary" className="w-full" size="lg" onClick={onClose}>
            Got it, Let's Play!
          </Button>
        </div>
      </div>
    </Modal>
  );
};
