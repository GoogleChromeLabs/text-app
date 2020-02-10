var util = {};

/**
 * A object which describes an edit session. Each session contains an instance
 * of how it should be represented to codemirror and to textarea so the two can
 * be easily switched between.
 * @typedef {{
 *            textarea:HTMLElement,
 *            codemirror:Object,
 *          }}
 */
var SessionDescriptor;

/**
 * @param {Event} e
 * @return {string} Human-readable error description.
 */
util.fsErrorStr = function(e) {
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      return 'Quota exceeded';
    case FileError.NOT_FOUND_ERR:
      return 'File not found';
    case FileError.SECURITY_ERR:
      return 'Security error';
    case FileError.INVALID_MODIFICATION_ERR:
      return 'Invalid modification';
    case FileError.INVALID_STATE_ERR:
      return 'Invalid state';
    default:
      return 'Unknown Error';
  }
}

util.handleFSError = function(e) {
  $.event.trigger('filesystemerror');
  console.warn('FS Error:', util.fsErrorStr(e), e);
};

/**
 * @param {FileEntry} entry
 * @param {string} content
 * @param {Function} onsuccess
 * @param {Function?} opt_onerror
 * Truncate the file and write the content.
 */
util.writeFile = function(entry, content, onsuccess, opt_onerror) {
  var blob = new Blob([content], {type: 'text/plain'});
  entry.createWriter(function(writer) {
    writer.onerror = opt_onerror ? opt_onerror : util.handleFSError;
    writer.onwrite = util.writeToWriter_.bind(null, writer, blob, onsuccess);
    writer.truncate(blob.size);
  });
};

/**
 * @param {FileWriter} writer
 * @param {!Blob} blob
 * @param {Function} onsuccess
 */
util.writeToWriter_ = function(writer, blob, onsuccess) {
  writer.onwrite = onsuccess;
  writer.write(blob);
};

/**
 * @param {string} fileName
 * @return {string} Sanitized File name.
 * Returns a sanitized version of a File Name.
 */
util.sanitizeFileName = function(fileName) {
  return fileName.replace(/[^a-z0-9\-]/gi, ' ').substr(0, 50).trim();
}

/**
 * @param {string} fileName
 * @return {?string} Extension.
 * Returns the extension of a File Name or null if there's none.
 */
util.getExtension = function(fileName) {
  var match = /\.([^.\\\/]+)$/.exec(fileName);

  if (match) {
    return match[1];
  } else {
    return null;
  }
};

/**
 * @param {?string} [text] Text content.
 * @return {string} Line endings.
 * Returns guessed line endings or LF if not successful.
 */
util.guessLineEndings = function(text) {
  if (!text) {
    return '\n';
  }
  var indexOfLF = text.indexOf('\n');
  var hasCRLF = (indexOfLF > 0) && (text[indexOfLF - 1] === '\r');

  return (hasCRLF ? '\r\n' : '\n');
};

/**
 * @param {?string} opt_content Optional content.
 * @return {SessionDescriptor}
 * Creates a unified session that can be read from any supported editor.
 */
util.createUnifiedSession = function(opt_content) {
  const textarea = document.createElement('textarea');
  textarea.value = opt_content || '';

  return {
    codemirror: new CodeMirror.Doc(opt_content || ''),
    textarea: textarea,
  };
}

/**
 * @param {SessionDescriptor} session
 * @param {string} updated Which text source is the source of truth.
 * @param {string} lineEndings What to use as a line ending
 * Syncs the multiple formats of a unified session. If one format of the session
 * such as the codemirror instance generates a change, it's registered here and
 * copied over to the other formats (such as textarea) so all of the formats
 * have the correct text. This means if you switch between modes you don't lose
 * any text. This does cause the other editer to lose it's undo/redo stack,
 * textarea loses all history whereas codemirror tries and interpert each
 * changed character as a single edit, which blows the undo stack out.
 */
util.syncUnifiedSession = function(session, updated, lineEndings) {
  // TODO: Update this so that updating 1 editor syncs to the other editors in a
  // way that preserves undo/redo stacks.
  switch(updated) {
    case 'codemirror':
      session.textarea.value = session.codemirror.getValue(lineEndings);
      break;
    case 'textarea':
      session.codemirror.setValue(session.textarea.value);
      break;
  }
}
