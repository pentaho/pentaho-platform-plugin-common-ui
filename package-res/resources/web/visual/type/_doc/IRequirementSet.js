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
 * This interface is a **documentation artifact** that describes
 * the JavaScript structure of part of the metadata that describes a type of visual.
 *
 * A **requirements set** describes one way in which a visual type can be used.
 * Yet, most visual types only define a single set.
 *
 * Requirements are satisfied by the creator of a visual.
 * Visual-containers, like Pentaho Analyzer, present a user interface that
 * allows end users to specify values for each of the visual's requirements.
 *
 * {{#crossLink "IVisualSpec"}}Visual specifications{{/crossLink}},
 * contain the values of requirements as same name properties.
 *
 * Visuals receive specifications to be
 * {{#crossLink "IVisual/draw:method"}}drawn{{/crossLink}} as an object,
 * of type {{#crossLink "IVisualDrawSpec"}}{{/crossLink}} —
 * a sub-type of {{#crossLink "IVisualSpec"}}{{/crossLink}}.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IRequirementSet
 * @constructor
 */

/**
 * The unique display name of the requirements set.
 *
 * @property name
 * @type string
 */

/**
 * [Analyzer specific]
 * An array of ids of visual-role requirements in order of drilling preference.
 *
 * An array of {{#crossLink "String"}}{{/crossLink}}.
 *
 * @property drillOrder
 * @type Array
 * @optional
 * @default undefined
 */

/**
 * [Analyzer specific]
 * An array of ids of visual-role requirements in order of hyperlink precedence.
 *
 * The first data property of the specified visual roles that has a defined hyperlink
 * defines the hyperlink target.
 *
 * An array of {{#crossLink "String"}}{{/crossLink}}.
 *
 * @property hyperlinkOrder
 * @type Array
 * @optional
 * @default undefined
 */

/**
 * A non-empty array of requirements.
 *
 * An array of {{#crossLink "IRequirement"}}{{/crossLink}}.
 *
 * @property reqs
 * @type Array
 */
