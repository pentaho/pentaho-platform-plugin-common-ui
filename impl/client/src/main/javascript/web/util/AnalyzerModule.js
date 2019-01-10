/*!
 * HITACHI VANTARA PROPRIETARY AND CONFIDENTIAL
 *
 * Copyright 2002 - 2019 Hitachi Vantara. All rights reserved.
 *
 * NOTICE: All information including source code contained herein is, and
 * remains the sole property of Hitachi Vantara and its licensors. The intellectual
 * and technical concepts contained herein are proprietary and confidential
 * to, and are trade secrets of Hitachi Vantara and may be covered by U.S. and foreign
 * patents, or patents in process, and are protected by trade secret and
 * copyright laws. The receipt or possession of this source code and/or related
 * information does not convey or imply any rights to reproduce, disclose or
 * distribute its contents, or to manufacture, use, or sell anything that it
 * may describe, in whole or in part. Any reproduction, modification, distribution,
 * or public display of this information without the express written authorization
 * from Hitachi Vantara is strictly prohibited and in violation of applicable laws and
 * international treaties. Access to the source code contained herein is strictly
 * prohibited to anyone except those individuals and entities who have executed
 * confidentiality and non-disclosure agreements or other agreements with Hitachi Vantara,
 * explicitly covering such access.
 */

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/dom-style",
  "dojo/io-query"
], function(declare, lang, domStyle, ioQuery) {

  var privateOptions = {
    "url": true,
    "parentElement": true,
    "reportPath": true,
    "catalog": true,
    "cube": true,
    "dataSource": true,
    "onAnalyzerReady": true,
    "mode": true,
    "useLegacyPath": true
  };

  // set window.onAnalyzer to only execute ready function for the given module
  // also save a reference to its api
  window.onAnalyzerReady = function(api, frameId) {
    // first get the appropriate module
    var thisModule = window.analyzerModules[frameId];

    if(thisModule) {
      // keep this api reference
      thisModule.api = api;

      // call its ready function
      thisModule.onAnalyzerReady(api, frameId);
    }
  };

  // create a place to keep module references
  if(!window.analyzerModules) {
    window.analyzerModules = {};
  }

  /**
   * build query string of provided options to append to iframe src url
   *
   * @param {Object} options
   * @return {string}
   */
  var buildQueryString = function(options) {
    var result = "";

    if(options) {
      var queryObj = {};
      for(var option in options) {
        // don't include the "private" options specific to this module in the url
        if(!privateOptions[option]) {
          queryObj[option] = options[option];
        }
      }

      if(options["cube"]) {
        queryObj["cube"] = options["cube"];
      }

      if(options["catalog"]) {
        queryObj["catalog"] = options["catalog"];
      }

      if(options["dataSource"]) {
        queryObj["dataSource"] = options["dataSource"];
      }

      queryObj["ts"] = new Date().getTime();

      result = ioQuery.objectToQuery(queryObj);
    }

    return result;
  };

  /**
   *
   * @param {Object} options
   * @return {boolean}
   */
  var init = function(options) {
    this.url = options["url"];
    this.parentElement = options["parentElement"];
    this.reportPath = options["reportPath"];
    this.useLegacyPath = options["useLegacyPath"];

    var newReportPath = "/api/repos/xanalyzer/";
    if (this.useLegacyPath) {
      newReportPath = "/content/analyzer/";
    }

    this.moduleOptions = options;

    // if no mode is supplied, default to viewer
    if(!this.moduleOptions["mode"]) {
      this.moduleOptions["mode"] = "viewer";
    }

    if(!this.validateParams(this.moduleOptions)) {
      console.error("One or more required parameters are missing.");
      return false;
    }

    this.analyzerModuleId = (Math.random() * (9999 - 1000 + 1)) + 1000;

    // if we get a string, get the element by id
    if(typeof (this.parentElement) === "string") {
      // set AnalyzerModuleId
      this.analyzerModuleId = this.parentElement;

      // try to get element
      this.documentAnalyzerRoot = document.getElementById(this.parentElement);
    } else if(typeof (this.parentElement) === "object") {
      // if we get an object, use it and try to get an id
      this.documentAnalyzerRoot = this.parentElement;

      // try to get an id
      var idAttribute = this.parentElement.attributes.getNamedItem("id");
      if((idAttribute) && (idAttribute.value !== "")) {
        this.analyzerModuleId = idAttribute.value;
      }
    }

    // set the frameId property
    this.frameId = this.analyzerModuleId + "-iframe";

    // if we don't have an analyzerRoot and moduleId at this point, fail
    if((this.documentAnalyzerRoot == null) || (this.analyzerModuleId == null)) {
      console.error("Unable to find DOM element for Analyzer module root: " + this.parentElement);
      return false;
    }

    window.analyzerModules[this.frameId] = this;

    var fullUrl = "";

    var queryString = buildQueryString(this.moduleOptions);

    if(this.reportPath) {
      // convert slashes to colons
      this.reportPath = this.reportPath.replace(/\//g, ":");
      this.reportPath = this.reportPath.replace(/\\/g, ":");

      if(this.reportPath.substring(this.reportPath.length - 1) === "/") {
        this.reportPath = this.reportPath.substr(0, this.reportPath.length - 1)
      }

      // point to an existing report
      fullUrl = this.url + "/api/repos/" +
        encodeURIComponent(this.reportPath) + "/" + this.moduleOptions["mode"] + "?" +
        queryString;
    } else {
      // create the url
      fullUrl = this.url + newReportPath + this.moduleOptions["mode"] + "?" +
        queryString;

    }

    this.url = fullUrl;

    // create iframe and set attributes
    this.analyzerIframe = document.createElement("iframe");
    this.analyzerIframe.setAttribute("src", this.url);
    this.analyzerIframe.setAttribute("id", this.frameId);
    this.analyzerIframe.setAttribute("height", "100%");
    this.analyzerIframe.setAttribute("width", "100%");
    this.analyzerIframe.setAttribute("frameborder", 0);

    // add it to the dom
    this.documentAnalyzerRoot.appendChild(this.analyzerIframe);
  };

  /**
   * This module allows for deploying and controlling Analyzer in a DOM element.
   * A global collection is maintained for each AnalyzerModule which is initialized,
   * available at window.analyzerModules.
   *
   * @class analyzer.AnalyzerModule
   */
  var AnalyzerModule = declare("common-ui/util/AnalyzerModule", null, /** @lends analyzer.AnalyzerModule# */{
    /**
     * Creates an iframe child of the provided parent element. Also,
     * it generates a URL query string based on the provided module options,
     * plus catalog and cube, or reportPath.
     *
     * Other options include required parameters, as well as parameters which are
     * provided by Analyzer's JavaScript API. Refer to the API documentation for a full list of
     * supported options.
     *
     * The Analyzer Module will fill the height and width to 100% of the parent
     * container.
     *
     * The reportPath option parameter is the repository path to the existing Analyzer report to be opened.
     * If reportPath is not present, then catalog and cube must have values to create
     * a new Analyzer report. If all three option parameters are present, then reportPath takes
     * precedence and the module will attempt to open an existing report located
     * at the path indicated. If reportPath is not present, and catalog and cube are
     * also not present, an error will occur.
     *
     * @constructor
     *
     * @name constructor
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @param {Object} options
     *    An object with properties which correspond to the available JavaScript API functions,
     *    as well as some required properties indicated below.
     *
     * @param {string} options.url
     *    The URL which points to the root of the Hitachi Vantara web application
     *    http://localhost:8080/pentaho
     *
     * @param {string|Object} options.parentElement
     *    The DOM element object or string ID of the DOM element in which to deploy Analyzer
     *
     * @param {string} options.catalog
     *    The catalog to use when creating a new Analyzer report
     *
     * @param {string} options.cube
     *    The cube to use when creating a new Analyzer report
     *
     * @param {string} options.dataSource
     *    Optional: The name of a data service that supplies data for the report. Use this in conjunction with
     *              a url value for that "catalog" parameter that supplies the mondrian model
     *
     * @param {string} options.reportPath
     *    The path which points to an existing Analyzer report to open
     *
     * @param {string} options.mode
     *    Mode in which to open Analyzer. Valid options are: viewer, editor. Defaults to viewer
     *
     * @param {function} options.onAnalyzerReady
     *    Callback function to execute once Analyzer has finished initializing
     *
     * @param {string} options.useLegacyPath
     *    Indicates the decision to use the legacy url path structure when creating a new analyzer report:
     *      when "true"  --> 'content/analyzer/'
     *      when "false" --> 'api/repos/xanalyzer/'
     *    This has no impact on the url path for opening existing reports, those will all be /api/repos/...
     *
     * @example
     *    var options = {
     *      "url" : "http://localhost:8080/pentaho",
     *      "parentElement" : "parentElementId",
     *      "catalog" : "http://localhost:1234/path/to/model",
     *      "cube" : "ExampleCube",
     *      "dataSource" : "DataServiceName"
     *      "mode" : "editor",
     *      "disableFilterPanel" : "true",
     *      "removeFieldLayout" : "true",
     *      "removeFieldList" : "true",
     *      "removeHeaderBar" : "true",
     *      "removeMainToolbar" : "true",
     *      "removeRedoButton" : "true"
     *    }
     *
     * @example
     *    new analyzerModule(options);
     */
    constructor: function(options) {
      this.onAnalyzerReady = (function (api, frameId) {
        this.api = api;

        // if we got onAnalyzerReady, set it as a property on this object
        // window.onAnalyzerReady created above will call the appropriate ready
        // function based on the frameId, and set the api as a property of the module
        if(typeof (options["onAnalyzerReady"]) === "function") {
          // add it to global onAnalyzerReadyFunctions
          options["onAnalyzerReady"](api, frameId);
        }
      }).bind(this);

      init.call(this, options);
    },

    /**
     * Validates the required parameters for the Analyzer module.
     *
     * @name validateParams
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @param options
     * @return {boolean}
     *
     * @example
     *   validateParams(options);
     */
    validateParams: function(options) {
      if(!options) {
        return false;
      }

      var hasCatalogCube = true;
      var hasReportPath = true;

      if(options["url"] == null) {
        console.error("Missing url option parameter");
        return false;
      }

      if((options["parentElement"] == null) || (options["parentElement"] === "")) {
        console.error("Missing parentElement option parameter");
        return false;
      }

      if((options["catalog"] == null) || (options["catalog"] === "")) {
        hasCatalogCube = false;
      }

      if((options["cube"] == null) || (options["cube"] === "")) {
        hasCatalogCube = false;
      }

      if((options["reportPath"] == null) || (options["reportPath"] === "")) {
        hasReportPath = false;
      }

      // if missing both reportPath and catalog/cube, error
      if((hasCatalogCube === false) && (hasReportPath === false)) {
        console.error("Must provide reportPath or catalog/cube combination");
        return false;
      }

      // if both catalog/cube and reportPath are provided, inform the user
      if((hasCatalogCube === true) && (hasReportPath === true)) {
        console.info("Must only provide either reportPath or catalog/cube.");
        console.info("If both are provided, reportPath takes precedence");
      }

      return true;
    },

    /**
     * Shows the Analyzer module when it has been hidden via the hide() method.
     *
     * @name show
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.show()
     */
    show: function() {
      domStyle.set(this.documentAnalyzerRoot, "display", "block");
    },

    /**
     * Hides the Analyzer module when it is visible.
     *
     * @name hide
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.hide()
     */
    hide: function() {
      domStyle.set(this.documentAnalyzerRoot, "display", "none");
    },

    /**
     * Removes the iframe and releases all of its resources.
     *
     * @name dispose
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.dispose()
     */
    dispose: function() {
      document.getElementById(this.parentElement).removeChild(this.analyzerIframe);

      // remove it from list of modules
      delete window.analyzerModules[this.frameId];
    },

    /**
     * Resets the state of the report back to the most recently saved state.
     *
     * @name reset
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.reset()
     */
    reset: function() {
      this.api.operation.resetReport();
    },

    /**
     * Returns the URL generated for the iframe.
     *
     * @name getUrl
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.getUrl()
     */
    getUrl: function() {
      return this.url;
    },

    /**
     * Returns the options used to render.
     *
     * @name getOptions
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.getOptions()
     */
    getOptions: function() {
      return this.moduleOptions;
    },

    /**
     * Returns the parent element of the iframe.
     *
     * @name getParentElement
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.getParentElement()
     */
    getParentElement: function() {
      return this.parentElement;
    },

    /**
     * Returns the reference to the Analyzer API for the loaded object.
     * This method is not safe to use until the onAnalyzerReady function has been called.
     *
     * @name getApi
     * @memberOf analyzer.AnalyzerModule#
     *
     * @method
     *
     * @example
     *    analyzerModule.getApi()
     */
    getApi: function() {
      return this.api;
    }
  });

  return AnalyzerModule;
});
