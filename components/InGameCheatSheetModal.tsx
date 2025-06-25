
import React from 'react';
import { Modal } from './Modal';
import { InGameCheatSheetModalProps, DraftAnalysis, StructuredDraftRec } from '../types';
import { ClipboardDocumentIcon } from './icons/index';
import { formatMarkdownString } from '../utils/textFormatting';

const extractCheatSheetContentFromStructuredData = (data: StructuredDraftRec): string => {
  const reminders = data.keyInGameReminders;
  if (!reminders) return "Key reminders not available in this analysis.";

  return `
*   **Our Top Win Condition:** ${reminders.ourTopWinCondition}
*   **Enemy's Top Win Condition:** ${reminders.enemyTopWinCondition}
*   **Key Threats Summary:** ${reminders.keyThreatsSummary}
*   **Target Priority in Fights:** ${reminders.targetPriorityInFights}
*   **Crucial Itemization Note:** ${reminders.crucialItemizationNote}
  `.trim();
};

// Legacy function, kept for safety but ideally not used if analysis is structured.
const extractCheatSheetContentFromText = (fullAnalysisText: string): string | null => {
  const cheatSheetHeading = "### Key In-Game Reminders (Cheat Sheet)";
  const startIndex = fullAnalysisText.indexOf(cheatSheetHeading);

  if (startIndex === -1) {
    return null; 
  }
  const contentStartIndex = startIndex + cheatSheetHeading.length;
  let contentEndIndex = fullAnalysisText.indexOf("### ", contentStartIndex);
  if (contentEndIndex === -1) {
    contentEndIndex = fullAnalysisText.length; 
  }
  return fullAnalysisText.substring(contentStartIndex, contentEndIndex).trim();
};


export const InGameCheatSheetModal: React.FC<InGameCheatSheetModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  if (!isOpen || !analysis) return null;

  let cheatSheetText: string | null = null;

  if (analysis.analysisType === 'draft' && typeof analysis.analysisData === 'object' && (analysis.analysisData as StructuredDraftRec).keyInGameReminders) {
    cheatSheetText = extractCheatSheetContentFromStructuredData(analysis.analysisData as StructuredDraftRec);
  } else if (typeof analysis.analysisData === 'string') {
    // Fallback for old text-based analysis or if structure is missing
    cheatSheetText = extractCheatSheetContentFromText(analysis.analysisData);
  }


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="In-Game Cheat Sheet"
      titleIcon={<ClipboardDocumentIcon className="w-5 h-5 text-sky-400" />}
      size="lg" 
      modalId="in-game-cheat-sheet-modal"
      footerContent={<button onClick={onClose} className="lol-button lol-button-secondary">Close</button>}
    >
      <div className="p-4 sm:p-6 prose prose-sm sm:prose-base prose-invert max-w-none text-slate-200 leading-relaxed selection:bg-sky-500 selection:text-white">
        {cheatSheetText ? (
          formatMarkdownString(cheatSheetText)
        ) : (
          <p className="text-center text-slate-400 py-4">
            Key In-Game Reminders section not found or not applicable for this analysis type.
          </p>
        )}
      </div>
    </Modal>
  );
};
