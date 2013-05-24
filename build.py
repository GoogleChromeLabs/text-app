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
  'css/app.css',
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
  'images/check_no_box_white.png',
  'images/close.svg',
  'images/close-tab.svg',
  'images/maximize.svg',
  'images/menu.svg',
  'images/search.svg',
  'lib/jquery-1.8.3.min.js',
  'lib/ace/src-min-noconflict/ace.js',
  'lib/ace/src-min-noconflict/mode-c_cpp.js',
  'lib/ace/src-min-noconflict/mode-clojure.js',
  'lib/ace/src-min-noconflict/mode-coffee.js',
  'lib/ace/src-min-noconflict/mode-coldfusion.js',
  'lib/ace/src-min-noconflict/mode-csharp.js',
  'lib/ace/src-min-noconflict/mode-css.js',
  'lib/ace/src-min-noconflict/mode-diff.js',
  'lib/ace/src-min-noconflict/mode-golang.js',
  'lib/ace/src-min-noconflict/mode-groovy.js',
  'lib/ace/src-min-noconflict/mode-haxe.js',
  'lib/ace/src-min-noconflict/mode-html.js',
  'lib/ace/src-min-noconflict/mode-java.js',
  'lib/ace/src-min-noconflict/mode-javascript.js',
  'lib/ace/src-min-noconflict/mode-json.js',
  'lib/ace/src-min-noconflict/mode-jsx.js',
  'lib/ace/src-min-noconflict/mode-latex.js',
  'lib/ace/src-min-noconflict/mode-less.js',
  'lib/ace/src-min-noconflict/mode-liquid.js',
  'lib/ace/src-min-noconflict/mode-luahtml.js',
  'lib/ace/src-min-noconflict/mode-lua.js',
  'lib/ace/src-min-noconflict/mode-luapage.js',
  'lib/ace/src-min-noconflict/mode-markdown.js',
  'lib/ace/src-min-noconflict/mode-ocaml.js',
  'lib/ace/src-min-noconflict/mode-perl.js',
  'lib/ace/src-min-noconflict/mode-pgsql.js',
  'lib/ace/src-min-noconflict/mode-php.js',
  'lib/ace/src-min-noconflict/mode-powershell.js',
  'lib/ace/src-min-noconflict/mode-python.js',
  'lib/ace/src-min-noconflict/mode-ruby.js',
  'lib/ace/src-min-noconflict/mode-scad.js',
  'lib/ace/src-min-noconflict/mode-scala.js',
  'lib/ace/src-min-noconflict/mode-scss.js',
  'lib/ace/src-min-noconflict/mode-sh.js',
  'lib/ace/src-min-noconflict/mode-sql.js',
  'lib/ace/src-min-noconflict/mode-svg.js',
  'lib/ace/src-min-noconflict/mode-textile.js',
  'lib/ace/src-min-noconflict/mode-text.js',
  'lib/ace/src-min-noconflict/mode-xml.js',
  'lib/ace/src-min-noconflict/mode-xquery.js',
  'lib/ace/src-min-noconflict/mode-yaml.js'
]

MANIFEST = 'manifest.json'
INDEX_HTML = 'index.html'
TARGET_JS = 'js/all.js'
TARGET_JS_INCLUDE = ('<script src="' + TARGET_JS + '" type="text/javascript">'
                     '</script>')
JS_INCLUDES = re.compile(r'(<!-- JS -->.*<!-- /JS -->)', flags=re.M | re.S)
JS_SRC = re.compile(r'<script src="([^"]*)" type="text/javascript">')
CLOSURE_URL = 'http://closure-compiler.appspot.com/compile'
JS_EXTERNS = os.path.join(SOURCE_DIR, 'js/externs.js')
EXTERNS_URLS = [
  'https://closure-compiler.googlecode.com' +
      '/svn/trunk/contrib/externs/jquery-1.8.js',
  'https://closure-compiler.googlecode.com' +
      '/git/contrib/externs/chrome_extensions.js',
  'https://closure-compiler.googlecode.com' +
      '/git/contrib/externs/google_analytics_api.js'
]

USE_LOCALIZED_NAME = False
COMPILATION_LEVEL = 'SIMPLE_OPTIMIZATIONS'
BACKGROUND_COMPILATION_LEVEL = 'ADVANCED_OPTIMIZATIONS'


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
    if error['file'].find('Externs') >= 0:
      filename = 'externs'
    else:
      fileno = int(error['file'][6:])
      filename = js_files[fileno]
    if 'error' in error:
      text = error['error']
    else:
      text = error['warning']
    print(filename + ':' + str(error['lineno']) + ' ' + text)
    print(error['line'])


def compile_js(out_path, js_files, level):
  print('Compiling JavaScript code.')
  js_code = []
  for js_file in js_files:
    js_code.append(open(os.path.join(SOURCE_DIR, js_file)).read())

  params = [
      ('compilation_level', level),
#      ('formatting', 'pretty_print'),
      ('language', 'ECMASCRIPT5_STRICT'),
      ('output_format', 'json'),
      ('output_info', 'statistics'),
      ('output_info', 'warnings'),
      ('output_info', 'errors'),
      ('output_info', 'compiled_code')
    ]

  if JS_EXTERNS:
    params.append(('js_externs', open(JS_EXTERNS).read()))

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
  version = get_version()

  dir_name = APP_NAME + '-' + version
  out_dir = os.path.join(BUILD_DIR, dir_name)
  archive_path = out_dir + '.zip'
  delete(out_dir, archive_path)
  copy_files(SOURCE_DIR, out_dir, FILES)

  background_js_files = process_manifest(out_dir, version)
  compile_js(os.path.join(out_dir, 'js', 'background.js'),
             background_js_files,
             BACKGROUND_COMPILATION_LEVEL)
  js_files = process_index(out_dir)
  compile_js(os.path.join(out_dir, TARGET_JS),
             js_files,
             COMPILATION_LEVEL)

  print('Archiving', archive_path)
  shutil.make_archive(out_dir, 'zip',
                      root_dir=os.path.abspath(BUILD_DIR),
                      base_dir=dir_name,
                      verbose=True)


if __name__ == '__main__':
  main()
