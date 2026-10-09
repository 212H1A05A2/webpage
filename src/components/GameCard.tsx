import React from 'react';
import { GameType } from '../types';
import { Button } from './ui/Common';
import { Play, Sparkles } from 'lucide-react';
import { sound } from '../services/sound';

interface GameCardProps {
  type: GameType;
  title: string;
  tagline: string;
  badge: string;
  themeColor: 'blue' | 'purple';
  onPlay: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  type,
  title,
  tagline,
  badge,
  themeColor,
  onPlay,
}) => {
  return (
    <div
      onClick={() => {
        sound.playClick();
        onPlay();
      }}
      className={`group relative overflow-hidden rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer p-6 sm:p-7 flex flex-col justify-between ${
        themeColor === 'blue'
          ? 'bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/30 hover:border-blue-400 hover:shadow-blue-500/20'
          : 'bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/20'
      }`}
    >
      {/* Background glow decoration */}
      <div
        className={`absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none ${
          themeColor === 'blue' ? 'bg-blue-500' : 'bg-pink-500'
        }`}
      />

      <div>
        {/* Top Header Tag */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              themeColor === 'blue'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            }`}
          >
            <Sparkles size={12} /> {badge}
          </span>

          <span className="text-2xl font-black opacity-40 group-hover:opacity-100 transition-opacity">
            {type === 'OX' ? '⭕❌' : '🔤'}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-2xl sm:text-3xl font-black font-fredoka text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-200 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5 line-clamp-2">
          {tagline}
        </p>

        {/* Mini Preview Graphic */}
        <div className="my-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center">
          {type === 'OX' ? (
            <div className="grid grid-cols-3 gap-2 w-32 h-32">
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-rose-400 font-black text-2xl group-hover:scale-110 transition-transform">X</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-blue-400 font-black text-2xl group-hover:scale-110 transition-transform">O</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-rose-400 font-black text-2xl group-hover:scale-110 transition-transform">X</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-blue-400 font-black text-2xl">O</div>
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center justify-center text-rose-400 font-black text-2xl animate-pulse">X</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-slate-600 font-black text-xl">·</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-blue-400 font-black text-2xl">O</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-slate-600 font-black text-xl">·</div>
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-xl flex items-center justify-center text-rose-400 font-black text-2xl animate-pulse">X</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 w-32 h-32">
              <div className="bg-purple-600/30 border border-purple-500/60 rounded-xl flex items-center justify-center text-purple-300 font-black text-xl">S</div>
              <div className="bg-pink-600/30 border border-pink-500/60 rounded-xl flex items-center justify-center text-pink-300 font-black text-xl animate-pulse">O</div>
              <div className="bg-purple-600/30 border border-purple-500/60 rounded-xl flex items-center justify-center text-purple-300 font-black text-xl">S</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-slate-600 font-black text-lg">·</div>
              <div className="bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 font-bold text-lg">S</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-slate-600 font-black text-lg">·</div>
              <div className="bg-pink-600/20 rounded-xl flex items-center justify-center text-pink-400 font-bold text-lg">O</div>
              <div className="bg-slate-800/80 rounded-xl flex items-center justify-center text-slate-600 font-black text-lg">·</div>
              <div className="bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 font-bold text-lg">S</div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant={themeColor === 'blue' ? 'ox' : 'sos'}
        size="lg"
        className="w-full mt-2"
        icon={<Play size={18} className="fill-white" />}
      >
        Play {type === 'OX' ? 'Tic-Tac-Toe' : 'SOS'}
      </Button>
    </div>
  );
};
