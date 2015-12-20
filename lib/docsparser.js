"use babel";

import util from 'util';
import { escape } from './utils';


class DocsParser {

    constructor(settings) {
        this.editor_settings = settings;
        this.setupSettings();
        this.name_override = null;
    }

    init(viewSettings) {
        this.viewSettings = viewSettings;
        this.setupSettings();
        this.nameOverride = null;
    }

    isExistingComment(line) {
        return ((line.search(/^\s*\*/) >=0) ? true : false);
    }

    isNumeric(val) {
        if(!isNaN(val))
            return true;

        return false;
    }

    setNameOverride(name) {
        // overrides the description of the function - used instead of parsed description
        this.name_override = name;
    }

    getNameOverride(){
        return this.name_override;
    }

    parse(line) {
        if(this.editor_settings.simple_mode === true) {
            return null;
        }
        var out = this.parseFunction(line);  // (name, args, retval, options)
        if (out) {
            return this.formatFunction.apply(this, out);
        }
        out = this.parseVar(line);
        if (out) {
            return this.formatVar.apply(this, out);
        }
        return null;
    }

    formatVar(name, val, valType) {
        valType = typeof valType !== 'undefined' ? valType : null;
        var out = [];
        var brace_open, brace_close, temp;
        if(this.settings.curlyTypes) {
            brace_open = '{';
            brace_close = '}';
        }
        else {
            brace_open = brace_close = '';
        }
        if (!valType) {
            if(!val || (val === '')) {  //quick short circuit
                valType = '[type]';
            }
            else {
                valType = this.guessTypeFromValue(val) || this.guessTypeFromName(name) || '[type]';
            }
        }
        if(this.inline) {
            temp = util.format('@%s %s${1:%s}%s ${1:[description]}',
                                            this.settings.typeTag, brace_open, valType, brace_close);
            out.push(temp);
        }
        else {
            temp = util.format('${1:[%s description]}', escape(name));
            out.push(temp);
            temp = util.format('@%s %s${1:%s}%s',
                                    this.settings.typeTag, brace_open, valType, brace_close);
            out.push(temp);
        }
        return out;
    }

    getTypeInfo(argType, argName) {
        var typeInfo = '';
        var brace_open, brace_close;
        if(this.settings.curlyTypes) {
            brace_open = '{';
            brace_close = '}';
        }
        else {
            brace_open = brace_close = '';
        }
        if(this.settings.typeInfo) {
            typeInfo = util.format('%s${1:%s}%s ' , brace_open,
                                    escape(argType || this.guessTypeFromName(argName) || '[type]'),
                                    brace_close
            );
        }
        return typeInfo;
    }

