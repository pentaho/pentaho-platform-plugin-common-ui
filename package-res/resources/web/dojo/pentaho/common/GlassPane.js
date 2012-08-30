dojo.provide("pentaho.common.GlassPane");
dojo.require("dijit._Widget");
/**
 * Creates a glass pane 
 */
dojo.declare(
    "pentaho.common.GlassPane",
    [dijit._Widget],
    {
        
        _glassPaneDiv: null,
        
        create: function(/*Object?*/params, /*DomNode|String?*/srcNodeRef) {
            this.inherited(arguments);
            this._glassPaneDiv = dojo.create('div', {
                id: 'glasspane',
                className: 'glasspane'
            });
            document.body.appendChild(this._glassPaneDiv);
        },
        
        show: function() {
            dojo.style(this._glassPaneDiv,"display","block")
        },
        
        hide: function() {
            dojo.style(this._glassPaneDiv,"display","none")
        }

    }
);

