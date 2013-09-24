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
