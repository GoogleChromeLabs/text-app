chrome.app = {};
chrome.app.runtime = {};
chrome.app.runtime.onLaunched = {};
/**
 * @param {function} callback
 */
chrome.app.runtime.onLaunched.addListener = function(callback) {};

chrome.app.window = {};
/**
 * @param {function(AppWindow)}
 */
chrome.app.window.create = function(callback) {};


chrome.fileSystem = {};
/**
 * @param {FileEntry} entry
 * @param {function(FileEntry)} callback
 */
chrome.fileSystem.getWritableEntry = function(entry, callback) {};
/**
 * @param {FileEntry} entry
 */
chrome.fileSystem.retainEntry = function(entry) {};
/**
 * @param {string} id
 * @param {function(FileEntry)} callback
 */
chrome.fileSystem.restoreEntry = function(id, callback) {};


chrome.storage = {};
chrome.storage.local = {};
/**
 * @param {Object} items
 * @param {function} callback
 */
chrome.storage.local.set = function(items, callback) {};
/**
 * @param {Object} keys
 * @param {function(<Object>)} callback
 */
chrome.storage.local.get = function(keys, callback) {};

/**
 * @constructor
 */
function AppWindow() {}

AppWindow.prototype.onClosed = {};
/**
 * @param {function} callback
 */
AppWindow.prototype.onClosed.addListener = function(callback) {};
/**
 * @type {Window}
 */
AppWindow.prototype.contentWindow = {};

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
TextApp.prototype.openEntries = function(entries) {};
TextApp.prototype.openNew = function() {};
/**
 * @return {Array.<FileEntry>}
 */
TextApp.prototype.getFilesToRetain = function() {};

/**
 * @type {TextApp}
 */
window.textApp = {};
