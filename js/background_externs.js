/**
 * @constructor
 */
function TextApp() {}
/**
 * @param {boolean} v
 */
TextApp.prototype.setHasChromeFrame = function(v) {};
/**
 * @param {Array.<FileEntry>} entries
 */
TextApp.prototype.openTabs = function(entries) {};
/**
 * @return {Array.<FileEntry>}
 */
TextApp.prototype.getFilesToRetain = function() {};

/**
 * @type {TextApp}
 */
window.textApp = {};
