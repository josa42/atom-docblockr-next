"use babel";

import DocblockrWorker from './docblockr-worker.js';

export default {
  config: {
    // deep_indent: {
    //   descriotion: 'Whether pressing tab at the start of a line in docblock should indent to match the previous line's description field. An example of this feature is described above. Default: `true`',
    //   type: 'boolean',
    //   default: false
    // },
    extendDoubleSlash: {
      descriotion: 'Whether double-slash comments should be extended. An example of this feature is described above. Default: `true`',
      type: 'boolean',
      default: true
    },
    indentationSpaces: {
      description: 'The number of spaces to indent after the leading asterisk.',
      type: 'number',
      default: 1
    },
    indentationSpacesSamePara: {
      descritpion: 'Described above in the *Reformatting paragraphs* section. Default: `1`',
      type: 'number',
      default: 1
    },
    alignTags: {
      description: 'Whether the words following the tags should align. Possible values are `no`, `shallow` and `deep`',
      type: 'string',
      default: 'deep',
      enum: ['no', 'shallow', 'deep']
    },
    extraTags: {
      description: 'An array of strings, each representing extra boilerplate comments to add to *functions*. These can also include arbitrary text (not just tags).',
      type: 'array',
      default: []
    },
    extraTagsGoAfter: {
      description: 'If true, the extra tags are placed at the end of the block (after param/return). Default: `false`',
      type: 'boolean',
      default: false
    },
    notationMap: {
      description: 'An array of notation objects. Each notation object must define either a `prefix` OR a `regex` property, and a `type` property.',
      type: 'array',
      default: []
    },
    returnTag: {
      description: 'The text which should be used for a `@return` tag. By default, `@return` is used, however this can be changed to `@returns` if you use that style.',
      type: 'string',
      default: '@return'
    },
    returnDescription: {
      type: 'boolean',
      default: true
    },
    paramDescription: {
      type: 'boolean',
      default: true
    },
    spacerBetweenSections: {
      description: 'If true, then extra blank lines are inserted between the sections of the docblock. If set to `"after_description"` then a spacer will only be added between the description and the first tag. Default: `false`.',
      type: 'boolean',
      default: false
    },
    perSectionIndent: {
      type: 'boolean',
      default: false
    },
    minSpacesBetweenColumns: {
      type: 'number',
      default: 1
    },
    autoAddMethodTag: {
      description: 'Add a `@method` tag to docblocks of functions. Default: `false`',
      type: 'boolean',
      default: false
    },
    simpleMode: {
      description: 'If true, DocBlockr won\'t add a template when creating a doc block before a function or variable. Useful if you don\'t want to write Javadoc-style, but still want your editor to help when writing block comments. Default: `false`',
      type: 'boolean',
      default: false
    },
    lowerCasePrimitives: {
      description: 'If true, primitive data types are added in lower case, eg "number" instead of "Number". Default: `false`',
      type: 'boolean',
      default: false
    },
    shortPrimitives: {
      description: 'If true, the primitives `Boolean` and `Integer` are shortened to `Bool` and `Int`. Default: `false`',
      type: 'boolean',
      default: false
    },
    overrideJsVar: {
      type: 'boolean',
      default: false
    },
    newlineAfterBlock: {
      description: 'If true, an extra line break is added after the end of a docblock to separate it from the code. Default `false`',
      type: 'boolean',
      default: false
    }
    // ,
    // developmentMode: {
    //   type: 'boolean',
    //   default: false
    // }
  },

  activate: function() {
    this.Docblockr = new DocblockrWorker();
  }
};
