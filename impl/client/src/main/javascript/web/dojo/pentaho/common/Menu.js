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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dijit/Menu", "dojo/text!pentaho/common/Menu.html"],
    function (declare, _WidgetBase, _Templated, on, query, Menu, templateStr) {
      return declare("pentaho.common.Menu",
          [Menu],
          {
            baseClass: "pentaho-menu",

            templateString: templateStr
          }
      );
    });

