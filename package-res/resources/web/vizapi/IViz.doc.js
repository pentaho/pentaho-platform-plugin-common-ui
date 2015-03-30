/**
 * @module common-ui.vizapi
 */

/*
 * TODO: consider adding
 * * getOutputParameters
 */

/**
 * This visualization interface is a **documentation artifact** that describes
 * the contract that the JavaScript objects of visualization instances must obey to.
 *
 * #### Visualization Implementation
 *
 * Visualization instances may be implemented using any JavaScript library.
 * What matters is that the here described contract is respected.
 *
 * #### Mandatory and Optional Members
 *
 * The visualization interface has a single mandatory member —
 * the {{#crossLink "IViz/draw:method"}}{{/crossLink}} method.
 * Construction of visualization instances is abstracted away
 * through the use of a factory function (see next section).
 * The remaining methods _can_ be implemented by visualizations
 * to expose richer functionality.
 *
 * #### Visualization Instance Construction
 *
 * In older versions of the VizAPI (< 3.0), the `IViz` interface
 * required a constructor that received the DOM element as argument.
 *
 * The visualization instance constructor, of a certain visualization type,
 * {{#crossLink "IVizType"}}{{/crossLink}},
 * was accessible in the global property
 * specified in {{#crossLink "IVizType/class:property"}}{{/crossLink}},
 * and the VizAPI constructed the instance directly.
 * This form is still supported, but only for legacy, non-AMD visualizations.
 *
 * The new AMD visualizations aren't constructed directly by the VizAPI anymore.
 * It is their AMD instance module,
 * whose id is specified in {{#crossLink "IVizType/instanceModule:property"}}{{/crossLink}},
 * that returns a factory function.
 * The factory function is responsible for constructing the visualization instances.
 *
 * @class IViz
 * @constructor
 */

/**
 * **Optional** event that is triggered by a visualization whenever
 * the current highlights are changed
 * in response to an internally initiated action.
 *
 * A visualization that triggers this event **must** also implement the
 * {{#crossLink "IViz/setHighlights:method"}}{{/crossLink}} method
 * (although the reverse isn't required).
 *
 * Both _selections_ and _selectionMode_ can be changed by handlers of the event.
 * It is the final values of these which will determine the new highlights.
 * If the final _selections_ are actually different from the current highlights,
 * the visualization's {{#crossLink "IViz/setHighlights:method"}}{{/crossLink}} method
 * is subsequently called to inform it of the new highlights.
 *
 * @event select
 * @param {IViz} source The visualization instance that triggered the event.
 * @param {Array} selections An array of {{#crossLink "ISelection"}}{{/crossLink}}.
 * @param {String} [selectionMode="REPLACE"] The mode by which the specified _selections_
 *    are combined with the current highlights.
 *    See {{#crossLink "SelectionMode"}}{{/crossLink}} for a list of possible selection modes.
 */

/**
 * **Optional** event that is triggered by a visualization whenever
 * the user double-clicks, i.e. **executes**, a certain selection of entities.
 *
 * Typically, this event is triggered on a selection of a single entity.
 *
 * The property _selections_ can be changed by handlers of the event,
 * and affect subsequent handlers.
 *
 * @event doubleclick
 * @param {IViz} source The visualization instance that triggered the event.
 * @param {Array} selections An array of {{#crossLink "ISelection"}}{{/crossLink}}.
 */

/**
 * Renders the visualization with the given data and options.
 *
 * @method draw
 * @param {DataTable} dataTable The data to encode visually.
 * @param {IVizDrawOptions} options The visualization options.
 */

