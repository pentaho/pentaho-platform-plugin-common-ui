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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", 'pentaho/common/button'
  , 'pentaho/common/Dialog', "dojo/dom-class", "dojo/_base/lang", 'dojo/text!pentaho/common/TemplatePicker.html'],
    function (declare, _WidgetBase, _Templated, on, query, button, Dialog, domClass, lang, templateStr) {
      return declare("pentaho.common.TemplatePicker",
          [Dialog],
          {
            buttons: [],

            templates: [],

            pageNo: 0,

            hasTitleBar: false,

            hasBorder: false,

            templateSelectedCallback: null,

            updatePageArrows: function () {
              this.prevSetBtn.set('disabled', this.pageNo == 0);
              this.nextSetBtn.set('disabled', (this.pageNo + 1) * 6 >= this.templates.length);
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
                  this['templateName' + idx].innerHTML = this.templates[idx + start].name;
                  domClass.remove(this['templateImg' + idx], 'hidden');
                  domClass.add(this['templateName' + idx], 'fade');
                } else {
                  domClass.add(this['templateImg' + idx], 'hidden');
                  domClass.remove(this['templateName' + idx], 'fade');
                  this['templateName' + idx].innerHTML = '';
                }
              }
              this.updatePageArrows();
            },

            templateString: templateStr,

            postCreate: function () {
              this.inherited(arguments);
              this.closeBtn.callback = lang.hitch(this, this.closeClick);
              this.prevSetBtn.callback = lang.hitch(this, this.prevPage);
              this.nextSetBtn.callback = lang.hitch(this, this.nextPage);
              on(this.templateImg0, 'click', lang.hitch(this, 'imgClick'));
              on(this.templateImg1, 'click', lang.hitch(this, 'imgClick'));
              on(this.templateImg2, 'click', lang.hitch(this, 'imgClick'));
              on(this.templateImg3, 'click', lang.hitch(this, 'imgClick'));
              on(this.templateImg4, 'click', lang.hitch(this, 'imgClick'));
              on(this.templateImg5, 'click', lang.hitch(this, 'imgClick'));
              on(this.templateName0, 'click',lang.hitch( this, 'imgClick'));
              on(this.templateName1, 'click',lang.hitch( this, 'imgClick'));
              on(this.templateName2, 'click',lang.hitch( this, 'imgClick'));
              on(this.templateName3, 'click',lang.hitch( this, 'imgClick'));
              on(this.templateName4, 'click',lang.hitch( this, 'imgClick'));
              on(this.templateName5, 'click',lang.hitch( this, 'imgClick'));
            },

            imgClick: function (event) {
              // BACKLOG-9334 - prevent a double-click
              var me = this;
              if (!me.clicks) me.clicks = 0;
              ++me.clicks;
              if (me.clicks > 1) {
                return;
              }
              setTimeout(function () {
                me.clicks = 0
              }, 500);

              var idx = parseInt(event.target.getAttribute('idx'));
              var idx = this.pageNo * 6 + idx;
              if (this.templateSelectedCallback) {
                this.templateSelectedCallback(idx);
              }
            },

            closeClick: function () {
              this.buttonClick(0);
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
            }

          });
    });
