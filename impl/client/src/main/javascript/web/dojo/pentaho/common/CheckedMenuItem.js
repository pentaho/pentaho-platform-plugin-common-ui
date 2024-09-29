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



define(["dojo/_base/declare", "dijit/CheckedMenuItem","dojo/text!pentaho/common/CheckedMenuItem.html","dojo/dom-class"],
  function(declare, CheckedMenuItem, templateStr, domClass){
    return declare("pentaho.common.CheckedMenuItem",[CheckedMenuItem],
      {

        templateString: templateStr,

        _setCheckedAttr: function(/*Boolean*/ checked){
          // summary:
          //		Hook so attr('checked', bool) works.
          //		Sets the class and state for the check box.
          domClass.toggle(this.iconNode, "menuitem-checked", checked);
          this.domNode.setAttribute("checked", checked);
          this._set("checked", checked);
        },

        _setSelected: function(selected){
            if(!this.disabled) {
                domClass.toggle(this.domNode, "pentaho-menuitem-hover", selected);
            }
        }

      }
    );
  });
