# FileDialog
This module is responsible of saving, loading, managing and creating files additionally it features a powerful driver system, allowing multiple backends.

## Usage
* `yasp.FileDialog.show(mode)` shows the FileDialog, mode describing in which mode the FileDialog should be started. Possible parameters are: `yasp.FileDialogMode.OPEN` (FileDialog in open mode), `yasp.FileDialogMode.SAVE` (in save mode), `yasp.FileDialogMode.SAVEAS` (in save as mode), `yasp.FileDialogMode.NEW` (in new mode).
* `yasp.FileDialog.close` closes current FileDialog

## Driver
Currently there are two possible ways of storing files:
* Local: This saves everything serialized as a JSON object in the localStorage
* PHP: This saves to the PHP server specifically programmed for yasp

The drivers are all callback based, so it is easily possible to transform the operations into REST requests


## Structure
A Driver has to support following operations:

```
DRIVERNAME: {
  newFile: function(name, cb) {
    // newfile => cb(instance of the createdFile)
  },
  requestList: function(cb) {
    // requests list => cb(array of all the files)
  },
  deleteFile: function(name, cb) {
    // deletes file => cb(instance of the deletedFile)
  },
  renameFile: function(oldname, newname, cb) {
    // renames file => cb(successful?)
  },
  openFile: function(name, cb) {
    // opens file => cb(instance of the opened file)
  },
  saveFile: function(file, cb) {
    // saves file => cb(instance of the saved file)
  }
}
```

They should be declared in the `yasp.FileDialog.FileSystemDriver` object.

## File
The files are object that represent a specific file in the JS environment. Following attributes define a file:

```
{
  filename: name_of_file,
  username: name_of_user,
  createdate: time_of_creation,
  group: group_of_user,
  changedate: last_change_of_file,
  content: content_of_file
}
```

Files have to be serializable by `JSON.stringify`, otherwise the backend drivers do not work properly.