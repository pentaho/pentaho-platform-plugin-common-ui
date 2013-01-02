dojo.provide('pentaho.common.SplashScreen');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.button');
dojo.require('pentaho.common.Dialog');
dojo.declare(
     'pentaho.common.SplashScreen',
     [pentaho.common.Dialog],
     {
        buttons: ['ok'],
        
        imagePath: '',
        
        hasTitleBar: false,
        
        setTitle: function(title) {
            this.splashtitle.innerHTML = title;
        },

        setText: function(text) {
            this.splashmessage.innerHTML = text;
        },
    
        setButtonText: function(text) {
            this.buttons[0] = text;
            dojo.query("#button"+0, this.domNode).innerHTML = text;
        },
    
        templatePath: dojo.moduleUrl('pentaho.common', 'SplashScreen.html'),
      
       postCreate: function() {
           this.inherited(arguments);
       }
       
    }
);
