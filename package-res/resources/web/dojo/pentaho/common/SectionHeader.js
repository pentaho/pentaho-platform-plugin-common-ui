dojo.provide('pentaho.common.SectionHeader');

// TODO support disabled mode and rollover effects

dojo.declare(
    'pentaho.common.SectionHeader',
    [dijit._Widget, dijit._Templated],
    {
        title : '',
          
        buttonTypes: '',
          
        height: '20px',
          
        templatePath: new dojo.moduleUrl('pentaho.common', 'SectionHeader.html'),
        
        postMixInProperties: function() {
            this.inherited(arguments);
        },
        
        postCreate: function() {
            this.inherited(arguments);
            dojo.connect(this.button, "onclick", this, this.onClick);
        }
      }
);
