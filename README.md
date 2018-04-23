# Text Chrome App

Just a text editor for ChromeOS and Chrome. To install visit the [Chrome Web Store page](https://chrome.google.com/webstore/detail/mmfbcljfglbokpmkimbfghdkjmjhdgbg).

## Getting the code

You can download the whole source code [as one archive](https://github.com/GoogleChromeLabs/text-app/archive/master.zip), or get it from the repository using git:

    git clone --recursive git://github.com/GoogleChromeLabs/text-app.git

## Running the development version

* Check `Developer Mode` in `chrome://extensions`
* Click "Load unpacked extension..." in `chrome://extensions` and select the `text-app` directory.

## Building the package

You do not have to build the app to install it in Chrome. Building will just extract all the required files and minify the JS code.

Building script requires Python3 and will use online Closure Compiler. Just run

    python3 build.py

and the package will be written to `text-app/build/` directory in zipped and unzipped formats.
