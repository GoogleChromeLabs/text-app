# TextDrive

Just a text editor for ChromeOS.

## Running on Chrome

* install [Chrome Canary](http://www.chromium.org/getting-involved/dev-channel/)
* enable `Experimental Extension APIs` in `chrome://flags`
* check `Developer Mode` in `chrome://chrome/extensions/`
* load as "unpacked extension" in `chrome://chrome/extensions/`


## Screenshots

### Main Screen
![Screenshot: TextDrive](https://github.com/vojtajina/textdrive/raw/master/screen_main.png)

### Settings
![Screenshot: Settings](https://github.com/vojtajina/textdrive/raw/master/screen_settings.png)

### Search (grep like filtering)
![Screenshot: Grep like filtering](https://github.com/vojtajina/textdrive/raw/master/screen_grep.png)



## Development

    grunt --help

Show all available grunt tasks.


### Install required packages

    npm install

Install `testacular`, `grunt`, `coffee-script`, `less`.


### Watch unit tests (coffee script) and styles (less)

    grunt watch


### Recompile all unit tests (coffee script)

    grunt coffee

Recompile all coffee script code (unit tests + mocks) in `test/unit/`.


### Recompile all less styles

    grunt less

Recompile all less files in `app/less/` and create css files in `app/css/`.


### Run unit tests

    testacular testacular.js

Capture Chrome Canary, start watching all the source files and run unit tests on change.


### Build package

    grunt build pack

Create `build/package-*.zip/` package, ready for uploading to [Chrome Web Store](https://chrome.google.com/webstore/category/home).



## Built With

- [AngularJS](http://angularjs.org/)
- [ACE Editor](http://ace.ajax.org/)
- [Font Awesome](http://fortawesome.github.com/Font-Awesome/)
