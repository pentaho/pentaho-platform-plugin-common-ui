/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/


 define(["dojo/_base/declare", "dijit/PopupMenuItem","pentaho/common/MenuItem", "dojo/dom-class"],
  function(declare, PopupMenuItem, MenuItem, domClass){
    return declare("pentaho.common.PopupMenuItem",[PopupMenuItem, MenuItem], {
      baseClass: "pentaho-menuitem",

      _setSelected: function(selected){
          if(!this.disabled) {
              domClass.toggle(this.domNode, "pentaho-menuitem-hover", selected);
          }
      }
    }
   )
 });
