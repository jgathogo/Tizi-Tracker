import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [exerciseName, setExerciseName] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setExerciseName('');
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = exerciseName.trim();
    if (trimmedName) {
      onAdd(trimmedName);
      setExerciseName('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-base-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-base-300 transform transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-300/50">
          <h3 className="text-lg font-bold text-base-content">Add Exercise</h3>
          <button 
            onClick={onClose}
            className="text-base-content/60 hover:text-base-content transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content/80 mb-2">
              Exercise Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="e.g., Push-ups, Pull-ups, Running"
              className="w-full bg-base-300 border border-base-300 rounded-xl px-4 py-3 text-base-content placeholder-base-content/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-base-300 hover:bg-base-300/80 text-base-content/80 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!exerciseName.trim()}
              className="flex-1 px-4 py-3 btn btn-primary disabled:bg-base-300 disabled:text-base-content/50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

