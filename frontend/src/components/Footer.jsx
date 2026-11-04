import React from 'react';
import { BookOpen, Github, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">DevSphere MERN</span>
            <span className="text-xs text-slate-400">| Production Blog Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">MongoDB</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">Express.js</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">React.js</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">Node.js</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">Socket.io</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">JWT + RBAC</span>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for MERN Stack Assignment
          </p>
        </div>
      </div>
    </footer>
  );
};
