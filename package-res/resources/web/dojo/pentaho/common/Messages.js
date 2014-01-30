/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojo/_base/lang", "dojo/request", "dojo/i18n", "dojo/string"],
    function (declare, _WidgetBase, _Templated, on, query, lang, request, i18n, string) {
      var moduleDef = declare("pentaho.common.Messages", [], {});

      moduleDef.init = function () {
        if (moduleDef.messageBundle === undefined) {
          moduleDef.messageBundle = {};
        }
      };

      pentaho = typeof pentaho == "undefined" ? {} : pentaho;
      pentaho.common = pentaho.common || {};
      pentaho.common.Messages = pentaho.common.Messages || moduleDef;

      /**
       * Add a resource bundle to the set of resource bundles.
       *
       * @param packageName String the name of the package containing the javascript
       * file with the resource strings.
       * @param fileName String name of the javascript file with the
       * resource strings, without the extention.
       */
      /*public static*/
      moduleDef.addBundle = function (packageName, fileName) {
        // Make sure Dojo doesn't try to load message bundles from any other locales than the default (ROOT).
        // Without the locale override Dojo will attempt to load resources from: ROOT, language, locale (language + variant).
        //     e.g. For English in the US: ROOT, en, en-us
        //          This results in 404s for any message bundle that does not exist as the client has no way of knowing.
        // We should change this to URL bundles exclusively or run a dojo build for all javascript (dataapi, common, etc)

        // Using ambiguated form to defeat dojo parser
        dojo["requireLocalization"](packageName, fileName, "ROOT", "ROOT");
        moduleDef.messageBundle[packageName] = i18n.getLocalization(packageName, fileName);
      };

      /**
       * Finds and returns a registered bundle if it exists.
       *
       * @param {String} name Name of a registered bundle
       * @return {Object} Message bundle as an object of key-value pairs or undefined if not found.
       */
      /*public static*/
      moduleDef.getBundle = function (name) {
        return moduleDef.messageBundle[name];
      }

      /*private static*/
      moduleDef.entityDecoder = document.createElement('textarea');

      /**
       * Get the string from a message bundle referenced by <param>key</param>.
       * @param key String the key in the bundle which references the desired string
       * @param substitutionVars Array of String (optional) an array of strings
       * to substitute into the message string.
       * @return String the string in the message bundle referenced by <param>key</param>.
       */
      /*public static*/
      moduleDef.getString = function (key, substitutionVars) {
        var b, bundle,
            msg = key; // if we don't find the msg, return the key as the msg
        // loop through each message bundle
        for (b in moduleDef.messageBundle) {
          if (moduleDef.messageBundle.hasOwnProperty(b)) {
            bundle = moduleDef.messageBundle[b];
            // does this bundle have the key we are looking for?
            if (bundle.hasOwnProperty(key)) {
              // yes, it has the key
              msg = bundle[key];
              if (undefined != substitutionVars) {
                var subs = {};
                if (typeof substitutionVars == "string") {
                  subs['0'] = substitutionVars;
                }
                else if (typeof substitutionVars == "array") {
                  for (var sNo = 0; sNo < substitutionVars.length; sNo++) {
                    subs['' + sNo] = substitutionVars[sNo];
                  }
                }
                else if (lang.isObject(substitutionVars)) {
                  subs = substitutionVars;
                }
                if (string.substituteParams) {
                  msg = string.substituteParams(msg, subs);
                }
                else if (lang.replace) {
                  msg = lang.replace(msg, subs);
                }
              }
              break;
            }
          }
        }
        return msg;
      };
      var cnt = 0;

      /**
       * TODO sbarkdull: this method does not belong here, it belongs in UIUtils
       *
       * @param elementOrId String or HTML element, if String, must be the id of an HTML element
       * @param msgKey String key into the message map
       */
      /*public static*/
      moduleDef.setElementText = function (elementOrId, msgKey) {
        var element;
        if (typeof elementOrId == "string") {
          element = document.getElementById(elementOrId);
        } else {
          element = elementOrId;
        }
        if (element) {
          element.innerHTML = moduleDef.getString(msgKey);
        }
      };

      /**
       * Add a resource bundle to the set of resource bundles.
       *
       * @param packageName String the name of the package containing the javascript
       * file with the resource strings.
       * @param fileName String name of the javascript file with the
       * resource strings, without the extention.
       * @param reload Force the reloading of this package name? If the package name
       * has already been provided no request will be made to the url. Defaults to false.
       */
      /*public static*/
      moduleDef.addUrlBundle = function (packageName, url, reload) {
        if (!reload && moduleDef.messageBundle.hasOwnProperty(packageName)) {
          return;
        }

        var deferred = request(url,
            {
              handleAs: "json",
              // This call must be synchronous so we inject the require message bundle before it needs to be used.  Message bundles
              // are generally fetched immediately before attempting to look up a localized string.
              sync: true
            }
        );

        deferred.then(
            function (data) {
              moduleDef.messageBundle[packageName] = data;
            },

            function (error) {
              if (typeof(console) != "undefined") {
                console.log("error loading message bundle at:" + url);
              }
            }
        );

      };

      /* static init */
      moduleDef.init();
      moduleDef.addUrlBundle('pentaho.common', CONTEXT_PATH + 'i18n?plugin=common-ui&name=resources/web/dojo/pentaho/common/nls/messages');
      return moduleDef;
    });