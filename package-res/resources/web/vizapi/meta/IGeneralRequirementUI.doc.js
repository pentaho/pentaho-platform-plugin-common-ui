/**
 * @module common-ui.vizapi.meta
 */

/**
 * This interface is a **documentation artifact** that describes
 * the JavaScript structure of part of the metadata that describes a type of visualization.
 *
 * The **general requirement UI** contains most of the properties
 * of general requirements that affect its user interface.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IGeneralRequirementUI
 * @constructor
 */

/**
 * The type of control to display.
 *
 * See {{#crossLink "UIType"}}{{/crossLink}} for a list of possible UI types.
 *
 * @property type
 * @type string
 */

/**
 * Indicates if the control is hidden.
 *
 * @property hidden
 * @type boolean
 * @default false
 */

/**
 * A caption that is displayed _before_ the control.
 *
 * The value of this property can be the name of a resource key
 * of a loaded resource bundle.
 *
 * Contrast with the
 * {{#crossLink "IGeneralRequirementUI/label:property"}}{{/crossLink}}
 * property, supported by some UI types.
 *
 * @property caption
 * @type string
 * @optional
 * @default ""
 */

/**
 * A label that is displayed beside or within the control.
 *
 * This property is only supported by the
 * {{#crossLink "UIType/Checkbox:property"}}{{/crossLink}} and
 * {{#crossLink "UIType/Button:property"}}{{/crossLink}} UI types.
 *
 * The value of this property can be the name of a resource key
 * of a loaded resource bundle.
 *
 * Contrast with the
 * {{#crossLink "IGeneralRequirementUI/caption:property"}}{{/crossLink}}
 * property.
 *
 * @property label
 * @type string
 * @optional
 * @default ""
 */

/**
 * The labels of the possible values of a control.
 *
 * This property is only supported by the
 * {{#crossLink "UIType/Combo:property"}}{{/crossLink}} UI type.
 *
 * An array of strings, one for each entry in the requirement's
 * {{#crossLink "IGeneralRequirement/values:property"}}{{/crossLink}} property.
 *
 * The values of this property can be the names of resource keys
 * of a loaded resource bundle.
 *
 * @property labels
 * @type Array
 * @optional
 * @default ""
 */

/**
 * Indicates that a separator rule is displayed before the control.
 *
 * @property separator
 * @type boolean
 * @optional
 * @default false
 * @since 3.0
 */

/**
 * Indicates that a separator rule is displayed before the control.
 *
 * Use {{#crossLink "IGeneralRequirementUI/separator:property"}}{{/crossLink}} instead.
 *
 * @property seperator
 * @type boolean
 * @optional
 * @default false
 * @deprecated Use separator.
 */
