pentaho.visualizations.push({
  id: 'sample_bar',                          // unique identifier
  type: 'barchart',                       // generic type id
  source: 'CCC',                          // id of the source library
  name: 'CCC Column',                     // visible name, this will come from a properties file eventually
  'class': 'pentaho.ccc.CccChart',          // type of the Javascript object to instantiate
  args: {                                 // arguments to provide to the Javascript object
    cccClass: 'pvc.BarChart',
    stacked: false,
    orientation: 'vertical',
    extensionPoints: {
      xAxisLabel_textAngle: -1,
      xAxisLabel_textAlign: "right",
      xAxisLabel_textBaseline: "top"
    }
  },
  propMap: [],
  dataReqs: [                             // dataReqs describes the data requirements of this visualization
    {
      name: 'Default',
      reqs :
          [
            {   id: 'rows',             // id of the data element
              dataType: 'string',         // data type - 'string', 'number', 'date', 'boolean', 'any' or a comma separated list
              dataStructure: 'column',    // 'column' or 'row' - only 'column' supported so far
              caption: 'Category',        // visible name
              required: true              // true or false
            },
            {   id: 'measures',
              dataType: 'number',
              dataStructure: 'column',
              caption: 'Values',
              required: true,
              allowMultiple: true         // true or false
            }
          ]
    }
  ]
});