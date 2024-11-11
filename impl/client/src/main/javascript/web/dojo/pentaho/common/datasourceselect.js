/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojox/html/entities", 'pentaho/common/SmallImageButton',
  'pentaho/common/ListBox',
  'pentaho/common/Dialog',
  'pentaho/common/MessageBox', "dojo/_base/lang", 'dojo/text!pentaho/common/datasourceselect.html',
  'dojo/Stateful', 'dojo/has', "common-ui/util/_a11y", 'dojo/dom', 'dojo/_base/sniff'],
  function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, entities, SmallImageButton, ListBox, Dialog, MessageBox, lang, templateStr, Stateful, has, a11yUtil, dom) {
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
        responsive: true, // Not intended to be set to false.
        responsiveClasses: "dw-md",

        setModelList: function (list) {
          this.models = list;
          var htmlSelect = this.modelList;

          while (htmlSelect.options.length) htmlSelect.remove(0);

          for (var idx = 0; idx < list.length; idx++) {
            var opt = new Option(list[idx].name, list[idx].id);
            htmlSelect.add(opt);
          }

          htmlSelect.selectedIndex = 0;
          this.datasourceSelected();
        },

        onModelDblClick: function (x) {
          this.buttonClick(0);
        },

        getSelectedModel: function () {
          var idx = this.modelList.selectedIndex;
          return this.models[idx];
        },

        setSelectedIndex: function (idx) {
          this.modelList.selectedIndex = idx;
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
          var enable = false;
          if ( this.models.length > 0 ) {
            var id = this.getSelectedModel().id;
            var model = this.getModel(id);
            enable = model.modelId === 'MODEL_1' && this.canDataSourceAdmin;
          } else {
            enable = this.canDataSourceAdmin;
          }
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
          this.own(
            on(this.modelList, "click, keypress", lang.hitch(this, this.datasourceSelected)),
            on(this.adddatasourceimg.buttonImg, "click", lang.hitch(this, this.addDatasource)),
            on(this.editdatasourceimg.buttonImg, "click", lang.hitch(this, this.editDatasource)),
            on(this.deletedatasourceimg.buttonImg, "click", lang.hitch(this, this.deleteDatasource)),
            on(this.modelList, "dblclick", lang.hitch(this, this.onModelDblClick)), //[PIR-439]
            a11yUtil.makeAccessibleActionButton(this.adddatasourceimg.buttonImg),
            a11yUtil.makeAccessibleActionButton(this.editdatasourceimg.buttonImg),
            a11yUtil.makeAccessibleActionButton(this.deletedatasourceimg.buttonImg),
            a11yUtil.makeAccessibleToolbar(dom.byId("toolbar"), {itemFilter: this.isEnabled}));
        },

        isEnabled: function (item) {
          return !isDisabled(item);

          function isDisabled(item) {
            if ((item.getAttribute("aria-disabled") !== "true")) {
              return Array.from(item.classList).some(function (className) {
                return className.toLowerCase().includes("disabled");
              });
            }
            return true;
          }
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

            var id = this.getSelectedModel().id;
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

            var model = this.getModel(id);
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

            this.msgBox.buttons = [this.getLocaleString('Yes'), this.getLocaleString('No')];
            this.msgBox.setTitle(this.getLocaleString('DeleteDatasourceWarningTitle'));
            this.msgBox.setMessage(this.getLocaleString('DeleteDatasourceWarning', entities.encode(this.getSelectedModel().name)));
            this.msgBox.callbacks = [
              lang.hitch(this, this.deleteDatasource2),
              lang.hitch(this, function () {
                this.msgBox.hide();
              })
            ];

            this.msgBox.show();
          }
        },


        deleteDatasource2: function () {
          this.msgBox.popup.setDialogOpener(this.adddatasourceimg.buttonImg);
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
