"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';

class RustParser extends DocsParser {

    setupSettings() {
        this.settings = {
            'curlyTypes': false,
            'typeInfo': false,
            'typeTag': false,
            'varIdentifier': '.*',
            'fnIdentifier':  '.*',
            'fnOpener': '^\\s*fn',
            'commentCloser': ' */',
            'bool': 'Boolean',
            'function': 'Function'
        };
    }

    parseFunction(line) {
        var regex = XRegExp('\\s*fn\\s+(?P<name>\\S+)');
        var matches = XRegExp.exec(line, regex);
        if(matches === null)
            return null;
        var name = [].join(matches.name);
        return [ name, []];
    };

    formatFunction(name, args) {
            return name;
    }
}

export default RustParser;
