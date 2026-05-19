'use client';

import { useTheme } from '@/hooks/useTheme';
import { isValidHex } from '@/utils/color';
import { useState } from 'react';

export function ThemeCustomizer() {
  const { theme, setTheme, resetTheme } = useTheme();
  const [primaryInput, setPrimaryInput] = useState(theme.primary);
  const [secondaryInput, setSecondaryInput] = useState(theme.secondary);
  const [tertiaryInput, setTertiaryInput] = useState(theme.tertiary);

  const handleColorChange = (type: 'primary' | 'secondary' | 'tertiary', value: string) => {
    const uppercased = value.toUpperCase();

    if (type === 'primary') {
      setPrimaryInput(uppercased);
      if (isValidHex(uppercased)) {
        setTheme({ primary: uppercased });
      }
    } else if (type === 'secondary') {
      setSecondaryInput(uppercased);
      if (isValidHex(uppercased)) {
        setTheme({ secondary: uppercased });
      }
    } else if (type === 'tertiary') {
      setTertiaryInput(uppercased);
      if (isValidHex(uppercased)) {
        setTheme({ tertiary: uppercased });
      }
    }
  };

  const handleReset = () => {
    resetTheme();
    setPrimaryInput('#00E5FF');
    setSecondaryInput('#7b61ff');
    setTertiaryInput('#00ffc8');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Couleur Primaire</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={primaryInput}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            className="w-12 h-10 cursor-pointer rounded"
          />
          <input
            type="text"
            value={primaryInput}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            placeholder="#00E5FF"
            className="flex-1 px-3 py-2 border border-[var(--color-primary)] rounded bg-[#1e1e2e] text-white focus:outline-none"
            maxLength={7}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Couleur Secondaire</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={secondaryInput}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            className="w-12 h-10 cursor-pointer rounded"
          />
          <input
            type="text"
            value={secondaryInput}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            placeholder="#7b61ff"
            className="flex-1 px-3 py-2 border border-[var(--color-secondary)] rounded bg-[#1e1e2e] text-white focus:outline-none"
            maxLength={7}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Couleur Tertiaire</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={tertiaryInput}
            onChange={(e) => handleColorChange('tertiary', e.target.value)}
            className="w-12 h-10 cursor-pointer rounded"
          />
          <input
            type="text"
            value={tertiaryInput}
            onChange={(e) => handleColorChange('tertiary', e.target.value)}
            placeholder="#00ffc8"
            className="flex-1 px-3 py-2 border border-[var(--color-tertiary)] rounded bg-[#1e1e2e] text-white focus:outline-none"
            maxLength={7}
          />
        </div>
      </div>

      <button
        onClick={handleReset}
        className="w-full mt-4 px-4 py-2 bg-[var(--color-primary)] text-black rounded font-medium hover:opacity-90 transition"
      >
        Réinitialiser les couleurs
      </button>
    </div>
  );
}
