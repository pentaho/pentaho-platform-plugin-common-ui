/*!
* Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
define(function() {

  return /** @type IVizTypeProvider */{
    getAll: getVizTypes
  };

  function getVizTypes() {
    return [
      {
        id:      'sample_calc',         // unique identifier
        type:    'calc',                // generic type id
        source:  'Sample',              // id of the source library
        name:    'Sample Calculation',  // visible name, this will come from a properties file eventually
        'class': 'pentaho.sample.Calc', // type of the Javascript object to instantiate
        instanceModule: 'common-ui/vizapi/sample/sampleVisualization',
        args:    {},                    // arguments to provide to the Javascript object
        dataReqs: [                     // dataReqs describes the data requirements of this visualization
          {
            name: 'Default',
            reqs: [
              {
                id: 'rows',              // id of the data element
                dataType: 'string',      // data type - 'string', 'number', 'date', 'boolean', 'any' or a comma separated list
                dataStructure: 'column', // 'column' or 'row' - only 'column' supported so far
                caption: 'Level',        // visible name
                required: true,          // true or false
                allowMultiple: false,
                ui: {
                  group: "data"
                }
              },
              {
                id: 'measures',
                dataType: 'number',
                dataStructure: 'column',
                caption: 'Measure',
                required: true,
                allowMultiple: false,
                ui: {
                  group: "data"
                }
              },
              {
                id: 'calc',
                dataType: 'string',
                values: ["MIN", "MAX", "AVG"],
                ui: {
                  labels: ["Minimum", "Maximum", "Average"],
                  group: "options",
                  type: 'combo',
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
