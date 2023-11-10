// Base script used with Rollup to bundle the necessary CodeMirror
// components.

import {
  defaultKeymap,
  history,
  historyKeymap,
  indentMore,
  indentSelection,
  insertNewlineAndIndent,
  insertTab,
} from '@codemirror/commands';
import {
  angular,
} from '@codemirror/lang-angular';
import {
  cpp,
} from '@codemirror/lang-cpp';
import {
  css,
} from '@codemirror/lang-css';
import {
  html,
} from '@codemirror/lang-html';
import {
  java,
} from '@codemirror/lang-java';
import {
  javascript,
} from '@codemirror/lang-javascript';
import {
  json,
} from '@codemirror/lang-json';
import {
  less,
} from '@codemirror/lang-less';
import {
  markdown,
} from '@codemirror/lang-markdown';
import {
  php,
} from '@codemirror/lang-php';
import {
  python,
} from '@codemirror/lang-python';
import {
  sass,
} from '@codemirror/lang-sass';
import {
  vue,
} from '@codemirror/lang-vue';
import {
  wast,
} from '@codemirror/lang-wast';
import {
  xml,
} from '@codemirror/lang-xml';
import {
  bracketMatching,
  HighlightStyle,
  IndentContext,
  indentString,
  indentUnit,
  syntaxHighlighting,
} from '@codemirror/language';
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  openSearchPanel,
  search,
  SearchCursor,
  SearchQuery,
  selectMatches,
  setSearchQuery,
} from '@codemirror/search';
import { Compartment, countColumn, EditorSelection, EditorState, Text } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  keymap,
  lineNumbers,
  ViewUpdate,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';

const CodeMirrorNext = {
  commands: {
    defaultKeymap,
    history,
    historyKeymap,
    indentMore,
    indentSelection,
    insertNewlineAndIndent,
    insertTab,
  },
  highlight: {
    tags,
  },
  lang: {
    angular,
    cpp,
    css,
    html,
    java,
    javascript,
    json,
    less,
    markdown,
    php,
    python,
    sass,
    vue,
    wast,
    xml,
  },
  language: {
    bracketMatching,
    HighlightStyle,
    IndentContext,
    indentString,
    indentUnit,
    syntaxHighlighting,
  },
  search: {
    closeSearchPanel,
    findNext,
    findPrevious,
    openSearchPanel,
    search,
    SearchCursor,
    SearchQuery,
    selectMatches,
    setSearchQuery,
  },
  state: {
    Compartment,
    countColumn,
    EditorSelection,
    EditorState,
    Text,
  },
  view: {
    drawSelection,
    EditorView,
    keymap,
    lineNumbers,
  },
} as const;

declare global {
  interface Window {
    CodeMirror: typeof CodeMirrorNext;
  }
}

window.CodeMirror = CodeMirrorNext;
