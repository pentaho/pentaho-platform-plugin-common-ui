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

define([
        "dojo/_base/declare",
        "dijit/form/DateTextBox",
        "dijit/Calendar",
        "dojo/text!pentaho/common/DropDownBox.html",
        "pentaho/common/Calendar"],
    function (declare, DateTextBox, dijitCalendar, templateStr, pentahoCalendar) {
        return declare("pentaho.common.DateTextBox", [DateTextBox], {
                templateString: templateStr,
                popupClass: pentahoCalendar
            }
        );
    });

