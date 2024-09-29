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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dojo/query",
  "dojo/text!pentaho/common/SmallImageButton.html", "dojo/dom-class", "dojo/_base/lang"],
    function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, templateStr, domClass, lang) {
      return declare("pentaho.common.SmallImageButton", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
          {
            title: '',

            baseClass: '',
            _imageSrc : require.toUrl("pentaho/common/images/spacer.gif"),

            callback: function () {
            },

            disabled: false,

            onClick: function (event) {

              if (this.callback && !this.get('disabled')) {
                this.callback(event);
              }
            },

            templateString: templateStr,

            mouseOver: function () {
              if (!this.disabled) {
                domClass.add(this.buttonImg, 'pentaho-imagebutton-hover');
              }
            },

            mouseOut: function () {
              if (!this.disabled) {
                domClass.remove(this.buttonImg, 'pentaho-imagebutton-hover');
              }
            },

            set: function (attr, value) {
              this.inherited(arguments);
              if (attr == 'disabled') {
                this.disabled = value;
                domClass.toggle(this.buttonImg, 'pentaho-imagebutton-disabled', this.disabled);
                if (this.disabled) {
                  this.buttonImg.title = '';
                  this.buttonImg.setAttribute("tabindex", "-1");
                } else {
                  this.buttonImg.title = this.title;
                  this.buttonImg.setAttribute("tabindex", "0");
                }
              }
            },

            postMixInProperties: function () {
              this.inherited(arguments);
            },

            postCreate: function () {
              this.inherited(arguments);
              this.buttonImg.className = this.baseClass;
              domClass.toggle(this.buttonImg, 'pentaho-imagebutton-disabled', this.disabled);
              on(this.buttonImg, "click", lang.hitch(this, this.onClick));
              on(this.buttonImg, "mouseover", lang.hitch(this, this.mouseOver));
              on(this.buttonImg, "mouseout", lang.hitch(this, this.mouseOut));
            }
          });
    });
