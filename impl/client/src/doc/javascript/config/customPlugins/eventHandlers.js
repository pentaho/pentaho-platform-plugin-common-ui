/**
 * Event Handlers {@link http://usejsdoc.org/about-plugins.html#event-handlers}
 */
exports.handlers = {
  newDoclet: newDoclet
};

// ---- Events

const MEMBEROF_CONSTRUCTOR = "#constructor";

function newDoclet( event ) {
  const doclet = event.doclet;

  let description = null;
  switch ( doclet.kind ) {
    case "class":
      doclet.classSummary = _getSummary(doclet.classdesc);
      doclet.constructorSummary = _getSummary(doclet.description);
      break;
    case "interface":
      description = doclet.description || doclet.classdesc;
      break;
    default:
      description = doclet.description;
  }

  if ( !doclet.summary ) doclet.summary = _getSummary(description);

  let memberOf = doclet.memberof;
  if (memberOf != null && memberOf.indexOf(MEMBEROF_CONSTRUCTOR)) {
    /*
      properties defined inside a constructor are considered members of it

      Example:
        {
         ...,
         constructor () {
           this.prop = 'something' // memberof: class#constructor, name: prop
           // wrong -> class_constructor#prop
           // right -> class#prop
         },
         ...
        }
     */
    doclet.memberof = memberOf.replace(MEMBEROF_CONSTRUCTOR, "");

  }
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
