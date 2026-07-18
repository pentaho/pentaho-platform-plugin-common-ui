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


define(["dojo/_base/declare", "dijit/form/DropDownButton", "dojo/text!pentaho/common/DropDownButton.html"],
    function (declare, DropDownButton, templateStr) {
      return declare("pentaho.common.DropDownButton",[DropDownButton],
          {

            baseClass: "dijitDropDownButton",

            templateString: templateStr
          });
    });

