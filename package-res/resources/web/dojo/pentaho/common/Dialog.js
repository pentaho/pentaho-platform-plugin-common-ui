dojo.provide('pentaho.common.Dialog');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.Dialog');
dojo.require('pentaho.common.button');
dojo.require('pentaho.common.SmallImageButton');
dojo.require('pentaho.common.Messages');
dojo.declare(
     'pentaho.common.Dialog',
     [dijit._Widget, dijit._Templated],
     {
        popup : null,
        title: "",
        widgetsInTemplate: true,
        getLocaleString: pentaho.common.Messages.getString,
        callbacks: [],
        shown: false,
        buttonsCreated: false,
        buttonPanel: null,
        hasTitleBar: true,
        hasBorder: true,
        hasCloseIcon: false,
        closeIcon: undefined,
        _onCancelCallback: undefined,
        
        setLocalizationLookupFunction: function(f) {
            this.getLocaleString = f;
            this._localize();
        },

        buttonClick: function(idx) {
            if(this.callbacks[idx]) {
                this.callbacks[idx]();
            }
        },

        // override this..
        buttons: [],
        
        // override this..
        _localize: function() {
            if(this.getLocaleString) {
                for(var i=0; i<this.buttons.length; i++) {
                    var button = dojo.query("button"+i, this.popup.domNode);
                    this.buttons[i] = this.getLocaleString(this.buttons[i]);
                    if(button) {
                        button.innerHTML = this.getLocaleString();
                    }
                }
                if (this.hasCloseIcon) {
                  dojo.attr(this.closeIcon.domNode, "title", this.getLocaleString('CloseIcon_title'));
                }
            }
        },

        // override this
        templateString : "<div></div>",

          // * set variables for the template
          postMixInProperties: function() {

               this.inherited(arguments);
          },
          
          _createButtonPanel: function() {
              this.buttonPanel = dojo.create("TABLE");
              dojo.style(this.buttonPanel, "width", "100%");
              dojo.place(this.buttonPanel, this.popup.domNode);
              dojo.addClass(this.buttonPanel, 'button-panel');
          },
          
          _createButtons: function() {
        	  if (this.buttonPanel.rows.length > 0) {
        		  this.buttonPanel.deleteRow(-1);
        	  }
              var row = this.buttonPanel.insertRow(-1);
              var cell = row.insertCell(-1);
              dojo.style(cell, "align", "right");
              dojo.style(cell, "width", "100%");        	  
                for(var j=0; j<this.buttons.length; j++) {
                    cell = row.insertCell(-1);
                    dojo.style(cell, "align", "right");
                    var btn = document.createElement("BUTTON");
                    dojo.addClass(btn, "pentaho-button");
                    dojo.attr(btn, "id", "button"+j);
                    btn.innerHTML = this.buttons[j];
                    cell.appendChild(btn);
                    btn.onclick = dojo.hitch(this, this.buttonClick, j);
                }
          },
          
          setButtonEnabled: function(/*int*/ buttonIndex, /*boolean*/ enabled) {
            var btn = dojo.byId("button" + buttonIndex);
            if(typeof(btn) != 'undefined' && btn != null) {
                if(typeof(btn.set) != 'undefined') {
                  btn.set('disabled', !enabled);
                } else {
                  btn.disabled = !enabled;
                }
            }
          },

          postCreate: function() {
            if(this.templatePath || this.templateString != '<div></div>') {
                this.popup.attr("content", this.domNode);
            }
               this.inherited(arguments);
               
               if(!this.hasTitleBar) {
                    dojo.addClass(dojo.query('.dijitDialogTitleBar',this.popup.domNode)[0],'hidden');
                }
                if(this.hasBorder) {
                    dojo.addClass(this.popup.domNode,'pentaho-dialog');
                }
                if(this.hasCloseIcon) {
                  this.closeIcon = new pentaho.common.SmallImageButton({"baseClass": "pentaho-closebutton"});
                  dojo.addClass(this.closeIcon.domNode, "pentahoDialogCloseIcon");
                  dojo.place(this.closeIcon.domNode,
                    dojo.query('.dijitDialogTitleBar',this.popup.domNode)[0]);
                  this.closeIcon.callback = dojo.hitch(this, this.onCancel);
                }
                
                dojo.addClass(dojo.query('.dijitDialogTitleBar',this.popup.domNode)[0],'Caption');
                dojo.connect(this.domNode,'onKeyPress', this, this.keyUp);
                dojo.connect(this.popup.domNode,'onKeyPress', this, this.keyUp);
                dojo.connect(this.domNode, "onkeyup", this, this.keyup);
                
                this.onKeyUp = dojo.hitch(this, this.keyup);
                dojo.connect(this.domNode, 'onKeyUp', this, this.keyup);
                dojo.connect(this.popup, 'onKeyUp', this, this.keyup);
                dojo.connect(this.popup.domNode, 'onKeyUp', this, this.keyup);
                
                this.popup.onCancel = dojo.hitch(this, function(){});
                this.popup.onExecute = dojo.hitch(this, this.okClick);
                this._localize();

                dojo.connect(this.popup, "onHide", dojo.hitch(this, "onHide"));
           },
           
           keyup: function(event) {
               dojo.stopEvent(event);
                if(event.keyCode == dojo.keys.ENTER) {
                    if(this.execute) {
                        this.execute();
                    }
                }
                if(event.keyCode == dojo.keys.ESCAPE) {
                    if(this.onCancel) {
                        this.onCancel();
                    }
                }
           },
            
            setTitle: function( title ) {
                this.title = title;
               this.popup.set('title',this.title);
            },
            
           show: function(){
               this.domNode.style.display='';
               this.popup.set('title',this.title);
                dojo.style(this.popup.domNode, 'display', 'none');
                if(this.templateBased) {
                    if(!this.shown) {
                        this.width = ''+dojo.style(this.domNode,'width')+'px';
                        if (dojo.style(this.domNode, 'display') === 'block') {
                          this.width = (dojo.style(this.domNode,'width') +
                                        dojo.style(this.domNode, 'paddingLeft') +
                                        dojo.style(this.domNode, 'paddingRight') +
                                        dojo.style(this.domNode, 'borderLeftWidth') +
                                        dojo.style(this.domNode, 'borderRightWidth')) +'px';
                        }
                        dojo.style(this.popup.domNode, 'width', this.width);
                        dojo.style(dojo.query('.dijitDialogPaneContent',this.popup.domNode),'width', this.width);
                        dojo.style(dojo.query('.dijitDialogPaneContent',this.domNode),'width', this.width);
                    }
                } else {
                    if(!this.shown) {
                        dojo.style(this.domNode, 'width', this.width);
                        dojo.style(this.popup.domNode, 'width', this.width);
                        dojo.style(dojo.query('.dijitDialogPaneContent',this.popup.domNode),'width', this.width);
                        dojo.style(dojo.query('.dijitDialogPaneContent',this.domNode),'width', this.width);
                        dojo.style(this.domNode, 'height', this.height);
                        dojo.style(this.popup.domNode, 'height', this.height);
                        dojo.style(dojo.query('.dijitDialogPaneContent',this.popup.domNode),'height', this.height);
                        dojo.style(dojo.query('.dijitDialogPaneContent',this.domNode),'height', this.height);
                    }
                }
                
                if(!this.shown) {
                    this._createButtonPanel();
                }
                
                this._createButtons();
                
               this.popup.show();
               this.shown = true;
            },
            hide: function(){
               return this.popup.hide();
            },
            destroy: function(){
               this.popup.destroy();
            },
            
            destroyRecursive: function() {
              this.popup.destroyRecursive();
              dojo.empty(this.domNode);
            },

            buildRendering: function(){ 
            
            if(this.templatePath) {
                this.templateString = null;
            }
            
               this.inherited(arguments);
            if( this.templateString== '<div></div>') {
                this.popup.buildRendering();
                }
            },

        _attachTemplateNodes: function(rootNode, getAttrFunc){
            this.inherited(arguments);
        },

        _fillContent: function(/*DomNode*/ source){

            if(!this.templatePath && this.templateString == '<div></div>') {
                this.templateBased = false;
                this.width = ''+dojo.style(source, 'width')+'px';
                this.height = ''+dojo.style(source, 'height')+'px';
                if(dojo.hasClass(source, 'hidden' )) {
                    dojo.removeClass(source,'hidden');
                }
//                this.templateString = source.innerHTML;
                this._attachTemplateNodes(source);
                this.source = source;
//                this.popup = new dijit.Dialog();
                this.popup = new dijit.Dialog({title: this.title, content: this.source.innerHTML});
                dojo.addClass(this.popup.domNode,'pentaho-dialog');
                dojo.removeClass(this.popup.domNode,'hidden');
                dojo.addClass(dojo.query('.dijitDialogTitleBar',this.popup.domNode)[0],'Caption');
            } else {
                this.templateBased = true;
                this.popup = new dijit.Dialog();
//                this.popup.attr("content", this.domNode);
            }
            this.inherited(arguments);            
		},
    
    registerOnCancelCallback: function(f) {
      this._onCancelCallback = f;
    },
    
    /*
     * Called when the close icon is clicked.
     */
    onCancel: function() {
      if (this._onCancelCallback) {
        try {
          this._onCancelCallback();
        } catch (e) {
          console.warn("error in onCancelCallback: " + e);
        }
      }
      this.hide();
    },

    onHide: function() {
      // Callback when popup.onHide() is called
    }
});
