/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2025 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "dojo/_base/declare",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/on",
  "dojo/query",
  "dojo/dom-style",
  "pentaho/common/FieldsetPane",
  "pentaho/common/Messages",
  "pentaho/common/DisableablePanel",
  "dijit/layout/_LayoutWidget",
  "dijit/layout/ContentPane",
  "pentaho/common/Messages",
  "dojo/text!pentaho/common/FieldsetPane.html",
  "common-ui/util/xss"
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, on, query, style, FieldsetPane, Messages,
             DisableablePanel, _LayoutWidget, ContentPane, Messages, templateStr, xssUtil) {
  return declare("pentaho.common.FieldsetPane",[DisableablePanel, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString: templateStr,
    title: "title",
    width: "100%",
    getLocalString: pentaho.common.Messages.getString,

    postCreate: function () {
      this.inherited(arguments);
      this._localize();
    },

    _localize: function () {
      var localTitle = this.getLocalString(this.title);
      if (localTitle != this.title) {
        this.setTitle(localTitle);
      }
    },

    setTitle: function (/*String*/ title) {
      this.title = title;
      xssUtil.setHtml(this.titleNode, title);
    },

    layout: function () {
      var box = this._borderBox;
      var container = this.containerNode;
      var header = this.titleNode;
      var padding = 20;
      style.set(container, {
        height: (box.h - header.offsetHeight - padding) + "px"
      });
    }
  });
});
