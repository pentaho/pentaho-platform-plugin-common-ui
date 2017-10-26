/**
 * Event Handlers {@link http://usejsdoc.org/about-plugins.html#event-handlers}
 */
exports.handlers = {
  newDoclet: newDoclet
};

// ---- Events

function newDoclet( event ) {
  const doclet = event.doclet;

  let description = null;
  switch ( doclet.kind ) {
    case "class":
      doclet.classSummary = _getSummary( doclet.classdesc );
      doclet.constructorSummary = _getSummary( doclet.description );
      break;
    case "interface":
      description = doclet.description || doclet.classdesc;
      break;
    default:
      description = doclet.description;
  }

  if ( !doclet.summary ) doclet.summary = _getSummary( description );
}

// ---- Private

function _getSummary( description ) {
  const isDescriptionEmpty = description == null || description === "";
  if ( isDescriptionEmpty ) return "";

  const SUMMARY = 0;
  const SUMMARY_END = 1;

  const match = description.split(/((\.?<\/p>)(?:$|\s)?)/);
  return match[SUMMARY] + match[SUMMARY_END];
}
