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
 * The selection interface is a **documentation artifact**.
 * A selection identifies a set of entities
 * of an (implicitly) associated {{#crossLink "DataTable"}}{{/crossLink}}.
 *
 * The identification is _intensional_,
 * in that it is made by fixating the values of properties
 * that all entities of the set must have.
 *
 * @class ISelection
 * @constructor
 */

/**
 * An id, or array of ids, of data table columns.
 *
 * An array of strings.
 *
 * @property id
 * @type Array
 */

/**
 * The value, or array of values,
 * that entities must have in each of the
 * corresponding columns in {{#crossLink "ISelection/id:property"}}{{/crossLink}}.
 *
 * @property value
 * @type Array
 */

/**
 * A label, or array of labels,
 * corresponding to the values in {{#crossLink "ISelection/value:property"}}{{/crossLink}}.
 *
 * An array of strings.
 *
 * @property label
 * @type Array
 */
