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

/**
 * A visual type configuration contains
 * configurations for one or more visual types,
 * and for a certain container type or types.
 *
 * A _container_ is an editor or viewer that renders a visual.
 *
 * Properties {{#crossLink "IVisualTypeConfiguration/id:property"}}{{/crossLink}}
 * and {{#crossLink "IVisualTypeConfiguration/container:property"}}{{/crossLink}}
 * determine the &lt;type,container&gt; pairs that the
 * configuration applies to.
 *
 * Containers may define extensions to the {{#crossLink "IVisualType"}}{{/crossLink}} interface,
 * consisting of additional properties that the containers give meaning to.
 * As an example, Analyzer supports the additional `maxValues` and `keepLevelOnDrilldown` properties.
 *
 * These properties _can_ be specified in `IVisualTypeConfiguration` objects
 * targeting such containers.
 *
 * @class IVisualTypeConfiguration
 * @constructor
 */

/**
 * The priority of the visual type configuration.
 *
 * The greater the number, the higher is the priority.
 *
 * By default, or when nully, the priority is <tt>0</tt>.
 *
 * Use a value of <tt>-1</tt> for a weak configuration —
 * one that is only used if no other "normal" configuration is made.
 *
 * Use a value of <tt>+1</tt> for a strong configuration —
 * one that is used unless another configuration intendedly overrides it,
 * with a greater priority value.
 *
 * @property priority
 * @type number
 * @default 0
 */

/**
 * Id or id pattern, or an array of such, of the visual types
 * that this configuration applies to.
 *
 * When unspecified, or _nully_, it applies to **all** visual types.
 * Otherwise, when an array, it applies to the union of the visual types
 * that each of the entries applies to.
 *
 * When a string is specified, it applies only to a visual type having
 * that exact id and constitutes an _individual_ configuration section.
 *
 * When a regular expression object is specified,
 * it applies to every matching visual type,
 * and constitutes a _group_ configuration section.
 *
 * See {{#crossLink "RegExp"}}{{/crossLink}} for more information on
 * the regular expression syntax.
 *
 * @example
 *     // the only visual type whose id is "ccc_bar"
 *     "ccc_bar"
 *
 *     // all of the CCC visual types
 *     /^ccc_/
 *
 *     // all of the visual types of the "twelve days of big data visualizations" plugin
 *     /^twelveDaysViz\//
 *
 *     // all visual types
 *     null
 *
 *     // the CCC column and bar charts
 *     ["ccc_bar", "ccc_horzbar"]
 *
 * @property id
 * @type string|RegExp|(string|RegExp)[]
 */

/**
 * Id, or array of ids, of
 * the container types that the configuration section applies to.
 *
 * When an unspecified or _nully_ value, applies to **all** configuration types.
 * Otherwise, when an array, it applies to the union of the visual types
 * that each of the entries applies to.
 *
 * @example
 *     // Analyzer
 *     "analyzer"
 *
 *     // Analyzer and CDF
 *     ["analyzer", "cdf"]
 *
 * @property container
 * @type string|string[]
 */

/**
 * Indicates if the visual type(s) should be enabled.
 *
 * By default, all visual types are enabled in every container type.
 *
 * When _nully_, it is ignored.
 * Otherwise, its boolean-coerced value is considered (`true` if _truthy_, `false` otherwise).
 *
 * @property enabled
 * @type boolean
 */

/**
 * Individual properties of this object override those of
 * {{#crossLink "IVisualType/args:property"}}{{/crossLink}}.
 *
 * @property args
 * @type Object
 */

/**
 * Overrides {{#crossLink "IVisualType/args:menuOrdinal"}}{{/crossLink}}.
 *
 * @property menuOrdinal
 * @type number
 */

/**
 * Overrides {{#crossLink "IVisualType/args:menuSeparator"}}{{/crossLink}}.
 *
 * @property menuSeparator
 * @type boolean
 */

/**
 * **Optional** method that translates editor _external_ properties to properties of visuals.
 *
 * This method is called with the configured visual type,
 * {{#crossLink "IVisualType"}}{{/crossLink}}, as the `this` JavaScript context.
 *
 * @method translateEditorProperties
 *
 * @param {string} editorTypeId The id of the editor type that is the source of _editorProps_.
 * @param {IVisualEditorProperties} editorProps An object that allows reading the editor's properties.
 * @param {string|string[]} [filterPropsList] A string or an array of strings with
   *   the editor property names
   *   that should be processed. When this is unspecified, _nully_,
   *   or has zero length, then all properties should be processed.
   *
   *   This argument can be seen to indicate a set of editor properties
   *   whose value has change and need to be updated.
 * @param {Object} filterPropsMap A map whose keys are the property names in _filterPropsList_
 *   and whose values are all `true`.
 *
 * @return {Object} A map of "visual properties".
 */
