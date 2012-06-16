TD.value('chromeFs', chrome.fileSystem);



/*
Platform Access to native FS
https://docs.google.com/a/google.com/document/d/1B3Bbns0vP6lx7w8agrIZbSgfMsfQJc5dqv34_z5ARQY/edit?pli=1


// Returns a path suitable for displaying to the user. Currently
// this is the full path but will get prettified (e.g. highlight
// the users' home directory) in future.
chrome.fileSystem.getDisplayPath(fileEntry, function(path) {...});

// Obtain a read / write FileEntry from a read-only one.
// The original FileEntry is not changed and remains read-only.
// This function opens a file picker with the initial path set
// from the read only entry; a different path can be chosen if
// the user wants to save into a different file.
chrome.fileSystem.getWritableFileEntry(readOnlyEntry, function(writableEntry) {...});

// Prompt the user for a read-only FileEntry.
chrome.fileSystem.chooseFile(function(readOnlyEntry) {...});
// or
chrome.fileSystem.chooseFile({type: "openFile"}, function(readOnlyEntry) {...});

// Prompt the use for a read / write entry. If a new file is
// chosen an empty file will be created before the FileEntry is
// returned.
// More options will be added to chooseFile in future.
chrome.fileSystem.chooseFile({type: "saveFile"}, function(writableEntry) {...});
*/
