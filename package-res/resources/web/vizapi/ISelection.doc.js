/**
 * @module common-ui.vizapi
 */

/**
 * The selection interface is a **documentation artifact**.
 * A selection identifies a set of entities
 * of an (implicitly) associated {{#crossLink "DataTable"}}{{/crossLink}}.
 *
 * The identification is _intensional_,
 * in that it is made by fixating the values of properties
 * that all entities of the set must have.
 *
 * @class ISelection
 * @constructor
 */

/**
 * An id, or array of ids, of data table columns.
 *
 * An array of strings.
 *
 * @property id
 * @type Array
 */

/**
 * The value, or array of values,
 * that entities must have in each of the
 * corresponding columns in {{#crossLink "ISelection/id:property"}}{{/crossLink}}.
 *
 * @property value
 * @type Array
 */

/**
 * A label, or array of labels,
 * corresponding to the values in {{#crossLink "ISelection/value:property"}}{{/crossLink}}.
 *
 * An array of strings.
 *
 * @property label
 * @type Array
 */
