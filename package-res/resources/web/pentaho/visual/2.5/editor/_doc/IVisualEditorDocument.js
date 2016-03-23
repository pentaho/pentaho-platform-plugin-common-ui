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
 * @module pentaho.visual.editing
 */

/**
 * A minimal interface for accessing a visualization editor document counterpart and
 * also for providing a way to generically read the properties it exposes.
 *
 * Used by {{#crossLink "IVisualTypeConfig/getEditorProperties:property"}}{{/crossLink}}.
 *
 * @class IVisualEditorDocument
 * @constructor
 */

/**
 * The editor type id.
 *
 * @property editorTypeId
 * @type string
 */

/**
 * An editor specific object that represents and gives access to the underlying document
 * and, possibly, to the editor itself.
 *
 * Can be _nully_, always or only in certain environments (like when printing), so code
 * should be able to handle both situations.
 *
 * @property source
 * @type object
 */

/**
 * Calls a function once for each editor property, passing it its name.
 *
 * @method forEach
 * @param {function} fun The mapping function.
 * @param {object} [ctx] The `this` context on which to can _fun_.
 */

/**
 * Gets the value of a property, given its name.
 *
 * If the property is not defined, or has no value, `undefined` should be returned.
 *
 * @method get
 * @param {string} name The name of the property.
 * @return {any} The value of the property.
 */
