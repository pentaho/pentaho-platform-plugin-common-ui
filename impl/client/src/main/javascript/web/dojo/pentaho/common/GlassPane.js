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

define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojo/dom-construct", "dojo/dom-style"],
    function (declare, _WidgetBase, _Templated, on, query, construct, style) {
      return declare("pentaho.common.GlassPane",[_WidgetBase],
          {

            _glassPaneDiv: null,

            create: function (/*Object?*/params, /*DomNode|String?*/srcNodeRef) {
              this.inherited(arguments);
              this._glassPaneDiv = construct.create('div', {
                id: 'glasspane',
                className: 'glasspane'
              });
              document.body.appendChild(this._glassPaneDiv);
            },

            show: function () {
              style.set(this._glassPaneDiv, "display", "block")
            },

            hide: function () {
              style.set(this._glassPaneDiv, "display", "none")
            }

          }
      );
    });

