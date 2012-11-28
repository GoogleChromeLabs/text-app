#!/usr/bin/python3

import json
import os
import re
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
  'js/background.js',
  'lib/font-awesome/css/font-awesome.css',
  'lib/font-awesome/font/fontawesome-webfont.woff'
]

MANIFEST = 'manifest.json'
INDEX_HTML = 'index.html'
TARGET_JS = 'js/all.js'
TARGET_JS_INCLUDE = ('<script src="' + TARGET_JS + '" type="text/javascript">'
                     '</script>')
JS_INCLUDES = re.compile(r'(<!-- JS -->.*<!-- /JS -->)', flags=re.M | re.S)
JS_SRC = re.compile(r'<script src="([^"]*)" type="text/javascript">')


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
  match = re.compile('v(\d+(?:\.\d+))(?:-(\d+)-g.*)?').match(version)
  version = match.group(1)
  if match.group(2):
    version += '.' + match.group(2)
  return version


def process_manifest(out_dir, version):
  manifest = json.load(open(os.path.join(SOURCE_DIR, MANIFEST)))
  manifest['version'] = version
  json.dump(manifest, open(os.path.join(out_dir, MANIFEST), 'w'))


def process_index(out_dir):
  html = open(os.path.join(SOURCE_DIR, INDEX_HTML)).read()
  match = JS_INCLUDES.search(html)
  if not match:
    print('Can\'t find JS includes in index.html.')
    exit(1)
  js_includes = match.group(1)

  html = JS_INCLUDES.sub(TARGET_JS_INCLUDE, html)
  open(os.path.join(out_dir, INDEX_HTML), 'w').write(html)

  js_files = []
  for match in JS_SRC.finditer(js_includes):
    js_files.append(match.group(1))
  return js_files


def compile_js(out_dir, js_files):
  print('Compiling JavaScript code.')
  all_js = ''
  for js_file in js_files:
    all_js += open(os.path.join(SOURCE_DIR, js_file)).read() + '\n'
  all_js_dst = os.path.join(out_dir, TARGET_JS)
  os.makedirs(os.path.dirname(all_js_dst), exist_ok=True)
  print('Writing', all_js_dst)
  open(all_js_dst, 'w').write(all_js)


def main():
  version = get_version()

  out_dir = os.path.join(BUILD_DIR, APP_NAME + '-' + version)
  archive_path = out_dir + '.zip'
  delete(out_dir, archive_path)
  copy_files(SOURCE_DIR, out_dir, FILES)

  process_manifest(out_dir, version)
  js_files = process_index(out_dir)
  compile_js(out_dir, js_files)
  
  print('Archiving', archive_path)
  shutil.make_archive(out_dir, 'zip', os.path.abspath(BUILD_DIR),
                      os.path.abspath(out_dir))


if __name__ == '__main__':
  main()
