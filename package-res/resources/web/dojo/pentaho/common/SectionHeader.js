dojo.provide('pentaho.common.SectionHeader');

dojo.require('pentaho.common.SmallImageButton');
// TODO support disabled mode and rollover effects

dojo.declare(
    'pentaho.common.SectionHeader',
    [dijit._Widget, dijit._Templated],
    {
        title : '',
        
        header: 'header',
          
        buttonTypes: '',
        
        headerButtons: [],
        
        id: '',
        
        buttonInfo: [],
          
        height: '20px',
          
        templatePath: dojo.moduleUrl('pentaho.common', 'SectionHeader.html'),
        
        postMixInProperties: function() {
            this.inherited(arguments);
        },
        
        postCreate: function() {
            this.inherited(arguments);
            if(this.buttonTypes && this.buttonTypes.length > 0) {
                var list = this.buttonTypes.split(',');
                var buttonInfo = [];
                for(var idx=0; idx<list.length; idx++) {
                    var info = {
                        baseClass: list[idx],
                        id: ''+this.id+'-button-'+idx,
                        title: '',
                        callback: dojo.hitch(this, this.buttonClick, idx)
                    };
                    buttonInfo.push(info);
                }
                this.setButtons(buttonInfo);
            }
        },
        
        setButtons: function( buttonInfo ) {
            this.buttonInfo = buttonInfo;
            this.headerButtons = [];
            for(var idx=0; idx<buttonInfo.length; idx++) {
                var button = new pentaho.common.SmallImageButton(buttonInfo[idx]);
                this.headerButtons.push(button);
                // the the button to the section.
                var cell = this.table.rows[0].insertCell(-1);
                cell.appendChild(button.domNode);
            }
        },
        
        buttonClick: function(idx) {
            if(this.callbacks && idx<this.callbacks.length) {
                this.callbacks[idx](this.headerButtons[idx].id);
            }
        },

        setHeader: function(/*String*/ header) {
          this.header = header;
          this.headerNode.innerHTML = header;
        }

    }
);
