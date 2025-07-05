'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];

export default function PlayerSetup({ onSave }: {
  onSave: (settings: { name: string; color: string }) => void;
}) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [editMode, setEditMode] = useState(false);

  const handleSave = () => {
    if (name.trim().length > 0) {
      onSave({ name, color: selectedColor });
      setEditMode(false);
    }
  };

  if (!editMode) {
    return (
      <div className="flex flex-col items-center gap-4">
        {name && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-lg font-medium">{name}</span>
          </div>
        )}
        <Button onPress={() => setEditMode(true)}>
          {name ? 'Editar Nombre' : 'Crear Nombre'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      <Input
        label="Tu nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ingresa tu nombre"
        className="text-white"
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-300">Color del personaje:</span>
        <div className="flex gap-2">
          {colors.map((color) => (
            <Button
              key={color}
              className={`w-8 h-8 rounded-full ${selectedColor === color ? 'ring-2 ring-white' : ''}`}
              style={{ backgroundColor: color }}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onPress={() => setEditMode(false)}>
          Cancelar
        </Button>
        <Button onPress={handleSave} isDisabled={!name.trim()}>
          Guardar
        </Button>
      </div>
    </div>
  );
}