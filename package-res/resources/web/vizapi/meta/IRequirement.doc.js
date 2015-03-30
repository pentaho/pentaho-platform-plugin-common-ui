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
 * A **requirement** or _data requirement_,
 * describes a specific need of data that a visualization has.
 * A requirement belongs to a {{#crossLink "IRequirementSet"}}{{/crossLink}}.
 *
 * Requirements can be divided in two groups,
 * which correspond to two sub-interfaces:
 *
 * 1. Visual roles (Gem bars) — {{#crossLink "IVisualRoleRequirement"}}{{/crossLink}} —
 *    represent major data-bound visual functions;
 *
 * 2. General — {{#crossLink "IGeneralRequirement"}}{{/crossLink}} —
 *    all other configuration properties that a visualization type supports.
 *
 * Note that, of the following properties, those not having a default value are **required**.
 *
 * @class IRequirement
 * @constructor
 */

/**
 * The id of the data requirement.
 *
 * A data requirement creates a property with the name of its _id_
 * in a visualization's {{#crossLink "IVizDrawOptions"}}properties{{/crossLink}} argument
 * of {{#crossLink "IViz/draw:method"}}{{/crossLink}} method calls.
 * Because of this namespace sharing behavior, the id of a data requirement
 * cannot be the name of a standard property of
 * {{#crossLink "IVizDrawOptions"}}{{/crossLink}}.
 *
 * @property id
 * @type string
 */

/**
 * The name or names of the data types supported
 * by the data requirement.
 *
 * See one of the sub-interfaces for more information:
 * {{#crossLink "IVisualRoleRequirement/dataType:property"}}Visual Role{{/crossLink}} and
 * {{#crossLink "IGeneralRequirement/dataType:property"}}General{{/crossLink}}.
 *
 * @property dataType
 * @type string
 */

/**
 * Indicates if a data requirement is _required_.
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
