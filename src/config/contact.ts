import { getRefCode } from '../lib/attribution';
import { track } from '../lib/track';

// Single source for shop contact details. Change them here only.
export const SHOP_CONTACT = {
  name: 'Nexo Autospares',
  phoneDisplay: '0141088163',
  phoneTel: '0141088163',
  whatsappNumber: '254141088163',
  addressShort: 'Kirinyaga Road, Nairobi',
  addressLong: 'Kirinyaga Road, 120m from Shell Globe, Nairobi',
  hours: ['Mon–Sat: 8:00 AM – 6:30 PM', 'Sun: 10:00 AM – 4:00 PM'],
} as const;

/**
 * wa.me link to the counter. Appends the visitor's ad "Ref:" code so WhatsApp leads can be
 * traced to a campaign; pass withRef: false for links meant to be shared with other people.
 */
export const whatsappUrl = (text?: string, { withRef = true } = {}) => {
  const ref = withRef ? getRefCode() : null;
  const body = [text, ref && `Ref: ${ref}`].filter(Boolean).join('\n\n');
  return `https://wa.me/${SHOP_CONTACT.whatsappNumber}${body ? `?text=${encodeURIComponent(body)}` : ''}`;
};

export const telUrl = `tel:${SHOP_CONTACT.phoneTel}`;

/** Opens WhatsApp with a prefilled message and records the lead. `source` names the button. */
export const openWhatsApp = (text: string, source: string) => {
  track('generate_lead', { method: 'whatsapp', source });
  window.open(whatsappUrl(text), '_blank');
};

/** onClick for tel: links. */
export const trackCall = (source: string) => track('generate_lead', { method: 'call', source });
