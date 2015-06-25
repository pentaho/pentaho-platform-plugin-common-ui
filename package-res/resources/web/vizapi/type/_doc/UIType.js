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
 * This class is a **documentation artifact** that
 * describes standard _user interface controls_
 * that can be used in a _general requirement's_ UI.
 *
 * It is possible to register additional UI types
 * in `pentaho.common.propertiesPanel.Panel.registeredTypes`.
 *
 * See {{#crossLink "IGeneralRequirementUI/type:property"}}IGeneralRequirementUI.type{{/crossLink}}.
 *
 * @class UIType
 * @static
 */

/**
 * A text box control.
 *
 * The requirement's {{#crossLink "IRequirement/dataType:property"}}{{/crossLink}}
 * should have the value `"string"`.
 *
 * Extra properties:
 * * {{#crossLink "IGeneralRequirement/disabled:property"}}IGeneralRequirement.disabled{{/crossLink}}
 *
 * @property Textbox
 * @type String
 * @default "textbox"
 * @final
 */

/**
 * An integer slider control with configurable range.
 *
 * The requirement's {{#crossLink "IRequirement/dataType:property"}}{{/crossLink}}
 * should have the value `"number"`.
 *
 * Extra properties:
 * * {{#crossLink "IGeneralRequirement/minimum:property"}}IGeneralRequirement.minimum{{/crossLink}}
 * * {{#crossLink "IGeneralRequirement/maximum:property"}}IGeneralRequirement.maximum{{/crossLink}}
 *
 * @property Slider
 * @type String
 * @default "slider"
 * @final
 */

/**
 * A check box control.
 *
 * The requirement's {{#crossLink "IRequirement/dataType:property"}}{{/crossLink}}
 * should have the value `"boolean"`.
 *
 * Extra properties:
 * * {{#crossLink "IGeneralRequirementUI/label:property"}}IGeneralRequirementUI.label{{/crossLink}}
 *
 * @property Checkbox
 * @type String
 * @default "checkbox"
 * @final
 */

/**
 * A combo box control.
 *
 * The requirement's {{#crossLink "IRequirement/dataType:property"}}{{/crossLink}}
 * should have the value `"string"`.
 *
 * Extra properties:
 * * {{#crossLink "IGeneralRequirement/values:property"}}IGeneralRequirement.values{{/crossLink}}
 * * {{#crossLink "IGeneralRequirementUI/labels:property"}}IGeneralRequirementUI.labels{{/crossLink}}
 *
 * @property Combo
 * @type String
 * @default "combo"
 * @final
 */

 // TODO: explain how button works... click event/property?
/**
 * A button control.
 *
 * Extra properties:
 * * {{#crossLink "IGeneralRequirement/disabled:property"}}IGeneralRequirement.disabled{{/crossLink}}
 * * {{#crossLink "IGeneralRequirementUI/label:property"}}IGeneralRequirementUI.label{{/crossLink}}
 *
 * @property Button
 * @type String
 * @default "button"
 * @final
 */
