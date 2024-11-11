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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query",
"pentaho/common/button", "pentaho/common/Dialog", "dojo/text!pentaho/common/SplashScreen.html"],
    function(declare, _WidgetBase, _Templated, on, query, button, Dialog, templateStr){
      return declare("pentaho.common.SplashScreen", [Dialog],
     {
        buttons: ['ok'],
        imagePath: '',
        hasTitleBar: false,
        responsive: true, // Not intended to be set to false.
        responsiveClasses: "dw-sm",
        
        setTitle: function(title) {
            this.splashtitle.innerHTML = title;
        },

        setText: function(text) {
            this.splashmessage.innerHTML = text;
        },
    
        setButtonText: function(text) {
            this.buttons[0] = text;
            query("#button"+0, this.domNode).innerHTML = text;
        },
    
        templateString: templateStr,
      
       postCreate: function() {
           this.inherited(arguments);
       }
       
    }
);
    });
