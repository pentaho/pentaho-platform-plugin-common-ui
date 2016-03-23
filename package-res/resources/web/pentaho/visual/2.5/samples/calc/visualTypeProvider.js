/*!
* Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
*/
define([
  "require",
  "pentaho/shim/es6-promise"
], function(require) {

  return /** @type IVisualTypeProvider */{
    getAll: getVisualTypes
  };

  function visualFactory(createOptions) {
    return new Promise(function(resolve, reject) {
      require(["./Calc"], function(Calc) {
        resolve(new Calc(createOptions));
      }, reject);
    });
  }

  function getVisualTypes() {
    return [
      {
        id:      "x-sample_calc",         // unique identifier
        type:    "calc",                // generic type id
        source:  "Sample",              // id of the source library
        name:    "X - Sample Calculation",  // visible name, this will come from a properties file eventually
        factory: visualFactory,         // visuals-factory
        args:    {},                    // arguments to provide to the Javascript object and default data requirements
        dataReqs: [                     // dataReqs describes the data requirements of this visualization
          {
            name: "Default",
            reqs: [
              {
                id: "rows",              // id of the data requirement
                dataType: "string",      // data type - "string", "number", "date", "boolean", "any" or a comma separated list
                dataStructure: "column", // "column" or "row"
                caption: "Level",        // visible name
                required: true,          // true or false
                allowMultiple: false     // true or false
              },
              {
                id: "measures",
                dataType: "number",
                dataStructure: "column",
                caption: "Measure",
                required: true,
                allowMultiple: false
              },
              {
                id: "calc",
                dataType: "string",
                values: ["MIN", "MAX", "AVG"],
                ui: {
                  labels:  ["Minimum", "Maximum", "Average"],
                  group:   "options",
                  type:    "combo",
                  caption: "Calculation"
                }
              }
            ]
          }
        ]
      }
    ];
  }

});
