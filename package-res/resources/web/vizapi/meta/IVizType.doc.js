/**
 * @module common-ui.vizapi.meta
 */


/*
 * TODO: consider adding
 * * needsColorGradient
 * * Analyzer's maxValues: [....] max number of plot values... domain limit. rows? rows*cols
 * * propMap
 * * Analyzer's keepLevelOnDrilldown
 */


/**
 * The **visualization type** interface is a **documentation artifact** that describes
 * the JavaScript structure of the metadata that describes a type of visualization.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IVizType
 * @constructor
 */

/**
 * The global id of the visualization type.
 *
 * The id of a visualization type should be never change.
 *
 * It is a good practice that visualization ids are composed
 * of a prefix that identifies its author,
 * or source _Pentaho_ plugin.
 *
 * Visualizations types produced by Pentaho do not use any prefix or special characters.
 *
 * @property id
 * @type string
 */

/**
 * The unique display name of the visualization.
 *
 * The value of this property can be the name of a resource key
 * of a loaded resource bundle.
 *
 * This name can be used in menus to represent the type of visualization.
 *
 * @property name
 * @type string
 */

/**
 * The **category** of the visualization type.
 *
 * Can be used to group visualization types in a menu.
 *
 * @property type
 * @type string
 * @optional
 * @default undefined
 */

/**
 * The name of the underlying graphics library that powers the visualization, if any.
 *
 * This property is purely informative.
 *
 * @property source
 * @type string
 * @optional
 * @default undefined
 */

/**
 * A number that defines the relative order of visualization types in a menu.
 * If visualizations are shown grouped by {{#crossLink "IVizType/type:property"}}category{{/crossLink}},
 * then only the relative order of visualizations having the same _category_ is affected.
 *
 * @property menuOrdinal
 * @type number
 * @optional
 * @default 0
 */

/**
 * Indicates that the visualization type starts a new menu group.
 *
 * This option is ignored when a menu
 * groups visualization types by {{#crossLink "IVizType/type:property"}}category{{/crossLink}}.
 *
 * @property menuSeparator
 * @type boolean
 * @optional
 * @default false
 */

/**
 * The path of a _global_ property that contains the visualization instances'
 * constructor function.
 *
 * This property is ignored when {{#crossLink "IVizType/instanceModule:property"}}{{/crossLink}}
 * is specified.
 *
 * @property class
 * @type string
 * @deprecated Use instanceModule instead.
 */

/**
 * The absolute id of the AMD module that contains
 * the visualization instances implementation.
 *
 * The value of this module should be a factory function like
 * {{#crossLink "IVizCallbacks/instanceFactory:method"}}{{/crossLink}}.
 *
 * @property instanceModule
 * @type string
 * @since 3.0
 */

/**
 * An object containing static properties which are
 * merged into {{#crossLink "IVizDrawOptions"}}{{/crossLink}}.
 *
 * Properties having the name of a standard property of
 * {{#crossLink "IVizDrawOptions"}}{{/crossLink}} are ignored.
 *
 * This property is useful for cases where
 * a visualization implementation class is shared by multiple visualization types,
 * as it allows configuring the class for each case.
 *
 * @property args
 * @type Object
 * @optional
 * @default undefined
 */

/**
 * A non-empty array of (data) requirements sets.
 * An array of {{#crossLink "IRequirementSet"}}{{/crossLink}}.
 *
 * @property dataReqs
 * @type Array
 */
