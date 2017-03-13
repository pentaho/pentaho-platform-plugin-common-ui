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
   * @name IObserverRegistration
   * @interface
   * @property {pentaho.lang.IEventObserver} observer - The observer.
   * @property {number} priority - The priority of the observer.
   * @property {number} index - The index of the observer in the event's observers list.
   */

  // ---

  /**
   * @classDesc The `EventSource` class is a **mixin** to be
   * used by classes that are the source of events - that emit events.
   *
   * The exposed interface is compatible with the
   * [dojo/on]{@link https://dojotoolkit.org/reference-guide/dojo/on.html} API.
   *
   * @name EventSource
   * @memberOf pentaho.lang
   * @class
   * @amd pentaho/lang/EventSource
   */

  return Base.extend(module.id, /** @lends pentaho.lang.EventSource# */{

    /**
     * The registry of event observers.
     *
     * Events have a name and, optionally, multiple phases.
     *
     * Observers are registered for events and can specify listeners for specific phases of the event.
     *
     * Events that have a single phase, have, nonetheless, the `"__"` phase, which is used,
     * implicitly, when a listener is registered directly to an event without specifying a phase.
     *
     * A map of event names to observer info arrays.
     *
     * @type {Map.<string, Array.<IObserverRegistration>>}
     * @private
     */
    __observersRegistry: null,

    /**
     * Registers a listener function for events of a given type or types.
     *
     * Optionally, a _listening priority_ may be specified to adjust
     * the order by which a listener is notified of an emitted event,
     * relative to other listeners.
     *
     * Note that if a listener function is registered more than once to the same event type,
     * a **new registration** is created each time and the function will be called
     * once per registration.
     *
     * It is safe to register for an event type while it is being emitted.
     * However, new registrations are only taken into account in subsequent emissions.
     *
     * When `type` represents multiple event types,
     * the returned event registration handle is a
     * composite registration for all event types.
     *
     * @see pentaho.lang.EventSource#off
     *
     * @param {string|string[]} type - The type or types of events.
     *   When a string, it can be a comma-separated list of event types.
     *
     * @param {!pentaho.lang.IEventObserver|!pentaho.lang.EventListener} observer - The event observer or
     * the single-phase event listener function.
     * @param {?object} [keyArgs] - Keyword arguments.
     * @param {?number} [keyArgs.priority=0] - The listening priority.
     * Higher priority event listeners listen to an event before any lower priority event listeners.
     * The priority can be set to `-Infinity` or `Infinity`.
     * In case two listeners are assigned the same priority,
     * the insertion order determines which runs first.
     *
     * @return {!pentaho.lang.IEventRegistrationHandle} An event registration handle that can be used
     *   for later removal.
     */
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

    /**
     * Removes one registration, or all registrations of a given event type and listener function.
     *
     * To remove an event registration,
     * it is sufficient to call the [dispose]{@link pentaho.lang.IEventRegistrationHandle#dispose} method
     * (or `remove`) of the registration handle returned by [on]{@link pentaho.lang.EventSource#on},
     * upon registration.
     *
     * Alternatively, as a convenience syntax,
     * the registration handle can be passed as the single argument to this method.
     *
     * To remove all registrations of a given event type and listener function,
     * specify these as arguments.
     *
     * It is safe to unregister from an event type while it is being emitted.
     * However, removed registrations are still taken into account in the current emission.
     *
     * Specifying an event registration handle that has already been disposed of has no effect.
     * Specifying an event type and listener function that have no registrations has no effect.
     *
     * @param {string|string[]|!pentaho.lang.IEventRegistrationHandle} typeOrHandle - The type or types of events,
     * or an event registration handle to dispose of.
     * When a string, it can be a comma-separated list of event types.
     *
     * @param {pentaho.lang.IEventObserver|pentaho.lang.EventListener} observer - The event observer or
     * the single-phase event listener function.
     * Required when `typeOrHandle` is not an event registration handle; ignored, otherwise.
     */
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

        var find = F.is(observer) ? findSinglePhaseObserver : findObserver;

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
     * for event type and phase pairs that currently have no registrations.
     *
     * @example
     *
     * if(this._hasListeners("select", "will")) {
     *   var event = new Event("select");
     *   if(this._emit(event)) {
     *     // Select Will phase
     *   }
     * }
     *
     * @param {string} type - The type of the event.
     * @param {string} [phase] - The phase of the event. For single-phase events don't specify this argument.
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
     *   var event = new Event("select");
     *
     *   if(this._emit(event, "will")) {
     *     // Select Will
     *   }
     *
     *   if(this._emit(event, "did")) {
     *     // Select Did
     *   }
     * }
     *
     * @param {string} type - The type of the event.
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
     * Emits an event and returns it, unless it was canceled.
     *
     * The listeners of existing registrations by the time the method is called are notified,
     * synchronously, by priority order and then insertion order,
     * until either the event is canceled or all of the listeners have been notified.
     *
     * It is safe to register or unregister to/from and event type while it is being emitted.
     * However, changes are only taken into account in subsequent emissions.
     *
     * If a listener function throws an error, the event processing is interrupted.
     * No more registrations are processed and the error is passed to the caller.
     *
     * @param {!pentaho.lang.Event} event The event object to emit.
     * @return {?pentaho.lang.Event} The emitted event object or `null`, when canceled.
     *
     * @protected
     * @sealed
     */
    _emit: function(event) {
      if(!event) throw error.argRequired("event");
      if(!(event instanceof Event)) throw error.argInvalidType("event", "pentaho.type.Event");

      return this._emitGeneric(event, event.type, null, keyArgsEmitEventUnsafe);
    },

    /**
     * Variation of the [_emit]{@link pentaho.lang.EventSource#_emit} method in which
     * all exceptions are caught (and logged).
     *
     * If an event listener throws an exception, the following event listeners are still processed.
     *
     * @param {!pentaho.lang.Event} event The event object to emit.
     * @return {?pentaho.lang.Event} The emitted event object or `null`, when canceled.
     *
     * @protected
     */
    _emitSafe: function(event) {
      if(!event) throw error.argRequired("event");
      if(!(event instanceof Event)) throw error.argInvalidType("event", "pentaho.type.Event");

      return this._emitGeneric(event, event.type, null, keyArgsEmitEventSafe);
    },

    /**
     * Emits an event of a generic type and returns it, unless it was canceled.
     *
     * @param {Object} event - The event object to emit.
     * @param {string} type - The type of the event.
     * @param {?string} [phase] - The phase of the event. For single-phase events don't specify this argument
     * (or specify as {@link Nully}.
     *
     * @param {Object} [keyArgs] - The keyword arguments' object.
     * @param {function(Object):boolean} [keyArgs.isCanceled] - A predicate that indicates if a given event object
     * is in a canceled state.
     * @param {function(any, Object, string, string)} [keyArgs.errorHandler] - When specified with a `null` value,
     * no error handling is performed and errors thrown by listeners are thrown back to this method's caller.
     * When unspecified or specified as `undefined`, defaults to a function that simply log the listener errors,
     * and let execution continue to following listeners.
     * The function arguments are: the error, the event, the event type and the event phase.
     *
     * @return {?Object} The emitted event object or `null`, when canceled.
     *
     * @protected
     */
    _emitGeneric: function(event, type, phase, keyArgs) {

      // Performance
      // if(!type) throw error.argRequired("type");

      var isCanceled;
      var queue;

      if((isCanceled = keyArgs && keyArgs.isCanceled) && isCanceled(event)) {
        return null;
      }

      // Resolve alias
      type = typeInfo.getIdOf(type) || type;

      if((queue = O.getOwn(this.__observersRegistry, type))) {
        return emitQueue.call(this, event, queue, type, phase || "__", isCanceled, keyArgs);
      }

      return event;
    }
  });

  /**
   * Gets or creates the queue of observer registrations for a given event type.
   *
   * @this pentaho.lang.EventSource
   *
   * @param {string} type - The event type.
   * @return {IObserverRegistration[]} The array of event observer registrations.
   *
   * @this pentaho.lang.EventSource
   * @inner
   * @private
   */
  function getObserversQueueOf(type) {
    var registry = this.__observersRegistry || (this.__observersRegistry = {});
    return registry[type] || (registry[type] = createObserversQueue());
  }

  /**
   * Creates a queue of observer registrations.
   *
   * @return {IObserverRegistration[]} An empty queue of event observer registrations.
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
   * @param {string} type - The event tyoe.
   * @param {!pentaho.lang.IEventObserver} observer - The event observer.
   * @param {number} priority - The listening priority.
   *
   * @return {!pentaho.lang.IEventRegistrationHandle} An event registration handle that can be used for later removal.
   *
   * @this pentaho.lang.EventSource
   * @inner
   * @private
   */
  function registerOne(type, observer, priority) {

    // Resolve alias
    type = typeInfo.getIdOf(type) || type;

    var queue = getObserversQueueOf.call(this, type, /* create: */true);

    var i = queue.length;

    /** @type IObserverRegistration */
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
   * @param {string} type - The event type.
   * @param {IObserverRegistration} observerRegistration - The event observer registration.
   *
   * @this pentaho.lang.EventSource
   * @inner
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

  function disposeHandles(handles) {
    for(var i = 0, L = handles.length; i !== L; ++i) {
      handles[i].dispose();
    }
  }

  function findSinglePhaseObserver(type, listener) {
    var queue = O.getOwn(this.__observersRegistry, type);
    if(queue) {
      var i = -1;
      var L = queue.length;
      while(++i < L) if(queue[i].observer.__ === listener) return queue[i];
    }

    return null;
  }

  function findObserver(type, observer) {
    var queue = O.getOwn(this.__observersRegistry, type);
    if(queue) {
      var i = -1;
      var L = queue.length;
      while(++i < L) if(queue[i].observer === observer) return queue[i];
    }

    return null;
  }

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

  function emitQueue(event, queue, type, phase, isCanceled, keyArgs) {

    // Use `null` to force no error handling.
    var errorHandler;
    if((errorHandler = keyArgs && keyArgs.errorHandler) === undefined)
      errorHandler = errorHandlerLog;

    queue.emittingLevel++;

    try {

      var i = queue.length;
      var listener;

      if(errorHandler) {

        while(i--) if((listener = queue[i].observer[phase])) {

          try {
            listener.call(this, event);
          } catch(ex) {

            if(errorHandler) errorHandler.call(this, ex, event, type, phase);
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

  function event_isCanceled(event) {
    return event.isCanceled;
  }

  function errorHandlerLog(ex, event, type, phase) {
    logger.log("Event listener of '" + type + ":" + phase + "' failed. \nStack: " + ex.stack);
  }
});
