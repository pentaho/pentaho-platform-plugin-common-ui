/**
 * @module common-ui.vizapi.meta
 */

/*
 * TODO: consider adding:
 */

/**
 * This interface is a **documentation artifact** that describes
 * the JavaScript structure of part of the metadata that describes a type of visualization.
 *
 * A **general requirement** is a requirement which is _not_ a _visual role requirement_.
 * This includes all other configuration options that a visualization type supports,
 * that allow changing its aesthetics or behavior,
 * like "Line Width" and "Empty Cells Mode".
 *
 * Pentaho Analyzer shows these in the "Properties" panel.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IGeneralRequirement
 * @extends IRequirement
 * @constructor
 */

/**
 * The data type of the value of the requirement.
 *
 * The supported values are:
 * * `"number"`
 * * `"string"`
 * * `"boolean"`
 * * `"date"`
 * * `"any"`
 *
 * For example, if a requirement with an id `"showLines"` and
 * a _dataType_ of `"boolean"`,
 * the value of the requirement in the _options_ argument could be like:
 *
 *     {
 *         // ...
 *         showLines: true
 *         // ...
 *     }
 *
 * When the requirement has an UI,
 * the data type should be configured taking the
 * {{#crossLink "IGeneralRequirement/type:property"}}ui.type{{/crossLink}}'s
 * supported data types into account.
 *
 * @property dataType
 * @type string
 * @optional
 * @default "string"
 */

/**
 * Indicates if a requirement is, actually, _required_.
 *
 * The requirement's value cannot be
 * _null_,
 * _undefined_,
 * an empty string, `""`, or
 * `NaN`.
 *
 * @property required
 * @type boolean
 * @optional
 * @default false
 */

// TODO: take care of object/array values and cloning?
// See value of the color gradient control.
/**
 * The default value.
 *
 * The type of value should be consistent with
 * the value of {{#crossLink "IGeneralRequirement/dataType:property"}}{{/crossLink}}.
 *
 * When this property is unspecified and
 * the property {{#crossLink "IGeneralRequirement/values:property"}}{{/crossLink}}
 * applies, its first value is taken as the default value.
 *
 * @property value
 * @type any
 * @optional
 * @default undefined
 */

/**
 * A list of possible values that the requirement can take.
 *
 * This property is only used by the {{#crossLink "UIType/Combo:property"}}{{/crossLink}}
 * UI type.
 *
 * When the default value is not defined,
 * the first value in this list is used as default.
 *
 * The type of each value should be consistent with
 * the value of {{#crossLink "IGeneralRequirement/dataType:property"}}{{/crossLink}}.
 *
 * @property values
 * @type Array
 * @optional
 * @default undefined
 */

/**
 * The minimum value.
 *
 * This property is only used by the
 * {{#crossLink "UIType/Slider:property"}}{{/crossLink}}
 * UI type.
 *
 * @property minimum
 * @type number
 * @optional
 * @default 0
 */

/**
 * The maximum value.
 *
 * This property is only used by the
 * {{#crossLink "UIType/Slider:property"}}{{/crossLink}}
 * UI type.
 *
 * @property maximum
 * @type number
 * @optional
 * @default 100
 */

/**
 * The user interface specification.
 *
 * @property ui
 * @type IGeneralRequirementUI
 * @optional
 * @default undefined
 */

/**
 * Indicates if the requirement's UI is disabled.
 *
 * This property is only used by the
 * {{#crossLink "UIType/Textbox:property"}}{{/crossLink}} and
 * {{#crossLink "UIType/Button:property"}}{{/crossLink}}
 * UI types.
 *
 * @property disabled
 * @type boolean
 * @optional
 * @default false
 */
