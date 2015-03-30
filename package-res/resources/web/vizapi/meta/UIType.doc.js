/**
 * @module common-ui.vizapi.meta
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
