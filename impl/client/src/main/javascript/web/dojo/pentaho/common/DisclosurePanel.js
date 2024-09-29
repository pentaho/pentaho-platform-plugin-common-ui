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


define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dijit/TitlePane", "dojo/text!pentaho/common/DisclosurePanel.html"],
    function(declare, _WidgetBase, _Templated, on, query, TitlePane, templateStr){
      return declare("pentaho.common.DisclosurePanel" ,[TitlePane],
	    {
        templateString: templateStr,

        baseClass: "",
        
        duration: 0,
        
        _setCss: function(){
        },

        postCreate: function(){
            this.toggleable = false;
            this.inherited(arguments);
            this.toggleable = true;
        },

        _setOpenAttr: function(/*Boolean*/ open, /*Boolean*/ animate){

            this.hideNode.style.display = open ? "" : "none";
            this.arrowNode.className = open ? "pentaho-disclosure-panel-openicon" : "pentaho-disclosure-panel-closeicon";
            this._set("open", open);
            
        }
    
      });
    });

