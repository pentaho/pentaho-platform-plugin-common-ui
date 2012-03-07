dojo.provide('pentaho.common.MessageBox');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.button');
dojo.require('pentaho.common.Dialog');
dojo.declare(
     'pentaho.common.MessageBox',
     [pentaho.common.Dialog],
     {
        buttons: ['btn1','btn2','btn3'],
        
        setTitle: function(title) {
            this.set("title",title);
        },

        setMessage: function(message) {
            this.messagelbl.innerHTML = message;
        },

        setButtons: function(buttons) {
        
            this.buttons = buttons;
            for(var i=0; i<3; i++) {
                var button = dojo.query("button"+i, this.popup.domNode)
                if(button) {
                    if(i<this.buttons.length) {
                        button.innerHTML = this.buttons[i];
                        dojo.removeClass(button, 'hidden');
                    } else {
                        dojo.addClass(button, 'hidden');
                    }
                }
            }
        },

        templatePath: dojo.moduleUrl('pentaho.common', 'MessageBox.html')
           
      }
);
