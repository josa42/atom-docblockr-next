"use babel";
import util from 'util';
import { XRegExp } from 'xregexp';
import DocsParser from '../docsparser';
import { isNumeric } from '../utils';

class TypescriptParser extends DocsParser {

  setupSettings() {
    var identifier = '[a-zA-Z_$][a-zA-Z_$0-9]*';
    var baseTypeIdentifier = util.format('%s(\\.%s)*(\\[\\])?', identifier, identifier);
    var parametricTypeIdentifier = util.format('%s(\\s*<\\s*%s(\\s*,\\s*%s\\s*)*>)?', baseTypeIdentifier, baseTypeIdentifier, baseTypeIdentifier);

    this.settings = {
      // curly brackets around the type information
      'curlyTypes': true,

      'typeInfo': true,
      'typeTag': 'type',

      // technically, they can contain all sorts of unicode, but w/e
      'varIdentifier': identifier,

      'fnIdentifier': identifier,
      'fnOpener': 'function(?:\\s+' + identifier + ')?\\s*\\(',
      'commentCloser': ' */',
      'bool': 'Boolean',
      'function': 'Function',

      'functionRE':
        // Modifiers
        '(?:public|private|static)?\\s*' +
        // Method name
        '(?P<name>' + identifier + ')\\s*' +
        // Params
        '\\((?P<args>.*?)\\)\\s*' +
        // Return value
        '(:\\s*(?P<retval>' + parametricTypeIdentifier + '))?',

      'varRE':
        '((public|private|static|var)\\s+)?(?P<name>' + identifier +
        ')\\s*(:\\s*(?P<type>' + parametricTypeIdentifier +
        '))?(\\s*=\\s*(?P<val>.*?))?([;,]|$)'
    };
  }

  parseFunction(line) {
    line = line.trim();
    var regex = XRegExp(this.settings.functionRE);
    var matches = XRegExp.exec(line, regex);
    if (matches === null) {
      return null;
    }

    return [matches.name, matches.args, matches.retval];
  }

  getArgType(arg) {
    if(arg.indexOf(':') > -1) {
      return arg.split(':').pop().trim();
    }
    return null;
  }

  getArgName(arg) {
    if (arg.indexOf(':') > -1) {
      arg = arg.split(':')[0];
    }

    var regex = /[ \?]/g;
    return arg.replace(regex, '');
  }

  parseVar(line) {
    var regex = XRegExp(this.settings.varRE);
    var matches = XRegExp.exec(line, regex);
    if (matches == null) {
      return null;
    }
    var val = matches.val;
    if (val != null) {
      val = val.trim();
    }

    return [matches.name, val, matches.type];
  }

  getFunctionReturnType(name, retval) {
    return ((retval != 'void') ? retval : null);
  }

  guessTypeFromValue(val) {
    var lowerPrimitives = this.editorSettings.lowerCasePrimitives || false;
    if (isNumeric(val)) {
      return (lowerPrimitives ? 'number' : 'Number');
    }
    if ((val[0] == '\'') || (val[0] == '"')) {
      return (lowerPrimitives ? 'string' : 'String');
    }
    if (val[0] == '[') {
      return 'Array';
    }
    if (val[0] == '{') {
      return 'Object';
    }
    if ((val == 'true') || (val == 'false')) {
      return (lowerPrimitives ? 'boolean' : 'Boolean');
    }
    var regex = new RegExp('RegExp\\b|\\/[^\\/]');
    if(regex.test(val)) {
      return 'RegExp';
    }
    if(val.slice(0,4) == 'new ') {
      regex = new RegExp('new (' + this.settings.fnIdentifier + ')');
      var matches = regex.exec(val);

      return (matches[0] && matches[1]) || null;
    }
    return null;
  }
}

export default TypescriptParser;
