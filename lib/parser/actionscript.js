"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';

class ActionscriptParser extends DocsParser {

  setupSettings() {
    var nameToken = '[a-zA-Z_][a-zA-Z0-9_]*';
    this.settings = {
      'typeInfo': false,
      'curlyTypes': false,
      'typeTag': '',
      'commentCloser': ' */',
      'fnIdentifier': nameToken,
      'varIdentifier': '(%s)(?::%s)?' % (nameToken, nameToken),
      'fnOpener': 'function(?:\\s+[gs]et)?(?:\\s+' + nameToken + ')?\\s*\\(',
      'bool': 'bool',
      'function': 'function'
    };
  }

  parseFunction(line) {
    var regex = XRegExp(
      // fnName = function,  fnName : function
      '(?:(?P<name1>' + this.settings.varIdentifier + ')\\s*[:=]\\s*)?' +
      'function(?:\\s+(?P<getset>[gs]et))?' +
      // function fnName
      '(?:\\s+(?P<name2>' + this.settings.fnIdentifier + '))?' +
      // (arg1, arg2)
      '\\s*\\(\\s*(?P<args>.*?)\\)'
    );
    var matches = XRegExp.exec(line, regex);
    if(matches === null) {
      return null;
    }

    regex = new RegExp(this.settings.varIdentifier, 'g');
    var name = matches.name1 && (matches.name1 || matches.name2 || '').replace(regex, '\\1') || null;
    var args = matches.args;
    var options = {};
    if(matches.getset == 'set') {
      options.as_setter = true;
    }

    return[name, args, null, options];
  }

  parseVar(line) {
    return null;
  }

  getArgName(arg) {
    var regex = new RegExp(this.settings.varIdentifier + '(\\s*=.*)?', 'g');
    return arg.replace(regex, '\\1');
  }

  getArgType(arg) {
    // could actually figure it out easily, but it's not important for the documentation
    return null;
  }
}

export default ActionscriptParser;
