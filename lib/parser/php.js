"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';

class PhpParser extends DocsParser {

    setupSettings() {
        var shortPrimitives = this.editor_settings.short_primitives || false;
        var nameToken = '[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*';
        this.settings = {
            // curly brackets around the type information
            'curlyTypes': false,
            'typeInfo': true,
            'typeTag': 'var',
            'varIdentifier': '[$]' + nameToken + '(?:->' + nameToken + ')*',
            'fnIdentifier': nameToken,
            'fnOpener': 'function(?:\\s+' + nameToken + ')?\\s*\\(',
            'commentCloser': ' */',
            'bool': (shortPrimitives ? 'bool' : 'boolean'),
            'function': 'function'
        };
    }

    parseFunction(line) {
        var regex = XRegExp(
            'function\\s+&?(?:\\s+)?' +
            '(?P<name>' + this.settings.fnIdentifier + ')' +
            // function fnName
            // (arg1, arg2)
            '\\s*\\(\\s*(?P<args>.*?)\\)'
            );

        var matches = XRegExp.exec(line, regex);
        if(matches === null)
            return null;

        return [matches.name, matches.args, null];
    }

    getArgType(arg) {
        // function add($x, $y = 1)
        var regex = XRegExp(
            '(?P<name>' + this.settings.varIdentifier + ')\\s*=\\s*(?P<val>.*)'
            );

        var matches = XRegExp.exec(arg, regex);
        if(matches !== null)
            return this.guessTypeFromValue(matches.val);

        // function sum(Array $x)
        if(arg.search(/\S\s/) > -1) {
            matches = /^(\S+)/.exec(arg);
            return matches[1];
        }
        else
            return null;
    }

    getArgName(arg) {
        console.log('getArgName', arg);
        var regex = new RegExp(
            '(' + this.settings.varIdentifier + ')(?:\\s*=.*)?$'
            );
        var matches = regex.exec(arg);
        return matches[1];
    }

    parseVar(line) {
        /*
            var $foo = blah,
                $foo = blah;
            $baz->foo = blah;
            $baz = array(
                 'foo' => blah
            )
        */
        var regex = XRegExp(
            '(?P<name>' + this.settings.varIdentifier + ')\\s*=>?\\s*(?P<val>.*?)(?:[;,]|$)'
            );
        var matches = XRegExp.exec(line, regex);
        if(matches !== null)
            return [matches.name, matches.val.trim()];

        regex = XRegExp(
            '\\b(?:var|public|private|protected|static)\\s+(?P<name>' + this.settings.varIdentifier + ')'
            );
        matches = XRegExp.exec(line, regex);
        if(matches !== null)
            return [matches.name, null];

        return null;
    }

    guessTypeFromValue(val) {
        var short_primitives = this.editor_settings.short_primitives || false;
        if(this.isNumeric(val)) {
            if(val.indexOf('.') > -1)
                return 'float';

            return (short_primitives ? 'int' : 'integer');
        }
        if((val[0] == '"') || (val[0] == '\''))
            return 'string';
        if(val.slice(0,5) == 'array')
            return 'array';

        if (val.match(/^(true|false)$/i)) {
            return (short_primitives ? 'bool' : 'boolean');
        }

        if(val.slice(0,4) == 'new ') {
            var regex = new RegExp(
                'new (' + this.settings.fnIdentifier + ')'
                );
            var matches = regex.exec(val);
            return (matches[0] && matches[1]) || null;
        }
        return null;
    }

    getFunctionReturnType(name, retval) {
        var shortPrimitives = this.editor_settings.short_primitives || false;
        if (name.slice(0,2) == '__'){
            var values = ['__construct', '__destruct', '__set', '__unset', '__wakeup'];
            var i, len;
            for(i = 0; len = values.length, i < len; i++) {
                if(name == values[i])
                    return null;
            }
            if(name == '__sleep')
                return 'array';
            if(name == '__toString')
                return 'string';
            if(name == '__isset')
                return (shortPrimitives ? 'bool' : 'boolean');
        }
        return super.getFunctionReturnType(name, retval);
    }
}

export default PhpParser;
