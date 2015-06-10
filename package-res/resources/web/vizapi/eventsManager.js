/*!
* Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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

  // an array of event listeners
  var _listeners = [];

  /*
      trigger
      Triggers an event by notifying all of the listeners that the event has occurred.
  */
  function events_trigger( object, eventName, args ) {

      // examine each listener
      for(var lNo=0; lNo<_listeners.length; lNo++ ) {
          if( _listeners[lNo].object == object && _listeners[lNo].eventName == eventName ) {
              // the event matches this listener's object and event name
              _listeners[lNo].func( args );
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
  function events_addListener(object, eventName, func ) {
      _listeners.push({
          object: object,
          eventName: eventName,
          func: func
      });
  }

  /*
      removeListener
      Removes a listener for an event

      object      The object to listen to
      eventName   The name of the event to listen to
  */
  function events_removeListener(object, eventName ) {

      var lNo = 0;
      while(lNo<_listeners.length ) {
          if( _listeners[lNo].object == object && _listeners[lNo].eventName == eventName ) {
              _listeners.splice(lNo,1);
          } else {
              lNo++;
          }
      }

  }

  /*
      removeSource
      Removes all the listeners for the specified ibject

      object      The object to listen to remove
  */
  function events_removeSource(object) {

      var lNo = 0;
      while(lNo<_listeners.length ) {
          if( _listeners[lNo].object == object ) {
              _listeners.splice(lNo,1);
          } else {
              lNo++;
          }
      }

  };

  return {
    trigger:      events_trigger,
    addListener: events_addListener,
    removeListener: events_removeListener,
    removeSource: events_removeSource
  };
});
