import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import { JoinedCourse } from '@sovereign-academy/types';

import { Button } from '../../../atoms/Button';
import { Routes } from '../../../types';
import { compose, computeAssetCdnUrl } from '../../../utils';

interface LevelPickerProps {
  courseId: string;
}

export const LevelPicker: React.FC<LevelPickerProps> = ({ courseId }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Beginner'); // Establecemos "Beginner" como nivel por defecto

  const levels = ['Beginner', 'Intermediate', 'Avanced'];

  const handleLevelClick = (level: string) => {
    setSelectedLevel(t(level));
  };

  const { t } = useTranslation();
  return (
    <div className="my-4">
      <h3 className="mb-1 text-base font-semibold text-white">Pick Level</h3>
      <div className="flex space-x-2 text-base">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => handleLevelClick(t(level))}
            className={`px-4 py-2 ${
              selectedLevel === level
                ? 'bg-orange-600 text-white'
                : 'border-secondary-300 border-2 bg-blue-700 text-white'
            } rounded-lg`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};
