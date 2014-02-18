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

pen.require(['common-ui/vizapi/DataTable'], function() {
    doh.register("Data Table Tests", [

        {  name: "1. Test Package",
            runTest: function(){
            
                doh.assertTrue( pentaho.DataTable );    
            
            }
        },
            
        {  name: "2. Test Table",
            runTest: function(){
            
                var jsonTable = {
                    metadata: [
                        { colName: 'col1', colType: 'STRING', colLabel: 'Column 1' },
                        { colName: 'col2', colType: 'NUMERIC', colLabel: 'Column 2' }
                    ],
                    resultset: [
                        [ 'Row1', 123 ],
                        [ 'Row2', 456 ]
                    ]
                }        
                var table = new pentaho.DataTable(jsonTable);
                
                doh.assertTrue( table );    
                doh.assertTrue( table.getNumberOfRows() == 2 );  
                doh.assertTrue( table.getNumberOfColumns() == 2 );
            
            }
        }
            
        ]
    );
});
