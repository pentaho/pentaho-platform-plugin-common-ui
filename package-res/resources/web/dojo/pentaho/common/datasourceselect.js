dojo.provide('pentaho.common.datasourceselect');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('pentaho.common.SmallImageButton');
dojo.require('pentaho.common.ListBox');
dojo.require('pentaho.common.Dialog');
dojo.require('pentaho.common.MessageBox');
dojo.declare(
     'pentaho.common.datasourceselect',
     [pentaho.common.Dialog],
     {
        getModel: null,
        modelSelected: null,
        canDataSourceAdmin: false,
        datasourceEditCallback: null,
        datasourceAddCallback: null,
        datasourceDeleteCallback: null,
        datasourceWizardIncluded: false,
        datasourceEditorPath: '',
        models: null,
        buttons: ['Ok_txt','Cancel_txt'],
        
        /* dynamic injection of the wizard does not work currently
        includeDatasourceWizard: function() {
            if(this.datasourceWizardIncluded) {
                return;
            }
            var docHead = document.getElementsByTagName("head")[0];
            var tag = document.createElement("link");
            tag.setAttribute("rel", "stylesheet");
            tag.setAttribute("type", "text/css");
            tag.setAttribute("href", this.datasourceEditorPath+"datasourceEditorDialog.css");
            docHead.appendChild(tag);
            
            var tag = document.createElement("script");
            tag.setAttribute("type", "text/javascript");
            tag.setAttribute("src", this.datasourceEditorPath+"DatasourceEditor.nocache.js");
            docHead.appendChild(tag);
            
        },
        */
        setModelList: function(list) {
            this.models = list;

            this.modelList.clearOptions();			
            for( var idx=0; idx<list.length; idx++ ) {
                var opt = new Option( list[idx].name, list[idx].id );
                this.modelList.addOption(opt);			
            }
            if(list.length>0) {
                this.modelList.set('value', list[0].id);
                this.datasourceSelected();
            }
        },
        
        onModelDblClick: function(x) {
            this.buttonClick(0);
        },
        
        getSelectedModel: function() {
            var idx = this.modelList.selectedIndex;
            return this.models[idx];
        },
        
        setSelectedIndex: function(idx) {
            this.modelList.set('value',this.models[idx]);
            this.modelList.selectedIndex = idx;
//            this.modelList.focus();
            this.datasourceSelected();
        },
        
        setCanDataSourceAdmin: function(state) {
            if(state) {
                this.canDataSourceAdmin = window.parent && window.parent.pho && window.parent.pho.openEditDatasourceEditor;
            } else {
                this.canDataSourceAdmin = false;
            }
            this.disableDatasourceAdminButtons();
            this.enableIconButton(this.adddatasourceimg,this.canDataSourceAdmin, this.addDatasource);
        },
        
        datasourceSelected: function() {
            var id = this.modelList.get('value');
            var model = this.getModel(id);
            var enable = model.modelId == 'MODEL_1' && this.canDataSourceAdmin;
            this.enableIconButton(this.editdatasourceimg, enable, this.editDatasource);
            this.enableIconButton(this.deletedatasourceimg, enable, this.deleteDatasource);
            this.enableIconButton(this.adddatasourceimg,this.canDataSourceAdmin, this.addDatasource);
        },
        
        enableIconButton: function(button, enabled, func) {
            var e = button;
            var src = e.src;
            if(this.canDataSourceAdmin && enabled) {
                button.set('disabled', false);
            }
            else if(!enabled) {
                button.set('disabled', true);
            }
        },

      _localize: function() {
        this.inherited(arguments);
        this.set("title",this.getLocaleString("modelSelectDialog_title"));
        this.modelSelectDialogComment.innerHTML = this.getLocaleString("modelSelectDialogComment_content");
        this.datasourcelistlbl.innerHTML =  this.getLocaleString("datasourcelistlbl_content");
        this.editdatasourceimg.title =  this.getLocaleString("editdatasourceimg_title");
        this.adddatasourceimg.title =  this.getLocaleString("adddatasourceimg_title")
        this.deletedatasourceimg.title =  this.getLocaleString("deletedatasourceimg_title");
      },

        templatePath: dojo.moduleUrl('pentaho.common', 'datasourceselect.html'),

           postCreate: function() {
               this.inherited(arguments);
               this.modelList.onChange = dojo.hitch(this, this.datasourceSelected);
               dojo.connect(this.adddatasourceimg.buttonImg, "onclick", this, this.addDatasource);
               dojo.connect(this.editdatasourceimg.buttonImg, "onclick", this, this.editDatasource);
               dojo.connect(this.deletedatasourceimg.buttonImg, "onclick", this, this.deleteDatasource);
               dojo.connect(this.modelList.menuNode, "onDblClick", this, this.onModelDblClick); //[PIR-439]
           },
           
            addDatasource: function() {
                    
                if(this.adddatasourceimg.disabled) {
                    return;
                }
                
                var callbacks = {
                    onError : function(val) {
                        alert('error:' + val);
                    },
                    onCancel : function() {
                        alert('cancelled');
                    },
                    onReady : function() {
                    }
                };
                callbacks.onFinish = dojo.hitch(this, this.datasourceAddCallback);
            
                if(window.parent && window.parent.pho && window.parent.pho.openDatasourceEditor) {
                    window.parent.pho.openDatasourceEditor ( callbacks );
                }
            },

            editDatasource: function() {

 		        if(this.editdatasourceimg.disabled) {
                    return;
                }
        
                if(this.canDataSourceAdmin && window.parent && window.parent.pho && window.parent.pho.openEditDatasourceEditor) {
                    if( this.modelList.selectedIndex == -1 ) {
                        // nothing is selected
                        return false;  
                    }
                    var id = this.modelList.get('value');
                    // find the model
                    var callbacks = {
                      onError : function(val) {
                        alert('error:' + val);
                      },
                      onCancel : function() {
                      alert('cancelled');
                      },
                      onReady : function() {
                      }
                    }

                    callbacks.onFinish = dojo.hitch(this, this.datasourceEditCallback);

                    var model = this.getModel(this.modelList.get('value'));
                    window.parent.pho.openEditDatasourceEditor(model.domainId, model.modelId, callbacks);
                }
            },
            
            deleteDatasource: function() {
	
         		if(this.deletedatasourceimg.disabled) {
                    return;
                }
        
                if(this.canDataSourceAdmin && window.parent && window.parent.pho && window.parent.pho.openEditDatasourceEditor) {
                    if( this.modelList.selectedIndex == -1 ) {
                        // nothing is selected
                        return false;  
                    }

                    if(!this.msgBox) {
                        this.msgBox = dijit.byId('messagebox');
                        this.msgBox.setLocalizationLookupFunction(this.getLocaleString);
                    }
    
                    this.msgBox.buttons = [this.getLocaleString('Ok'),this.getLocaleString('Cancel')];
                    this.msgBox.setTitle(this.getLocaleString('Warning'));
                    this.msgBox.setMessage(this.getLocaleString('DeleteDatasourceWarning'));
                    this.msgBox.callbacks = [
                        dojo.hitch(this, this.deleteDatasource2), 
                        dojo.hitch(this, function() {this.msgBox.hide()})
                    ];
                    
                    this.msgBox.show();
                }
            },
            
            
            deleteDatasource2: function() {
        
                this.msgBox.hide();
                
                var callbacks = {
                  onError : function(val) {
                    alert('error:' + val);
                  },
                  onCancel : function() {
                  },
                  onReady : function() {
                  }
                }
                
                callbacks.onFinish = dojo.hitch(this, this.datasourceDeleteCallback);
                
                window.parent.pho.deleteModel(this.models[this.modelList.selectedIndex].domainId, 
                    this.models[this.modelList.selectedIndex].modelId, callbacks);

            },
            
            disableDatasourceAdminButtons: function() {
                this.enableIconButton(this.editdatasourceimg, false);
                this.enableIconButton(this.deletedatasourceimg, false);
                this.enableIconButton(this.adddatasourceimg, false);
            }
      }
);
