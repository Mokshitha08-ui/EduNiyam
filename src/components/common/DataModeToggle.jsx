import React from 'react';
import { Database, Radio, Loader2, AlertCircle } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export const DataModeToggle = ({ className = '' }) => {
  const { dataMode, setDataMode, isLiveLoading, liveError } = useAppData();

  return (
    <div className={`inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs shadow-inner ${className}`}>
      {/* Dummy Data Button */}
      <button
        type="button"
        onClick={() => setDataMode('dummy')}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all select-none ${
          dataMode === 'dummy'
            ? 'bg-white text-gov-900 shadow-sm border border-slate-200/80 font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Use local mock data with localStorage persistence"
      >
        <Database className={`w-3.5 h-3.5 ${dataMode === 'dummy' ? 'text-gov-800' : 'text-slate-400'}`} />
        <span className="hidden sm:inline">Dummy Data</span>
        <span className="sm:hidden">Mock</span>
        {dataMode === 'dummy' && (
          <span className="ml-0.5 rounded bg-slate-200 px-1 py-0.2 text-[9px] font-bold text-slate-700">
            Active
          </span>
        )}
      </button>

      {/* Live Data Button */}
      <button
        type="button"
        onClick={() => setDataMode('live')}
        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition-all select-none ${
          dataMode === 'live'
            ? liveError
              ? 'bg-rose-50 text-rose-800 shadow-sm border border-rose-300 font-bold'
              : 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Connect to real Spring Boot REST APIs via VITE_API_BASE_URL"
      >
        {isLiveLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gov-800" />
        ) : liveError && dataMode === 'live' ? (
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        ) : (
          <Radio className={`w-3.5 h-3.5 ${dataMode === 'live' ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
        )}
        <span className="hidden sm:inline">Live Data</span>
        <span className="sm:hidden">Live</span>
        {dataMode === 'live' && (
          <span className={`ml-0.5 rounded px-1 py-0.2 text-[9px] font-bold ${
            liveError ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {liveError ? 'Offline' : 'Connected'}
          </span>
        )}
      </button>
    </div>
  );
};
