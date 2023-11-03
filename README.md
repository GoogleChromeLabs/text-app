# Text Chrome App

Just a text editor for Chrome OS and Chrome. Install via the Chrome Web Store: [stable version](https://chrome.google.com/webstore/detail/mmfbcljfglbokpmkimbfghdkjmjhdgbg) or [canary version](https://chrome.google.com/webstore/detail/text-canary/fojlbpdodmdfcdeigmknnaeikaadaaoh).

## Getting the code

You can download the whole source code [as one archive](https://github.com/GoogleChromeLabs/text-app/archive/master.zip), or get it from the repository using git:

    git clone --recursive git://github.com/GoogleChromeLabs/text-app.git

## Prebuild CodeMirror
Do this before running the development version or building the package.
```
cd third_party/codemirror.next
npm install
npm run rebuild
```

## Running the development version

* Check `Developer Mode` in `chrome://extensions`
* Click "Load unpacked extension..." in `chrome://extensions` and select the `text-app` directory.

## Building the package

You do not have to build the app to install it in Chrome. Building will just extract all the required files and minify the JS code.

Building script requires Python3 and will use online Closure Compiler. Just run

    python3 build.py

and the package will be written to `text-app/build/` directory in zipped and unzipped formats (canary version). To build the stable version run the build script with the flag -s.
