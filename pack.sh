#!/bin/sh

TARGET=build/textdrive

rm -rf $TARGET
mkdir $TARGET
cp -rv app/css app/icon app/js app/index.html app/manifest.json $TARGET
mkdir $TARGET/lib
cp -rv app/lib/jquery-1.8.3.js app/lib/font-awesome $TARGET/lib
mkdir -p $TARGET/lib/ace/src-noconflict
cp app/lib/ace/src-noconflict/ace.js $TARGET/lib/ace/src-noconflict

cd $TARGET/..
rm -rf textdrive.zip
zip -r textdrive.zip textdrive/
