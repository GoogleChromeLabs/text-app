# TextDrive

Just a text editor for ChromeOS. Can also be used on any other system with Chrome.

## Running on Chrome

* Check `Developer Mode` in `chrome://chrome/extensions/`
* Load as "unpacked extension" in `chrome://chrome/extensions/`. You can load the extension from `textdrive/app` or, after building it, from `textdrive/build/TextDrive-<version>`.


## Getting the code

    git clone git://github.com/eterevsky/textdrive-app.git textdrive
    cd textdrive
    git submodule init
    git submodule update


## Building the package

Building script requires Python3 and will use online Closure Compiler. Just run

    python3 build.py

and the package will be written to textdrive/build/ directory in zipped and unzipped formats.
