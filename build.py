#!/usr/bin/python3

import json
import os
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
import glob

APP_NAME = 'Text'
CANARY_APP_NAME = 'Text Canary'
IS_APP = True

BASE_DIR = os.path.dirname(sys.argv[0])
SOURCE_DIR = BASE_DIR
BUILD_DIR = os.path.join(BASE_DIR, 'build')

# These files will be copied into the newly built directory as is.
# Should include all files not included in the Closure compilation unit (i.e.
# all non javascript files as well as all javascript files declared outside of
# the <!-- JS --> block in index.html).
FILES_TO_COPY = [
  'index.html',
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
  'third_party/CodeMirror/lib/codemirror.css',
  'third_party/jquery/jquery-1.8.3.min.js',
  'third_party/material-components-web/material-components-web.min.css',
  'third_party/material-components-web/material-components-web.min.js',
  'third_party/material-design-icons/iconfont/material-icons.css',
  'third_party/material-design-icons/iconfont/MaterialIcons-Regular.woff2'
 ] + glob.glob('_locales/*/messages.json')

MANIFEST = 'manifest.json'
INDEX_HTML = 'index.html'
TARGET_JS = 'js/all.js'
TARGET_JS_INCLUDE = ('<script src="' + TARGET_JS + '" type="text/javascript">'
                     '</script>')
JS_INCLUDES = re.compile(r'(<!-- JS -->.*<!-- /JS -->)', flags=re.M | re.S)
JS_SRC = re.compile(r'<script src="([^"]*)" type="text/javascript">')
CLOSURE_URL = 'https://closure-compiler.appspot.com/compile'
BACKGROUND_EXTERNS = 'js/background_externs.js'
JS_EXTERNS = None
EXTERNS_URLS = [
  'https://raw.githubusercontent.com/google/closure-compiler/master/' +
      'contrib/externs/jquery-1.8.js',
  'https://raw.githubusercontent.com/google/closure-compiler/master/' +
      'contrib/externs/chrome_extensions.js',
]

SKIP_JS_FILES = []

USE_LOCALIZED_NAME = False
PRINT_THIRD_PARTY_WARNINGS = False
COMPILATION_LEVEL = 'SIMPLE_OPTIMIZATIONS'
BACKGROUND_COMPILATION_LEVEL = 'ADVANCED_OPTIMIZATIONS'

debug_build = False
stable_build = False


def parse_command_line():
  global debug_build
  global stable_build
  for option in sys.argv[1:]:
    if option == '-d':
      debug_build = True
    elif option == '-s':
      stable_build = True
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
  elif stable_build:
    manifest['name'] = APP_NAME
  else:
    manifest['name'] = CANARY_APP_NAME
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


def print_server_errors(errors):
  for error in errors:
    print(
        '\nError code ' + str(error.get('code', get_missing_key_msg('code')))
        + ': ' + error.get('error', get_missing_key_msg('error')))


def print_compilation_errors(errors, type, js_files, externs_file):
  # Preprocessing
  for error in errors:
    filename = error.get('file', get_missing_key_msg('file'))
    if filename.lower().find('input') >=0:
      fileno = int(filename[len('Input_'):]) - 1  # file index starts at 1
      filename = js_files[fileno]
    elif filename.lower().find('externs') >= 0:
      filename = externs_file
    error['file'] = filename
  if type is 'warning' and not PRINT_THIRD_PARTY_WARNINGS:
    errors = [error for error in errors if 'third_party' not in error['file']]
    if not errors:
      return

  print('\n' + str(len(errors)) + ' ' + type + 's:')
  for error in errors:
    print(
        '\n' + error['file'] + ':'
        + str(error.get('lineno', get_missing_key_msg('lineno'))) + ' '
        + error.get(type, get_missing_key_msg(type)))
    print (error.get('line', get_missing_key_msg('line')))
  print()


def get_missing_key_msg(key):
  return '[\'' + key + '\' key missing]'


def compile_js(out_path, js_files, level, externs):
  print('Compiling JavaScript code.')

  params = [
      ('compilation_level', level),
      ('language', 'ECMASCRIPT6'),
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
    params.append(('js_externs', open(os.path.join(SOURCE_DIR, externs)).read()))

  for url in EXTERNS_URLS:
    params.append(('externs_url', url))

  for code in js_code:
    params.append(('js_code', code))

  params = bytes(urllib.parse.urlencode(params, encoding='utf8'), 'utf8')
  headers = {'Content-Type': 'application/x-www-form-urlencoded'}

  print('Connecting', CLOSURE_URL)
  out = urllib.request.urlopen(CLOSURE_URL, data=params)
  result = json.loads(out.read().decode('utf8'))

  if 'serverErrors' in result:
    print('\n' + str(len(result['serverErrors'])) + ' Closure server errors:')
    print_server_errors(result['serverErrors'])
    print()

  if 'errors' in result:
    print_compilation_errors(result['errors'], 'error', js_files, externs)

  if 'warnings' in result:
    print_compilation_errors(result['warnings'], 'warning', js_files, externs)

  print('Writing', out_path)
  os.makedirs(os.path.dirname(out_path), exist_ok=True)
  if result.get('compiledCode'):
    open(out_path, 'w').write(result.get('compiledCode'))
  else:
    print(
      'Fatal build error: '
      'compiledCode key missing from Closure response object')


def main():
  parse_command_line()
  version = get_version()

  dir_name = APP_NAME + '-' + version
  if not stable_build:
    dir_name += '-canary'
  if debug_build:
    dir_name += '-dbg'
  print(dir_name)
  out_dir = os.path.join(BUILD_DIR, dir_name)
  archive_path = out_dir + '.zip'
  delete(out_dir, archive_path)
  copy_files(SOURCE_DIR, out_dir, FILES_TO_COPY)

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
