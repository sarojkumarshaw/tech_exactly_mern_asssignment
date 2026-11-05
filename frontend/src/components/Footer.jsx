import React from 'react';
import { TechExactlyLogo } from './TechExactlyLogo';
import { Heart, ShieldCheck, Radio } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <TechExactlyLogo size="sm" showTag={true} />

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600">
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">MongoDB</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">Express.js</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">React 18</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">Node.js</span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-600" />
              Socket.io
            </span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
              RBAC &amp; JWT
            </span>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Tech Exactly Assignment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
