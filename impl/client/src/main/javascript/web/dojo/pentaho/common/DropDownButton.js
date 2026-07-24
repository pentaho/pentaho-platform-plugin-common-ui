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

define(["dojo/_base/declare", "dijit/form/DropDownButton", "dojo/text!pentaho/common/DropDownButton.html"],
    function (declare, DropDownButton, templateStr) {
      return declare("pentaho.common.DropDownButton",[DropDownButton],
          {

            baseClass: "dijitDropDownButton",

            templateString: templateStr
          });
    });

