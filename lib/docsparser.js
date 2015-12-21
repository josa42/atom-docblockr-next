"use babel";

import util from 'util';
import { escape } from './utils';


class DocsParser {

  get brace() {
    if (this.settings.curlyTypes) {
      return { open : '{', close: '}' };
    }
    return { open: '', close: '' };
  }

  constructor(settings) {
    this.editorSettings = settings;
    this.setupSettings();
    this.nameOverride = null;
  }

  init(viewSettings) {
    this.viewSettings = viewSettings;
    this.setupSettings();
    this.nameOverride = null;
  }

  isExistingComment(line) {
    return line.search(/^\s*\*/) >= 0;
  }

  setNameOverride(name) {
    // overrides the description of the function - used instead of parsed description
    this.nameOverride = name;
  }

  getNameOverride() {
    return this.nameOverride;
  }

  parse(line) {
    if(this.editorSettings.simpleMode === true) {
      return null;
    }

    var out = this.parseFunction(line);  // (name, args, retval, options)
    if (out) {
      return this.formatFunction(...out);
    }

    out = this.parseVar(line);
    if (out) {
      return this.formatVar(...out);
    }

    return null;
  }

  formatVar(name, val, valType) {
    valType = typeof valType !== 'undefined' ? valType : null;

    var out = [], brace = this.brace, temp;

    if (!valType) {
      if(!val || (val === '')) {  // quick short circuit
        valType = '[type]';
      } else {
        valType = this.guessTypeFromValue(val) || this.guessTypeFromName(name) || '[type]';
      }
    }

    if (this.inline) {
      out.push(util.format('@%s %s${1:%s}%s ${1:[description]}',
        this.settings.typeTag, brace.open, valType, brace.close
      ));
    } else {
      out.push(util.format('${1:[%s description]}', escape(name)));
      out.push(util.format('@%s %s${1:%s}%s',
        this.settings.typeTag, brace.open, valType, brace.close
      ));
    }

    return out;
  }

  getTypeInfo(argType, argName) {
    var typeInfo = '';
    var brace = this.brace;

    if(this.settings.typeInfo) {
      typeInfo = util.format('%s${1:%s}%s ' ,
        brace.open, escape(argType || this.guessTypeFromName(argName) || '[type]'), brace.close
      );
    }

    return typeInfo;
  }

