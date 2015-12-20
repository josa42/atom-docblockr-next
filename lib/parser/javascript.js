"use babel";

import util from 'util';
import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';
import { isNumeric } from '../utils';

class JavaScriptParser extends DocsParser {

  setupSettings() {
    var identifier = '[a-zA-Z_$][a-zA-Z_$0-9]*';
    this.settings = {
      // curly brackets around the type information
      'curlyTypes': true,
      'typeInfo': true,
      'typeTag': 'type',
      // technically, they can contain all sorts of unicode, but w/e
      'varIdentifier': identifier,
      'fnIdentifier':  identifier,
      'fnOpener': 'function(?:\\s+' + identifier + ')?\\s*\\(',
      'commentCloser': ' */',
      'bool': 'Boolean',
      'function': 'Function'
    };
  }

  parseFunction(line) {
    // (?:(?([a-zA-Z_$][a-zA-Z_$0-9]*)\\s*[:=]\\s*)?(?:function\\*|get|set)\\s+)(?:([a-zA-Z_$][a-zA-Z_$0-9]*))?\\s*\\(\\s*(.*)\\)
    var regex = XRegExp(
      //   fnName = function,  fnName : function
      '(?:(?:(?P<name1>' + this.settings.varIdentifier + ')\\s*[:=]\\s*)?' +
      '(?:function\\*?|get|set)\\s+)?' +
      // function fnName
      '(?:(?P<name2>' + this.settings.fnIdentifier + '))?' +
      // (arg1, arg2)
      '\\s*\\(\\s*(?P<args>.*?)\\)'
    );

    var matches = XRegExp.exec(line, regex);
    if(matches === null) {
      return null;
    }
    // grab the name out of "name1 = function name2(foo)" preferring name1
    var name = matches.name1 || matches.name2 || '';
    var args = matches.args;
    return [name, args, null];
  }

  parseVar(line) {
    //   var foo = blah,
    //       foo = blah;
    //   baz.foo = blah;
    //   baz = {
    //        foo : blah
    //   }
    var regex = XRegExp('(?P<name>' + this.settings.varIdentifier + ')\\s*[=:]\\s*(?P<val>.*?)(?:[;,]|$)');
    var matches = XRegExp.exec(line, regex);
    if(matches === null) {
      return null;
    }

    // variable name, variable value
    return [matches.name, matches.val.trim()];
  }

  parseArg(arg) {

    var regex = XRegExp(
      '(?P<name>' + this.settings.varIdentifier + ')(\\s*=\\s*(?P<value>.*))?'
    );

    return XRegExp.exec(arg, regex);
  }

  getArgType(arg) {

    var matches = this.parseArg(arg);

    if(matches.value) {
      return this.guessTypeFromValue(matches.value);
    }

    return null;
  }

  getArgName(arg) {

    var matches = this.parseArg(arg);

    if (matches.value) {
      return util.format('[%s=%s]', matches.name, matches.value);
    }

    return matches.name;
  }

  guessTypeFromValue(val) {
    var lower_primitives = this.editorSettings.lowerCasePrimitives || false;
    var shortPrimitives = this.editorSettings.shortPrimitives || false;
    var var_type;
    var capitalize = function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };
    if(isNumeric(val)) {
      var_type = 'number';
      return (lower_primitives ? var_type : capitalize(var_type));
    }
    if((val[0] === '\'') || (val[0] === '"')) {
      var_type = 'string';
      return (lower_primitives ? var_type : capitalize(var_type));
    }
    if(val[0] === '[') {
      return 'Array';
    }
    if(val[0] === '{') {
      return 'Object';
    }
    if((val === 'true') || (val === 'false')) {
      var ret_val = (shortPrimitives ? 'bool' : 'Boolean');
      return (lower_primitives ? ret_val : capitalize(ret_val));
    }
    var regex = new RegExp('RegExp\\b|\\\/[^\\/]');
    if(regex.test(val)) {
      return 'RegExp';
    }
    if(val.slice(0, 4) === 'new ') {
      regex = new RegExp('new (' + this.settings.fnIdentifier + ')');
      var matches = regex.exec(val);
      return (matches[0] && matches[1]) || null;
    }

    var match = val.match(/^(.*)\.create\s*\(.*\)$/);
    if(match) {
      return match[1];
    }
    return null;
  }
}

export default JavaScriptParser;
