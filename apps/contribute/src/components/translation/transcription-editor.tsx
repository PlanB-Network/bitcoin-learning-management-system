import { Button } from '@blms/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import DroplistArrowIcon from '#src/assets/icons/droplist_arrow_balck.svg';
import './transcription-editor-scrollbar.css';

interface TranscriptionEditorProps {
  originalContent: string;
  translatedContent: string;
  onTranslationChange: (value: string) => void;
  onGenerateAudio: () => void;
  onValidateTranscription: () => void;
  transcriptionValidated: boolean;
  /** Optional: display the tries remaining e.g. "Limit 2/3 tries" */
  triesLabel?: string;
  /** Disable Generate Audio button when tries exhausted */
  generateDisabled?: boolean;
}

/**
 * Displays the bilingual transcription editor with controls to generate audio
 * and validate the transcript. Extracted from the chapter translation page so
 * the page remains lean and other screens can reuse this editor.
 */
export const TranscriptionEditor: React.FC<TranscriptionEditorProps> = ({
  originalContent,
  translatedContent,
  onTranslationChange,
  onGenerateAudio,
  onValidateTranscription,
  transcriptionValidated,
  triesLabel = 'Limit 2/3 tries',
  generateDisabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        backgroundColor: '#F5F5F5',
        border: '1px solid #CCCCCC',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0px 1px 1px 0px #00000040',
      }}
    >
      {/* Language Toggle */}
      <div className="mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4">
          {/* Source language selector */}
          <div className="flex items-center gap-[10px]">
            <span
              className="text-base sm:text-lg md:text-xl font-semibold text-gray-900"
              style={{ fontFamily: 'Rubik, sans-serif' }}
            >
              {t('translate.language', { defaultValue: 'Language' })}
            </span>
            {/* Custom select with left arrow */}
            <div className="relative">
              <select className="appearance-none bg-white border border-[#CCCCCC] rounded-[10px] text-sm text-orange-500 w-full sm:w-[225px] h-[34px] pl-8 pr-3 py-1">
                <option>English</option>
              </select>
              {/* Black arrow icon */}
              <img
                src={DroplistArrowIcon}
                alt="Dropdown arrow"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-[11px] h-[7px]"
              />
            </div>
          </div>
          {/* Target language information (visible only on large screens) */}
          <div className="hidden lg:flex items-center gap-2 lg:justify-start justify-start">
            <span className="text-gray-400">⇄</span>
            <span
              className="text-base sm:text-lg md:text-xl font-semibold text-gray-900"
              style={{ fontFamily: 'Rubik, sans-serif' }}
            >
              {t('translate.translateTo', { defaultValue: 'Translate to' })}
            </span>
            {/* TODO: make target language dynamic */}
            <span className="text-orange-500 text-base sm:text-lg md:text-xl">
              Italiano
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side Translation Text Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Original Content */}
        <div
          className="bg-white rounded-lg p-4 min-h-[200px]"
          style={{ border: '1px solid #CCCCCC' }}
        >
          <div className="text-sm leading-relaxed text-gray-900 whitespace-pre-line">
            {originalContent || ''}
          </div>
        </div>

        {/* Target language information (visible on small screens, outside the box) */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-gray-400">⇄</span>
          <span
            className="text-base font-semibold text-gray-900"
            style={{ fontFamily: 'Rubik, sans-serif' }}
          >
            {t('translate.translateTo', { defaultValue: 'Translate to' })}
          </span>
          <span className="text-orange-500 text-base">Italiano</span>
        </div>

        {/* Translated Content */}
        <div
          className="bg-white rounded-lg p-4 min-h-[200px]"
          style={{ border: '1px solid #CCCCCC' }}
        >
          <textarea
            value={translatedContent}
            onChange={(e) => onTranslationChange(e.target.value)}
            placeholder={t('translate.enterTranslation', {
              defaultValue: 'Enter your translation here...',
            })}
            className="w-full h-full min-h-[160px] border-0 resize-none focus:outline-none text-sm leading-relaxed bg-transparent text-gray-900 textarea-scrollbar"
            style={{ width: 'calc(100% + 18px)', marginRight: '-18px' }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 md:gap-6">
        {/* Left group: Generate audio + tries label */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <Button
            onClick={onGenerateAudio}
            size="m"
            variant="primary"
            disabled={generateDisabled || !transcriptionValidated}
            className={`shadow-[0_2px_3px_rgba(0,0,0,0.25)] flex gap-[10px] text-sm sm:text-base md:text-lg leading-none font-medium ${generateDisabled || !transcriptionValidated ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {t('translate.generateAudio', { defaultValue: 'Generate audio' })}
          </Button>
          <span className="text-orange-600 text-sm md:self-center">
            {triesLabel}
          </span>
        </div>

        {/* Right group: Validate transcription */}
        <button
          type="button"
          onClick={onValidateTranscription}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0 md:mt-0"
        >
          <div
            className={`w-6 h-6 border-2 rounded-[4px] flex items-center justify-center ${
              transcriptionValidated
                ? 'bg-orange-500 border-orange-500'
                : 'bg-transparent border-gray-400'
            }`}
          >
            {transcriptionValidated && (
              <span className="text-white text-sm">✓</span>
            )}
          </div>
          <span className="text-gray-900 font-medium text-sm sm:text-base md:text-lg">
            {t('translate.validateTranscription', {
              defaultValue: 'Validate transcription',
            })}
            <span className="ml-1 font-medium" style={{ color: '#ef4444' }}>
              *
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
