/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @module pentaho.visual
 */

/*
 * TODO: consider adding
 * * getOutputParameters
 */

/**
 * Visualization instances, or for short, _visuals_, must implement this interface.
 *
 * #### Visual Implementation
 *
 * Visuals may be implemented using any JavaScript library.
 * What matters is that the here described contract is respected.
 *
 * #### Mandatory and Optional Members
 *
 * The visual interface has a single mandatory member —
 * the {{#crossLink "IVisual/draw:method"}}{{/crossLink}} method.
 * Construction of visuals is abstracted away
 * through the use of a factory function (see next section).
 * The remaining methods _can_ be implemented by visuals
 * to expose richer functionality.
 *
 * #### Visual Construction
 *
 * In older versions of the VisualAPI (< 3.0), the `IVisual` interface
 * required a constructor that received the DOM element as argument.
 *
 * The visual constructor, of a certain
 * {{#crossLink "IVisualType"}}visual type{{/crossLink}},
 * was accessible in the global property
 * specified in {{#crossLink "IVisualType/class:property"}}{{/crossLink}},
 * and the VisualAPI constructed the instance directly.
 * This form is still supported, but only for legacy, non-AMD visualizations.
 *
 * The new AMD visualizations aren't constructed directly by the VisualAPI anymore.
 * The new {{#crossLink "IVisualType/factory:property"}}{{/crossLink}} property,
 * can contain:
 * 1. a factory function, than can be synchronous or asynchronous (return a promise for the visual)
 * 2. a string that is the name of a module whose value is a factory function.
 *
 * The factory function is responsible for constructing the visuals.
 *
 * @class IVisual
 * @constructor
 */

/**
 * **Optional** event that is triggered by a visual whenever
 * the current highlights are changed
 * in response to an internally initiated action.
 *
 * A visual that triggers this event **must** also implement the
 * {{#crossLink "IVisual/setHighlights:method"}}{{/crossLink}} method
 * (although the reverse isn't required).
 *
 * Both _selections_ and _selectionMode_ can be changed by handlers of the event.
 * It is the final values of these which will determine the new highlights.
 * If the final _selections_ are actually different from the current highlights,
 * the visual's {{#crossLink "IVisual/setHighlights:method"}}{{/crossLink}} method
 * is subsequently called to inform it of the new highlights.
 *
 * @event select
 * @param {IVisual} source The visual that triggered the event.
 * @param {Array} selections An array of {{#crossLink "ISelection"}}{{/crossLink}}.
 * @param {String} [selectionMode="REPLACE"] The mode by which the specified _selections_
 *    are combined with the current highlights.
 *    See {{#crossLink "SelectionMode"}}{{/crossLink}} for a list of possible selection modes.
 */

/**
 * **Optional** event that is triggered by a visual whenever
 * the user double-clicks, i.e. **executes**, a certain selection of entities.
 *
 * Typically, this event is triggered on a selection of a single entity.
 *
 * The property _selections_ can be changed by handlers of the event,
 * and affect subsequent handlers.
 *
 * @event doubleclick
 * @param {IVisual} source The visual that triggered the event.
 * @param {Array} selections An array of {{#crossLink "ISelection"}}{{/crossLink}}.
 */

/**
 * Renders a visual specification, of a supported type,
 * with the given data.
 *
 * @method draw
 * @param {DataTable} dataTable The data to encode visually.
 * @param {IVisualDrawSpec} drawSpec The visual _draw_ specification.
 */