    formatFunction(name, args, retval, options) {
        options = (typeof options !== 'undefined') ? options : {};
        var out = [];
        var i, len, format_str;
        if(options.hasOwnProperty('as_setter')) {
            out.push('@private');
            return out;
        }
        var extra_tag_after = this.editor_settings.extra_tags_go_after || false;

        var description = this.getNameOverride() || ('['+ escape(name) + (name ? ' ': '') + 'description]');
        out.push('${1:' + description + '}');

        if (this.editor_settings.auto_add_method_tag) {
            out.push('@method '+ escape(name));
        }

        if(!extra_tag_after)
            out = this.addExtraTags(out);

        // if there are arguments, add a @param for each
        if(args) {
            // remove comments inside the argument list.
            args = args.replace(/\/\*.*?\*\//,'');
            var parsed_args = this.parseArgs(args);
            for (i = 0; len = parsed_args.length,i < len; i++) {
                var arg_type = parsed_args[i][0];
                var arg_name = parsed_args[i][1];

                type_info = this.getTypeInfo(arg_type, arg_name);
                format_str = '@param %s%s';
                //var str = '@param ' + type_info + escape(arg_name);
                if(this.editor_settings.param_description)
                    //str+= ' ${1:[description]}';
                    format_str += ' ${1:[description]}';
                //out.push(str);
                out.push(util.format(format_str, type_info, escape(arg_name)));
            }
        }

        // return value type might be already available in some languages but
        // even then ask language specific parser if it wants it listed
        var ret_type = this.getFunctionReturnType(name, retval);
        if(ret_type !== null) {
            var type_info = '';
            if(this.settings.typeInfo)
                //type_info = ' ' + (this.settings.curlyTypes ? '{' : '') + '${1:' + (ret_type || '[type]') + (this.settings.curlyTypes ? '}' : '');
                type_info = util.format(' %s${1:%s}%s', (this.settings.curlyTypes ? '{' : ''),
                                                        (ret_type || '[type]'),
                                                        (this.settings.curlyTypes ? '}' : '')
                                        );

            var format_args = [
                (this.editor_settings.return_tag || '@return'),
                type_info
            ];

            if (this.editor_settings.return_description) {
                format_str = '%s%s %s${1:[description]}';
                var third_arg = '';

                // the extra space here is so that the description will align with the param description
                if(args && (this.editor_settings.alignTags == 'deep')) {
                    if(!this.editor_settings.per_section_indent)
                        third_arg = ' ';
                }

                format_args.push(third_arg);
            }
            else
                format_str = '%s%s';

            // TODO
            //out.push(util.format(format_str, format_args));
            format_args.forEach(function(element) {
                format_str = util.format(format_str, element);
            });
            out.push(format_str);
        }
        var matching_names = this.getMatchingNotations(name);
        for (i = 0; len = matching_names.length,i < len; i++) {
            var notation = matching_names[i];
            if(notation.indexOf('tags') > -1)
                out.concat(notation.args);
        }

        if(extra_tag_after)
            out = this.addExtraTags(out);

        return out;
    }

    getFunctionReturnType(name, retval) {
        // returns None for no return type. False meaning unknown, or a string
        if(/^[A-Z]/.test(name))
            return null;  // no return, but should add a class

        if(name.search(/[$_]?(?:set|add)($|[A-Z_])/) > -1)
            return null;     // setter/mutator, no return

        if(name.search(/[$_]?(?:is|has)($|[A-Z_])/) > -1)  //functions starting with 'is' or 'has'
            return this.settings.bool;

        return (this.guessTypeFromName(name) || false);
    }

    parseArgs(args) {
        /*
        an array of tuples, the first being the best guess at the type, the second being the name
        */
        var out = [];
        if(!args)
            return out;
        // the current token
        var current = '';
        // characters which open a section inside which commas are not separators between different arguments
        var open_quotes  = '"\'<(';
        // characters which close the the section. The position of the character here should match the opening
        // indicator in `openQuotes`
        var close_quotes = '"\'>)';
        var matching_quote = '';
        var inside_quotes = false;
        var next_is_literal = false;
        var blocks = [];

        var i, len;
        for (i = 0; len = args.length,i < len; i++) {
            var character = args.charAt(i);
            if(next_is_literal) {// previous char was a \
                current+= character;
                next_is_literal = false;
            }
            else if(character == '\\') {
                next_is_literal = true;
            }
            else if(inside_quotes) {
                current+= character;
                if(character === matching_quote)
                    inside_quotes = false;
            }
            else {
                if(character == ',') {
                    blocks.push(current.trim());
                    current = '';
                }
                else {
                    current+= character;
                    var quote_index = open_quotes.indexOf(character);
                    if(quote_index > -1) {
                        matching_quote = close_quotes[quote_index];
                        inside_quotes = true;
                    }
                }
            }
        }
        blocks.push(current.trim());

        for (i = 0; len = blocks.length,i < len; i++) {
            var arg = blocks[i];
            out.push([this.getArgType(arg), this.getArgName(arg)]);
        }
        return out;
    }

    getArgType(arg) {
        return null;
    }

    getArgName(arg) {
        return arg;
    }

    addExtraTags(out) {
        var extra_tags = this.editor_settings.extra_tags || [];
        if (extra_tags.length > 0)
            out = out.concat(extra_tags);
        return out;
    }

    guessTypeFromName(name) {
        var matches = this.getMatchingNotations(name);
        if(matches.length > 0) {
            var rule = matches[0];
            if(rule.indexOf('type') > -1)
                return (this.settings.indexOf(rule.type) > -1) ? this.settings.rule.type : rule.type;
        }
        if(name.search('(?:is|has)[A-Z_]') > -1)
            return this.settings.bool;

        if(name.search('^(?:cb|callback|done|next|fn)$') > -1)
            return this.settings.function;

        return false;
    }

    getMatchingNotations(name) {
        var check_match = function(rule) {
            if(rule.indexOf('prefix') > -1) {
                //TODO :escape prefix
                var regex = new RegExp(rule.prefix);
                if(rule.prefix.search('.*[a-z]') > -1)
                    regex = new RegExp(regex.source + (/(?:[A-Z_]|$)/).source);
                return regex.exec(name);
            }
            else if(rule.indexOf('regex') > -1)
                return rule.regex.exec(name);
        };

        return (this.editor_settings.notation_map || []).filter(check_match);
    }

    getDefinition(editor, pos, readLine) {
        //TODO:
        // get a relevant definition starting at the given point
        // returns string
        var maxLines = 25;  //# don't go further than this
        var openBrackets = 0;
        var definition = '';

        // make pos writable
        //pos = pos.copy();

        // count the number of open parentheses
        var countBrackets = function(total, bracket) {
            if(bracket == '(')
               return total + 1;
            else
                return total - 1;
        };

        for(var i=0; i < maxLines; i++) {
            var line = readLine(editor, pos);
            if(line == null)
                break;

            //pos += (line.length + 1);
            pos.row+= 1;
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
                }
                else {
                    opener = false;
                }
                if((opener >= 0) && (opener != null)){
                    // ignore everything before the function opener
                    searchForBrackets = line.slice(opener.index);
                }
            }
            var regex = new RegExp('[()]', 'g');
            var Brackets = [];
            var match;
            while((match = regex.exec(searchForBrackets)) !== null) {
                Brackets.push(match);
            }
            openBrackets = Brackets.reduce(countBrackets, openBrackets);

            definition += line;
            if(openBrackets === 0)
                break;
        }
        return definition;
    }
}

export default DocsParser;
