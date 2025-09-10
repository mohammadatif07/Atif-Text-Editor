
import React from 'react';
import { FONTS, COLORS, HIGHLIGHT_COLORS } from '../constants';

interface ToolbarProps {
  onFormat: (command: 'font' | 'color' | 'highlight', value: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onFormat }) => {
  return (
    <div className="bg-white p-2 rounded-t-lg border-b border-gray-200 flex items-center space-x-2 flex-wrap">
      {/* Font Selector */}
      <select
        onChange={(e) => onFormat('font', e.target.value)}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ fontFamily: 'Inter' }}
      >
        <option>Font Family</option>
        {FONTS.map((font) => (
          <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
            {font.name}
          </option>
        ))}
      </select>

      {/* Text Color */}
      <div className="flex items-center space-x-1 p-1 border border-gray-300 rounded-md">
        <span className="text-sm ml-1">A</span>
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onFormat('color', color)}
            className="w-5 h-5 rounded-full transition-transform transform hover:scale-110"
            style={{ backgroundColor: color }}
            title={`Text color ${color}`}
          />
        ))}
      </div>
      
      {/* Highlight Color */}
      <div className="flex items-center space-x-1 p-1 border border-gray-300 rounded-md">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.504 4.196a.75.75 0 00-1.06 0L4.874 13.766a2.5 2.5 0 00-.733 1.558l-.002.046a.75.75 0 00.752.748l.046-.002a2.5 2.5 0 001.558-.733L15.504 5.256a.75.75 0 000-1.06zM16.564 3.136a2.25 2.25 0 010 3.182L6.73 16.152a4 4 0 01-2.493 1.172l-.074.003a2.25 2.25 0 01-2.252-2.252l.003-.074a4 4 0 011.172-2.493L13.382 1.954a2.25 2.25 0 013.182 0z" clipRule="evenodd" />
        </svg>
        {HIGHLIGHT_COLORS.map((hColor) => (
          <button
            key={hColor.name}
            onClick={() => onFormat('highlight', hColor.value)}
            className="w-5 h-5 rounded-full transition-transform transform hover:scale-110 border border-gray-300"
            style={{ backgroundColor: hColor.value }}
            title={`Highlight ${hColor.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
