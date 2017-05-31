/*!
 * Copyright 2010 - 2017 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", 'pentaho/common/SmallImageButton',
  'pentaho/common/ListBox',
  'pentaho/common/Dialog',
  'pentaho/common/MessageBox', "dojo/_base/lang", 'dojo/text!pentaho/common/datasourceselect.html',
  'dojo/Stateful', 'dojo/has', 'dojo/_base/sniff'],
  function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, SmallImageButton, ListBox, Dialog, MessageBox, lang, templateStr, Stateful, has) {
    return declare("pentaho.common.datasourceselect", [Stateful, Dialog, _TemplatedMixin, _WidgetsInTemplateMixin],

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
        buttons: ['Ok_txt', 'Cancel_txt'],
        scrollPosition: 0,

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
        setModelList: function (list) {
          this.models = list;

          this.modelList.clearOptions();
          for (var idx = 0; idx < list.length; idx++) {
            var opt = new Option(list[idx].name, list[idx].id);
            this.modelList.addOption(opt);
          }
          if (list.length > 0) {
            this.modelList.set('value', list[0].id);
            this.datasourceSelected();
          }
        },

        onModelDblClick: function (x) {
          this.buttonClick(0);
        },

        getSelectedModel: function () {
          var idx = this.modelList.selectedIndex;
          return this.models[idx];
        },

        setSelectedIndex: function (idx) {
          this.modelList.set('value', this.models[idx]);
          this.modelList.selectedIndex = idx;
//            this.modelList.focus();
          this.datasourceSelected();
        },

        setCanDataSourceAdmin: function (state) {
          if (state) {
            this.canDataSourceAdmin = window.parent && window.parent.pho && window.parent.pho.openEditDatasourceEditor;
          } else {
            this.canDataSourceAdmin = false;
          }
          this.disableDatasourceAdminButtons();
          this.enableIconButton(this.adddatasourceimg, this.canDataSourceAdmin, this.addDatasource);
        },

        datasourceSelected: function () {
          var id = this.modelList.get('value');
          var model = this.getModel(id);
          var enable = model.modelId == 'MODEL_1' && this.canDataSourceAdmin;
          this.enableIconButton(this.editdatasourceimg, enable, this.editDatasource);
          this.enableIconButton(this.deletedatasourceimg, enable, this.deleteDatasource);
          this.enableIconButton(this.adddatasourceimg, this.canDataSourceAdmin, this.addDatasource);
        },

        enableIconButton: function (button, enabled, func) {
          var e = button;
          var src = e.src;
          if (this.canDataSourceAdmin && enabled) {
            button.set('disabled', false);
          }
          else if (!enabled) {
            button.set('disabled', true);
          }
        },

        _localize: function () {
          this.inherited(arguments);
          this.set("title", this.getLocaleString("modelSelectDialog_title"));
          this.modelSelectDialogComment.innerHTML = this.getLocaleString("modelSelectDialogComment_content");
          this.datasourcelistlbl.innerHTML = this.getLocaleString("datasourcelistlbl_content");
          this.editdatasourceimg.title = this.getLocaleString("editdatasourceimg_title");
          this.adddatasourceimg.title = this.getLocaleString("adddatasourceimg_title")
          this.deletedatasourceimg.title = this.getLocaleString("deletedatasourceimg_title");
        },

        templateString: templateStr,

        postCreate: function () {
          this.inherited(arguments);
          this.modelList.onChange = lang.hitch(this, this.datasourceSelected);
          on(this.adddatasourceimg.buttonImg, "click", lang.hitch( this,  this.addDatasource));
          on(this.editdatasourceimg.buttonImg, "click", lang.hitch( this,  this.editDatasource));
          on(this.deletedatasourceimg.buttonImg, "click", lang.hitch( this,  this.deleteDatasource));
          on(this.modelList.menuNode, "dblclick", lang.hitch( this,  this.onModelDblClick)); //[PIR-439]

          // workaround to make scrollbar somewhat usable in IE8
          if(has("ie") == 8){

            // remember scroll position
            on(this.modelList.menuOuterNode, "scroll", lang.hitch(this, this.retainScrollPosition));

            // apply scroll position whenever possible
            on(this, "focus", lang.hitch(this, this.applyScrollPosition));
            on(this, "blur", lang.hitch(this, this.applyScrollPosition));
            on(this, "mouseover", lang.hitch(this, this.applyScrollPosition));
            on(this, "mouseout", lang.hitch(this, this.applyScrollPosition));
          }

        },

        retainScrollPosition: function () {
          this.scrollPosition = this.modelList.menuOuterNode.scrollTop;
        },

        applyScrollPosition: function () {
          window.setTimeout(lang.hitch( this, function(){
            if(this.modelList.menuOuterNode.scrollTop === 0){
              this.modelList.menuOuterNode.scrollTop = this.scrollPosition;
            }
          }), 0);
        },

        addDatasource: function () {

          if (this.adddatasourceimg.disabled) {
            return;
          }

          var callbacks = {
            onError: function (val) {
              if(console){
                console.log("Error with Datasource Editor", val);
              }
            },
            onCancel: function () {
            },
            onReady: function () {
            }
          };
          callbacks.onFinish = lang.hitch(this, this.datasourceAddCallback);

          if (window.parent && window.parent.pho && window.parent.pho.openDatasourceEditor) {
            window.parent.pho.openDatasourceEditor(callbacks);
          }
        },

        editDatasource: function () {

          if (this.editdatasourceimg.disabled) {
            return;
          }

          if (this.canDataSourceAdmin && window.parent && window.parent.pho && window.parent.pho.openEditDatasourceEditor) {
            if (this.modelList.selectedIndex == -1) {
              // nothing is selected
              return false;
            }
            var id = this.modelList.get('value');
            // find the model
            var callbacks = {
              onError: function (val) {
                if(console){
                  console.log("Error with Datasource Editor", val);
                }
              },
              onCancel: function () {
              },
              onReady: function () {
              }
            }

            callbacks.onFinish = lang.hitch(this, this.datasourceEditCallback);

            var model = this.getModel(this.modelList.get('value'));
            window.parent.pho.openEditDatasourceEditor(model.domainId, model.modelId, callbacks);
          }
        },

        deleteDatasource: function () {

          if (this.deletedatasourceimg.disabled) {
            return;
          }

          if (this.canDataSourceAdmin && window.parent && window.parent.pho && window.parent.pho.openEditDatasourceEditor) {
            if (this.modelList.selectedIndex == -1) {
              // nothing is selected
              return false;
            }

            if (!this.msgBox) {
              this.msgBox = registry.byId('messagebox');
              this.msgBox.setLocalizationLookupFunction(this.getLocaleString);
            }

            this.msgBox.buttons = [this.getLocaleString('Ok'), this.getLocaleString('Cancel')];
            this.msgBox.setTitle(this.getLocaleString('Warning'));
            this.msgBox.setMessage(this.getLocaleString('DeleteDatasourceWarning'));
            this.msgBox.callbacks = [
              lang.hitch(this, this.deleteDatasource2),
              lang.hitch(this, function () {
                this.msgBox.hide()
              })
            ];

            this.msgBox.show();
          }
        },


        deleteDatasource2: function () {

          this.msgBox.hide();

          var callbacks = {
            onError: function (val) {
              alert('error:' + val);
            },
            onCancel: function () {
            },
            onReady: function () {
            }
          }

          callbacks.onFinish = lang.hitch(this, this.datasourceDeleteCallback);

          window.parent.pho.deleteModel(this.models[this.modelList.selectedIndex].domainId,
              this.models[this.modelList.selectedIndex].modelId, callbacks);

        },

        disableDatasourceAdminButtons: function () {
          this.enableIconButton(this.editdatasourceimg, false);
          this.enableIconButton(this.deletedatasourceimg, false);
          this.enableIconButton(this.adddatasourceimg, false);
        }
      });
  });
