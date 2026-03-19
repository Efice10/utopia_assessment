/**
 * WhatsApp Integration
 *
 * Provides WhatsApp deep-link generation for sending notifications.
 * Uses wa.me for universal WhatsApp links.
 */

/**
 * Generate WhatsApp deep-link URL
 *
 * @param phone - Phone number (with or without country code)
 * @param message - Pre-filled message
 * @returns WhatsApp URL
 */
export function generateWhatsAppUrl(phone: string | undefined, message: string): string {
  const encodedMessage = encodeURIComponent(message);

  // If phone is provided, use wa.me/{phone}
  // Otherwise, use wa.me/?text= for sharing without a specific recipient
  if (phone) {
    // Clean phone number: remove spaces, dashes, parentheses
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // Ensure phone starts with country code (default to Malaysia +60)
    let formattedPhone = cleanPhone;
    if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('60')) {
      // If starts with 0, replace with 60
      if (cleanPhone.startsWith('0')) {
        formattedPhone = `60${  cleanPhone.substring(1)}`;
      } else {
        formattedPhone = `60${  cleanPhone}`;
      }
    } else if (cleanPhone.startsWith('+')) {
      formattedPhone = cleanPhone.substring(1);
    }

    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  }

  // No phone - return share link
  return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp business API URL (for future integration)
 * Currently returns deep-link as fallback
 */
export function generateBusinessApiUrl(phone: string, message: string): string {
  // For now, use the same deep-link approach
  // In the future, this could be replaced with actual WhatsApp Business API calls
  return generateWhatsAppUrl(phone, message);
}

/**
 * Check if WhatsApp is likely available on the device
 */
export function isWhatsAppAvailable(): boolean {
  // In browser environment, we can't definitively check
  // Return true and let the deep-link handle it
  if (typeof window === 'undefined') return true;

  // Mobile devices are more likely to have WhatsApp
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  return isMobile || true; // Always return true as desktop can use WhatsApp Web
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsApp(phone: string | undefined, message: string): void {
  const url = generateWhatsAppUrl(phone, message);
  window.open(url, '_blank');
}
