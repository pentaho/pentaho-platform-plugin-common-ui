/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "dojo/_base/declare",
  "dijit/_WidgetBase",
  "dijit/_Templated",
  "dojo/on",
  "dojo/query",
  "pentaho/common/SmallImageButton",
  "dojo/text!pentaho/common/SectionHeader.html",
  "dojo/_base/lang",
  "common-ui/util/xss"
], function (declare, _WidgetBase, _Templated, on, query, SmallImageButton, templateStr, lang, xssUtil) {
  return declare("pentaho.common.SectionHeader", [_WidgetBase, _Templated], {
    title: '',

    header: 'header',

    buttonTypes: '',

    headerButtons: [],

    id: '',

    buttonInfo: [],

    height: '20px',

    templateString: templateStr,

    postMixInProperties: function () {
      this.inherited(arguments);
    },

    postCreate: function () {
      this.inherited(arguments);
      if (this.buttonTypes && this.buttonTypes.length > 0) {
        var list = this.buttonTypes.split(',');
        var buttonInfo = [];
        for (var idx = 0; idx < list.length; idx++) {
          var info = {
            baseClass: list[idx],
            id: '' + this.id + '-button-' + idx,
            title: '',
            callback: lang.hitch(this, this.buttonClick, idx)
          };
          buttonInfo.push(info);
        }
        this.setButtons(buttonInfo);
      }
    },

    setButtons: function (buttonInfo) {
      this.buttonInfo = buttonInfo;
      this.headerButtons = [];
      for (var idx = 0; idx < buttonInfo.length; idx++) {
        var button = new SmallImageButton(buttonInfo[idx]);
        this.headerButtons.push(button);
        // the the button to the section.
        var cell = this.table.rows[0].insertCell(-1);
        cell.appendChild(button.domNode);
      }
    },

    buttonClick: function (idx) {
      if (this.callbacks && idx < this.callbacks.length) {
        this.callbacks[idx](this.headerButtons[idx].id);
      }
    },

    setHeader: function (/*String*/ header) {
      this.header = header;
      xssUtil.setHtml(this.headerNode, header);
    }
  });
});
