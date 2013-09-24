/**
 * The Pentaho proprietary code is licensed under the terms and conditions
 * of the software license agreement entered into between the entity licensing
 * such code and Pentaho Corporation. 
 */

pen.require(['common-ui/instrumented/vizapi/DataTable'], function() {
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