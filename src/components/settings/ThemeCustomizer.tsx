'use client';

import { useTheme } from '@/hooks/useTheme';
import { isValidHex } from '@/utils/color';
import { useState } from 'react';

export function ThemeCustomizer() {
  const { theme, setTheme, resetTheme } = useTheme();
  const [primaryInput, setPrimaryInput] = useState(theme.primary);
  const [secondaryInput, setSecondaryInput] = useState(theme.secondary);
  const [tertiaryInput, setTertiaryInput] = useState(theme.tertiary);
  const [backgroundInput, setBackgroundInput] = useState(theme.background);
  const [backgroundDarkInput, setBackgroundDarkInput] = useState(theme.backgroundDark);

  const handleColorChange = (type: 'primary' | 'secondary' | 'tertiary' | 'background' | 'backgroundDark', value: string) => {
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
    } else if (type === 'background') {
      setBackgroundInput(uppercased);
      if (isValidHex(uppercased)) {
        setTheme({ background: uppercased });
      }
    } else if (type === 'backgroundDark') {
      setBackgroundDarkInput(uppercased);
      if (isValidHex(uppercased)) {
        setTheme({ backgroundDark: uppercased });
      }
    }
  };

  const handleReset = () => {
    resetTheme();
    setPrimaryInput('#00E5FF');
    setSecondaryInput('#7b61ff');
    setTertiaryInput('#00ffc8');
    setBackgroundInput('#ffffff');
    setBackgroundDarkInput('#0a0a0a');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Personnalisation des couleurs</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Couleur Primaire (Cyan)</label>
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

      <hr className="my-4 border-[var(--color-primary)]" />

      <h3 className="text-lg font-semibold mb-4">Personnalisation du fond</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Couleur du Fond (Mode Clair)</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={backgroundInput}
            onChange={(e) => handleColorChange('background', e.target.value)}
            className="w-12 h-10 cursor-pointer rounded"
          />
          <input
            type="text"
            value={backgroundInput}
            onChange={(e) => handleColorChange('background', e.target.value)}
            placeholder="#ffffff"
            className="flex-1 px-3 py-2 border border-[var(--color-primary)] rounded bg-[#1e1e2e] text-white focus:outline-none"
            maxLength={7}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Couleur du Fond (Mode Sombre)</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={backgroundDarkInput}
            onChange={(e) => handleColorChange('backgroundDark', e.target.value)}
            className="w-12 h-10 cursor-pointer rounded"
          />
          <input
            type="text"
            value={backgroundDarkInput}
            onChange={(e) => handleColorChange('backgroundDark', e.target.value)}
            placeholder="#0a0a0a"
            className="flex-1 px-3 py-2 border border-[var(--color-primary)] rounded bg-[#1e1e2e] text-white focus:outline-none"
            maxLength={7}
          />
        </div>
      </div>

      <button
        onClick={handleReset}
        className="w-full mt-4 px-4 py-2 bg-[var(--color-primary)] text-black rounded font-medium hover:opacity-90 transition"
      >
        Réinitialiser tous les thèmes
      </button>
    </div>
  );
}
