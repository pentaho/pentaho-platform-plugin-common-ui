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
 * * Analyzer's VizHelper#placeholderImageSrc ? Or imageClassName?? Through dynamic css loading?
 */


/**
 * The **visual type** interface is a **documentation artifact** that describes
 * the JavaScript structure of the metadata that describes a type of visual.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IVisualType
 * @constructor
 */

/**
 * The global id of the visual type.
 *
 * The id of a visual type should never change.
 *
 * It is considered good practice to assign visual type ids
 * that are composed of a prefix that identifies its author or
 * is the name of the _Pentaho_ plugin that installs the visual.
 *
 * Visual types produced by _Pentaho_ use the following **reserved** prefixes:
 * * "ccc_" — the VisualAPI's CCC based visuals
 * * "sample_" — the VisualAPI's sample visuals
 * * "twelveDaysViz/" — the "Twelve Days of Big Data Visualizations" visuals
 * * "open_layers" - the GEO map visual
 * * "pen_" — reserved for future use
 * * "x-" — for experimental visuals
 *
 * @property id
 * @type string
 */

/**
 * The unique display name of the visual type.
 *
 * The value of this property can be the name of a resource key
 * of a loaded resource bundle.
 *
 * This name can be used in menus to represent the visual type.
 *
 * @property name
 * @type string
 */

/**
 * The **category** of the visual type.
 *
 * Can be used to group visual types in a menu.
 *
 * @property type
 * @type string
 * @optional
 * @default undefined
 */

/**
 * The name of the underlying graphics library that powers the visual, if any.
 *
 * This property is purely informative.
 *
 * @property source
 * @type string
 * @optional
 * @default undefined
 */

/**
 * A number that defines the relative order of visual types in a menu.
 * If visual types are shown grouped by {{#crossLink "IVisualType/type:property"}}category{{/crossLink}},
 * then only the relative order of visual types having the same _category_ is affected.
 *
 * @property menuOrdinal
 * @type number
 * @optional
 * @default 0
 */

/**
 * Indicates that the visual type starts a new menu group/section.
 *
 * This option is ignored when
 * visual types are displayed in a menu
 * grouped by {{#crossLink "IVisualType/type:property"}}category{{/crossLink}}.
 *
 * @property menuSeparator
 * @type boolean
 * @optional
 * @default false
 */

/**
 * The path of a _global_ property that contains the visuals' constructor function.
 *
 * This property is ignored when {{#crossLink "IVisualType/factory:property"}}{{/crossLink}}
 * is specified.
 *
 * @property class
 * @type string
 * @deprecated Use factory instead.
 */

/**
 * A visuals-factory function or
 * a string with the absolute id of an AMD module that contains a visuals-factory.
 *
 * The value of a factory module should be a visuals-factory function like
 * {{#crossLink "IVisualCallbacks/visualFactory:method"}}{{/crossLink}}.
 *
 * @property factory
 * @type string
 * @since 3.0
 */

/**
 * An object containing static properties which are
 * merged into {{#crossLink "IVisualSpec"}}{{/crossLink}}.
 *
 * Properties having the name of a standard property of
 * {{#crossLink "IVisualSpec"}}{{/crossLink}} are **ignored**.
 *
 * Use this property for specifying default values for
 * a visual's requirements.
 *
 * Also, this property can be useful for cases where
 * a visual implementation class is shared by multiple visual types,
 * as it allows configuring the class for each case.
 *
 * @property args
 * @type Object
 * @optional
 * @default undefined
 */

/**
 * A non-empty array of (data) requirements sets.
 * An array of {{#crossLink "IRequirementSet"}}{{/crossLink}}.
 *
 * @property dataReqs
 * @type Array
 */

/**
 * [Analyzer specific]
 * Indicates if a drill-down operation keeps original parent levels on the visual role.
 *
 * The default value is given by the Analyzer configuration property
 * `chart.options.keepLevelOnDrilldown`.
 *
 * @property keepLevelOnDrilldown
 * @type boolean
 * @optional
 * @default undefined
 */

/**
 * [Analyzer specific]
 * The possible maximum number of result rows.
 *
 * In the chart options dialog, the user will be given this list of values to choose from.
 *
 * @property maxValues
 * @type number[]
 * @optional
 * @default [100, 150, 200, 250]
 */

/**
 * Updates the edit model based on the current requirement values.
 *
 * @method updateEditModel
 *
 * @param {IVisualEditModel} editModel The visual edit model.
 * @param {string} [changedProp] The name of the property that has changed.
 *    When unspecified, it is assumed that all properties have changed.
 */

/**
 * Validates a given edit model based on the current requirement values.
 *
 * This method can assume that basic validation —
 * "requiredness" and minimum occurrence —
 * has been performed and was successful.
 *
 * The returned {{#crossLink "Error"}}{{/crossLink}} objects can
 * have a string `code` property with an error code.
 *
 * @method validateEditModel
 *
 * @param {IVisualEditModel} editModel The visual edit model to validate.
 * @return {Error[]|null} A non-empty array of error objects,
 *    or `null`, when there are no validation errors.
 */
