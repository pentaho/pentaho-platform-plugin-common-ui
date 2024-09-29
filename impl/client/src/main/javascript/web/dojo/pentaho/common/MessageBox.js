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
  "dijit/_WidgetBase",
  "dijit/_Templated",
  "dojo/dom-class",
  "dojo/on",
  "dojo/query",
  "common-ui/dompurify",
  "pentaho/common/button",
  "pentaho/common/Dialog",
  "dojo/text!pentaho/common/MessageBox.html",
], (declare, _WidgetBase, _Templated, domClass, on, query, DOMPurify, button, Dialog, templateStr) =>
  declare("pentaho.common.MessageBox", [Dialog], {
    buttons: ["btn1", "btn2", "btn3"],
    messageType: null, // Options are null, ERROR, WARN, INFO
    responsive: true, // Not intended to be set to false.
    responsiveClasses: "dw-sm",

    setTitle(title) {
      this.titleNode.innerHTML = DOMPurify.sanitize(title);
    },

    postCreate() {
      this.inherited(arguments);
      this.setMessageType(this.messageType);
    },

    setMessageType(/* String */ type) {
      this.messageType = type;
      if (type != null) {
        if (type === "ERR" || type === "ERROR") {
          domClass.replace(this.typeIcon, "error-large-icon", "warning-large-icon info-large-icon");
        } else if (type === "WARN" || type === "WARNING") {
          domClass.replace(this.typeIcon, "warning-large-icon", "error-large-icon info-large-icon");
        } else {
          domClass.replace(this.typeIcon, "info-large-icon", "error-large-icon warning-large-icon");
        }
      } else {
        // Remove the image
        domClass.remove(this.typeIcon, "error-large-icon info-large-icon warning-large-icon");
      }
    },

    setMessage(message) {
      this.messagelbl.innerHTML = DOMPurify.sanitize(message);
    },

    setButtons(buttons) {
      this.buttons = buttons;

      for (let i = 0; i < 3; i++) {
        const buttonNode = query(`button${i}`, this.popup.domNode);

        if (buttonNode) {
          if (i < this.buttons.length) {
            const { [i]: buttonText } = this.buttons;
            buttonNode.innerHTML = DOMPurify.sanitize(buttonText);

            domClass.remove(buttonNode, "hidden");
          } else {
            domClass.add(buttonNode, "hidden");
          }
        }
      }
    },

    templateString: templateStr,
  }));
