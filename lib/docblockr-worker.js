"use babel";

import JsParser from './parser/javascript';
import CppParser from './parser/cpp';
import RustParser from './parser/rust';
import PhpParser from './parser/php';
import CoffeeParser from './parser/coffee';
import ActionscriptParser from './parser/actionscript';
import ObjCParser from './parser/objc';
import JavaParser from './parser/java';
import TypescriptParser from './parser/typescript';

import { escape } from './utils';
import util from 'util';

class DocBlockrAtom {

  constructor() {
    var self = this;
    var settings = atom.config.get('docblockr-next');
    this.editorSettings = settings;

    atom.config.observe('docblockr-next', () => this.updateConfig());

    atom.commands.add('atom-workspace', 'docblockr:parse-tab', (event) => {
      var regex = {
        // Parse Command
        'parse': /^\s*(\/\*|###)[*!]\s*$/,
        // Indent Command
        'indent': /^\s*\*\s*$/
      };

      // Parse Command
      if(this.validateRequest({preceding:true, preceding_regex:regex.parse})) {
        this.parseCommand(false);
      }

      // Indent Command
      else if (this.validateRequest({preceding:true, preceding_regex:regex.indent})) {
        this.indentCommand();
      } else {
        event.abortKeyBinding();
      }
    });

    atom.commands.add('atom-workspace', 'docblockr:parse-enter', (event) => {
      var regex = {
        // Parse Command
        'parse': /^\s*(\/\*|###)[*!]\s*$/,
        // Trim auto whitespace
        'trim_auto': [/^\s*\*\s*$/, /^\s*$/],
        // Deindent Command
        'deindent': /^\s+\*\//,
        // Snippet-1
        'snippet_1': [/^\s*\/\*$/,/^\*\/\s*$/],
        // Close block comment
        'close_block': /^\s*\/\*$/,
        // extend line
        'extend_line': /^\s*(\/\/[\/!]?|#)/,
        // Extend docblock by adding an asterix at start
        'extend': /^\s*\*[^\/]*$/,
      };

      // Parse Command
      if(this.validateRequest({preceding:true, preceding_regex:regex.parse})) {
        this.parseCommand(false);
      }
      // Trim auto whitespace
      else if(this.validateRequest({preceding:true, preceding_regex:regex.trim_auto[0], following:true, following_regex:regex.trim_auto[1], scope:'comment.block'})) {
        this.trimAutoWhitespaceCommand();
      }
      // Deindent command
      else if(this.validateRequest({preceding:true, preceding_regex:regex.deindent})) {
        this.deindentCommand();
      }
      else if(this.validateRequest({preceding:true, preceding_regex:regex.snippet_1[0], following:true, following_regex:regex.snippet_1[1]})) {
        var editor = atom.workspace.getActiveTextEditor();
        this.write(editor, '\n$0\n ');
      }
      // Close block comment
      else if(this.validateRequest({preceding:true, preceding_regex:regex.close_block})) {
        var editor = atom.workspace.getActiveTextEditor();
        this.write(editor, '\n$0\n */');
      }
      // extend line comments (// and #)
      else if((this.editorSettings.extendDoubleSlash == true) && (this.validateRequest({preceding:true, preceding_regex:regex.extend_line, scope:'comment.line'}))) {
        let _regex = /^(\s*(?:#|\/\/[\/!]?)\s*).*$/;
        let editor = atom.workspace.getActiveTextEditor();
        let cursor_position = editor.getCursorBufferPosition();
        let line_text = editor.lineTextForBufferRow(cursor_position.row);
        line_text = line_text.replace(_regex, '$1');
        editor.insertText('\n' + line_text);
      }
      // Extend docblock by adding an asterix at start
      else if (this.validateRequest({preceding:true, preceding_regex:regex.extend, scope:'comment.block'})) {
        let _regex = /^(\s*\*\s*).*$/;
        let editor = atom.workspace.getActiveTextEditor();
        let cursor_position = editor.getCursorBufferPosition();
        let line_text = editor.lineTextForBufferRow(cursor_position.row);
        line_text = line_text.replace(_regex, '$1');
        editor.insertText('\n' + line_text);
      } else {
        event.abortKeyBinding();
      }
    });

    atom.commands.add('atom-workspace', 'docblockr:parse-inline', (event) => {
      // console.log('Parse-Inline command');
      if(this.validateRequest({preceding:true, preceding_regex:/^\s*\/\*{2}$/})) {
        this.parseCommand(true);
      } else {
        var editor = atom.workspace.getActiveTextEditor();
        editor.insertNewline();
        //event.abortKeyBinding();
      }
    });

    atom.commands.add('atom-workspace', 'docblockr:join', (event) => {
      // console.log('Join command');
      if (this.validateRequest({scope:'comment.block'})) {
        this.joinCommand();
      }
    });

    atom.commands.add('atom-workspace', 'docblockr:reparse', (event) => {
      // console.log('Reparse command');
      if (this.validateRequest({scope:'comment.block'})) {
        this.reparseCommand();
      }
    });

    atom.commands.add('atom-workspace', 'docblockr:wrap-lines', (event) => {
      // console.log('Wraplines command');
      if (this.validateRequest({scope:'comment.block'})) {
        this.wrapLinesCommand();
      }
    });

    atom.commands.add('atom-workspace', 'docblockr:decorate', (event) => {
      // console.log('Decorate command');
      if (this.validateRequest({scope:'comment.line.double-slash'})) {
        this.decorateCommand();
      }
    });

    atom.commands.add('atom-workspace', 'docblockr:decorate-multiline', (event) => {
      // console.log('Decorate Multiline command');
      if (this.validateRequest({scope:'comment.block'})) {
        this.decorateMultilineCommand();
      }
    });
  }

  updateConfig() {
    var settings = atom.config.get('docblockr-next');
    this.editorSettings = settings;
  }

  /**
   * Validate the keypress request
   * @param  {Boolean}  preceding        Check against regex if true
   * @param  {Regex}    preceding_regex  Regex to check preceding text against
   * @param  {Boolean}  following        Check against regex if true
   * @param  {Regex}    following_regex  Regex to check following text against
   * @param  {String}   scope            Check if cursor matches scope
   */
  validateRequest(options) {
    /**
     *  Multiple cursor behaviour:
     *   1. Add mulitple snippets dependent on cursor pos, this makes traversing
     *        snippets not possible
     *   2. So we will iterate over the cursors and find the first among the cursors
     *        that satisfies the regex, the rest of the cursors will be deleted.
     */

    options = (typeof options !== 'undefined') ? options : {};

    var preceding = (typeof options.preceding !== 'undefined') ? options.preceding : false;
    var preceding_regex = (typeof options.preceding_regex !== 'undefined') ? options.preceding_regex : '';
    var following = (typeof options.following !== 'undefined') ? options.following : false;
    var following_regex = (typeof options.following_regex !== 'undefined') ? options.following_regex : '';
    var scope     = (typeof options.scope !== 'undefined') ? options.scope : false;

    var editor = atom.workspace.getActiveTextEditor();
    this.cursors = [];
    var cursor, i, len, following_text, preceding_text;

    var cursor_positions = editor.getCursors();

    for (i = 0, len = cursor_positions.length; i < len; i += 1) {
      var cursor_position = cursor_positions[i].getBufferPosition();

      if(scope) {
        var scope_list = editor.scopeDescriptorForBufferPosition(cursor_position).getScopesArray();
        var _i, _len;
        for(_i = 0; _len = scope_list.length, _i < _len; _i += 1) {
          if(scope_list[_i].search(scope) > -1) {
            break;
          }
        }

        if(_i === _len) {
          // scope did not succeed
          continue;
        }
      }

      if (preceding) {
        preceding_text = editor.getTextInBufferRange([[cursor_position.row, 0], cursor_position]);
      }

      if(following) {
        var line_length = editor.lineTextForBufferRow(cursor_position.row).length;
        var following_range = [cursor_position, [cursor_position.row, line_length]];
        following_text = editor.getTextInBufferRange(following_range);
      }

      if(preceding && following) {
        if((preceding_text.search(preceding_regex) > -1) && (following_text.search(following_regex) > -1)) {
          this.cursors.push(cursor_position);
          break;
        }
      }
      else if(preceding) {
        if(preceding_text.search(preceding_regex) > -1) {
          this.cursors.push(cursor_position);
          break;
        }
      }
      else if(following) {
        if(following_text.search(following_regex) > -1) {
          this.cursors.push(cursor_position);
          break;
        }
      }
      else if(scope) {
        /* comes here only if scope is being checked */
        return true;
      }
    }

    if (this.cursors.length > 0) {
      cursor_positions.splice(i,1);
      cursor_positions.forEach(function(value) {
        value.destroy();
      });
      return true;
    } else {
      return false;
    }
  }

  parseCommand(inline) {
    var editor = atom.workspace.getActiveTextEditor();
    if (typeof editor === 'undefined' || editor === null) {
      return;
    }
    this.initialize(editor, inline);
    if(this.parser.isExistingComment(this.line)) {
      this.write(editor, '\n *' + this.indentSpaces);
      return;
    }

    // erase characters in the view (will be added to the output later)
    this.erase(editor, this.trailing_range);

    // match against a function declaration.
    var out = this.parser.parse(this.line);
    var snippet = this.generateSnippet(out, inline);
    // atom doesnt currently support, snippet end by default
    // so add $0
    if ((snippet.search(/\${0:/) < 0) && (snippet.search(/\$0/) < 0)) {
      snippet+= '$0';
    }
    this.write(editor, snippet);
  }

  trimAutoWhitespaceCommand() {
    /**
     * Trim the automatic whitespace added when creating a new line in a docblock.
     */
    var editor = atom.workspace.getActiveTextEditor();
    if (typeof editor === 'undefined' || editor === null) {
      return;
    }
    var cursor_position = editor.getCursorBufferPosition();
    var line_text = editor.lineTextForBufferRow(cursor_position.row);
    var line_length = editor.lineTextForBufferRow(cursor_position.row).length;
    var spaces = Math.max(0, this.editorSettings.indentationSpaces);

    var regex = /^(\s*\*)\s*$/;
    line_text = line_text.replace(regex, ('$1\n$1' + this.repeat(' ', spaces)));
    var range = [[cursor_position.row, 0], [cursor_position.row, line_length]];
    editor.setTextInBufferRange(range, line_text);
  }

  indentCommand() {
    var editor = atom.workspace.getActiveTextEditor();
    var current_pos = editor.getCursorBufferPosition();
    var prev_line = editor.lineTextForBufferRow(current_pos.row - 1);
    var spaces = this.getIndentSpaces(editor, prev_line);

    if (spaces !== null) {
      var matches = /^(\s*\*)/.exec(prev_line);
      var to_star = matches[1].length;
      var to_insert = spaces - current_pos.column + to_star;
      if(to_insert <= 0) {
        this.write(editor, '\t');
        return;
      }
      editor.insertText(this.repeat(' ', to_insert));
    } else {
      editor.insertText('\t');
    }
  }

  joinCommand() {
    var editor = atom.workspace.getActiveTextEditor();
    var selections = editor.getSelections();
    var i, j, len, row_begin;
    var text_with_ending = function(row) {
      return editor.buffer.lineForRow(row) + editor.buffer.lineEndingForRow(row);
    };

    for(i = 0; len = selections.length, i < len; i += 1) {
      var selection = selections[i];
      var no_rows;
      var _r = selection.getBufferRowRange();
      no_rows = Math.abs(_r[0] - _r[1]); // no of rows in selection
      row_begin = Math.min(_r[0], _r[1]);
      if (no_rows === 0) {
        // exit if current line is the last one
        if ((_r[0] + 1) == editor.getLastBufferRow()) {
          continue;
        }
        no_rows = 2;
      } else {
        no_rows+= 1;
      }

      var text = '';
      for(j = 0; j < no_rows; j += 1) {
        text+= text_with_ending(row_begin + j);
      }
      var regex = /[ \t]*\n[ \t]*((?:\*|\/\/[!/]?|#)[ \t]*)?/g;
      text = text.replace(regex, ' ');
      var end_line_length = editor.lineTextForBufferRow(row_begin + no_rows - 1).length;
      var range = [[row_begin, 0], [row_begin + no_rows - 1, end_line_length]];
      editor.setTextInBufferRange(range, text);
    }
  }

  decorateCommand() {
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var whitespace_re = /^(\s*)\/\//;
    var scopeRange = this.scopeRange(editor, pos, 'comment.line.double-slash');

    var max_len = 0;
    var _i, _len, _row, leading_ws, line_text, tab_count;
    _row = scopeRange[0].row;
    _len = Math.abs(scopeRange[0].row - scopeRange[1].row);

    for(_i = 0; _i <= _len; _i += 1) {
      line_text = editor.lineTextForBufferRow(_row + _i);
      tab_count = line_text.split('\t').length - 1;

      var matches = whitespace_re.exec(line_text);
      if (matches[1] == null) {
        leading_ws = 0;
      } else {
        leading_ws = matches[1].length;
      }

      leading_ws-= tab_count;
      max_len = Math.max(max_len, editor.lineTextForBufferRow(_row + _i).length);
    }

    var line_length = max_len - leading_ws;
    leading_ws = this.repeat('\t', tab_count) + this.repeat(' ', leading_ws);
    editor.buffer.insert(scopeRange[1], '\n' + leading_ws + this.repeat('/' , (line_length + 3)) + '\n');

    for(_i = _len; _i >= 0; _i -= 1) {
      line_text = editor.lineTextForBufferRow(_row + _i);
      var _length = editor.lineTextForBufferRow(_row + _i).length;
      var r_padding = 1 + (max_len - _length);
      var _range = [[scopeRange[0].row + _i, 0], [scopeRange[0].row + _i, _length]];
      editor.setTextInBufferRange(_range, leading_ws + line_text + this.repeat(' ', r_padding) + '//');
    }
    editor.buffer.insert(scopeRange[0], this.repeat('/', line_length + 3) + '\n');
  }

  decorateMultilineCommand() {
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var whitespace_re = /^(\s*)\/\*/;
    var tab_size = atom.config.get('editor.tabLength');
    var scopeRange = this.scopeRange(editor, pos, 'comment.block');
    var line_lengths = {};

    var max_len = 0;
    var _i, _len, _row, block_ws, leading_ws, line_text, block_tab_count, content_tab_count, matches;
    _row = scopeRange[0].row;
    _len = Math.abs(scopeRange[0].row - scopeRange[1].row);

    // get block indent from first line
    line_text = editor.lineTextForBufferRow(_row);
    block_tab_count = line_text.split('\t').length - 1;
    matches = whitespace_re.exec(line_text);
    if (matches == null) {
      block_ws = 0;
    } else {
      block_ws = matches[1].length;
    }
    block_ws-= block_tab_count;

    // get max_len
    for(_i = 1; _i < _len; _i += 1) {
      var text_length;
      line_text = editor.lineTextForBufferRow(_row + _i);
      text_length = line_text.length;
      content_tab_count = line_text.split('\t').length - 1;
      line_lengths[_i] = text_length - content_tab_count + (content_tab_count * tab_size);
      max_len = Math.max(max_len, line_lengths[_i]);
    }

    var line_length = max_len - block_ws;
    block_ws = this.repeat('\t', block_tab_count) + this.repeat(' ', block_ws);

    // last line
    line_text = editor.lineTextForBufferRow(scopeRange[1].row);
    line_text = line_text.replace(/^(\s*)(\*)+\//, function(self) {
      return function(match, p1, stars) {
        var len = stars.length;
        return (p1 +  self.repeat('*' , (line_length + 2 - len)) + '/' + '\n');
      };
    }(this));
    var _range = [[scopeRange[1].row, 0], [scopeRange[1].row, line_length]];
    editor.setTextInBufferRange(_range, line_text);

    // first line
    line_text = editor.lineTextForBufferRow(scopeRange[0].row);
    line_text = line_text.replace(/^(\s*)\/(\*)+/, function(self) {
      return function(match, p1, stars) {
        var len = stars.length;
        return (p1 +  '/' +  self.repeat('*' , (line_length + 2 - len)));
      };
    }(this));
    _range = [[scopeRange[0].row, 0], [scopeRange[0].row, line_length]];
    editor.setTextInBufferRange(_range, line_text);

    // skip first line and last line
    for(_i = _len-1; _i > 0; _i -= 1) {
      line_text = editor.lineTextForBufferRow(_row + _i);
      var _length = editor.lineTextForBufferRow(_row + _i).length;
      var r_padding = 1 + (max_len - line_lengths[_i]);
      _range = [[scopeRange[0].row + _i, 0], [scopeRange[0].row + _i, _length]];
      editor.setTextInBufferRange(_range, line_text + this.repeat(' ', r_padding) + '*');
    }
  }

  deindentCommand() {
    /*
     * When pressing enter at the end of a docblock, this takes the cursor back one space.
    /**
     *
     *//*|   <-- from here
    |      <-- to here
     */
    var editor = atom.workspace.getActiveTextEditor();
    var cursor = editor.getCursorBufferPosition();
    var text = editor.lineTextForBufferRow(cursor.row);
    text = text.replace(/^(\s*)\s\*\/.*/, '\n$1');
    editor.insertText(text, options={ autoIndentNewline:false });
  }

  reparseCommand() {
    // Reparse a docblock to make the fields 'active' again, so that pressing tab will jump to the next one
    var tab_index = this.counter();
    var tab_stop = function(m, g1) {
      return util.format('${%d:%s}', tab_index(), g1);
    };
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var Snippets = atom.packages.activePackages.snippets.mainModule;
    // disable all snippet expansions

    if (editor.snippetExpansion != null) {
      editor.snippetExpansion.destroy();
    }
    var scopeRange = this.scopeRange(editor, pos, 'comment.block');
    var text = editor.getTextInBufferRange([scopeRange[0], scopeRange[1]]);
    // escape string, so variables starting with $ won't be removed
    text = escape(text);
    // strip out leading spaces, since inserting a snippet keeps the indentation
    text = text.replace(/\n\s+\*/g, '\n *');
    //replace [bracketed] [text] with a tabstop
    text = text.replace(/(\[.+?\])/g, tab_stop);

    editor.buffer.delete(([scopeRange[0], scopeRange[1]]));
    editor.setCursorBufferPosition(scopeRange[0]);
    if ((text.search(/\${0:/) < 0) && (text.search(/\$0/) < 0)) {
      text+= '$0';
    }
    this.write(editor, text);
  }

  wrapLinesCommand() {
    /**
     * Reformat description text inside a comment block to wrap at the correct length.
     *  Wrap column is set by the first ruler (set in Default.sublime-settings), or 80 by default.
     * Shortcut Key: alt+q
     */
    var editor = atom.workspace.getActiveTextEditor();
    var pos = editor.getCursorBufferPosition();
    var tab_size = atom.config.get('editor.tabLength');
    var wrap_len = atom.config.get('editor.preferredLineLength');

    var num_indent_spaces = Math.max(0, (this.editorSettings.indentationSpaces ? this.editorSettings.indentationSpaces : 1));
    var indent_spaces = this.repeat(' ', num_indent_spaces);
    var indent_spaces_same_para = this.repeat(' ', (this.editorSettings.indentationSpacesSamePara ? this.editorSettings.indentationSpacesSamePara : num_indent_spaces));
    var spacerBetweenSections = (this.editorSettings.spacerBetweenSections === true);
    var spacer_between_desc_tags = (this.editorSettings.spacerBetweenSections === 'after_description');

    var scopeRange = this.scopeRange(editor, pos, 'comment.block');
    //var text = editor.getTextInBufferRange([scopeRange[0], scopeRange[1]]);

    // find the first word
    var i, len, _col, _text;
    var start_point = {};
    var end_point = {};
    var start_row = scopeRange[0].row;
    len = Math.abs(scopeRange[0].row - scopeRange[1].row);
    for(i = 0; i <= len; i += 1) {
      _text = editor.lineTextForBufferRow(start_row + i);
      _col = _text.search(/^\s*\* /);
      if(_col > -1) {
        if(i === 0) {
          start_point.column = scopeRange[0].column + _col;
        }
        else {
          start_point.column = _col;
        }
        start_point.row = scopeRange[0].row + i;
        break;
      }
    }
    // find the first tag, or the end of the comment
    for(i = 0; i <= len; i += 1) {
      _text = editor.lineTextForBufferRow(start_row + i);
      _col = _text.search(/^\s*\*(\/)/);
      if(_col > -1) {
        if(i === 0) {
          end_point.column = scopeRange[0].column + _col;
        }
        else {
          end_point.column = _col;
        }
        end_point.row = scopeRange[0].row + i;
        break;
      }
    }
    var text = editor.getTextInBufferRange([start_point, end_point]);

    //find the indentation level
    var regex = /\n(\s*\*)/;
    var matches = regex.exec(text);
    var indentation = matches[1].replace(/\t/g, this.repeat(' ', tab_size)).length;
    line_prefix = matches[1];

    // join all the lines, collapsing "empty" lines
    text = text.replace(/\n(\s*\*\s*\n)+/g, '\n\n');

    var wrap_para = function(para) {
      para = para.replace(/(\n|^)\s*\*\s*/g, ' ');
      var _i, _len;
      // split the paragraph into words
      var words = para.trim().split(' ');
      var text = '\n';
      var line = line_prefix + indent_spaces;
      var line_tagged = false; // indicates if the line contains a doc tag
      var para_tagged = false; // indicates if this paragraph contains a doc tag
      var line_is_new = true;
      var tag = '';
      // join all words to create lines, no longer than wrapLength
      for(_i = 0; _len = words.length, _i < _len; _i += 1) {
        var word = words[_i];
        if ((word == null) && (!line_tagged)) {
          continue;
        }

        if((line_is_new) && (word[0] == '@')) {
          line_tagged = true;
          para_tagged = true;
          tag = word;
        }

        if((line.length + word.length) > wrap_len) {
          // appending the word to the current line would exceed its
          // length requirements
          text+= line.replace(/\s+$/, '') + '\n';
          line = line_prefix + indent_spaces_same_para + word + ' ';
          line_tagged = false;
          line_is_new = true;
        }
        else {
          line+= word + ' ';
        }
        line_is_new = false;
      }
      text+= line.replace(/\s+$/, '');

      return {
        'text':       text,
        'line_tagged': line_tagged,
        'tagged':     para_tagged,
        'tag':        tag
      };
    };

    // split the text into paragraphs, where each paragraph is eighter
    // defined by an empty line or the start of a doc parameter
    var paragraphs = text.split(/\n{2,}|\n\s*\*\s*(?=@)/);
    var wrapped_paras = [];
    text = '';
    for(i = 0; len = paragraphs.length, i < len; i += 1) {
      // wrap the lines in the current paragraph
      wrapped_paras.push(wrap_para(paragraphs[i]));
    }

    // combine all the paragraphs into a single piece of text
    for(i = 0; len = wrapped_paras.length, i < len; i += 1) {
      para = wrapped_paras[i];
      last = (i == (wrapped_paras.length - 1));
      var _tag, _tagged;
      if(i == len - 1) {
        _tag = _tagged = false;
      }
      else {
        _tag = wrapped_paras[i+1].tag;
        _tagged = wrapped_paras[i+1].tagged;
      }
      next_is_tagged = (!last && _tagged);
      next_is_same_tag = ((next_is_tagged && para.tag) == _tag);

      if(last || (para.line_tagged || next_is_tagged) && !(spacerBetweenSections && (!next_is_same_tag)) && !((!para.line_tagged) && next_is_tagged && spacer_between_desc_tags)) {
        text+= para.text;
      }
      else {
        text+= para.text + '\n' + line_prefix;
      }
    }
    text = escape(text);
    // strip start \n
    if (text.search(/^\n/) > -1) {
      text = text.replace(/^\n/, '');
    }
    // add end \n
    if (text.search(/\n$/) < 0) {
      text+= '\n';
    }
    editor.setTextInBufferRange([start_point, end_point],text);
  }

  getIndentSpaces(editor, line) {
    var has_types = this.getParser(editor).settings.typeInfo;
    var extra_indent = ((has_types == true) ? '\\s+\\S+' : '');

    var regex = [
      new RegExp(util.format('^\\s*\\*(\\s*@(?:param|property)%s\\s+\\S+\\s+)\\S', extra_indent)),
      new RegExp(util.format('^\\s*\\*(\\s*@(?:returns?|define)%s\\s+\\S+\\s+)\\S', extra_indent)),
      new RegExp('^\\s*\\*(\\s*@[a-z]+\\s+)\\S'),
      new RegExp('^\\s*\\*(\\s*)')
    ];

    var i, len, matches;
    for(i = 0; len = regex.length, i < len; i += 1) {
      matches = regex[i].exec(line);
      if (matches != null) {
        return matches[1].length;
      }
    }
    return null;
  }

  initialize(editor, inline) {
    inline = (typeof inline === 'undefined') ? false : inline;
    var cursor_position = editor.getCursorBufferPosition(); // will handle only one instance
    // Get trailing string
    var line_length = editor.lineTextForBufferRow(cursor_position.row).length;
    this.trailing_range = [cursor_position, [cursor_position.row, line_length]];
    this.trailing_string = editor.getTextInBufferRange(this.trailing_range);
    // drop trailing */
    this.trailing_string = this.trailing_string.replace(/\s*\*\/\s*$/, '');
    this.trailing_string = escape(this.trailing_string);

    this.parser = parser = this.getParser(editor);
    parser.inline = inline;

    this.indentSpaces = this.repeat(' ', Math.max(0, (this.editorSettings.indentationSpaces || 1)));
    this.prefix = '*';

    settingsAlignTags = this.editorSettings.alignTags || 'deep';
    this.deepAlignTags = settingsAlignTags == 'deep';
    this.shallowAlignTags = ((settingsAlignTags == 'shallow') || (settingsAlignTags === true));

    // use trailing string as a description of the function
    if (this.trailingString) {
      parser.setNameOverride(this.trailingString);
    }

    // read the next line
    cursor_position = cursor_position.copy();
    cursor_position.row+= 1;
    this.line = parser.getDefinition(editor, cursor_position, this.readLine);
  }

  counter() {
    var count = 0;
    return (function() {
      return count += 1;
    });
  }

  repeat(string, number) {
    return Array(Math.max(0, number) + 1).join(string);
  }

  write(editor, str) {
    // will insert data at last cursor position
    var Snippets = atom.packages.activePackages.snippets.mainModule;
    Snippets.insert(str, editor);
  }

  erase(editor, range) {
    var buffer = editor.getBuffer();
    buffer.delete(range);
  }

  fillArray(len) {
    var a = [];
    for (var i = 0; i < len; i += 1) {
      a[i] = 0;
    }
    return a;
  }

  readLine(editor, point) {
      // TODO: no longer works
      if (point >= editor.getText().length) {
        return;
      }
      return editor.lineTextForBufferRow(point.row);
  }

  scopeRange(editor, point, scope_name) {
    // find scope starting point
    // checks: ends when row less than zero, column != 0
    // check if current point is valid
    var _range;
    if ((_range = editor.displayBuffer.bufferRangeForScopeAtPosition(scope_name, point)) == null) {
      return null;
    }

    var start, end;
    var _row = point.row;
    var line_length;
    start = _range.start;
    end = _range.end;
    while(_row >= 0) {
      line_length = editor.lineTextForBufferRow(_row).length;
      _range = editor.displayBuffer.bufferRangeForScopeAtPosition(scope_name, [_row, line_length]);
      if (_range == null) {
        break;
      }
      start = _range.start;
      if(start.column > 0) {
        break;
      }
      _row -= 1;
    }
    _row = point.row;
    var last_row = editor.getLastBufferRow();
    while(_row <= last_row) {
      line_length = editor.lineTextForBufferRow(_row).length;
      _range = editor.displayBuffer.bufferRangeForScopeAtPosition(scope_name, [_row, 0]);
      if (_range == null) {
        break;
      }
      end = _range.end;
      if(end.column < line_length) {
        break;
      }
      _row += 1;
    }
    return [start, end];
  }

  getParser(editor) {
    var scope = editor.getGrammar().scopeName;
    var regex = /\bsource\.([a-z+\-]+)/;
    var matches = regex.exec(scope);
    var source_lang = (matches === null)? null: matches[1];

    var settings = atom.config.get('docblockr-next');

    if((source_lang === null) && (scope == "text.html.php")) {
      return new PhpParser(settings);
    }

    if (source_lang === "coffee") {
      return new CoffeeParser(settings);
    } else if ((source_lang === "actionscript") || (source_lang == 'haxe')) {
      return new ActionscriptParser(settings);
    } else if ((source_lang === "c++") || (source_lang === "cpp") || (source_lang === 'c') || (source_lang === 'cuda-c++')) {
      return new CppParser(settings);
    } else if ((source_lang === 'objc') || (source_lang === 'objc++')) {
      return new ObjCParser(settings);
    } else if ((source_lang === 'java') || (source_lang === 'groovy')) {
      return new JavaParser(settings);
    } else if (source_lang === 'rust') {
      return new RustParser(settings);
    } else if (source_lang === 'ts') {
      return new TypescriptParser(settings);
    }
    return new JsParser(settings);
  }

  generateSnippet(out, inline) {
    //# substitute any variables in the tags

    if (out) {
      out = this.substituteVariables(out);
    }

    // align the tags
    if (out && (this.shallowAlignTags || this.deepAlignTags) && (!inline)) {
      out = this.alignTags(out);
    }

    // fix all the tab stops so they're consecutive
    if (out) {
      out = this.fixTabStops(out);
    }

    if (inline) {
      if (out) {
        return (' ' + out[0] + ' */');
      } else {
        return (' $0 */');
      }
    } else {
      return (this.createSnippet(out) + (this.editorSettings.newlineAfterBlock ? '\n' : ''));
    }
  }

  substituteVariables(out) {
    function get_var(match, group, str) {
      var var_name = group;
      if(var_name == 'datetime') {
          var datetime = new Date();
          return format_time(datetime);
      }
      else if (var_name == 'date') {
        var datetime = new Date();
        return datetime.toISOString().replace(/T.*/, '');
      } else {
        return match;
      }
    }
    function format_time(datetime) {
      function length_fix(x) {
        if (x < 10) {
          x = '0' + x;
        }
        return x;
      }
      var hour = length_fix(datetime.getHours());
      var min = length_fix(datetime.getMinutes());
      var sec = length_fix(datetime.getSeconds());
      var tz = datetime.getTimezoneOffset() / -60;
      var tz_string;
      if (tz >= 0) {
        tz_string = '+';
      } else {
        tz_string = '-';
      }
      tz_string+=  length_fix(Math.floor(Math.abs(tz)).toString()) + ((tz % 1) * 60);
      datetime = datetime.toISOString().replace(/T.*/, '');
      return datetime+= 'T' + hour + ':' + min + ':' + sec + tz_string;
    }
    function sub_line(line) {
      var regex = new RegExp('\{\{([^}]+)\}\}', 'g');
      return line.replace(regex, get_var);
    }
    return out.map(sub_line);
  }

  alignTags(out) {
    var output_width = function(str){
      // get the length of a string, after it is output as a snippet,
      // "${1:foo}" --> 3
      return str.replace(/[$][{]\d+:([^}]+)[}]/, '$1').replace('\\$', '$').length;
    };
    // count how many columns we have
    var maxCols = 0;
    // this is a 2d list of the widths per column per line
    var widths = [];
    var returnTag;
    // Grab the return tag if required.
    if (this.editorSettings.perSectionIndent) {
      returnTag = this.editorSettings.returnTag || '@return';
    } else {
      returnTag = false;
    }

    for(var i=0; i<out.length; i += 1) {
      if(out[i].startsWith('@')) {
        // Ignore the return tag if we're doing per-section indenting.
        if (returnTag && out[i].startsWith(returnTag)) {
          continue;
        }
        // ignore all the words after `@author`
        var columns = (!out[i].startsWith('@author')) ? out[i].split(' ') : ['@author'];
        widths.push(columns.map(output_width));
        maxCols = Math.max(maxCols, widths[widths.length - 1].length);
      }
    }
    // initialise a list to 0
    var maxWidths = this.fillArray(maxCols);

    if (this.shallowAlignTags) {
      maxCols = 1;
    }

    for(i = 0; i < maxCols; i += 1) {
      for(var j = 0; j < widths.length; j += 1) {
        if (i < widths[j].length) {
          maxWidths[i] = Math.max(maxWidths[i], widths[j][i]);
        }
      }
    }
    // Convert to a dict so we can use .get()
    // maxWidths = dict(enumerate(maxWidths))

    // Minimum spaces between line columns
    var minColSpaces = this.editorSettings.minSpacesBetweenColumns || 1;
    for(i = 0; i_len = out.length, i < i_len; i += 1) {
      // format the spacing of columns, but ignore the author tag. (See #197)
      if((out[i].startsWith('@')) && (!out[i].startsWith('@author'))) {
        var new_out = [];
        var split_array = out[i].split(' ');
        for(var j=0; j_len = split_array.length, j < j_len; j += 1) {
          new_out.push(split_array[j]);
          new_out.push(this.repeat(' ', minColSpaces) + (
                                    this.repeat(' ', ((maxWidths[j] || 0) - output_width(split_array[j])))
                                  ));
        }
        out[i] = new_out.join('').trim();
      }
    }
    return out;
  }

  fixTabStops(out) {
    var tab_index = this.counter();
    var swap_tabs = function(match, group1, group2, str) {
      return (group1 + tab_index() + group2);
    };
    var i, len;
    for (i=0; len = out.length, i<len; i += 1) {
      out[i] = out[i].replace(/(\$\{)\d+(:[^}]+\})/g, swap_tabs);
    }
    return out;
  }

  createSnippet(out) {
    var snippet = '';
    var closer = this.parser.settings.commentCloser;
    var regex = new RegExp('^\s*@([a-zA-Z]+)');
    var i, len;
    if (out) {
      if(this.editorSettings.spacerBetweenSections === true) {
        var last_tag = null;
        for(i=0; len = out.length, i < len; i += 1) {
          var match = regex.exec(out[i]);
          if(match && (last_tag != match[1])) {
            last_tag = match[1];
            out.splice(i, 0 , '');
          }
        }
      } else if(this.editorSettings.spacerBetweenSections == 'after_description') {
        var lastLineIsTag = false;
        for(i=0; len = out.length, i < len; i += 1) {
          var match = regex.exec(out[i]);
          if(match) {
            if (!lastLineIsTag) {
              out.splice(i, 0, '');
            }
            lastLineIsTag = true;
          }
        }
      }
      for(i=0; len = out.length, i < len; i += 1) {
        snippet+= '\n ' + this.prefix + (out[i] ? (this.indentSpaces + out[i]) : '');
      }
    } else {
      snippet+= '\n ' + this.prefix + this.indentSpaces + '${0:' + this.trailing_string + '}';
    }

    snippet+= '\n' + closer;
    return snippet;
  }
}



export default DocBlockrAtom;
