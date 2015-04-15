/**
 * @module common-ui.vizapi
 */

/*
 * TODO: consider adding
 * * propsMap
 * * color1, color2, from VizType#needsColorGradient
 * * user defined options
 * * controller
 * * title
 * * action
 * * metrics
 * * palette
 * * memberPalette
 * * formatInfo
 *
 * Also, still need and overview of the precedence of property sets.
 * Also, need visual map and requirements knowledge.
 */

/**
 * The visualization drawing options interface is a **documentation artifact** that
 * describes configuration properties that
 * control the presentation and behavior of visualizations,
 * and that can change on each render.
 *
 * It is the type of the
 * `options` argument of
 * {{#crossLink "IViz"}}{{/crossLink}}'s
 * {{#crossLink "IViz/draw:method"}}{{/crossLink}} method.
 *
 * @class IVizDrawOptions
 * @constructor
 */

/**
 * The available width, in pixels.
 * A positive number (never 0 or negative).
 *
 * The visualization's DOM element,
 * initally specified in {{#crossLink "IVizCreationProperties/domNode:property"}}{{/crossLink}},
 * will already have this dimension set.
 *
 * @property width
 * @type number
 */

/**
 * The available height, in pixels.
 * A positive number (never 0 or negative).
 *
 * The visualization's DOM element,
 * initally specified in {{#crossLink "IVizCreationProperties/domNode:property"}}{{/crossLink}},
 * will already have this dimension set.
 *
 * @property height
 * @type number
 */

/**
 * The array of initial highlights, possibly empty or _nully_.
 *
 * An array of {{#crossLink "ISelection"}}{{/crossLink}}.
 *
 * Visualizations should be tolerant to the fact that some of the highlights
 * may not apply (anymore) to the current data.
 *
 * The setting of these highlights should **not** cause the visualization
 * to trigger a {{#crossLink "IViz/select:event"}}{{/crossLink}} event.
 *
 * @property selections
 * @type Array
 * @default undefined
 */

/**
 * A state object previously obtained by a call to
 * {{#crossLink "IViz/getState:method"}}{{/crossLink}},
 * on a visualization instance of the same type,
 * or _nully_.
 *
 * The visualization can use this information
 * to restore fine-grained state not contained in other
 * visualization properties.
 *
 * @property state
 * @type Object
 * @default undefined
 * @since 3.0
 */

/**
 * Options that are passed-through to the underlying graphics library or libraries.
 *
 * It is up to visualization implementations to forward these options with more or less control.
 *
 * Direct options allow users to specify options not yet
 * supported by visualizations, but that are known to be supported by the underlying
 * graphics library or libraries.
 *
 * @property directOptions
 * @type Object
 * @default undefined
 * @since 3.0
 */