/**
 * **Optional** method that resizes the visual to new given dimensions.
 *
 * This method can only be called if the visual
 * has been previously rendered,
 * with a call to {{#crossLink "IVisual/draw:method"}}{{/crossLink}}.
 *
 * When a visual does not implement it,
 * the {{#crossLink "IVisual/draw:method"}}{{/crossLink}}
 * method should be called instead,
 * with the same _dataTable_ and the same visual _draw_ specification of
 * the previous {{#crossLink "IVisual/draw:method"}}{{/crossLink}} method call
 * (having, however, updated "width" and "height" properties).
 *
 * A visual implements this method
 * if it can perform a resize operation more efficiently
 * than a re-draw.
 *
 * The container must take care of resizing the container DOM element
 * before calling this method.
 *
 * @method resize
 * @param {number} width  The new width, in pixels. A non-negative number.
 * @param {number} height The new height, in pixels. A non-negative number.
 */

/**
 * **Optional** method that gets the state of a visual.
 *
 * This method can only be called if the visual
 * has been previously rendered,
 * with a call to {{#crossLink "IVisual/draw:method"}}{{/crossLink}}.
 *
 * Note that state information should not include properties
 * that are otherwise present in a
 * {{#crossLink "IVisualSpec"}}visual specification{{/crossLink}}.
 *
 * In general, state information _can_ be related to the current dataset.
 * However, there are no guarantees that the returned state object will only be
 * specified in a subsequent {{#crossLink "IVisual/draw:method"}}{{/crossLink}} call,
 * in {{#crossLink "IVisualSpec/state:property"}}visualSpec.state{{/crossLink}},
 * along with the current dataset.
 * However, it can be assumed that it will only be used with a dataset
 * having the _same structure_ as the current one.
 *
 * State information must be JSON-serializable.
 *
 * @method getState
 * @return {Object} An object containing the visual's state, or a _nully_ value.
 */

/**
 * **Optional** method that sets the state of a visual,
 * previously obtained by a call to {{#crossLink "IVisual/getState:method"}}{{/crossLink}}.
 *
 * This method can only be called if the visual
 * has been previously rendered,
 * with a call to {{#crossLink "IVisual/draw:method"}}{{/crossLink}}.
 *
 * Usually, state will be provided in the
 * {{#crossLink "IVisualSpec/state:property"}}visualSpec.state{{/crossLink}}
 * argument of a {{#crossLink "IVisual/draw:method"}}{{/crossLink}} method call.
 * However, this method is provided for completness with the
 * {{#crossLink "IVisual/getState:method"}}{{/crossLink}}.
 *
 * @method setState
 * @param {Object} state A non _nully_ object containing the visual's state.
 */

/**
 * **Optional** method that sets the current highlights,
 * in response to externally initiated actions or
 * to changes to the initial highlights of a
 * {{#crossLink "IVisual/select:event"}}{{/crossLink}} event
 * triggered by the visual.
 *
 * A visual implements this method if it _can_ visually represent the
 * highlighted state of represented entities.
 *
 * This method can only be called if the visual
 * has been previously rendered,
 * with a call to {{#crossLink "IVisual/draw:method"}}{{/crossLink}}.
 *
 * This method can be called with an empty array, or with a _nully_ value,
 * to clear the current highlights.
 *
 * The visual should _not_ fire the
 * {{#crossLink "IVisual/select:event"}}{{/crossLink}} event in response
 * to any changes, caused by this call, to the current highlights.
 *
 * When highlighting changes originate from within the visual,
 * it triggers the {{#crossLink "IVisual/select:event"}}{{/crossLink}} event.
 * If, then, in response to the event, the highlights are further modified,
 * this method will be called with the final highlights.
 *
 * Initial highlights must be given in calls to
 * the {{#crossLink "IVisual/draw:method"}}{{/crossLink}} method,
 * in argument {{#crossLink "IVisualSpec/highlights:property"}}visualSpec.highlights{{/crossLink}},
 * and not in a immediately following call to this method.
 *
 * @method setHighlights
 * @param {Array} [highlights] The current highlights, or,
 *     when none, an empty array or a _nully_ value.
 */

/**
 * **Optional** method that disposes a visual.
 *
 * Allows a visual to release important shared or memory-leaking resources.
 *
 * @method dispose
 * @since 3.0
 */
