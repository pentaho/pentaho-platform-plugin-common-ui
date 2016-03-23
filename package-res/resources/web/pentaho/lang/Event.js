/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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

define([
  "./Base",
  "../util/object",
  "../util/error",
  "./UserError"
], function(Base, O, error, UserError) {

  "use strict";

  return Base.extend("pentaho.lang.Event", /** @lends pentaho.lang.Event# */{
    /**
     * @classDesc The `Event` class is the base class of event objects emitted by an
     * [EventSource]{@link pentaho.lang.EventSource}.
     *
     * The source of an event is the object that emits it and
     * is given by its [source]{@link pentaho.lang.Event#source} property.
     *
     * ##### Event Type
     *
     * Events have a _type_ that is given by its [type]{@link pentaho.lang.Event#type} property.
     * The type of an event is the _id_ used to register to it,
     * using [EventSource#on]{@link pentaho.lang.EventSource#on}.
     *
     * An event type corresponds to a single subclass of `Event`.
     * However, an `Event` subclass can be used by several event types.
     * The `Event` subclass of an event type mainly depends on the data that it is associated with.
     *
     * ##### Event Cancellation
     *
     * Certain types of events are used to signal that an _action_ is about to execute
     * (or that a phase of an already executing action is about to start).
     * When the execution of the action can be canceled by the event listeners,
     * the event is said to be _cancelable_.
     * That characteristic is exposed by the [isCancelable]{@link pentaho.lang.Event#isCancelable} property.
     *
     * When an event is canceled, its corresponding action is also canceled and
     * the listeners of unprocessed registrations are not notified.
     *
     * To cancel an event, call its [cancel]{@link pentaho.lang.Event#cancel} method.
     * To find out if an event has been canceled, read the [isCanceled]{@link pentaho.lang.Event#isCanceled} property.
     *
     * ##### Persistable Events
     *
     * Certain types of events are emitted so frequently that it
     * makes it highly beneficial to reuse event objects.
     * To safely use an event object beyond its emission,
     * a cloned event object must be obtained,
     * through [clone]{@link pentaho.lang.Event#clone}.
     *
     * @name Event
     * @memberOf pentaho.lang
     * @class
     * @amd pentaho/lang/Event
     *
     * @description Creates an event of a given type, source and cancelable.
     * @constructor
     * @param {!nonEmptyString} type - The type of the event.
     * @param {!Object} source - The object where the event will be initially emitted.
     * @param {?boolean} [cancelable=false] - Indicates if the event can be canceled.
     */
    constructor: function(type, source, cancelable) {
      if(!type) throw error.argRequired("type");
      if(!source) throw error.argRequired("source");

      this._type = type;
      this._source = source;
      this._cancelable = !!cancelable;
    },

    _cancelReason: null,
    _canceled: false,

    /**
     * Gets the type of the event.
     *
     * @type {!nonEmptyString}
     * @readonly
     */
    get type() {
      return this._type;
    },

    /**
     * Gets the object where the event was initially emitted.
     *
     * @type {!Object}
     * @readonly
     */
    get source() {
      return this._source;
    },

    /**
     * Gets a value that indicates if the event can be canceled.
     *
     * @type {boolean}
     * @readonly
     */
    get isCancelable() {
      return this._cancelable;
    },

    /**
     * Gets the reason why the event was canceled.
     *
     * @type {!pentaho.lang.UserError}
     * @readonly
     */
    get cancelReason() {
      return this._cancelReason;
    },


    /**
     * Cancels the event.
     *
     * This method has no effect if the event is not cancelable or
     * has already been canceled.
     * @param {string|pentaho.lang.UserError} [reason="canceled"] - The reason why the event is being canceled.
     *
     * @see pentaho.lang.Event#isCanceled
     */
    cancel: function(reason) {
      if(this._cancelable) {
        if(!reason) reason = "canceled";

        if(typeof reason === "string") {
          reason = new UserError(reason);
        } else if(!(reason instanceof UserError)) {
          throw error.argInvalidType("reason", ["string", "pentaho/lang/UserError"], typeof reason);
        }
        this._cancelReason = reason;
        this._canceled = true;
      }
    },

    /**
     * Gets a value that indicates if the event has been canceled.
     *
     * @type {!boolean}
     * @readonly
     */
    get isCanceled() {
      return this._canceled;
    },

    /**
     * Creates a clone of the event object.
     *
     * @return {!pentaho.lang.Event} The cloned event object.
     */
    clone: function() {
      var proto = Object.getPrototypeOf(this);

      var clone = Object.create(proto);
      for(var name in this) {
        if(this.hasOwnProperty(name)) {
          var desc = O.getPropertyDescriptor(this, name);
          Object.defineProperty(clone, name, desc);
        }
      }

      return clone;
    }
  });
});
