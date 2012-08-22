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
        messageType: null,                         // options are null, ERROR, WARN, INFO

        setTitle: function(title) {
            this.set("title",title);
        },

        postCreate: function() {
          this.inherited(arguments);
          this.setMessageType(this.messageType);
        },

        setMessageType: function(/*String*/ type) {
          this.messageType = type;
          if(type != null) {
            if(type == "ERR" || type == "ERROR") {
              dojo.replaceClass(this.typeIcon, "error-large-icon", "warning-large-icon info-large-icon");
            } else if(type == "WARN" || type == "WARNING") {
              dojo.replaceClass(this.typeIcon, "warning-large-icon", "error-large-icon info-large-icon");
            } else {
              dojo.replaceClass(this.typeIcon, "info-large-icon", "error-large-icon warning-large-icon");
            }
          } else {
            // remove the image
            dojo.removeClass(this.typeIcon, "error-large-icon info-large-icon warning-large-icon");
          }
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
