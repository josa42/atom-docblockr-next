"use babel";

import DocsParser from '../docsparser';
import { XRegExp } from 'xregexp';

function RustParser(settings) {
    DocsParser.call(this, settings);
}

RustParser.prototype = Object.create(DocsParser.prototype);

RustParser.prototype.setup_settings = function() {
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
};

RustParser.prototype.parse_function = function(line) {
    var regex = XRegExp('\\s*fn\\s+(?P<name>\\S+)');
    var matches = XRegExp.exec(line, regex);
    if(matches === null)
        return null;
    var name = [].join(matches.name);
    return [ name, []];
};

RustParser.prototype.format_function = function(name, args) {
        return name;
};

export default RustParser;
