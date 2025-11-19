import { copyToClipboard } from '../utils/helpers';

/**
 * Service for sharing timers and generating share links
 */
class ShareService {
  /**
   * Generate share link for timer group
   * @param {string} groupName - Group name
   * @param {Array} timers - Array of timers
   * @returns {string} Share URL
   */
  generateShareLink(groupName, timers) {
    try {
      const shareData = {
        group: groupName,
        timers: timers.map(t => ({
          name: t.name,
          duration: t.duration,
          unit: t.unit,
          color: t.color,
          group: t.group
        })),
        version: '1.0',
        timestamp: Date.now()
      };

      const encoded = btoa(JSON.stringify(shareData));
      const url = `${window.location.origin}${window.location.pathname}?import=${encoded}`;

      return url;
    } catch (error) {
      console.error('Error generating share link:', error);
      return null;
    }
  }

  /**
   * Parse share link from URL
   * @param {string} url - URL or encoded string
   * @returns {Object|null} Parsed share data
   */
  parseShareLink(url) {
    try {
      // Extract import parameter
      let encoded;
      if (url.includes('?import=')) {
        const urlObj = new URL(url);
        encoded = urlObj.searchParams.get('import');
      } else {
        encoded = url;
      }

      if (!encoded) return null;

      const decoded = atob(encoded);
      const data = JSON.parse(decoded);

      // Validate data structure
      if (!data.group || !Array.isArray(data.timers)) {
        throw new Error('Invalid share data structure');
      }

      return data;
    } catch (error) {
      console.error('Error parsing share link:', error);
      return null;
    }
  }

  /**
   * Share via Web Share API (if available)
   * @param {string} title - Share title
   * @param {string} text - Share text
   * @param {string} url - Share URL
   * @returns {Promise<boolean>} Success status
   */
  async shareViaWebAPI(title, text, url) {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing via Web Share API:', error);
      }
      return false;
    }
  }

  /**
   * Share timer group with fallback methods
   * @param {string} groupName - Group name
   * @param {Array} timers - Array of timers
   * @returns {Promise<Object>} Result with method and success status
   */
  async shareTimerGroup(groupName, timers) {
    const url = this.generateShareLink(groupName, timers);

    if (!url) {
      return { success: false, method: 'none', message: 'Failed to generate link' };
    }

    // Try Web Share API first (mobile-friendly)
    const webShareSuccess = await this.shareViaWebAPI(
      `${groupName} Timers`,
      `Check out my ${groupName} timer collection!`,
      url
    );

    if (webShareSuccess) {
      return { success: true, method: 'webapi', url };
    }

    // Fallback to clipboard
    const clipboardSuccess = await copyToClipboard(url);

    if (clipboardSuccess) {
      return { success: true, method: 'clipboard', url };
    }

    return { success: false, method: 'none', url, message: 'Could not share' };
  }

  /**
   * Export single timer as JSON
   * @param {Object} timer - Timer object
   * @returns {string} JSON string
   */
  exportTimerAsJSON(timer) {
    try {
      return JSON.stringify(timer, null, 2);
    } catch (error) {
      console.error('Error exporting timer as JSON:', error);
      return null;
    }
  }

  /**
   * Download data as file
   * @param {string} data - Data to download
   * @param {string} filename - File name
   * @param {string} mimeType - MIME type
   */
  downloadAsFile(data, filename, mimeType = 'application/json') {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }
}

const shareService = new ShareService();

export default shareService;