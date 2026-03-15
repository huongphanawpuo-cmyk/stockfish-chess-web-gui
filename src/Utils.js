/**
 * Utility functions for the application
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} unsafe
 * @returns {string}
 */
export function escapeHtml(unsafe) {
	if (unsafe === undefined || unsafe === null) {
		return "";
	}
	return String(unsafe)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
