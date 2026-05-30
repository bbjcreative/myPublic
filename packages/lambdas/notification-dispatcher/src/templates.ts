export interface AlertMessage {
  title_en: string;
  title_ms: string;
  body_en: string;
  body_ms: string;
}

export function buildAlertMessage(
  severity: 'INFO' | 'WARNING' | 'SEVERE',
  headerText: string,
  descriptionText: string,
  affectedRoutes: string[]
): AlertMessage {
  const routeList = affectedRoutes.join(', ');

  const severityPrefix: Record<string, { en: string; ms: string }> = {
    INFO: { en: 'Service Update', ms: 'Kemas Kini Perkhidmatan' },
    WARNING: { en: 'Service Disruption', ms: 'Gangguan Perkhidmatan' },
    SEVERE: { en: 'URGENT: Service Alert', ms: 'SEGERA: Amaran Perkhidmatan' },
  };

  const prefix = severityPrefix[severity] ?? severityPrefix['INFO'];

  return {
    title_en: `${prefix.en}: ${routeList}`,
    title_ms: `${prefix.ms}: ${routeList}`,
    body_en: descriptionText || headerText,
    body_ms: descriptionText || headerText,
  };
}