  // TODO: Way to long function
  formatFunction(name, args, retval, options = {}) {
    // options = (typeof options !== 'undefined') ? options : {};

    var brace = this.brace;

    var out = [];
    var i, len, formatStr;
    if(options.hasOwnProperty('as_setter')) {
      out.push('@private');
      return out;
    }

    var extraTagAfter = this.editorSettings.extraTagsGoAfter;
    var description = this.getNameOverride() || ('['+ escape(name) + (name ? ' ': '') + 'description]');

    out.push('${1:' + description + '}');

    if (this.editorSettings.autoAddMethodTag) {
      out.push('@method '+ escape(name));
    }

    if (!extraTagAfter) {
      // TODO: IS that right? assign or push?
      out = this.addExtraTags(out);
    }

    // if there are arguments, add a @param for each
    // remove comments inside the argument list.
    args = (args || '').replace(/\/\*.*?\*\//,'');
    if(args) {
      this.parseArgs(args)
        .map(parsedArg => {
          let [type, name] = parsedArg;
          let typeInfo = this.getTypeInfo(type, name);

          let formatStr = '@param %s%s';
          if (this.editorSettings.paramDescription) {
            formatStr += ' ${1:[description]}';
          }

          return util.format(formatStr, typeInfo, escape(name));
        })
        .forEach(argDoc => out.push(argDoc));
    }

    // return value type might be already available in some languages but
    // even then ask language specific parser if it wants it listed
    var retType = this.getFunctionReturnType(name, retval);

    if(retType !== null) {
      let typeInfo = '';

      if (this.settings.typeInfo) {
        typeInfo = util.format(' %s${1:%s}%s', brace.open, (retType || '[type]'), brace.close);
      }

      var formatArgs = [
        (this.editorSettings.returnTag || '@return'),
        typeInfo
      ];

      formatStr = '%s%s';
      if (this.editorSettings.returnDescription) {
        formatStr += ' %s${1:[description]}';
        let thirdArg = '';

        // the extra space here is so that the description will align with the param description
        if(args && (this.editorSettings.alignTags == 'deep') && !this.editorSettings.perSectionIndent) {
          thirdArg = ' ';
        }

        formatArgs.push(thirdArg);
      }

      // TODO
      //out.push(util.format(formatStr, formatArgs));
      formatArgs.forEach(function(element) {
        // TODO Weird?? What is this suposed to do?
          formatStr = util.format(formatStr, element);
      });
      out.push(formatStr);
    }

    this.getMatchingNotations(name)
      .filter(notation => notation.indexOf('tags') > -1)
      // TODO did noth originaly: `out.concat(notation.args);`
      .forEach(notation => out = out.concat(notation.args));

    if (extraTagAfter) {
      // TODO: IS that right? assign or push?
      out = this.addExtraTags(out);
    }

    return out;
  }

  // returns None for no return type. False meaning unknown, or a string
  getFunctionReturnType(name, retval) {

    if (/^[A-Z]/.test(name)) {
      // no return, but should add a class
      return null;
    }

    if (name.search(/[$_]?(?:set|add)($|[A-Z_])/) > -1) {
      // setter/mutator, no return
      return null;
    }

    // functions starting with 'is' or 'has'
    if (name.search(/[$_]?(?:is|has)($|[A-Z_])/) > -1) {
      return this.settings.bool;
    }

    return (this.guessTypeFromName(name) || false);
  }

  parseArgs(args) {
    // an array of tuples, the first being the best guess at the type, the second being the name
    var out = [];
    if (!args) {
        return out;
    }
    // the current token
    var current = '';
    // characters which open a section inside which commas are not separators between different arguments
    var openQuotes  = '"\'<(';
    // characters which close the the section. The position of the character here should match the opening
    // indicator in `openQuotes`
    var closeQuotes = '"\'>)';
    var matchingQuote = '';
    var insideQuotes = false;
    var nextIsLiteral = false;
    var blocks = [];

    var i, len;
    for (i = 0; len = args.length,i < len; i += 1) {
      let character = args.charAt(i);
      if(nextIsLiteral) { // previous char was a \
        current += character;
        nextIsLiteral = false;
      } else if(character == '\\') {
        nextIsLiteral = true;
      } else if(insideQuotes) {
        current += character;
        if (character === matchingQuote) {
          insideQuotes = false;
        }
      } else if(character == ',') {
        blocks.push(current.trim());
        current = '';
      } else {
        current += character;
        var quote_index = openQuotes.indexOf(character);
        if(quote_index > -1) {
          matchingQuote = closeQuotes[quote_index];
          insideQuotes = true;
        }
      }
    }
    blocks.push(current.trim());

    blocks.forEach(arg => {
      out.push([ this.getArgType(arg), this.getArgName(arg )]);
    });

    return out;
  }

  getArgType(arg) {
    return null;
  }

  getArgName(arg) {
    return arg;
  }

  addExtraTags(out) {
    return out.concat(this.editorSettings.extraTags || []);
  }

  guessTypeFromName(name) {
    var matches = this.getMatchingNotations(name);
    if (matches.length > 0) {
      var rule = matches[0];
      if (rule.indexOf('type') > -1) {
        return (this.settings.indexOf(rule.type) > -1) ? this.settings.rule.type : rule.type;
      }
    }

    if (name.search('(?:is|has)[A-Z_]') > -1) {
      return this.settings.bool;
    }

    if (name.search('^(?:cb|callback|done|next|fn)$') > -1) {
      return this.settings.function;
    }

    return false;
  }

  getMatchingNotations(name) {
    return (this.editorSettings.notationMap || []).filter(function(rule) {
      if(rule.indexOf('prefix') > -1) {
        //TODO :escape prefix
        var regex = new RegExp(rule.prefix);
        if (rule.prefix.search('.*[a-z]') > -1) {
          regex = new RegExp(regex.source + (/(?:[A-Z_]|$)/).source);
        }
        return regex.exec(name);

      } else if (rule.indexOf('regex') > -1) {
        return rule.regex.exec(name);
      }
    });
  }

  getDefinition(editor, pos, readLine) {
    //TODO:
    // get a relevant definition starting at the given point
    // returns string
    var maxLines = 25;  //# don't go further than this
    var definition = '';

    // make pos writable
    //pos = pos.copy();

    for(var i=0; i < maxLines; i += 1) {
      var line = readLine(editor, pos);
      if (line == null) { break; }

      //pos += (line.length + 1);
      pos.row += 1;

      // strip comments
      line = line.replace(/\/\/.*/, '');
      line = line.replace(/\/\*.*\*\//, '');

      var searchForBrackets = line;
      var opener;
      // on the first line, only start looking from *after* the actual function starts. This is
      // needed for cases like this:
      // (function (foo, bar) { ... })
      if(definition === '') {
        if(this.settings.fnOpener) {
          opener = RegExp(this.settings.fnOpener).exec(line);
        } else {
          opener = false;
        }

        if((opener >= 0) && (opener !== null)){
          // ignore everything before the function opener
          searchForBrackets = line.slice(opener.index);
        }
      }

      definition += line;

      var brackets = [];
      var match;

      // TODO: WFT? Why wile()?
      while((match = /[()]/g.exec(searchForBrackets)) !== null) {
        brackets.push(match);
      }

      let openBrackets = brackets
        .map(bracket => bracket === '(' ? +1 : -1)
        .reduce((total, count) => total + count, 0);

      if (openBrackets === 0) { break; }
    }

    return definition;
  }
}

export default DocsParser;
