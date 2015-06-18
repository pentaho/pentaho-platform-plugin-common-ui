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
 * A **visual role requirement** is a special type of requirement
 * that represents major data-bound visual functions.
 * Common visual roles are "Series", "X-axis", "Color-By", "Size-By", etc.
 *
 * The value of these requirements are names of data properties (Gems)
 * that will play that role.
 *
 * Pentaho Analyzer shows these in the "Layout" panel.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IVisualRoleRequirement
 * @extends IRequirement
 * @constructor
 */

/**
 * The data table structure where
 * data properties bound to a visual role requirement
 * are encoded.
 *
 * A non-empty value identifies a visual role requirement.
 *
 * This property supports the values:
 * * `"row"`
 * * `"column"`.
 *
 * Usually,
 * `"row"` is used for discrete data properties and
 * `"column"` for continuous data properties.
 *
 * @property dataStructure
 * @type string
 * @optional
 * @default undefined
 */

/**
 * The name or names of the data types
 * _that data properties_ (gems) must have,
 * to be bindable to the visual role.
 *
 * The supported values are:
 * * `"number"`
 * * `"string"`
 *
 * When multiple data types are supported,
 * these should be provided as a comma-separated string,
 * like, for example, `"number, string"`.
 *
 * See {{#crossLink "IDataModelProperty/type:property"}}IDataModelProperty type{{/crossLink}}.
 *
 * @property dataType
 * @type string
 * @optional
 * @default "string"
 */

/**
 * Indicates if a visual role requirement supports
 * multiple data properties.
 *
 * @property allowMultiple
 * @type boolean
 * @optional
 * @default false
 */

/**
 * Indicates if a requirement is, actually, _required_.
 *
 * The visual role must be bound to at least one data property.
 *
 * @property required
 * @type boolean
 * @optional
 * @default false
 */

/**
 * The name of the visual role.
 *
 * The value of this property can be the name of a resource key
 * of a loaded resource bundle.
 *
 * @property caption
 * @type string
 */

/**
 * The visual role's _current_ value.
 *
 * This property is only significant when the requirement is obtained via
 * {{#crossLink "IVisualEditModel/byId:method"}}{{/crossLink}}.
 *
 * The `value` property contains the requirement's _currently_ bound data model properties.
 *
 * This property always returns an array, possibly empty.
 *
 * NOTE: The visual role value in a {{#crossLink "IVisualSpec"}}visual specification{{/crossLink}}
 * is not an array of data property objects, but one of their names only.
 * So, for example, in a visual specification,
 * the value of a requirement with id `"colors"` could be:
 *
 *     {
 *         // ...
 *         colors: ["productFamily", "productName"]
 *         // ...
 *     }
 *
 * @property value
 * @type IDataModelProperty[]
 * @optional
 * @default []
 */
