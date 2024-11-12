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


define(["dojo/_base/declare", "dijit/MenuSeparator",
  "dojo/text!pentaho/common/MenuSeparator.html"],
    function (declare, MenuSeparator, templateStr) {
      return declare("pentaho.common.MenuSeparator",[MenuSeparator],
          {
            // summary:
            //		A line between two menu items

            templateString: templateStr

          }
      );
    });