/**
 * **Optional** method that resizes the visualization to new given dimensions.
 *
 * This method can only be called if the visualization
 * has been previously rendered,
 * with a call to {{#crossLink "IViz/draw:method"}}{{/crossLink}}.
 *
 * When a visualization does not implement it,
 * the {{#crossLink "IViz/draw:method"}}{{/crossLink}}
 * method is called instead,
 * with the same _dataTable_ and (mostly) the same _options_ of
 * the previous {{#crossLink "IViz/draw:method"}}{{/crossLink}} method call.
 *
 * A visualization implements this method
 * if it can perform a resize operation more efficiently
 * than a re-draw.
 *
 * The framework takes care of resizing the container DOM element
 * before calling this method.
 *
 * @method resize
 * @param {number} width  The new width, in pixels. A positive number (never 0 or negative).
 * @param {number} height The new height, in pixels. A positive number (never 0 or negative).
 */

/**
 * **Optional** method that gets the state of a visualization instance.
 *
 * This method can only be called if the visualization
 * has been previously rendered,
 * with a call to {{#crossLink "IViz/draw:method"}}{{/crossLink}}.
 *
 * Note that state information should not include the options
 * passed in at construction or render time, and that were thus present in
 * {{#crossLink "IVizCreateOptions"}}{{/crossLink}} or
 * in the {{#crossLink "IVizDrawOptions"}}{{/crossLink}} of the last render.
 *
 * In general, state information can be related to the current dataset.
 * However, there are no guarantees that the returned state object will only be
 * specified in a subsequent {{#crossLink "IViz/draw:method"}}{{/crossLink}} call,
 * in {{#crossLink "IVizDrawOptions/state:property"}}options.state{{/crossLink}},
 * along with the current dataset.
 * However, it can be assumed that it will only be used with a dataset
 * having the same structure as the current one.
 *
 * State information must be JSON-serializable.
 *
 * @method getState
 * @return {Object} An object containing the visualization state, or a _nully_ value.
 */

/**
 * **Optional** method that sets the state of a visualization instance,
 * previously obtained by a call to {{#crossLink "IViz/getState:method"}}{{/crossLink}}.
 *
 * This method can only be called if the visualization
 * has been previously rendered,
 * with a call to {{#crossLink "IViz/draw:method"}}{{/crossLink}}.
 *
 * Usually, state will be provided in the
 * {{#crossLink "IVizDrawOptions/state:property"}}options.state{{/crossLink}}
 * argument of a {{#crossLink "IViz/draw:method"}}{{/crossLink}} method call.
 * However, this method is provided for completness with the
 * {{#crossLink "IViz/getState:method"}}{{/crossLink}}.
 *
 * @method setState
 * @param {Object} state A non _nully_ object containing the visualization state.
 */

/**
 * **Optional** method that sets the current highlights,
 * in response to externally initiated actions or
 * to changes to the initial highlights of a
 * {{#crossLink "IViz/select:event"}}{{/crossLink}} event
 * triggered by the visualization.
 *
 * A visualization implements this method if it _can_ visually represent the
 * highlighted state of represented entities.
 *
 * This method can only be called if the visualization
 * has been previously rendered,
 * with a call to {{#crossLink "IViz/draw:method"}}{{/crossLink}}.
 *
 * This method can be called with an empty array, or with a _nully_ value,
 * to clear the current highlights.
 *
 * The visualization should _not_ fire the
 * {{#crossLink "IViz/select:event"}}{{/crossLink}} event in response
 * to any changes, caused by this call, to the current highlights.
 *
 * When highlighting changes originate from within the visualization,
 * it triggers the {{#crossLink "IViz/select:event"}}{{/crossLink}} event.
 * If, then, in response to the event, the highlights are further modified,
 * this method will be called with the final highlights.
 *
 * Initial highlights are given in calls to
 * the {{#crossLink "IViz/draw:method"}}{{/crossLink}} method,
 * in argument {{#crossLink "IVizDrawOptions/selections:property"}}options.selections{{/crossLink}},
 * and not in a immediately following call to this method.
 *
 * @method setHighlights
 * @param {Array} [highlights] The current highlights, or,
 *     when none, an empty array or a _nully_ value.
 */

/**
 * **Optional** method that disposes a visualization instance.
 *
 * Allows a visualization instance to release important shared or memory-leaking resources.
 *
 * @method dispose
 * @since 3.0
 */
