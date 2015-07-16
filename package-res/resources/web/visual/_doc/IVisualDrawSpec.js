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

// tooltipFooter, container specific contextual options.

/**
 * Adds to a visual specification
 * contextual information required by the draw operation.
 *
 * A visual receives a _draw_ specification
 * in its {{#crossLink "IVisual/draw:method"}}{{/crossLink}} method.
 *
 * @class IVisualDrawSpec
 * @extends IVisualSpec
 * @constructor
 */

/**
 * Gets the name of the action that triggered the draw operation.
 *
 * The following are _standard, reserved action names_:
 *
 * 1. `"setData"` — used when the _data_ argument was the only change since the previous draw operation.
 *
 * 2. `"setHighlights"` — used when (and only when) a _visual_ does not implement the
 *     {{#crossLink "IVisual/setHighlights:method"}}{{/crossLink}} method and, as such,
 *     {{#crossLink "IVisual/draw:method"}}{{/crossLink}}
 *     is called instead with an updated {{#crossLink "IVisualSpec/highlights:property"}}{{/crossLink}}
 *     property value.
 *
 * 3. `"resize"` — used when (and only when) a _visual_ does not implement the
 *     {{#crossLink "IVisual/resize:method"}}{{/crossLink}} method and, as such,
 *     {{#crossLink "IVisual/draw:method"}}{{/crossLink}}
 *     is called instead with updated
 *     {{#crossLink "IVisualSpec/width:property"}}{{/crossLink}} and
 *     {{#crossLink "IVisualSpec/height:property"}}{{/crossLink}} property values.
 *
 * 4. `"setProps"` — used when one or more of the generic visual properties, _which_ is unknown,
 *     were the only change since the previous draw operation.
 *     Note that this also means that _data_, _highlights_ and _available size_ have _not_ changed.
 *
 * Actions that correspond to a single generic visual property changing its value _must_ follow
 * the pattern: `"change:&lt;propertyId&gt;"` (angle brackets not included).
 *
 * Containers are not required to specify visual property change actions,
 * however, when they do, then it must be the case that no other argument
 * (data, visual property, highlights, etc.) has changed since the previous draw operation.
 *
 * Visuals _can_ take advantage of the action property to optimize certain draw calls.
 *
 * Visuals _must_ react to an _unknown_ or _falsy_ action by performing a full (re-)draw.
 *
 * @property action
 * @type string
 * @since 3.0
 * @optional
 */
