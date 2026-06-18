export type ExpiryStatus = 'expired' | 'urgent' | 'warning' | 'safe';

/**
 * Calculates the expiry status based on a target date.
 * @param targetDateStr YYYY-MM-DD string
 * @returns ExpiryStatus
 */
export const getExpiryStatus = (targetDateStr?: string | null): ExpiryStatus => {
  if (!targetDateStr) return 'safe';
  
  // Normalize dates to midnight to avoid time-of-day timezone issues
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 1) {
    return 'urgent';
  } else if (diffDays <= 3) {
    return 'warning';
  } else {
    return 'safe';
  }
};
