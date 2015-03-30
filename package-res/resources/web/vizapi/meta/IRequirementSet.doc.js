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
 * A **requirements set** describes one way in which a visualization type can be used.
 * Yet, most visualization types only define a single set.
 *
 * Requirements are satisfied by the creator of a visualization.
 * Visualization containers, like Pentaho Analyzer, present a user interface that
 * allows end users to specify values for each of the visualization's requirements.
 *
 * Visualizations receive the values of requirements as properties of same name
 * in the {{#crossLink "IVizDrawOptions"}}options{{/crossLink}} argument
 * of {{#crossLink "IViz/draw:method"}}{{/crossLink}} method calls.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IRequirementSet
 * @constructor
 */

/**
 * The unique display name of the requirements set.
 *
 * @property name
 * @type string
 */

/**
 * [Analyzer specific]
 * An array of ids of visual-role requirements in order of drilling preference.
 *
 * An array of {{#crossLink "String"}}{{/crossLink}}.
 *
 * @property drillOrder
 * @type Array
 * @optional
 * @default undefined
 */

/**
 * [Analyzer specific]
 * An array of ids of visual-role requirements in order of hyperlink precedence.
 *
 * The first data property of the specified visual roles that has a defined hyperlink
 * defines the hyperlink target.
 *
 * An array of {{#crossLink "String"}}{{/crossLink}}.
 *
 * @property hyperlinkOrder
 * @type Array
 * @optional
 * @default undefined
 */

/**
 * A non-empty array of requirements.
 *
 * An array of {{#crossLink "IRequirement"}}{{/crossLink}}.
 *
 * @property reqs
 * @type Array
 */
