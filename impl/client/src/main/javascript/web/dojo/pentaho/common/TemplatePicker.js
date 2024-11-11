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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", 'pentaho/common/button'
  , 'pentaho/common/Dialog', "dojo/dom-class", "dojo/_base/lang", 'dojo/text!pentaho/common/TemplatePicker.html', "common-ui/util/_a11y"],
    function (declare, _WidgetBase, _Templated, on, query, button, Dialog, domClass, lang, templateStr, a11yUtil) {
      return declare("pentaho.common.TemplatePicker",
          [Dialog],
          {
            buttons: [],

            templates: [],

            pageNo: 0,

            hasTitleBar: false,

            hasBorder: false,

            templateSelectedCallback: null,

            responsive: true, // Not intended to be set to false.

            responsiveClasses: "dw-md ds-fill-viewport-width",

            updatePageArrows: function () {
              var isFirstPage = this.pageNo == 0;
              var isLastPage = (this.pageNo + 1) * 6 >= this.templates.length;
              this.prevSetBtn.set('disabled', isFirstPage);
              this.nextSetBtn.set('disabled', isLastPage);
              if (!this.prevSetBtn.get('disabled')) {
                this.prevSetBtn.domNode.focus();
              } else if (!this.nextSetBtn.get('disabled')) {
                this.nextSetBtn.domNode.focus();
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

              this.own(
                  a11yUtil.makeAccessibleActionButton(this.closeBtn.domNode),
                  a11yUtil.makeAccessibleActionButton(this.prevSetBtn.domNode),
                  a11yUtil.makeAccessibleActionButton(this.nextSetBtn.domNode)
              );

              for (var idx = 0; idx < 6; idx++) {
                this.own(
                    on(this['templateImg' + idx], 'click', lang.hitch(this, 'imgClick')),
                    on(this['templateName' + idx], 'click', lang.hitch(this, 'imgClick')),
                    a11yUtil.makeAccessibleActionButton(this['templateImg' + idx])
                );
              }
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
