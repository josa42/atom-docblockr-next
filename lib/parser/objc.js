"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';

class ObjCParser extends DocsParser {

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
            'fnOpener': '^\\s*[-+]',
            'commentCloser': ' */',
            'bool': 'Boolean',
            'function': 'Function'
        };
    };

    getDefinition(editor, pos, readLine) {
        var maxLines = 25;  // don't go further than this

        var definition = '';
        var i;
        for(i=0; i < maxLines; i += 1) {
            var line = readLine(editor, pos);
            if (line == null) {
                break;
            }

            // goto next line
            pos.row+= 1;
            // strip comments
            line = line.replace(/\/\/.*/, '');
            if(definition === '') {
                if((!this.settings.fnOpener) || !(line.search(RegExp(this.settings.fnOpener)) > -1)) {
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
    };

    parseFunction(line) {
        // this is terrible, don't judge me
        var type_regex = '[a-zA-Z_$][a-zA-Z0-9_$]*\\s*\\**';
        var regex = XRegExp(
            '[-+]\\s+\\(\\s*(?P<retval>' + type_regex + ')\\s*\\)\\s*' +
            '(?P<name>[a-zA-Z_$][a-zA-Z0-9_$]*)' +
            // void fnName
            // (arg1, arg2)
            '\\s*(?::(?P<args>.*))?'
            );

        var matches = XRegExp.exec(line, regex);
        if (matches == null) {
            return null;
        }

        var name = matches.name;
        var arg_str = matches.args;
        var args = [];

        if(arg_str !== null) {
            regex = /\s*:\s*/g;
            var groups = arg_str.split(regex);
            var num_groups = groups.length;
            var i,len;
            for(i=0; i < num_groups; i += 1) {
                var group = groups[i];
                if(i < (num_groups - 1)) {
                    regex = /\s+(\S*)$/g;
                    result = group.exec(regex);
                    name+= ':' + result[1];
                    group = group.slice(0, result.index);
                }
                args.push(group);
            }
            if (num_groups) {
                name+= ':';
            }
        }
        return [name, args.join('|||'), matches.retval];
    };

    parseArgs(args) {
        var out = [];
        var arg_list = args.split('|||');
        var i, len;
        for(i=0; len = arg_list.length, i < len; i += 1) {
            var arg = arg_list[i];
            var last_paren = arg.lastIndexOf(')');
            out.push(arg.split(1, last_paren), arg.split(last_paren + 1));
        }
        return out;
    };

    getFunctionReturnType(name, retval) {
        if ((retval != 'void') && (retval != 'IBAction')) {
            return retval;
        } else {
            return null;
        }
    };

    parseVar(line) {
        return null;
    };
}

export default ObjCParser;
