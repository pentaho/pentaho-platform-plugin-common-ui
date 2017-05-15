exports.handlers = {
  newDoclet: function(event) {
    let doclet = event.doclet;

    switch (doclet.kind) {
      case "class":
        doclet.classSummary = getSummary( doclet.classdesc );
        doclet.constructorSummary = getSummary( doclet.description );
        break;
      case "interface":
        doclet.summary = getSummary( doclet.description || doclet.classdesc );
        break;
      default:
        doclet.summary = getSummary( doclet.description );
    }
  }
};

/**
 * Define your custom tags inside this block
 *
 * Tag options:
 *
 * @property {boolean}  canHaveType              Default Value (false)
 * @property {boolean}  canHaveName              Default Value (false)
 * @property {boolean}  isNamespace              Default Value (false)
 * @property {boolean}  mustHaveValue            Default Value (false)
 * @property {boolean}  mustNotHaveDescription   Default Value (false)
 * @property {boolean}  mustNotHaveValue         Default Value (false)
 *
 * @property {function} onTagged
 *
 */
exports.defineTags = function ( dictionary ) {

  // region New Tags
  /** Tag to add AMD module information to a class */
  createTagDefinition('amd', {
    onTagged: function( doclet, tag ) { doclet.amd = tag; }
  });

  /** Other tag for code examples in order to have different header */
  const exampleTag = dictionary.lookUp('example');
  createTagDefinition('code', {
    keepsWhitespace: exampleTag.keepsWhitespace,
    removesIndent:   exampleTag.removesIndent,
    mustHaveValue:   exampleTag.mustHaveValue,

    onTagged: function( doclet, tag ) {
      doclet.codeExamples = doclet.codeExamples || [];
      doclet.codeExamples.push( tag.value );
    }
  });

  /**
   * New tag to manually mark classes as static
   */
  createTagDefinition('staticClass', {
    onTagged: function ( doclet/*, tag*/ ) { doclet.static = true; }
  });
  // endregion

  /** (Re)defining extends tag */
  extendTagDefinition('extends', {
    onTagged: function( doclet, tag ) {
      let value = tag.value;
      if ( value.indexOf( "@link" ) < 0 ) {
        value = firstWordOf(value);
      }

      doclet.augment( value );
    }
  });

  // ------ Private -----

  function createTagDefinition( name, options ) {
    return dictionary.defineTag( name, options );
  }

  function extendTagDefinition( name, options ) {
    const tagDefinition = dictionary.lookUp( name );
    const isNewTag = tagDefinition === false;

    if ( isNewTag ) {
      return createTagDefinition( name, options );
    }

    Object.keys( tagDefinition ).map(function( key ) {
      const tagOption = tagDefinition[key];
      if ( tagDefinition.hasOwnProperty( key ) && key !== 'onTagged' ) options[key] = tagOption;
    });

    const onTagged = options.onTagged;
    options.onTagged = function( doclet, tag ) {
      tagDefinition.onTagged( doclet, tag );
      if ( onTagged ) onTagged( doclet, tag );
    };

    return createTagDefinition( name, options );
  }

};

/**
 * Gets the first word in the {@code string}
 *
 * @param {string} string
 *
 * @return {string} the first word of {@code string} if any exist; otherwise return an empty string
 */
function firstWordOf( string ) {
  const match = /^(\S+)/.exec( string );
  if ( match ) {
    const group0 = 1;
    return match[group0];
  } else {
    return '';
  }
}

function getSummary( description ) {
  if ( !description ) return "";

  const summary = description.split(/(\.(<\/?([^<]+)>)?\s*)$/);
  return summary[0] + ( summary[1] || "" );
}


