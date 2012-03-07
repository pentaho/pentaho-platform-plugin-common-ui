dojo.provide('pentaho.common.button');

// TODO support disabled mode and rollover effects

dojo.declare(
    'pentaho.common.button',
    [dijit._Widget, dijit._Templated],
    {
        label : 'a button',
          
        onClick: function() {
            this.callback();
        },
        
        callback: null,

        templatePath: dojo.moduleUrl('pentahocommon', 'button.html'),
        
        postMixInProperties: function() {
            this.inherited(arguments);
        },
        
        postCreate: function() {
            this.inherited(arguments);
            dojo.connect(this.button, "onclick", this, this.onClick);
        }
      }
);
