/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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

/**
 * A visual specification describes a visualization,
 * by stating its type, state and properties.
 *
 * Can be used for visualization persistence.
 *
 * A visual receives a visual specification implicitly,
 * through an object of the sub-type {{#crossLink "spec.IVisualDraw"}}{{/crossLink}},
 * in its {{#crossLink "IVisual/draw:method"}}{{/crossLink}} method.
 *
 * For each specific visual type,
 * this interface is actually specialized to contain
 * one property for each requirement,
 * {{#crossLink "IRequirement"}}{{/crossLink}},
 * having,
 * as name, the requirement's {{#crossLink "IRequirement/id:property"}}{{/crossLink}}
 * and
 * as value, the requirement's {{#crossLink "IRequirement/value:property"}}{{/crossLink}}.
 *
 * @class spec.IVisual
 * @constructor
 */

/**
 * Gets the type of visualization.
 *
 * @property type
 * @type string
 * @since 3.0
 */

/**
 * Gets a plain object, in _data table_ format, of the visualization data, or _nully_.
 *
 * This property is used for persistence only, and thus,
 * need not correspond to the data
 * specified in a call to {{#crossLink "IVisual/draw:method"}}{{/crossLink}}.
 *
 * @property data
 * @type Object
 * @optional
 * @default undefined
 * @since 3.0
 */

/**
 * Gets the available width, in pixels.
 * A positive number (never 0 or negative).
 *
 * The visualization's DOM element,
 * initally specified in {{#crossLink "IVisualCreateOptions/domElement:property"}}{{/crossLink}},
 * will already have this dimension set.
 *
 * @property width
 * @type number
 */

/**
 * Gets the available height, in pixels.
 * A positive number (never 0 or negative).
 *
 * The visualization's DOM element,
 * initally specified in {{#crossLink "IVisualCreateOptions/domElement:property"}}{{/crossLink}},
 * will already have this dimension set.
 *
 * @property height
 * @type number
 */

/**
 * Gets the array of initial highlights, possibly empty or _nully_.
 *
 * An array of {{#crossLink "ISelection"}}{{/crossLink}}.
 *
 * Visualizations should be tolerant to the fact that some of the highlights
 * may not apply (anymore) to the current data.
 *
 * The setting of these highlights should **not** cause the visualization
 * to trigger a {{#crossLink "IVisual/select:event"}}{{/crossLink}} event.
 *
 * In API versions 2 and below, this property was named "selections".
 *
 * @property highlights
 * @type ISelection[]
 * @optional
 * @default undefined
 * @since 3.0
 */

/**
 * Gets a state object previously obtained by a call to
 * {{#crossLink "IVisual/getState:method"}}{{/crossLink}},
 * on a visual of the same type,
 * or _nully_.
 *
 * The visual can use this information
 * to restore fine-grained state not contained in other
 * visualization properties.
 *
 * @property state
 * @type Object
 * @optional
 * @default undefined
 * @since 3.0
 */

/**
 * Gets the options that are passed-through to the underlying graphics library or libraries.
 *
 * It is up to visualization implementations to forward these options,
 * to the right place, with more or less control.
 *
 * Direct options allow users to specify options not yet
 * supported by visualizations, but that are known to be supported by the underlying
 * graphics library or libraries.
 *
 * @property direct
 * @type Object
 * @default undefined
 * @since 3.0
 */
