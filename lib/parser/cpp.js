"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';
import util from 'util';

class CppParser extends DocsParser {

  setupSettings() {
    var name_token = '[a-zA-Z_][a-zA-Z0-9_]*';
    var identifier = util.format('(%s)(::%s)?', name_token, name_token);
    this.settings = {
      'typeInfo': false,
      'curlyTypes': false,
      'typeTag': 'param',
      'commentCloser': ' */',
      'fnIdentifier': identifier,
      'varIdentifier': '(' + identifier + ')\\s*(?:\\[(?:' + identifier + ')?\\]|\\((?:(?:\\s*,\\s*)?[a-z]+)+\\s*\\))?',
      'fnOpener': identifier + '\\s+' + identifier + '\\s*\\(',
      'bool': 'bool',
      'function': 'function'
    };
  }

  parseFunction(line) {
    var regex = XRegExp(
      '(?P<retval>' + this.settings.varIdentifier + ')[&*\\s]+' +
      '(?P<name>' + this.settings.varIdentifier + ');?' +
      // void fnName
      // (arg1, arg2)
      '\\s*\\(\\s*(?P<args>.*?)\\)'
    );

    var matches = XRegExp.exec(line, regex);
    if(matches === null) {
      return null;
    }

    return [matches.name, matches.args, matches.retval];
  }

  parseArgs(args) {
    if (args.trim() === 'void') {
      return [];
    }

    return super.parseArgs(args);
  }

  getArgType(arg) {
    return null;
  }

  getArgName(arg) {
    if(arg === "...") {
      // variable arguments
      return "VARARGS";
    }
    var regex = new RegExp(this.settings.varIdentifier + '(?:\s*=.*)?$');
    var matches = regex.exec(arg);
    return matches[1];
  }

  parseVar(/* line */) {
    return null;
  }

  guessTypeFromValue(/* val */) {
    return null;
  }

  getFunctionReturnType(name, retval) {
    return ((retval !== 'void') ? retval : null);
  }
}

export default CppParser;
