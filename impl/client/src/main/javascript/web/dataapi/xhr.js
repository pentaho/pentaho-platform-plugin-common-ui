/*!
* Copyright 2010 - 2019 Hitachi Vantara.  All rights reserved.
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

define("common-data/xhr", ['common-data/oop'], function() {
  pentaho = typeof pentaho == "undefined" ? {} : pentaho;

  /**
	 * @module pentaho
	 * @class xhr
	 * @description Utility container for XHR events independent of JS library
	 * Currently uses pentaho-ajax.js to minimize dependencies, but could be any library
	 */
  pentaho.xhr = {
    /**
     * @method execute
     * @description call the appropriate XHR functions and delivers results
     */
    execute: function(url, oConfig){
      var parms = "";
      for (var parm in oConfig.data) {
        parms += "&" + parm + "=" + oConfig.data[parm];
      }

      function func(response) {
        // console.log(response);
        var myxml = pentaho.xhr.parseXML(response);
        oConfig.complete(myxml);
      }

      // this shoudl be done by default then send if it cant convert
      // var response = pentahoGet(url, parms, func);
      var response = pentahoGet(url, parms);
      oConfig.complete(response);
    },

    /**
     * @method SOAP2JS
     * @description Utility function to convert data from pentaho ServiceAction SOAP to JS objects
     */
    SOAP2JS: function(oXML) {
      // assumes we get a valid XML document

			// var oXML  = pentaho.xhr.parseXML(sSOAP);
      var rows = oXML.getElementsByTagName('DATA-ROW');        // initialize array of all DATA-ROW returned in SOAP
      var cols = oXML.getElementsByTagName('COLUMN-HDR-ITEM'); // initialize arry of all COLUMN-HDR-ITEM in SOAP

			var oResults = { // initialize emply object for each the JSON rows
        results: []    // add empty array to hold DATA-ROW contents in the results JS property
      };

      for (var i = 0, R = rows.length; i < R; i++) {
        var row = oXML.getElementsByTagName('DATA-ROW')[i]; // get the row for this loop var i
        oResults.results[i] = {}; //initialize each row with empty objects

        for (var j = 0, C = cols.length; j < C; j++) {
          // addign the object value for column header COLUMN-HDR-ITEM and ros DATA-ROW values
          oResults.results[i][oXML.getElementsByTagName('COLUMN-HDR-ITEM')[j].firstChild.nodeValue] = row.getElementsByTagName('DATA-ITEM')[j].firstChild.nodeValue;
        }
      }

      return oResults;
    },

		/**
		 * @method parseXML
     * @description Utility function to convert data from plain text/xml into XML document object
     */
    parseXML: function (sText) {
      var xmlDoc, parser;

      try { //Firefox, Mozilla, Opera, etc.
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(sText,"text/xml");

        return xmlDoc;
      } catch (e) {
        try { //Internet Explorer
          xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async="false";
          xmlDoc.loadXML(sText);

          return xmlDoc;
        } catch(e) {
          alert("parseXML Error" + e.message);
          return false;
        }
      }
    }
  };

  return pentaho.xhr;
});
