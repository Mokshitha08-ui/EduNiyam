import React from 'react';
import { AlertTriangle, RefreshCw, Database, Radio, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { Button } from './Button';

export const LiveConnectionBanner = () => {
  const { dataMode, setDataMode, isLiveLoading, liveError, retryLiveFetch, backendUrl } = useAppData();

  if (dataMode !== 'live') return null;

  if (isLiveLoading) {
    return (
      <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/90 p-3.5 text-xs text-blue-900 shadow-sm flex items-center justify-between gap-3 animate-pulse">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 text-gov-800 animate-spin shrink-0" />
          <span>Connecting to live Spring Boot REST API at <strong className="font-mono">{backendUrl}</strong>...</span>
        </div>
        <span className="font-semibold text-gov-800">Fetching live records...</span>
      </div>
    );
  }

  if (liveError) {
    return (
      <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50/95 p-4 text-xs text-rose-900 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-950 uppercase tracking-wide">
                Live Backend Connection Error
              </h4>
              <p className="mt-0.5 text-rose-800 leading-relaxed">
                {liveError}
              </p>
              <p className="mt-1 text-[11px] text-rose-700">
                Ensure your Spring Boot backend application is running on port 8080 or check your <code className="font-mono">VITE_API_BASE_URL</code> configuration in <code className="font-mono">.env</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={retryLiveFetch}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 bg-white"
            >
              Retry Connection
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Database}
              onClick={() => setDataMode('dummy')}
            >
              Switch to Dummy Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 px-4 text-xs text-emerald-900 shadow-sm flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Live Backend Active:</strong> Streaming actual records from Spring Boot REST API (<code className="font-mono text-[11px]">{backendUrl}</code>).
        </span>
      </div>
      <button
        onClick={() => setDataMode('dummy')}
        className="text-[11px] font-semibold text-emerald-800 hover:underline shrink-0"
      >
        Switch to Dummy Data &rarr;
      </button>
    </div>
  );
};
