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
 * In this case,
 * the _value of the requirement_,
 * when specified as a property in the
 * {{#crossLink "IVizDrawOptions"}}options{{/crossLink}} argument
 * of {{#crossLink "IViz/draw:method"}}{{/crossLink}} method calls, is
 * an array of the data property (gem) names bound
 * to the visual role (gem bar).
 * For example, for a requirement with the id `"colors"`,
 * the value of the requirement in the _properties_ argument could be like:
 *
 *     {
 *         // ...
 *         colors: ["productFamily", "productName"]
 *         // ...
 *     }
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
