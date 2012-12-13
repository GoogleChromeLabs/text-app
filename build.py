#!/usr/bin/python3

import json
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

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
  'images/close.svg',
  'images/close-tab.svg',
  'images/maximize.svg',
  'images/menu.svg',
  'images/search.svg',
  'js/background.js',
  'lib/jquery-1.8.3.min.js',
  'lib/ace/src-min-noconflict/ace.js'
]

MANIFEST = 'manifest.json'
INDEX_HTML = 'index.html'
TARGET_JS = 'js/all.js'
TARGET_JS_INCLUDE = ('<script src="' + TARGET_JS + '" type="text/javascript">'
                     '</script>')
JS_INCLUDES = re.compile(r'(<!-- JS -->.*<!-- /JS -->)', flags=re.M | re.S)
JS_SRC = re.compile(r'<script src="([^"]*)" type="text/javascript">')
CLOSURE_URL = 'http://closure-compiler.appspot.com/compile'
JQUERY_EXTERNS = ('http://closure-compiler.googlecode.com/'
                  'svn/trunk/contrib/externs/jquery-1.8.js')


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


def print_errors(errors, js_files):
  for error in errors:
    fileno = int(error['file'][6:])
    if 'error' in error:
      text = error['error']
    else:
      text = error['warning']
    print(js_files[fileno] + ':' + str(error['lineno']) + ' ' + text)
    print(error['line'])


def compile_js(out_dir, js_files):
  print('Compiling JavaScript code.')
  js_code = []
  for js_file in js_files:
    js_code.append(open(os.path.join(SOURCE_DIR, js_file)).read())

  params = [
      ('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
      ('formatting', 'pretty_print'),
      ('output_format', 'json'),
      ('output_info', 'statistics'),
      ('output_info', 'warnings'),
      ('output_info', 'errors'),
      ('output_info', 'compiled_code'),
    ]
  for code in js_code:
    params.append(('js_code', code))

  params = bytes(urllib.parse.urlencode(params, encoding='utf8'), 'utf8')
  headers = {'Content-Type': 'application/x-www-form-urlencoded'}

  print('Connecting', CLOSURE_URL)
  out = urllib.request.urlopen(CLOSURE_URL, data=params)
  result = json.loads(out.read().decode('utf8'))

  if 'errors' in result and len(result['errors']):
    print('Errors:')
    print_errors(result['errors'], js_files)
    print()

  if 'warnings' in result and len(result['warnings']):
    print('Warnings:')
    print_errors(result['warnings'], js_files)
    print()

  all_js_dst = os.path.join(out_dir, TARGET_JS)
  print('Writing', all_js_dst)
  os.makedirs(os.path.dirname(all_js_dst), exist_ok=True)
  open(all_js_dst, 'w').write(result['compiledCode'])


def main():
  version = get_version()

  dir_name = APP_NAME + '-' + version
  out_dir = os.path.join(BUILD_DIR, dir_name)
  archive_path = out_dir + '.zip'
  delete(out_dir, archive_path)
  copy_files(SOURCE_DIR, out_dir, FILES)

  process_manifest(out_dir, version)
  js_files = process_index(out_dir)
  compile_js(out_dir, js_files)

  print('Archiving', archive_path)
  shutil.make_archive(out_dir, 'zip',
                      root_dir=os.path.abspath(BUILD_DIR),
                      base_dir=dir_name,
                      verbose=True)


if __name__ == '__main__':
  main()
