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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/_base/lang", "dojo/text!pentaho/common/button.html", "dojo/on"],
  function(declare, _WidgetBase, _Templated, lang, templateStr, on){
    return declare("pentaho.common.button",
      [_WidgetBase, _Templated],
      {
          label : 'a button',

          onClick: function() {
              this.callback();
          },

          callback: null,

          templateString: templateStr,

          postMixInProperties: function() {
              this.inherited(arguments);
          },

          postCreate: function() {
              this.inherited(arguments);
              on(this.button, "click", lang.hitch( this,  this.onClick));
          }
        }
    );
});
