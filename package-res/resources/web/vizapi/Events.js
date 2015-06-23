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

/*
pentaho.events

An event handler

author: James Dixon

*/

pentaho = typeof pentaho == "undefined" ? {} : pentaho;

pentaho.events = {};

// an array of event listeners
pentaho.events.listeners = [];

/*
    trigger
    Triggers an event by notifying all of the listeners that the event has occurred.
*/
pentaho.events.trigger = function( object, eventName, args ) {

    // examine each listener
    for(var lNo=0; lNo<pentaho.events.listeners.length; lNo++ ) {
        if( pentaho.events.listeners[lNo].object == object && pentaho.events.listeners[lNo].eventName == eventName ) {
            // the event matches this listener's object and event name
            pentaho.events.listeners[lNo].func( args );
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
pentaho.events.addListener = function(object, eventName, func ) {
    pentaho.events.listeners.push({
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
pentaho.events.removeListener = function(object, eventName ) {

    var lNo = 0;
    while(lNo<pentaho.events.listeners.length ) {
        if( pentaho.events.listeners[lNo].object == object && pentaho.events.listeners[lNo].eventName == eventName ) {
            pentaho.events.listeners.splice(lNo,1);
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
pentaho.events.removeSource = function(object) {

    var lNo = 0;
    while(lNo<pentaho.events.listeners.length ) {
        if( pentaho.events.listeners[lNo].object == object ) {
            pentaho.events.listeners.splice(lNo,1);
        } else {
            lNo++;
        }
    }
    
}
