/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query", 'pentaho/common/button'
  , 'pentaho/common/SmallImageButton', "dojo/dom-class", "dojo/text!pentaho/common/TemplatePickerEmbed.html",
  "dojo/_base/lang"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, button, SmallImageButton, domClass, templateStr, lang) {
      return declare("pentaho.common.TemplatePickerEmbed",[_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
          {
            buttons: [],

            templates: [],

            pageNo: 0,

            hasTitleBar: false,

            hasBorder: false,

            templateSelectedCallback: null,

            templateString: templateStr,

            updatePageArrows: function () {
              if (this.prevSetBtn.set) {
                this.prevSetBtn.set('disabled', this.pageNo == 0);
              }
              if (this.nextSetBtn.set) {
                this.nextSetBtn.set('disabled', (this.pageNo + 1) * 6 >= this.templates.length);
              }
            },

            setTemplates: function (templates) {
              this.templates = templates;
              this.showPage();
              this.updatePageArrows();
            },

            showPage: function () {
              var start = this.pageNo * 6;
              for (var idx = 0; idx < 6; idx++) {

                if (idx + start < this.templates.length) {
                  this['templateImg' + idx].src = this.templates[idx + start].imagePath;
                  if (this.templates[idx + start].description && this.templates[idx + start].description != null) {
                    this['templateImg' + idx].title = this.templates[idx + start].description;
                  }
                  this['templateName' + idx].innerHTML = this.templates[idx + start].name;
                  domClass.remove(this['templateImg' + idx], 'hidden');
                  domClass.add(this['templateName' + idx], 'fadeEmbed');
                  if (this.templates[idx + start].selected) {
                    domClass.add(this['templateName' + idx], 'pentaho-selection-dialog-selected');
                    domClass.add(this['templateImgCell' + idx], 'pentaho-selection-dialog-selected');
                    domClass.remove(this['templateName' + idx], 'pentaho-selection-dialog-unselected');
                    domClass.remove(this['templateImgCell' + idx], 'pentaho-selection-dialog-unselected');
                  } else {
                    domClass.add(this['templateName' + idx], 'pentaho-selection-dialog-unselected');
                    domClass.add(this['templateImgCell' + idx], 'pentaho-selection-dialog-unselected');
                    domClass.remove(this['templateName' + idx], 'pentaho-selection-dialog-selected');
                    domClass.remove(this['templateImgCell' + idx], 'pentaho-selection-dialog-selected');
                  }
                } else {
                  domClass.add(this['templateImg' + idx], 'hidden');
                  domClass.remove(this['templateName' + idx], 'fadeEmbed');
                  domClass.add(this['templateImgCell' + idx], 'pentaho-selection-dialog-unselected');
                  domClass.remove(this['templateImgCell' + idx], 'pentaho-selection-dialog-selected');
                  domClass.remove(this['templateName' + idx], 'pentaho-selection-dialog-selected');
                  this['templateName' + idx].innerHTML = '';
                }
              }
              this.updatePageArrows();
            },

            postCreate: function () {
              this.inherited(arguments);
              this.prevSetBtn.callback = lang.hitch(this, this.prevPage);
              this.nextSetBtn.callback = lang.hitch(this, this.nextPage);

              for (var idx = 0; idx < 6; idx++) {
                on(this['templateImg' + idx], 'click', lang.hitch(this, 'imgClick'));
                on(this['templateName' + idx], 'click', lang.hitch(this, 'imgClick'));
                on(this['templateImg' + idx], 'dblclick', lang.hitch(this, 'imgDblClick'));
                on(this['templateName' + idx], 'dblclick', lang.hitch(this, 'imgDblClick'));
                on(this['templateImgCell' + idx], 'mouseover', lang.hitch(this, 'mouseOver'));
                on(this['templateImgCell' + idx], 'mouseout', lang.hitch(this, 'mouseOut'));
                on(this['templateName' + idx], 'mouseover', lang.hitch(this, 'mouseOver'));
                on(this['templateName' + idx], 'mouseout', lang.hitch(this, 'mouseOut'));
              }

            },

            mouseOver: function (event) {
              var idx = parseInt(dojo.attr(event.target, 'idx'));

              if (this.templates[idx] && this.templates[idx].selected) {
                return;
              }

              var node = this['templateImgCell' + idx];
              if (node) {
                domClass.add(node, 'pentaho-selection-dialog-hover');
              }
              var node = this['templateName' + idx];
              if (node) {
                domClass.add(node, 'pentaho-selection-dialog-hover');
              }
            },

            mouseOut: function (event) {
              var idx = parseInt(event.target.getAttribute('idx'));
              var node = this['templateImgCell' + idx];
              if (node) {
                domClass.remove(node, 'pentaho-selection-dialog-hover');
              }
              var node = this['templateName' + idx];
              if (node) {
                domClass.remove(node, 'pentaho-selection-dialog-hover');
              }
            },

            imgDblClick: function (event) {
              var idx = parseInt(event.target.getAttribute('idx'));
              var templateNo = this.pageNo * 6 + idx;
              if (this.templateDblClickCallback) {
                this.templateDblClickCallback(templateNo);
              }
            },

            imgClick: function (event) {
              var idx = parseInt(event.target.getAttribute('idx'));
              var templateNo = this.pageNo * 6 + idx;
              this.select(idx, templateNo);
              if (this.templateSelectedCallback) {
                this.templateSelectedCallback(templateNo);
              }
            },

            prevPage: function () {
              if (this.pageNo == 0) {
                return;
              }
              this.pageNo--;
              this.showPage();
            },

            nextPage: function () {
              if ((this.pageNo + 1) * 6 >= this.templates.length) {
                return;
              }
              this.pageNo++;
              this.showPage();
            },

            select: function (idx, templateNo) {
              for (var n = 0; n < this.templates.length; n++) {
                this.templates[n].selected = false;
              }
              this.templates[templateNo].selected = true;
              var node = this['templateImgCell' + idx];
              domClass.remove(node, 'pentaho-selection-dialog-hover');
              var node = this['templateName' + idx];
              domClass.remove(node, 'pentaho-selection-dialog-hover');
              this.showPage();
            }

          });
    });
