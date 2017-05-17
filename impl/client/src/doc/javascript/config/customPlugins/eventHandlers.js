/**
 * Event Handlers {@link http://usejsdoc.org/about-plugins.html#event-handlers}
 */
exports.handlers = {
  newDoclet: newDoclet
};

// ---- Events

function newDoclet( event ) {
  let doclet = event.doclet;

  switch ( doclet.kind ) {
    case "class":
      doclet.classSummary = _getSummary( doclet.classdesc );
      doclet.constructorSummary = _getSummary( doclet.description );
      break;
    case "interface":
      if ( !doclet.summary ) doclet.summary = _getSummary( doclet.description || doclet.classdesc );
      break;
    default:
      if ( !doclet.summary ) doclet.summary = _getSummary( doclet.description );
  }
}

// ---- Private

function _getSummary( description ) {
  if ( !description ) return "";

  const SUMMARY = 0;
  const SUMMARY_END = 1;

  const match = description.split(/((\.?<\/p>)(?:$|\s)?)/);
  return match[SUMMARY] + match[SUMMARY_END];
}
