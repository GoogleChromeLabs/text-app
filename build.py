#!/usr/bin/python3

import json
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request

APP_NAME = 'Text'
IS_APP = True

BASE_DIR = os.path.dirname(sys.argv[0])
SOURCE_DIR = BASE_DIR
BUILD_DIR = os.path.join(BASE_DIR, 'build')

FILES = [
  'index.html',
  '_locales/en/messages.json',
  'css/app.css',
  'css/print.css',
  'css/theme-dark.css',
  'css/theme-default.css',
  'css/theme-light.css',
  'icon/16x16.png',
  'icon/32x32.png',
  'icon/48x48.png',
  'icon/64x64.png',
  'icon/96x96.png',
  'icon/128x128.png',
  'icon/256x256.png',
  'images/arrow-down.svg',
  'images/arrow-up.svg',
  'images/check_no_box.png',
  'images/check_no_box_white.png',
  'images/close.svg',
  'images/close-tab.svg',
  'images/maximize.svg',
  'images/menu.svg',
  'images/search.svg',
  'images/minimize.svg',
  'lib/analytics/google-analytics-bundle.js',
  'lib/CodeMirror/lib/codemirror.css',
  'lib/jquery-1.8.3.min.js'
 ]

MANIFEST = 'manifest.json'
INDEX_HTML = 'index.html'
TARGET_JS = 'js/all.js'
TARGET_JS_INCLUDE = ('<script src="' + TARGET_JS + '" type="text/javascript">'
                     '</script>')
JS_INCLUDES = re.compile(r'(<!-- JS -->.*<!-- /JS -->)', flags=re.M | re.S)
JS_SRC = re.compile(r'<script src="([^"]*)" type="text/javascript">')
CLOSURE_URL = 'http://closure-compiler.appspot.com/compile'
BACKGROUND_EXTERNS = os.path.join(SOURCE_DIR, 'js/externs.js')
JS_EXTERNS = None
EXTERNS_URLS = [
  'https://raw.githubusercontent.com' +
      '/google/closure-compiler/master/contrib/externs/jquery-1.8.js',
  'https://raw.githubusercontent.com' +
      '/google/closure-compiler/master/contrib/externs/google_analytics_api.js'
]

SKIP_JS_FILES = []

USE_LOCALIZED_NAME = False
COMPILATION_LEVEL = 'SIMPLE_OPTIMIZATIONS'
BACKGROUND_COMPILATION_LEVEL = 'ADVANCED_OPTIMIZATIONS'

debug_build = False


def parse_command_line():
  global debug_build
  for option in sys.argv[1:]:
    if option == '-d':
      debug_build = True
    else:
      raise Exception('Unknown command line option: ' + option)


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
  if USE_LOCALIZED_NAME:
    manifest['name'] = '__MSG_extName__'
  else:
    manifest['name'] = APP_NAME
  manifest['version'] = version

  if IS_APP:
    background_js = manifest['app']['background']['scripts']
  else:
    background_js = manifest['background']['scripts']

  background_libs = set(f for f in background_js if f.startswith('lib'))
  background_js = set(background_js) - background_libs
  background_libs.add('js/background.js')

  if IS_APP:
    manifest['app']['background']['scripts'] = list(background_libs)
  else:
    manifest['background']['scripts'] = list(background_libs)

  json.dump(manifest, open(os.path.join(out_dir, MANIFEST), 'w'), indent=2)
  return list(background_js)


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
    if error['file'].lower().find('externs') >= 0:
      filename = error['file']
    else:
      fileno = int(error['file'][6:])
      filename = js_files[fileno]
    if 'error' in error:
      text = error['error']
    else:
      text = error['warning']
    print(filename + ':' + str(error['lineno']) + ' ' + text)
    print(error['line'])


def compile_js(out_path, js_files, level, externs):
  print('Compiling JavaScript code.')

  params = [
      ('compilation_level', level),
      ('language', 'ECMASCRIPT5'),
      ('output_format', 'json'),
      ('output_info', 'statistics'),
      ('output_info', 'warnings'),
      ('output_info', 'errors'),
      ('output_info', 'compiled_code')
    ]

  if debug_build:
    params.append(('formatting', 'pretty_print'))
    js_code = ['/** @define {boolean} */\nvar DEBUG = true;']
  else:
    js_code = ['/** @define {boolean} */\nvar DEBUG = false;']

  for js_file in js_files:
    if os.path.basename(js_file) not in SKIP_JS_FILES:
      js_code.append(open(os.path.join(SOURCE_DIR, js_file), encoding='utf-8').read())

  if externs:
    params.append(('js_externs', open(externs).read()))

  for url in EXTERNS_URLS:
    params.append(('externs_url', url))

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

  print('Writing', out_path)
  os.makedirs(os.path.dirname(out_path), exist_ok=True)
  open(out_path, 'w').write(result['compiledCode'])


def main():
  parse_command_line()
  version = get_version()

  dir_name = APP_NAME + '-' + version
  if debug_build:
    dir_name += '-dbg'
  print(dir_name)
  out_dir = os.path.join(BUILD_DIR, dir_name)
  archive_path = out_dir + '.zip'
  delete(out_dir, archive_path)
  copy_files(SOURCE_DIR, out_dir, FILES)

  background_js_files = process_manifest(out_dir, version)
  compile_js(os.path.join(out_dir, 'js', 'background.js'),
             background_js_files,
             BACKGROUND_COMPILATION_LEVEL,
             BACKGROUND_EXTERNS)
  js_files = process_index(out_dir)
  compile_js(os.path.join(out_dir, TARGET_JS),
             js_files,
             COMPILATION_LEVEL,
             JS_EXTERNS)

  print('Archiving', archive_path)
  shutil.make_archive(out_dir, 'zip',
                      root_dir=os.path.abspath(BUILD_DIR),
                      base_dir=dir_name,
                      verbose=True)


if __name__ == '__main__':
  main()
