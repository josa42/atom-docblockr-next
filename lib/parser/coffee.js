"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';

class CoffeeParser extends DocsParser {

    setupSettings() {
        var identifier = '[a-zA-Z_$][a-zA-Z_$0-9]*';
        this.settings = {
            // curly brackets around the type information
            'curlyTypes': true,
            'typeTag': this.editor_settings.override_js_var || 'type',
            'typeInfo': true,
            // technically, they can contain all sorts of unicode, but w/e
            'varIdentifier': identifier,
            'fnIdentifier': identifier,
            'fnOpener': null,  // no multi-line function definitions for you, hipsters!
            'commentCloser': '###',
            'bool': 'Boolean',
            'function': 'Function'
        };
    }

    parseFunction(line) {
        var regex = XRegExp(
            // fnName = function,  fnName : function
            '(?:(?P<name>' + this.settings.varIdentifier + ')\\s*[:=]\\s*)?' +
            '(?:\\((?P<args>[^()]*?)\\))?\\s*([=-]>)'
            );
        var matches = XRegExp.exec(line, regex);
        if(matches === null)
            return null;

        // grab the name out of "name1 = function name2(foo)" preferring name1
        var name = matches.name || '';
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
        var regex = XRegExp(
            '(?P<name>' + this.settings.varIdentifier + ')\\s*[=:]\\s*(?P<val>.*?)(?:[;,]|$)'
            );
        var matches = XRegExp.exec(line, regex);
        if(matches === null)
            return null;

        return [matches.name, matches.val.trim()];
    }

    guessTypeFromValue(val) {
        var lowerPrimitives = this.editor_settings.lower_case_primitives || false;
        if(this.isNumeric(val))
            return (lowerPrimitives ? 'number' : 'Number');
        if((val[0] == '"') || (val[0] == '\''))
            return (lowerPrimitives ? 'string' : 'String');
        if(val[0] == '[')
            return 'Array';
        if(val[0] == '{')
            return 'Object';
        if((val == 'true') || (val == 'false'))
            return (lowerPrimitives ? 'boolean' : 'Boolean');
        var regex = new RegExp('RegExp\\b|\\\/[^\\/]');
        if(regex.test(val)) {
            return 'RegExp';
        }
        if(val.slice(0,4) == 'new ') {
            regex = new RegExp(
                'new (' + this.settings.fnIdentifier + ')'
                );
            var matches = regex.exec(val);
            return (matches[0] && matches[1]) || null;
        }
        return null;
    }
}

export default CoffeeParser;
