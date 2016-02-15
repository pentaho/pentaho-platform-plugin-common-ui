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

define(["pentaho/lang/Base", "pentaho/lang/Event"], function(Base, Event) {
  "use strict";

  return Base.extend("EventSource", /** @lends pentaho.lang.EventSource# */{
    _registry: null,

    /**
     * @classDesc The `EventSource` class is a mixin to be
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
     * Registers a listener of events of a given type emitted by this object.
     *
     * Optionally, a _listening priority_ may be specified to adjust the order
     * by which listeners are notified of an emitted event.
     *
     * If a listener is registered more than once to the same event,
     * it is only actually registered once.
     * However, it is the last specified priority that determines its listening priority.
     *
     * It is safe to add listeners during an event emission.
     * However, new listeners are only notified in subsequent emissions.
     *
     * @see pentaho.lang.EventSource#off
     * @see pentaho.lang.Event
     *
     * @param {string} type The type(s) of the event. Can match multiple event
     * types with a single call by comma-delimiting the event names.
     * @param {!pentaho.lang.EventListener} listener The listener function.
     * @param {?object} [keyArgs] Keyword arguments.
     * @param {?number} [keyArgs.priority=0] The listening priority.
     * Higher priority event listeners listen to an event before any lower priority event listeners.
     *
     * @return {!pentaho.lang.IEventHandle} An event handle that can be used to
     *   efficiently remove the event listener.
     */
    on: function(type, listener, keyArgs) {
      var handles = [];

      var eventTypes;
      if (type instanceof Array) {
        // allow an array of event types
        eventTypes = type;
      } else if (type.indexOf(",") > -1) {
        // allow comma delimited event types
        eventTypes = type.split(/\s*,\s*/);
      } else {
        eventTypes = [type];
      }

      if (eventTypes) {
        for (var events_i = 0, events_len = eventTypes.length; events_i !== events_len; ++events_i) {
          var eventType = eventTypes[events_i].trim();

          var queue = this._getQueueOf(eventType);

          var priority = !!keyArgs && !!keyArgs.priority ? keyArgs.priority : 0;

          for (var i = queue.length - 1; i !== -2; --i) {
            if (i === -1 || priority >= queue[i].priority) {
              var listenerInfo = {
                order: i + 1,
                priority: priority,
                listener: listener,
                args: keyArgs
              };

              queue[i + 1] = listenerInfo;

              handles.push(/** @implements pentaho.lang.IEventHandle */ {
                _source: this,
                _type: eventType,
                _info: listenerInfo,

                remove: removeSingleHandle
              });

              break;
            }

            queue[i + 1] = queue[i];
            queue[i + 1].order = i + 1;
          }
        }
      }

      if (handles.length === 1) {
        return handles[0];
      }

      if (handles.length > 1) {
        return /** @implements pentaho.lang.IEventHandle */ {
          _source: this,
          _type: type,
          _handles: handles,

          remove: removeMultipleHandles
        };
      }

      return null;

      function removeSingleHandle() {
        var fromIndex = this._info.order;

        var r = this._source._removeListener(this._type, this._info.listener, fromIndex);
        if (!r && fromIndex > 0) {
          r = this._source._removeListener(this._type, this._info.listener, 0);
        }
      }

      function removeMultipleHandles() {
        for (var i = 0; i !== this._handles.length; ++i) {
          this._handles[i].remove();
        }
      }
    },

    _getQueueOf: function(type) {
      if (!this._registry) {
        this._registry = {};
      }

      var queue = this._registry[type];
      if (!queue) {
        queue = [];
        this._registry[type] = queue;
      }

      return queue;
    },

    _indexOfListener: function(type, listener, fromIndex) {
      var queue = this._getQueueOf(type);

      if (fromIndex == null) {
        fromIndex = 0;
      }

      for (var i = fromIndex, len = queue.length; i < len; ++i) {
        if (queue[i].listener === listener) {
          return i;
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
     * Unregisters a listener from an event.
     *
     * The recommended way to unregister from an event is by
     * calling the [dispose]{@link pentaho.lang.IEventHandle#dispose} method
     * of the event handle returned, upon registration, by [on]{@link pentaho.lang.EventSource#on}.
     * This usage pattern, however, requires storing the event handle,
     * something which is sometimes undesirable.
     *
     * This method allows unregistering from an event
     * when given the same main arguments used when registering to it.
     *
     * This method can also be called with a single argument, an event handle,
     * in which case it is disposed of.
     *
     * It is safe to remove listeners during an event emission.
     * However, removed listeners are still notified in the current emission.
     *
     * @param {string|!pentaho.lang.IEventHandle} typeOrHandle The type of the event,
     *  or an event handle to dispose of.
     * @param {!pentaho.lang.EventListener} [listener] The listener function.
     */
    off: function(typeOrHandle, listener) {
      if (typeof typeOrHandle === "object") {
        if (typeOrHandle.remove && typeOrHandle._source === this) {
          typeOrHandle.remove();
          return;
        }
      }

      var eventTypes;
      if (typeOrHandle instanceof Array) {
        // allow an array of event types
        eventTypes = typeOrHandle;
      } else if (typeOrHandle.indexOf(",") > -1) {
        // allow comma delimited event types
        eventTypes = typeOrHandle.split(/\s*,\s*/);
      } else {
        eventTypes = [typeOrHandle];
      }

      if (eventTypes) {
        for (var events_i = 0, events_len = eventTypes.length; events_i !== events_len; ++events_i) {
          while (this._removeListener(eventTypes[events_i], listener)) {
          }
        }
      }
    },

    /**
     * Determines if there are any listeners registered to an event.
     *
     * This method can be used to avoid creating expensive event objects
     * for events that currently have no registered listeners.
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
     * @param {string} type The type of the event.
     * @return {boolean} `true` if the event has any listeners, `false` if not.
     *
     * @protected
     */
    _hasListeners: function(type) {
      return this._registry != null && this._registry[type] != null && this._registry[type].length > 0;
    },

    /**
     * Emits an event and returns it, unless it was canceled.
     *
     * Event listeners registered by the time the method is called are notified,
     * by priority order,
     * until either the event is canceled or all of the listeners have been notified.
     *
     * It is safe to add and/or remove listeners during an event emission.
     * However, any changes only impact following event emissions.
     *
     * @param {!pentaho.lang.Event} event The event object emit.
     * @return {?pentaho.lang.Event} The emitted event object or `null`, when canceled.
     *
     * @protected
     * @sealed
     */
    _emit: function(event) {
      if (!(event instanceof Event)) {
        return null;
      }

      if (event.isCanceled) {
        return null;
      }

      var queue = this._getQueueOf(event.type).slice();

      var i = queue.length;
      while (i-- && !event.isCanceled) {
        queue[i].listener.call(this, event);
      }

      if (event.isCanceled) {
        return null;
      }

      return event;
    }
  });
});
