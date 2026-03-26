import type { BookingDraft } from '@/lib/types';

const KEY = 'aerodesk-booking-draft';

export function getBookingDraft(): BookingDraft | null {
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as BookingDraft) : null;
}

export function setBookingDraft(draft: BookingDraft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearBookingDraft() {
  sessionStorage.removeItem(KEY);
}
