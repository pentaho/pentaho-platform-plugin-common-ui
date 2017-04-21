/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
  "module",
  "./Base",
  "./Event",
  "../typeInfo",
  "../util/error",
  "../util/object",
  "../util/fun",
  "../util/logger"
], function(module, Base, Event, typeInfo, error, O, F, logger) {

  "use strict";

  /* eslint new-cap: 0 */

  var O_hasOwn = Object.prototype.hasOwnProperty;
  var keyArgsEmitEventUnsafe = {isCanceled: event_isCanceled, errorHandler: null};
  var keyArgsEmitEventSafe = {isCanceled: event_isCanceled, errorHandler: errorHandlerLog};

  /**
   * @classDesc The `EventRegistrationHandle` class handles creating the alias, `remove`,
   * for the `dispose` method.
   *
   * @name pentaho.lang.EventRegistrationHandle
   * @class
   * @implements pentaho.lang.IEventRegistrationHandle
   * @private
   */

  function pentaho_lang_IEventRegistrationHandle(dispose) {
    this.dispose = dispose;
  }

  pentaho_lang_IEventRegistrationHandle.prototype.remove = function() {
    return this.dispose();
  };

  /**
   * Holds registration information about an observer.
   *
   * @name pentaho.lang.IEventObserverRegistration
   * @interface
   * @property {pentaho.lang.IEventObserver} observer - The observer.
   * @property {number} priority - The priority of the observer.
   * @property {number} index - The index of the observer in the event's observers list.
   * @private
   */

  // ---

  // TODO: Move this to the pentaho.lang.impl namespace; possibly along with Event ?

  /**
   * @classDesc The `EventSource` class is an implementation [IEventSource]{@link pentaho.lang.IEventSource}
   * that can be used as **mixin** class for classes that emit events.
   *
   * The class publicly exposes the `IEventSource` interface, allowing the registration and
   * unregistration of event listeners/observers.
   *
   * The ability to emit events is, however, only exposed via the protected interface, through the methods:
   * [_emit]{@link pentaho.lang.EventSource#_emit},
   * [_emitSafe]{@link pentaho.lang.EventSource#_emitSafe} and
   * [_emitGeneric]{@link pentaho.lang.EventSource#_emitGeneric}.
   *
   * The methods `_emit` and `_emitSafe` can only be used with events of the [Event]{@link pentaho.lang.Event} type,
   * while the `_emitGeneric` method can be used with any event type and exposes more control options.
   *
   * To know if any listeners are registered for a certain event type and phase,
   * use the [_hasListeners]{@link pentaho.lang.EventSource#_hasListeners} method.
   * To know if any listeners are registered for any of the phases of a certain event type:
   * [_hasObservers]{@link pentaho.lang.EventSource#_hasObservers} method.
   *
   * @name EventSource
   * @memberOf pentaho.lang
   * @class
   * @implements pentaho.lang.IEventSource
   * @amd pentaho/lang/EventSource
   */

  return Base.extend(module.id, /** @lends pentaho.lang.EventSource# */{

    /**
     * The registry of event observers by event type.
     *
     * Listeners of unstructured events are registered as observers of the special `"__"` phase.
     *
     * @type {Map.<nonEmptyString, Array.<pentaho.lang.IEventObserverRegistration>>}
     * @private
     */
    __observersRegistry: null,

    on: function(type, observer, keyArgs) {
      if(!type) throw error.argRequired("type");
      if(!observer) throw error.argRequired("observer");

      var eventTypes = parseEventTypes(type);
      if(eventTypes && eventTypes.length) {

        var priority = (keyArgs && keyArgs.priority) || 0;

        if(F.is(observer)) observer = {__: observer};

        /** @type pentaho.lang.IEventRegistrationHandle[] */
        var handles = eventTypes.map(function(type) {
          return registerOne.call(this, type, observer, priority);
        }, this);

        return handles.length > 1
            ? new pentaho_lang_IEventRegistrationHandle(disposeHandles.bind(this, handles))
            : handles[0];
      }

      return null;
    },

    off: function(typeOrHandle, observer) {
      if(!typeOrHandle) throw error.argRequired("typeOrHandle");

      if(typeOrHandle instanceof pentaho_lang_IEventRegistrationHandle) {
        // This is just syntax sugar, so let dispose from any source.
        typeOrHandle.dispose();
        return;
      }

      if(!observer) throw error.argRequired("observer");

      var types = parseEventTypes(typeOrHandle);
      if(types && types.length) {

        var find = F.is(observer) ? findUnstructuredObserverRegistration : findObserverRegistration;

        types.forEach(function(type) {

          // Resolve alias
          type = typeInfo.getIdOf(type) || type;

          var observerRegistration = find.call(this, type, observer);
          if(observerRegistration) {
            unregisterOne.call(this, type, observerRegistration);
          }
        }, this);
      }
    },

    /**
     * Determines if there are any registrations for a given event type and phase.
     *
     * This method can be used to avoid creating expensive event objects
     * for event type and phase pairs that don't have registrations.
     *
     * @example
     *
     * if(this._hasListeners("select", "will")) {
     *
     *   var event = new Event("select", this);
     *
     *   if(this._emit(event)) {
     *     // Select Will phase
     *   }
     * }
     *
     * @param {nonEmptyString} type - The type of the event.
     * @param {?nonEmptyString} [phase] - The phase of a structured event.
     * For unstructured events don't specify this argument.
     *
     * @return {boolean} `true` if the event has any listeners for the given event type and phase; `false`, otherwise.
     *
     * @protected
     */
    _hasListeners: function(type, phase) {
      // Resolve alias
      type = typeInfo.getIdOf(type) || type;

      var queue = O.getOwn(this.__observersRegistry, type);
      if(queue) {
        if(!phase) phase = "__";

        // Find at least one observer with the desired phase.
        var i = -1;
        var L = queue.length;
        while(++i < L) if(O_hasOwn.call(queue[i].observer, phase)) return true;
      }

      return false;
    },

    /**
     * Determines if there are any registrations for a given event type,
     * for at least one of its phases.
     *
     * This method can be used to avoid creating expensive event objects
     * for event types that currently have no registrations.
     *
     * @example
     *
     * if(this._hasObservers("select")) {
     *
     *   var event = new Event("select");
     *
     *   if(this._emitGeneric(event, "select", "will")) {
     *     // Select Will
     *
     *     this._emitGeneric(event, "select", "did");
     *   }
     * }
     *
     * @param {nonEmptyString} type - The type of the event.
     *
     * @return {boolean} `true` if the event has any observers for the given event type; `false`, otherwise.
     *
     * @protected
     */
    _hasObservers: function(type) {
      // Resolve alias
      type = typeInfo.getIdOf(type) || type;

      return O.hasOwn(this.__observersRegistry, type);
    },

    /**
     * Emits an unstructured event and returns it, unless it was canceled.
     *
     * The listeners of existing registrations by the time the method is called are notified,
     * synchronously, by priority order and then registration order,
     * until either the event is canceled or all of the listeners have been notified.
     *
     * It is safe to register or unregister to/from and event type while it is being emitted.
     * However, changes are only taken into account in subsequent emissions.
     *
     * If a listener function throws an error, the event processing is interrupted.
     * No more registrations are processed and the error is passed to the caller.
     *
     * @see pentaho.lang.EventSource#_emitSafe
     * @see pentaho.lang.EventSource#_emitGeneric
     *
     * @param {!pentaho.lang.Event} event - The event object.
     *
     * @return {?pentaho.lang.Event} The given event object or `null`, when canceled.
     *
     * @protected
     */
    _emit: function(event) {
      if(!event) throw error.argRequired("event");
      if(!(event instanceof Event)) throw error.argInvalidType("event", "pentaho.type.Event");

      return this._emitGeneric(event, event.type, null, keyArgsEmitEventUnsafe);
    },

    /**
     * Variation of the [_emit]{@link pentaho.lang.EventSource#_emit} method in which
     * errors thrown by event listeners are caught and logged.
     *
     * If an event listener throws an error, the following event listeners are still processed.
     *
     * @see pentaho.lang.EventSource#_emit
     * @see pentaho.lang.EventSource#_emitGeneric
     *
     * @param {!pentaho.lang.Event} event - The event object.
     *
     * @return {?pentaho.lang.Event} The given event object or `null`, when canceled.
     *
     * @protected
     */
    _emitSafe: function(event) {
      if(!event) throw error.argRequired("event");
      if(!(event instanceof Event)) throw error.argInvalidType("event", "pentaho.type.Event");

      return this._emitGeneric(event, event.type, null, keyArgsEmitEventSafe);
    },

    /**
     * Emits an event given an arbitrary payload object, its type and phase.
     * Returns the event payload object, unless the event is canceled.
     *
     * @param {object} event - The event object.
     * @param {nonEmptyString} type - The type of the event.
     * @param {?nonEmptyString} [phase] - The phase of the event. For unstructured events don't specify this argument
     * (or specify a {@link Nully} value).
     *
     * @param {Object} [keyArgs] - The keyword arguments' object.
     * @param {function(object):boolean} [keyArgs.isCanceled] - A predicate that indicates if a given event object
     * is in a canceled state.
     * @param {function(any, object, nonEmptyString, nonEmptyString)} [keyArgs.errorHandler] -
     * When specified with a `null` value,
     * no error handling is performed and errors thrown by listeners are thrown back to this method's caller.
     * When unspecified or specified as `undefined`, defaults to a function that simply log the listener errors,
     * and let execution continue to following listeners.
     * The function arguments are: the error, the event, the event type and the event phase.
     *
     * @return {?object} The event payload object or `null`, when the event is canceled.
     *
     * @protected
     */
    _emitGeneric: function(event, type, phase, keyArgs) {

      // Performance
      // if(!event) throw error.argRequired("event");
      // if(!type) throw error.argRequired("type");

      var isCanceled;
      var queue;

      if((isCanceled = keyArgs && keyArgs.isCanceled) && isCanceled(event)) {
        return null;
      }

      // Resolve alias
      type = typeInfo.getIdOf(type) || type;

      if((queue = O.getOwn(this.__observersRegistry, type))) {
        return emitQueue.call(this, event, queue, type, phase || "__", isCanceled, keyArgs && keyArgs.errorHandler);
      }

      return event;
    }
  });

  /**
   * Gets or creates the queue of observer registrations for a given event type.
   *
   * @this pentaho.lang.EventSource
   *
   * @param {nonEmptyString} type - The event type.
   * @return {!Array.<pentaho.lang.IEventObserverRegistration>} The array of event observer registrations.
   *
   * @private
   */
  function getObserversQueueOf(type) {
    var registry = this.__observersRegistry || (this.__observersRegistry = {});
    return registry[type] || (registry[type] = createObserversQueue());
  }

  /**
   * Creates a queue of observer registrations.
   *
   * @return {!Array.<pentaho.lang.IEventObserverRegistration>} An empty queue of event observer registrations.
   *
   * @private
   */
  function createObserversQueue() {
    var queue = [];
    queue.emittingLevel = 0;
    return queue;
  }

  /**
   * Register an observer given its event type and priority.
   *
   * @this pentaho.lang.EventSource
   *
   * @param {nonEmptyString} type - The event tyoe.
   * @param {!pentaho.lang.IEventObserver} observer - The event observer.
   * @param {number} priority - The listening priority.
   *
   * @return {!pentaho.lang.IEventRegistrationHandle} An event registration handle that can be used for later removal.
   *
   * @private
   */
  function registerOne(type, observer, priority) {

    // Resolve alias
    type = typeInfo.getIdOf(type) || type;

    var queue = getObserversQueueOf.call(this, type, /* create: */true);

    var i = queue.length;

    /** @type pentaho.lang.IEventObserverRegistration */
    var observerRegistration;
    while(i-- && (observerRegistration = queue[i]).priority >= priority) {
      // Will be shifted to the right one position, with the splice operation, below.
      observerRegistration.index = i + 1;
    }

    // `i` has the first position (from end) where priority is lower.
    // Add to its right.
    i++;

    // Can change the queue directly? Or need to copy it?
    if(queue.emittingLevel) {
      // Use "copy on write". Replace by a fresh copy to not affect current iteration.
      this.__observersRegistry[type] = queue = queue.slice();
      queue.emittingLevel = 0;
    }

    observerRegistration = {
      index: i,
      priority: priority,
      observer: observer
    };

    // Insert at index `i`.
    queue.splice(i, 0, observerRegistration);

    return new pentaho_lang_IEventRegistrationHandle(unregisterOne.bind(this, type, observerRegistration));
  }

  /**
   * Removes an event observer registration.
   *
   * @this pentaho.lang.EventSource
   *
   * @param {nonEmptyString} type - The event type.
   * @param {!pentaho.lang.IEventObserverRegistration} observerRegistration - The event observer registration.
   *
   * @private
   */
  function unregisterOne(type, observerRegistration) {

    var queue = this.__observersRegistry[type];
    var i = observerRegistration.index;

    // Can change the queue directly? Or need to copy it?
    if(queue.emittingLevel) {
      // Use "copy on write". Replace by a fresh copy to not affect current iteration.
      this.__observersRegistry[type] = queue = queue.slice();
      queue.emittingLevel = 0;
    }

    // Remove index `i`
    queue.splice(i, 1);

    // Update indexes of any observers to the right.
    var L = queue.length;
    if(L) {
      while(i < L) {
        queue[i].index = i;
        i++;
      }
    } else {
      // Was last observer registration.
      delete this.__observersRegistry[type];
    }
  }

  /**
   * Disposes a given array of event registration handles.
   *
   * @param {!Array.<pentaho.lang.IEventRegistrationHandle>} handles - The array of event registration handles.
   *
   * @private
   */
  function disposeHandles(handles) {
    for(var i = 0, L = handles.length; i !== L; ++i) {
      handles[i].dispose();
    }
  }

  /**
   * Finds the first unstructured event observer registration for the given event type and listener.
   *
   * @this pentaho.lang.EventSource
   *
   * @param {nonEmptyString} type - The event type.
   * @param {function} listener - The event listener.
   *
   * @return {pentaho.lang.IEventObserverRegistration} The event registration, if any; or `null`, otherwise.
   *
   * @private
   */
  function findUnstructuredObserverRegistration(type, listener) {
    var queue = O.getOwn(this.__observersRegistry, type);
    if(queue) {
      var i = -1;
      var L = queue.length;
      while(++i < L) if(queue[i].observer.__ === listener) return queue[i];
    }

    return null;
  }

  /**
   * Finds the first structured event observer registration for the given event type and observer.
   *
   * @this pentaho.lang.EventSource
   *
   * @param {nonEmptyString} type - The event type.
   * @param {!pentaho.lang.IEventObserver} observer - The event observer.
   *
   * @return {pentaho.lang.IEventObserverRegistration} The event registration, if any; or `null`, otherwise.
   *
   * @private
   */
  function findObserverRegistration(type, observer) {
    var queue = O.getOwn(this.__observersRegistry, type);
    if(queue) {
      var i = -1;
      var L = queue.length;
      while(++i < L) if(queue[i].observer === observer) return queue[i];
    }

    return null;
  }

  /**
   * Parses the given event type specification.
   *
   * When a string, multiple event types can be specified separated by a comma, `,`.
   *
   * @param {nonEmptyString|nonEmptyString[]} type - The event type specification.
   *
   * @return {nonEmptyString[]} An array of event types.
   *
   * @private
   */
  function parseEventTypes(type) {

    if(type instanceof Array) {
      // Allow an array of event types.
      return type;
    }

    if(type.indexOf(",") > -1) {
      // Allow comma delimited event types.
      // Already eats spaces.
      return type.split(/\s*,\s*/);
    }

    return [type];
  }

  /**
   * Emits an event.
   *
   * @this pentaho.lang.EventSource
   *
   * @param {object} event - The event payload object.
   * @param {!Array.<pentaho.lang.IEventObserverRegistration>} queue - The queue of event observer regitrations.
   * @param {nonEmptyString} type - The event type.
   * @param {nonEmptyString} phase - The event phase.
   * @param {function(object):boolean} [isCanceled] - A predicate that indicates if a given event object
   * is in a canceled state.
   * @param {function(any, object, nonEmptyString, nonEmptyString)} [errorHandler] -
   * When specified with a `null` value,
   * no error handling is performed and errors thrown by listeners are thrown back to this method's caller.
   * When unspecified or specified as `undefined`, defaults to a function that simply log the listener errors,
   * and let execution continue to following listeners.
   * The function arguments are: the error, the event, the event type and the event phase.
   *
   * @return {?object} The event payload object or `null`, when the event is canceled.
   */
  function emitQueue(event, queue, type, phase, isCanceled, errorHandler) {

    // Performance
    // if(!event) throw error.argRequired("event");
    // if(!queue) throw error.argRequired("queue");
    // if(!type) throw error.argRequired("type");
    // if(!phase) throw error.argRequired("phase");

    // Use `null` to force no error handling.
    if(errorHandler === undefined) errorHandler = errorHandlerLog;

    queue.emittingLevel++;

    try {
      var i = queue.length;
      var listener;

      if(errorHandler) {

        while(i--) if((listener = queue[i].observer[phase])) {

          try {
            listener.call(this, event);
          } catch(ex) {

            errorHandler.call(this, ex, event, type, phase);
          }

          if(isCanceled && isCanceled(event)) return null;
        }
      } else {

        while(i--) if((listener = queue[i].observer[phase])) {

          listener.call(this, event);

          if(isCanceled && isCanceled(event)) return null;
        }
      }
    } finally {
      queue.emittingLevel--;
    }

    return event;
  }

  /**
   * Determines if a given event object is canceled.
   *
   * @param {!pentaho.lang.Event} event - The event object.
   *
   * @return {boolean} `true` if it is canceled; `false`, otherwise.
   *
   * @private
   */
  function event_isCanceled(event) {
    return event.isCanceled;
  }

  // TODO: check log level!

  /**
   * Logs an error thrown by an event listener.
   *
   * @param {any} error - The thrown value.
   * @param {pentaho.lang.Event} event - The event object.
   * @param {nonEmptyString} type - The event type.
   * @param {nonEmptyString} phase - The event phase.
   *
   * @private
   */
  function errorHandlerLog(error, event, type, phase) {

    var eventTypeId = type + (phase !== "__" ? (":" + phase) : "");
    var errorDesc = error ? (" Error: " + error.message) : "";

    logger.log("Event listener of '" + eventTypeId + "' failed." + errorDesc);
  }
});
