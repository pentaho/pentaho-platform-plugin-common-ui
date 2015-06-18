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
 * The **visual edit model** interface allows edit/design-time access to a
 * visual type's requirements set ({{#crossLink "IRequirementSet"}}{{/crossLink}}).
 *
 * The visual type's {{#crossLink "IVisualType/updateEditModel:method"}}{{/crossLink}} hook
 * allows applying dynamic logic to the requirements' definitions,
 * _based on the requirements' current values_.
 *
 * @class IVisualEditModel
 * @constructor
 */

/**
 * Gets a requirement given its id.
 *
 * @method byId
 *
 * @param {string} id The data requirement id.
 *
 * @return {IRequirement|undefined} The requested requirement if it is defined or `undefined` if not.
 */
