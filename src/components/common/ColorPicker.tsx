// src/components/common/ColorPicker.tsx
import React, { useState } from 'react';
import { Input } from 'antd';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value = '#000000', onChange }) => {
  const [color, setColor] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (onChange) {
      onChange(newColor);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Sélecteur natif de couleur */}
      <input
        type="color"
        value={color}
        onChange={handleChange}
        style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
      />
      {/* Champ texte pour voir/modifier la valeur hex */}
      <Input
        value={color}
        onChange={handleChange}
        style={{ width: 100 }}
      />
    </div>
  );
};

export default ColorPicker;
