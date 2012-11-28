#!/usr/bin/python3

import json
import os
import shutil
import subprocess
import sys

APP_NAME = 'TextDrive'

BASE_DIR = os.path.dirname(sys.argv[0])
SOURCE_DIR = os.path.join(BASE_DIR, 'app')
BUILD_DIR = os.path.join(BASE_DIR, 'build')

FILES = [
  'index.html',
  'css/app.css',
  'icon/16x16.png',
  'icon/96x96.png',
  'icon/128x128.png',
  'icon/256x256.png',
  'js/app.js',
  'js/background.js',
  'js/editor.js',
  'js/menu_controller.js',
  'js/tabs.js',
  'js/tabs_controller.js',
  'js/util.js',
  'js/window_controller.js',
  'lib/jquery-1.8.3.js',
  'lib/ace/src-noconflict/ace.js',
  'lib/font-awesome/css/font-awesome.css',
  'lib/font-awesome/font/fontawesome-webfont.woff'
]

MANIFEST = 'manifest.json'


def delete(*paths):
  for path in paths:
    if os.path.isdir(path):
      print('Deleting', path)
      shutil.rmtree(path, ignore_errors=True)
    elif os.path.isfile(path):
      print('Deleting', path)
      os.remove(path)


def copy_files(src, dst, files):
  for f in files:
    print('Copying', f)
    full_path = os.path.join(src, f)
    target_path = os.path.join(dst, f)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    shutil.copy(full_path, target_path)


def get_version():
  version = subprocess.check_output(['git', 'describe'],
                                    universal_newlines=True)
  return version.strip()[1:]


def process_manifest(out_dir, version):
  manifest = json.load(open(os.path.join(SOURCE_DIR, MANIFEST)))
  manifest['version'] = version
  json.dump(manifest, open(os.path.join(out_dir, MANIFEST), 'w'))
  

def main():
  version = get_version()

  out_dir = os.path.join(BUILD_DIR, APP_NAME + '-' + version)
  archive_path = out_dir + '.zip'
  delete(out_dir, archive_path)
  copy_files(SOURCE_DIR, out_dir, FILES)

  process_manifest(out_dir, version)
  
  print('Archiving', archive_path)
  shutil.make_archive(out_dir, 'zip', os.path.abspath(BUILD_DIR),
                      os.path.abspath(out_dir))


if __name__ == '__main__':
  main()
