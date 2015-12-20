"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';
import util from 'util';

class JavaParser extends DocsParser {

  setupSettings() {
    var identifier = '[a-zA-Z_$][a-zA-Z_$0-9]*';
    this.settings = {
      'curlyTypes': false,
      'typeInfo': false,
      'typeTag': 'type',
      'varIdentifier': identifier,
      'fnIdentifier':  identifier,
      'fnOpener': identifier + '(?:\\s+' + identifier + ')?\\s*\\(',
      'commentCloser': ' */',
      'bool': 'Boolean',
      'function': 'Function'
    };
  }

  parseFunction(line) {
    line = line.trim();
    var regex = XRegExp(
      // Modifiers
      '(?:(public|protected|private|static|abstract|final|transient|synchronized|native|strictfp)\\s+)*' +
      // Return value
      '(?P<retval>[a-zA-Z_$][\\<\\>\\., a-zA-Z_$0-9]+)\\s+' +
      // Method name
      '(?P<name>' + this.settings.fnIdentifier + ')\\s*' +
      // Params
      '\\((?P<args>.*?)\\)\\s*' +
      // # Throws ,
      '(?:throws){0,1}\\s*(?P<throwed>[a-zA-Z_$0-9\\.,\\s]*)'
    );

    var matches = XRegExp.exec(line, regex);
    if (matches == null) {
      return null;
    }

    var name = matches.name;
    var retval = matches.retval;

    var args = matches.args
      .split(',')
      .map(arg => arg.trim().split(' ').pop())
      .join(',');


    var argThrows = (matches.throwed || '')
      .split(',')
      .map(arg => arg.trim().split(' ').pop())
      .join(',');

    return [ matches.name, args, matches.retval, argThrows];
  }

  parseVar(/* line */) {
    return null;
  }

  guessTypeFromValue(/* val */) {
    return null;
  }

  formatFunction(name, args, retval, throws_args, options) {
    options = (typeof options !== 'undefined') ? options : {};
    var out = super.formatFunction(name, args, retval, options);
    if(throws_args !== '') {
      var list = this.parseArgs(throws_args);
      for (var key in list) {
        var unused = key;
        var exceptionName = list.key;
        var type_info = this.getTypeInfo(unused, exceptionName);
        out.push(
          util.format('@throws %s%s ${1:[description]}', type_info, this.escape(exceptionName))
        );
      }
    }
    return out;
  }

  getFunctionReturnType(name, retval) {
    if (retval == 'void') {
      return null;
    } else {
      return retval;
    }
  }

  getDefinition(editor, pos, readLine) {
    var maxLines = 25;  // don't go further than this

    var definition = '';
    var open_curly_annotation = false;
    var open_paren_annotation = false;

    var i, len;
    for(i=0; i < maxLines; i += 1) {
      var line = readLine(editor, pos);
      if (line == null) {
        break;
      }

      pos.row+= 1;
      // Move past empty lines
      if (line.search(/^\s*$/) > -1) {
        continue;
      }

      // strip comments
      line = line.replace(/\/\/.*/, '');
      line = line.replace(/\/\*.*\*\//, '');
      if(definition === '') {
        // Must check here for function opener on same line as annotation
        if(this.settings.fnOpener && (line.search(RegExp(this.settings.fnOpener)) > -1)) {

        }
        // Handle Annotations
        else if(line.search(/^\s*@/) > -1) {
          if ((line.search('{') > -1) && !((line.search('}') > -1))) {
            open_curly_annotation = true;
          }
          if ((line.search('\(') > -1) && !(line.search('\)') > -1)) {
            open_paren_annotation = true;
          }
          continue;
        } else if(open_curly_annotation) {
          if (line.search('}') > -1) {
            open_curly_annotation = false;
          }
          continue;
        } else if(open_paren_annotation) {
          if (line.search('\)') > -1) {
            open_paren_annotation = false;
          }
        } else if (line.search(/^\s*$/) > -1) {
          // Check for function
          continue;
        } else if(!(this.settings.fnOpener) || !(line.search(RegExp(this.settings.fnOpener)) > -1)) {
          definition = line;
          break;
        }
      }

      definition+= line;
      if((line.indexOf(';') > -1) || (line.indexOf('{') > -1)) {
        var regex = new RegExp('\\s*[;{]\\s*$', 'g');
        definition = definition.replace(regex, '');
        break;
      }
    }
    return definition;
  }
}

export default JavaParser;
