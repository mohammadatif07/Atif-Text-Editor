
import React from 'react';
import type { GrammarError } from '../types';

interface SuggestionsModalProps {
  error: GrammarError;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ error, onSelect, onClose }) => {
  if (!error) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Correction Suggestions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <p className="text-sm text-gray-500 mb-2">Original:</p>
        <p className="bg-red-50 text-red-700 p-2 rounded-md mb-4 line-through">
          {error.errorText}
        </p>

        <p className="text-sm text-gray-500 mb-3 font-medium">
          <span className="font-bold text-gray-700">Explanation:</span> {error.explanation}
        </p>
        
        <div className="space-y-2">
          {error.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <span className="text-blue-700 font-medium">{suggestion}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;
