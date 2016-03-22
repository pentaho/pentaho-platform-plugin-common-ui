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
*
*/
define(function() {

  /*
  pentaho.events

  An event handler

  author: James Dixon
  */

  /*
      trigger
      Triggers an event by notifying all of the listeners that the event has occurred.
   */
  function events_trigger(object, eventName, arg) {
    var events = object && object.__events__;
    if(events) {
      var handlers = events[eventName];
      if(handlers) {
        var i = -1, L = handlers.length;
        while(++i < L) handlers[i](arg);
      }
    }
  }

  /*
      addListener
      Adds a listener for an event

      object      The object to listen to
      eventName   The name of the event to listen to
      func        The function to call when the event happens
   */
  function events_addListener(object, eventName, func) {
    if(object) {
      var events   = (object.__events__ || (object.__events__ = {})),
          handlers = (events[eventName] || (events[eventName] = []));
      handlers.push(func);
    }
  }

  /*
      removeListener
      Removes a listener for an event

      object      The object to listen to
      eventName   The name of the event to listen to
  */
  function events_removeListener(object, eventName) {
    var events = object && object.__events__;
    if(events) {
      if(eventName) {
        delete events[eventName];
      } else {
        delete object.__events__;
      }
    }
  }

  /*
      removeSource
      Removes all the listeners for the specified ibject

      object      The object to listen to remove
   */
  function events_removeSource(object) {
    events_removeListener(object);
  }

  return {
    trigger:        events_trigger,
    addListener:    events_addListener,
    removeListener: events_removeListener,
    removeSource:   events_removeSource
  };
});
