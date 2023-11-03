// Base script used with Rollup to bundle the necessary CodeMirror
// components.

import {
  defaultKeymap, history, historyKeymap,
} from '@codemirror/commands';
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
import { Compartment, EditorState } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  keymap, lineNumbers
} from '@codemirror/view';

const CodeMirrorNext = {
  commands: {
    defaultKeymap,
    history,
    historyKeymap,
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
