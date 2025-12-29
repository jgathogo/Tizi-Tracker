import React, { useRef, useState } from 'react';
import { Download, Upload, X, Trash2, Settings, FileJson, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onImport: (data: UserProfile) => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onImport, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const date = new Date().toISOString().split('T')[0];
    downloadAnchorNode.setAttribute("download", `tizilog_backup_${date}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation
        if (!json.currentWeights || !json.history) {
            throw new Error("Invalid file format");
        }
        onImport(json);
        onClose();
      } catch (err) {
        setError("Failed to parse file. Please select a valid backup JSON.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-700">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2 text-white">
             <Settings size={20} />
             <h3 className="text-lg font-bold">Data & Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Backup</h4>
            <button 
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Download size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-white">Export Data</div>
                        <div className="text-xs text-slate-400">Download JSON backup</div>
                    </div>
                </div>
                <FileJson size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Restore</h4>
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json"
                onChange={handleFileChange}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-xl border border-slate-600 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Upload size={20} />
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-white">Import Data</div>
                        <div className="text-xs text-slate-400">Restore from JSON file</div>
                    </div>
                </div>
                <FileJson size={18} className="text-slate-500" />
            </button>
            {error && <div className="text-red-400 text-xs px-2">{error}</div>}
          </div>

          <hr className="border-slate-700" />

          {/* Danger Zone */}
          <div className="space-y-2">
             <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                 <AlertTriangle size={14} /> Danger Zone
             </h4>
             <button 
                onClick={() => {
                    if(window.confirm("Are you sure? This will delete all your history and reset weights. This cannot be undone.")) {
                        onReset();
                        onClose();
                    }
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-xl transition-colors font-medium text-sm"
            >
                <Trash2 size={16} /> Reset All Data
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
