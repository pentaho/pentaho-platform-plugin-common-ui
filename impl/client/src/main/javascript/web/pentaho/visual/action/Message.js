/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/


define([
    "pentaho/module!_",
    "./Base",
    "pentaho/util/text",
    "pentaho/lang/UserError",
    "pentaho/lang/ArgumentInvalidTypeError"
], function(module, ActionBase, textUtil, UserError, ArgumentInvalidTypeError) {

    "use strict";

    return ActionBase.extend(module.id, /** @lends pentaho.visual.action.IMessage# */{

        /**
         * @alias Message
         * @memberOf pentaho.visual.action
         * @class
         * @extends pentaho.visual.action.Base
         *
         * @amd pentaho/visual/action/Message
         *
         * @classDesc The `Message` action is a synchronous action that
         * is performed when there is a message to be shown to the user, which does not break functionality.

         * @description Creates a _message_ action given its specification.
         * @param {pentaho.visual.action.spec.IMessage} [spec] A _message_ action specification.
         * @constructor
         *
         * @see pentaho.visual.action.spec.IMessage
         */
        constructor: function (spec) {
            this.base(spec);

            this.code = spec.code;
            this.description = spec.description;
        },

        /**
         * Gets or sets the _code_ of this message.
         *
         * When set to an empty string, `null` will be set.
         * A `null` value will not pass validation.
         *
         * @type {nonEmptyString}
         *
         * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value which is not a `string`.
         */
        get code() {
            return this.__code;
        },

        set code(value) {
            this.__code = __returnValueOrThrow("code", value);
        },

        /**
         * Gets or sets The localized, human-readable description of this message.
         *
         * When set to an empty string, `null` will be set.
         * A `null` value will not pass validation.
         *
         * @type {nonEmptyString}
         *
         * @throws {pentaho.lang.ArgumentInvalidTypeError} When set to a value which is not a `string`.
         */
        get description() {
            return this.__description;
        },

        set description(value) {
            this.__description = __returnValueOrThrow("description", value);
        },

        /** @inheritDoc */
        _fillSpec: function(spec) {
            this.base(spec)
            spec.code = this.__code;
            spec.description = this.__description;
        },

        /** @inheritDoc */
        validate: function() {
            var errors;
            if (this.__code === null) {
                errors = [];
                errors.push(new UserError("Message 'code' cannot be Null"));
            }

            if (this.__description === null) {
                errors = errors || [];
                errors.push(new UserError("Message 'description' cannot be Null"));
            }

            return errors;
        },

    },  /** @lends pentaho.visual.action.IMessage */{
        /** @inheritDoc */
        get id() {
            return module.id;
        }
    });

    /**
     * Return the non empty string of value, or `null`.
     *
     * @param {string} argName - The argument name, for error purposes.
     * @param {string} value - The argument value.
     *
     * @return {nonEmptyString} A non empty string or `null`.
     *
     * @throws {pentaho.lang.ArgumentInvalidTypeError} When `value` is not a `string`.
     */
    function __returnValueOrThrow(argName, value) {
        if (typeof value !== "string") {
            throw new ArgumentInvalidTypeError(argName, ["string"], typeof value);
        }

        return textUtil.nonEmptyString(value);
    }
});