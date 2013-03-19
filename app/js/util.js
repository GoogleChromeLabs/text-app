var util = {};

util.handleFSError = function(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  }

  console.warn('FS Error:', e, msg);
};

/**
 * @param {FileEntry} entry
 * @param {string} content
 * @param {Function} onsuccess
 * Make a writable copy of entry, truncate the file and write the content.
 */
util.writeFile = function(entry, content, onsuccess) {
  var blob = new Blob([content], {type: 'text/plain'});
  chrome.fileSystem.getWritableEntry(
      entry, util.truncateAndWriteWritable_.bind(null, blob, onsuccess));
};

/**
 * @param {FileEntry} entry
 * @param {Blob} blob
 * @param {Function} onsuccess
 */
util.truncateAndWriteWritable_ = function(blob, onsuccess, entry) {
  entry.createWriter(function(writer) {
    writer.onerror = util.handleFSError;
    writer.onwrite = util.writeToWriter_.bind(null, writer, blob, onsuccess);
    writer.truncate(blob.size);
  });
};

/**
 * @param {FileWriter} writer
 * @param {Blob} blob
 * @param {Function} onsuccess
 */
util.writeToWriter_ = function(writer, blob, onsuccess) {
  writer.onwrite = onsuccess;
  writer.write(blob);
};
