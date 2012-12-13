# TextDrive

Just a text editor for ChromeOS. Can also be used on any other system with Chrome.

## Getting the code

You can download the whole source code [as one archive](https://github.com/eterevsky/textdrive-app/archive/master.zip), or get it from the repository using git:

    git clone git://github.com/eterevsky/textdrive-app.git textdrive
    cd textdrive
    git submodule init
    git submodule update

## Running on Chrome

* Check `Developer Mode` in `chrome://chrome/extensions/`
* Click "Load unpacked extension..." in `chrome://chrome/extensions/` and open the `app/` directory.

## Building the package

You do not have to build the app to install it in Chrome. Building will just extract all the required files and minify the JS code.

Building script requires Python3 and will use online Closure Compiler. Just run

    python3 build.py

and the package will be written to `textdrive/build/` directory in zipped and unzipped formats.
