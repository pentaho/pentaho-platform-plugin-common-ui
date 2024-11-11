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


/**
 * The Prompting API Class
 * This is a simple and concise mechanism for easily plugging prompting.
 *
 * @name PromptingAPI
 * @param {String} id HTML object id where to render the prompt panel
 * @param {Object} [options] Extra options to be passed to the prompt renderer constructor
 * @class
 * @property {OperationAPI} operation The prompting operation API
 * @property {EventAPI} event The prompting event API
 * @property {UiAPI} ui The prompting ui API
 * @property {UtilAPI} util The prompting utility API
 * @property {Object} log The console logger of prompting API
 */
define(["./OperationAPI", "./EventAPI", "./UiAPI", "./UtilAPI"], function(OperationAPI, EventAPI, UiAPI, UtilAPI) {
  var API = function(id, options) {
    this.log = {
      info: function(msg) {
        console.log(msg);
      },
      warn: function(msg) {
        console.warn(msg)
      },
      error: function(msg, throwException) {
        if (throwException) {
          throw (msg instanceof Error) ? msg : new Error(msg);
        }
        console.error(msg);
      }
    };

    if (!id) {
      this.log.error(API._msgs.NO_ID, true);
    }

    this.operation = new OperationAPI(this, id, options);
    this.util = new UtilAPI(this);
    this.ui = new UiAPI(this);
    this.event = new EventAPI(this);
  };

  API._msgs = {
    NO_ID: "An HTML id for the prompt panel is required."
  };

  return API;
});
