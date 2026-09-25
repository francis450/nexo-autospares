import { getRefCode } from './attribution';

// Single analytics entry point. No GA4 or Meta Pixel is installed yet: once their IDs exist,
// load the tags in index.html and forward events here. Event names follow GA4
// (generate_lead, view_item, add_to_cart, begin_checkout, purchase).
export type LeadMethod = 'whatsapp' | 'call' | 'form';

export function track(event: string, params: Record<string, unknown> = {}): void {
  const payload = { ...params, ref: getRefCode() ?? undefined };
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };
  w.gtag?.('event', event, payload);
  if (event === 'generate_lead') w.fbq?.('track', 'Lead', payload);
  if (import.meta.env.DEV) console.debug('[track]', event, payload);
}
