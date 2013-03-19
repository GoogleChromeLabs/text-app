var chrome = {};
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
function TextDrive() {}
/**
 * @param {boolean} v
 */
TextDrive.prototype.setHasChromeFrame = function(v) {};
/**
 * @param {Array.<FileEntry>} entries
 */
TextDrive.prototype.openEntries = function(entries) {};
TextDrive.prototype.openNew = function() {};
/**
 * @return {Array.<Object>}
 */
TextDrive.prototype.getFilesToSave = function() {};

/**
 * @type {TextDrive}
 */
window.textDrive = {};