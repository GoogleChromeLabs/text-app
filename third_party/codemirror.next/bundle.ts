// Base script used with Rollup to bundle the necessary CodeMirror
// components.

import {
  defaultKeymap, history, historyKeymap, indentMore, indentSelection, insertTab,
} from '@codemirror/commands';
import {
  bracketMatching,
  IndentContext,
  indentUnit,
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
import { Compartment, EditorSelection, EditorState } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  keymap,
  lineNumbers,
  ViewUpdate,
} from '@codemirror/view';

const CodeMirrorNext = {
  commands: {
    defaultKeymap,
    history,
    historyKeymap,
    indentMore,
    indentSelection,
    insertTab,
  },
  language: {
    bracketMatching,
    IndentContext,
    indentUnit,
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
    EditorSelection,
    EditorState,
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
