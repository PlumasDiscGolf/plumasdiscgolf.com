import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a date string from YYYY-MM-DD or YYYY-MM-DDTHH:mm
 * to a UTC ISO string for PocketBase.
 *
 * IMPORTANT: these two input shapes are handled differently, on purpose.
 * - "YYYY-MM-DDTHH:mm" (from <input type="datetime-local">) has a real,
 *   meaningful time-of-day (e.g. "meeting starts at 5:30pm") — parsed as
 *   local time, which is what the browser actually meant.
 * - "YYYY-MM-DD" (from <input type="date">) has NO time-of-day meaning at
 *   all — it's just a calendar date. `new Date("YYYY-MM-DD")` parses this
 *   as UTC MIDNIGHT per the JS spec (NOT local time, despite what this
 *   function's behavior might suggest) — which means any viewer in a
 *   timezone behind UTC sees it rendered as the PREVIOUS calendar day. This
 *   is explicitly forced to UTC NOON instead, which is far enough from any
 *   timezone's day boundary to always land on the correct calendar date for
 *   every real-world timezone.
 * @param {string | undefined | null} inputDateTime
 * @returns {string | null} UTC ISO string or null if input is invalid/empty
 */
export function formatInputDateToPocketBase(inputDateTime) {
	if (!inputDateTime) return null;

	const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(inputDateTime);
	const date = isDateOnly ? new Date(`${inputDateTime}T12:00:00Z`) : new Date(inputDateTime);

	if (!isValid(date)) {
		return null; // Or throw an error
	}

	// .toISOString() correctly converts the date to a UTC string
	return date.toISOString();
}

/**
 * Formats a UTC ISO string from PocketBase to YYYY-MM-DDTHH:mm
 * for HTML datetime-local input.
 * @param {string | undefined | null} pbDateTime
 * @returns {string} Formatted local datetime string or empty string
 */
export function formatPocketBaseDateToLocalInput(pbDateTime) {
	if (!pbDateTime) return '';

	// parseISO handles the UTC string, and format displays it in the local timezone by default.
	const date = parseISO(pbDateTime);
	return format(date, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Formats a UTC ISO string from PocketBase to YYYY-MM-DD
 * for HTML date input.
 * @param {string | undefined | null} pbDateTime
 * @returns {string} Formatted local date string or empty string
 */
export function formatPocketBaseDateToDateInput(pbDateTime) {
	if (!pbDateTime) return '';

	const date = parseISO(pbDateTime);
	return format(date, 'yyyy-MM-dd');
}

export const serializeNonPOJOs = (obj) => {
	return structuredClone(obj);
};

export const dateOptions = {
	weekday: 'long',
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

export const preventDefault = (handler) => {
	return (e) => {
		e.preventDefault();
		handler(e);
	};
};