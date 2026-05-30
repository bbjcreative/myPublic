export const Colors = {
  primary: '#1A56DB',
  primaryDark: '#1245B0',
  secondary: '#F59E0B',
  background: '#F9FAFB',
  backgroundDark: '#111827',
  surface: '#FFFFFF',
  surfaceDark: '#1F2937',
  text: '#111827',
  textDark: '#F9FAFB',
  textSecondary: '#6B7280',
  textSecondaryDark: '#9CA3AF',
  border: '#E5E7EB',
  borderDark: '#374151',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',

  modeWalk: '#6B7280',
  modeLRT: '#1A56DB',
  modeMRT: '#7C3AED',
  modeKTM: '#059669',
  modeBUS: '#F59E0B',
  modeMONORAIL: '#DB2777',

  severityInfo: '#3B82F6',
  severityWarning: '#F59E0B',
  severitySevere: '#EF4444',

  admobBackground: '#F3F4F6',
  mapBackground: '#E5E7EB',
};

export function getModeColor(mode: string): string {
  const map: Record<string, string> = {
    walk: Colors.modeWalk,
    LRT: Colors.modeLRT,
    MRT: Colors.modeMRT,
    KTM: Colors.modeKTM,
    BUS: Colors.modeBUS,
    MONORAIL: Colors.modeMONORAIL,
  };
  return map[mode] ?? Colors.primary;
}
