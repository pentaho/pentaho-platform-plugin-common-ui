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
 * This interface is a **documentation artifact** that describes
 * the JavaScript structure of part of the metadata that describes a type of visual.
 *
 * A **requirement** or _data requirement_,
 * describes a specific need of data that a visual type has.
 * A requirement belongs to a {{#crossLink "IRequirementSet"}}{{/crossLink}}.
 *
 * Requirements can be divided in two groups,
 * which correspond to two sub-interfaces:
 *
 * 1. Visual roles (Gem bars) — {{#crossLink "IVisualRoleRequirement"}}{{/crossLink}} —
 *    represent major data-bound visual functions;
 *
 * 2. General — {{#crossLink "IGeneralRequirement"}}{{/crossLink}} —
 *    all other configuration properties that a visual type supports.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IRequirement
 * @constructor
 */

/**
 * The id of the requirement.
 *
 * A requirement defines a property with the name of its _id_
 * in a visual specification, {{#crossLink "spec.IVisual"}}{{/crossLink}}.
 * Because of the namespace sharing, the id of a requirement
 * cannot be the name of a standard property of {{#crossLink "spec.IVisual"}}{{/crossLink}}.
 *
 * @property id
 * @type string
 */

/**
 * The name or names of the data types supported
 * by the requirement.
 *
 * See one of the sub-interfaces for more information:
 * {{#crossLink "IVisualRoleRequirement/dataType:property"}}Visual Role{{/crossLink}} and
 * {{#crossLink "IGeneralRequirement/dataType:property"}}General{{/crossLink}}.
 *
 * @property dataType
 * @type string
 */

/**
 * Indicates if a requirement is, actually, _required_.
 *
 * See one of the sub-interfaces for more information:
 * {{#crossLink "IVisualRoleRequirement/required:property"}}Visual Role{{/crossLink}} and
 * {{#crossLink "IGeneralRequirement/required:property"}}General{{/crossLink}}.
 *
 * @property required
 * @type boolean
 * @optional
 * @default false
 */

/**
 * The value of the requirement.
 *
 * See one of the sub-interfaces for more information:
 * {{#crossLink "IVisualRoleRequirement/value:property"}}Visual Role{{/crossLink}} and
 * {{#crossLink "IGeneralRequirement/value:property"}}General{{/crossLink}}.
 *
 * @property value
 * @type any
 * @optional
 * @default undefined
 */
