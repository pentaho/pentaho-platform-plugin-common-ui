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
  "./Event",
  "../util/error"
], function(Base, Event, error) {

  "use strict";

  // EventRegistrationHandle class handles creating the alias, remove, from dispose.
  /**
   * @class
   * @implements pentaho.lang.IEventRegistrationHandle
   * @private
   */
  function EventRegistrationHandle(dispose) {
    this.dispose = dispose;
  }

  EventRegistrationHandle.prototype.remove = function() {
    return this.dispose();
  };

  // ---

  return Base.extend("pentaho.lang.EventSource", /** @lends pentaho.lang.EventSource# */{
    _registry: null,

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
     */

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
     * @see pentaho.lang.Event
     *
     * @param {string|string[]} type The type or types of events.
     *   When a string, it can be a comma-separated list of event types.
     *
     * @param {!pentaho.lang.EventListener} listener The listener function.
     * @param {?object} [keyArgs] Keyword arguments.
     * @param {?number} [keyArgs.priority=0] The listening priority.
     * Higher priority event listeners listen to an event before any lower priority event listeners.
     * The priority can be set to `-Infinity` or `Infinity`.
     * In case two listeners are assigned the same priority,
     * the insertion order determines which runs first.
     *
     * @return {!pentaho.lang.IEventRegistrationHandle} An event registration handle that can be used
     *   for later removal.
     */
    on: function(type, listener, keyArgs) {
      if(!type) throw error.argRequired("type");
      if(!listener) throw error.argRequired("listener");

      var handles = [];

      var eventTypes = parseEventTypes(type);
      if (eventTypes) {
        var priority = !!keyArgs && !!keyArgs.priority ? keyArgs.priority : 0;

        for (var events_i = 0, events_len = eventTypes.length; events_i !== events_len; ++events_i) {
          var eventType = eventTypes[events_i];
          
          var queue = this._getQueueOf(eventType, /*create:*/true);

          for (var i = queue.length - 1; i !== -2; --i) {
            if (i !== -1 && priority <= queue[i].priority) {
              queue[i + 1] = queue[i];
              queue[i + 1].order = i + 1;
            } else {
              var listenerInfo = {
                order: i + 1,
                priority: priority,
                listener: listener
              };

              queue[i + 1] = listenerInfo;

              handles.push(new EventRegistrationHandle(removeSingleHandle.bind(this, eventType, listenerInfo)));

              break;
            }
          }
        }
      }

      if (handles.length === 1) {
        return handles[0];
      }

      if (handles.length > 1) {
        return new EventRegistrationHandle(removeMultipleHandles.bind(this, handles));
      }

      return null;
    },

    _getQueueOf: function(type, create) {
      var registry = this._registry;
      if(!registry) {
        if(!create) return null;

        // 1st event registration being added
        this._registry = registry = {};
        return (registry[type] = []);
      }

      var queue = registry[type];
      if(!queue) {
        if(!create) return null;

        // 1st event of this type being added
        registry[type] = queue = [];
      }

      return queue;
    },

    _indexOfListener: function(type, listener, fromIndex) {
      var queue = this._getQueueOf(type, /*create:*/false);
      if(queue) {
        if (fromIndex == null) {
          fromIndex = 0;
        }

        for (var i = fromIndex, len = queue.length; i < len; ++i) {
          if (queue[i].listener === listener) {
            return i;
          }
        }
      }

      return -1;
    },

    _removeListener: function(type, listener, fromIndex) {
      var index = this._indexOfListener(type, listener, fromIndex);
      if (index !== -1) {
        var queue = this._registry[type];
        queue.splice(index, 1);

        return true;
      }

      return false;
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
     * @memberOf pentaho.lang.EventSource#
     *
     * @param {string|string[]|!pentaho.lang.IEventRegistrationHandle} typeOrHandle
     * The type or types of events, or an event registration handle to dispose of.
     * When a string, it can be a comma-separated list of event types.
     *
     * @param {!pentaho.lang.EventListener} [listener] The listener function.
     */
    off: function(typeOrHandle, listener) {
      if(!typeOrHandle) throw error.argRequired("typeOrHandle");

      if(typeOrHandle instanceof EventRegistrationHandle) {
        // This is just syntax sugar, so let dispose from any source.
        typeOrHandle.dispose();
        return;
      }

      if(!listener) throw error.argRequired("listener");

      var eventTypes = parseEventTypes(typeOrHandle);
      if (eventTypes) {
        for (var events_i = 0, events_len = eventTypes.length; events_i !== events_len; ++events_i) {
          while (this._removeListener(eventTypes[events_i], listener)) {
          }
        }
      }
    },

    /**
     * Determines if there are any registrations for a given event type.
     *
     * This method can be used to avoid creating expensive event objects
     * for event types that currently have no registrations.
     *
     * @example
     *
     * if(this._hasListeners("selecting")) {
     *   var event = new Event("selecting");
     *   if(this._emit(event)) {
     *     // Select
     *   }
     * }
     *
     * @memberOf pentaho.lang.EventSource#
     *
     * @param {string} type The type of the event.
     * @return {boolean} `true` if the event has any registrations, `false` if not.
     *
     * @protected
     */
    _hasListeners: function(type) {
      var registry = this._registry;
      return registry != null && registry[type] != null && registry[type].length > 0;
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
     * @memberOf pentaho.lang.EventSource#
     *
     * @param {!pentaho.lang.Event} event The event object emit.
     * @return {?pentaho.lang.Event} The emitted event object or `null`, when canceled.
     *
     * @protected
     * @sealed
     */
    _emit: function(event) {
      if(!event) throw error.argRequired("event");
      if(!(event instanceof Event)) throw error.argInvalidType("event", "pentaho.type.Event");

      if (event.isCanceled) {
        return null;
      }

      var queue = this._getQueueOf(event.type, /*create:*/false);
      if(queue) {
        queue = queue.slice();

        var i = queue.length;
        while (i-- && !event.isCanceled) {
          queue[i].listener.call(this, event);
        }

        if (event.isCanceled) {
          return null;
        }
      }

      return event;
    }
  });

  /**
   * Removes a single registration.
   *
   * @param {string} type The event type.
   * @param {Object} info The event registration.
   *
   * @this pentaho.lang.EventSource
   * @inner
   * @private
   */
  function removeSingleHandle(type, info) {
    var fromIndex = info.order;

    var r = this._removeListener(type, info.listener, fromIndex);
    if (!r && fromIndex > 0) {
      this._removeListener(type, info.listener, 0);
    }
  }

  function removeMultipleHandles(handles) {
    for (var i = 0, L = handles.length; i !== L; ++i) {
      handles[i].dispose();
    }
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
});
