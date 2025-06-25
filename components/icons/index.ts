
// components/icons/index.ts

// First, export everything from the new thematic icons file
export * from './newIcons'; // This will export OracleEyeIcon, StrategyTomeIcon, new Role Icons, AISparkleIcon, BanIcon, EyeIcon, EyeSlashIcon, GoldenLaurelIcon, etc.

// Then, export any remaining unique icons from the old structure that are still needed
// and not covered or renamed in newIcons.tsx

export { DocumentMagnifyingGlassIcon } from './DocumentMagnifyingGlassIcon';
export { ArrowUturnLeftIcon } from './ArrowUturnLeftIcon';
export { UsersIcon } from './UsersIcon';
export { ShieldCheckIcon } from './ShieldCheckIcon'; 
export { GlobeAltIcon } from './GlobeAltIcon';
export { AcademicCapIcon } from './AcademicCapIcon';
export { ArrowsRightLeftIcon } from './ArrowsRightLeftIcon';
export { Cog6ToothIcon } from './Cog6ToothIcon';
export { XMarkIcon } from './XMarkIcon';
export { ArchiveBoxIcon } from './ArchiveBoxIcon';
export { BookOpenIcon } from './BookOpenIcon'; 
export { LinkIcon } from './LinkIcon'; 
export { SunIcon } from './SunIcon'; 
export { MoonIcon } from './MoonIcon'; 
export { MagnifyingGlassIcon } from './MagnifyingGlassIcon'; 
export { HomeIcon } from './HomeIcon'; 
export { ChartBarIcon } from './ChartBarIcon'; 
export { ClipboardDocumentListIcon } from './ClipboardDocumentListIcon';


export { BeakerIcon } from './BeakerIcon'; 
export { ClipboardDocumentIcon } from './ClipboardDocumentIcon';
export { ArrowDownTrayIcon } from './ArrowDownTrayIcon';
export { ArrowUpTrayIcon } from './ArrowUpTrayIcon';
export { UserIcon } from './UserIcon';
export { FlaskConicalIcon } from './FlaskConicalIcon';
export { PaperAirplaneIcon } from './PaperAirplaneIcon';
export { PuzzlePieceIcon } from './PuzzlePieceIcon';
export { ShatteredGlassIcon } from './ShatteredGlassIcon'; 


// Icons for Knowledge Base (these are custom concept icons, keep them if distinct)
export { TeamCompositionIcon } from './TeamCompositionIcon'; // This might be GuardianShieldIcon now, verify usage
export { TrophyIcon } from './TrophyIcon';
export { DamageProfileIcon } from './DamageProfileIcon'; // This might be MagicOrbIcon now, verify usage
export { CheckCircleIcon } from './CheckCircleIcon'; 

// Explicitly export role icons (if these are separate files and not in newIcons.tsx)
// If they ARE in newIcons.tsx, these are redundant due to export *
export { TopLaneIcon } from './TopLaneIcon';
export { JungleLaneIcon } from './JungleLaneIcon';
export { MidLaneIcon } from './MidLaneIcon';
export { ADCCarryIcon } from './ADCCarryIcon';
export { SupportLaneIcon } from './SupportLaneIcon';

// Aliases for icons
export { XMarkIcon as ClearIcon } from './XMarkIcon';
export { CheckCircleIcon as ConfirmIcon } from './CheckCircleIcon';
export { EyeIcon as FocusIcon } from './newIcons'; // Alias EyeIcon from newIcons as FocusIcon


export type { IconProps } from './IconProps';
