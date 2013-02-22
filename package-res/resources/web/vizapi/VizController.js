/*
 pentaho.VizController

 A controller for visualization objects

 author: James Dixon

 */

pentaho = typeof pentaho == "undefined" ? {} : pentaho;

/*
 A list of color palettes that can be used by visualizations
 */
pentaho.palettes = [];

pentaho.palettes.push( {
      name: 'palette 1',
      colors: [
        "#336699",
        "#99CCFF",
        "#999933",
        "#666699",
        "#CC9933",
        "#006666",
        "#3399FF",
        "#993300",
        "#CCCC99",
        "#666666",
        "#FFCC66",
        "#6699CC",
        "#663366"]
    }
);

pentaho.palettes.push( {
      name: 'palette 2',
      colors: [
        "#880a0f",
        "#b09a6b",
        "#772200",
        "#c52f0d",
        "#123d82",
        "#4a0866",
        "#ffaa00",
        "#1e8ad3",
        "#aa6611",
        "#772200",
        "#8b2834",
        "#333333"]
    }
);

pentaho.palettes.push( {
      name: 'palette 3',
      colors: [
        "#387179",
        "#626638",
        "#A8979A",
        "#B09A6B",
        "#772200",
        "#C52F0D",
        "#123D82",
        "#4A0866",
        "#445500",
        "#FFAA00",
        "#1E8AD3",
        "#AA6611",
        "#772200"]
    }
);

/*
 pentaho.visualizations is an array that visualization metadata objects can be added to
 */
pentaho.visualizations = pentaho.visualizations || [];

pentaho.visualizations.getById = function(id){
  for(var i = 0; i < this.length ; i++){
    if(this[i].id == id){
      return this[i];
    }
  }
  return null;
};


var visualizations = pentaho.visualizations;

/*
 pentaho.VizController
 The visualization controller
 */
pentaho.VizController = function(id) {
  this.id = id;
  this.domNode = null;
  this.isDragging = false;
  this.combinations = [];
  this.selections = [];
  this.highlights = [];
  this.metrics = null;
  this.origTable = null;
  this.dataTable = null;
  this.currentViz = null;
  this.currentAction = 'select';
  this.layoutPanelElement = null;
  this.layoutPanel = null;
  this.visualPanelElement = null;
  this.layoutShown = false;
  this.toolbarElement = null;
  this.title = null;
  this.chart = null;
  this.palette = pentaho.palettes[0];
  this.lastError = null;
  this.memberPalette = null;  
}

/*
 getError
 Returns the most recent Javascript error object
 */
pentaho.VizController.prototype.getError = function() {
  return this.lastError;
}

/*
 getState
 Returns the state of the controller and the current visualiztion.
 {
 vizId: 'some id', // the id of the visualization
 vizState: {} // the state object from the visualization
 }
 */
pentaho.VizController.prototype.getState = function() {
  try {
    var state = {};

    if( this.currentViz ) {
      state.vizId = this.currentViz.id;
      if( this.chart.getState ) {
        state.vizState = this.chart.getState();
      }
    }
    return state;
  } catch (e) {
    this.lastError = e;
    return null;
  }
}

/*
 setState
 Sets the state of the controller and the visualization

 state       A state object
 returns     true if there were no errors
 */
pentaho.VizController.prototype.setState = function(state) {
  try {
    // find the visualization
    if( !this.currentViz || this.currentViz.id != state.vizId ) {
      for( var idx=0; idx<pentaho.visualizations.length; idx++) {
        if( pentaho.visualizations[idx].id == state.id) {
          // we found a visualization with the specified id
          this.currentViz = pentaho.visualizations[idx];
          break;
        }
      }
      if( !this.currentViz ) {
        alert('Visualization not found: '+state.vizId);
      }
      // set the state of the visualization
      this.setVisualization(this.currentViz);
    }
    delete state.dataReqs;
    dojo.safeMixin(this.currentViz, state);

    if( this.chart && this.chart.setState ) {
      this.chart.setState( state.vizState );
    }
    return true;
  } catch (e) {
    this.lastError = e;
    return false;
  }
}

/*
 setDomNode
 Sets the HTML DOM node that the visualization needs to render inside

 node    HTML DOM element
 returns     true if there were no errors
 */
pentaho.VizController.prototype.setDomNode = function( node ) {
  try {
    this.domNode = node;

    // Empty out the node
    while(node.firstChild) {
      node.removeChild(node.firstChild);
    }

    // Create an empty DIV for the visualization to render in
    var width = this.domNode.offsetWidth;
    var height = this.domNode.offsetHeight;
    this.visualPanelElement = document.createElement("DIV");
    this.visualPanelElement.setAttribute('id', 'visualPanelElement-'+this.id);
    this.visualPanelElement.setAttribute('style','border:0px solid #red; background-color: white; width: '+(width)+'px; height: '+(height)+'px');
    this.domNode.appendChild(this.visualPanelElement);
    return true;
  } catch (e) {
    this.lastError = e;
    return false;
  }
}

/*
 setDataTable
 Sets the DataTable (pentaho.DataTable) for the visualization

 table       A DataTable object
 returns     true if there were no errors
 */
pentaho.VizController.prototype.setDataTable = function(table) {
  try {
    this.origTable = table;
    this.setupTable();
    return true;
  } catch (e) {
    this.lastError = e;
    return false;
  }
}

/*
setMemberPalette
Sets the color mappings for members in the current data table

colors     Map of attributes/measures in the table to a map of member to color mappings
*/
pentaho.VizController.prototype.setMemberPalette = function(colors) {
 this.memberPalette = colors;
}

/*
 setTitle
 Sets the title that the visualization should display

 title   The title to display
 */
pentaho.VizController.prototype.setTitle = function(title) {
  this.title = title;
}

/*
 setVisualization
 Sets the visualization to display

 visualization   Visualization metadata
 returns         true if there were no errors
 */
pentaho.VizController.prototype.setVisualization = function(visualization, options) {
  try {
    if( this.currentViz && this.currentViz['class'] != visualization['class'] ) {
      // remove the old visualization
      this.setDomNode(this.domNode);
    }
    this.currentViz = visualization;
    // dipslay the new visualization
    this.doVisualization(visualization, options);
    return true;
  } catch (e) {
    this.lastError = e;
    return false;
  }
}

/*
 updateVisualization
 Updates the current visualization, for example if the data has changed in some way

 returns         true if there were no errors
 */
pentaho.VizController.prototype.updateVisualization = function(options) {
  try {
    // update the current visualization, if possible
    if(!this.currentViz) {
      return;
    }
    this.doVisualization(this.currentViz, options);
    return true;
  } catch (e) {
    this.lastError = e;
    return false;
  }
}

/*
 doVisualization
 Creates a visualization and causes it to render

 returns         true if there were no errors
 */
pentaho.VizController.prototype.doVisualization = function( visualization, userDefinedOptions ) {
  this.userDefinedOptions = userDefinedOptions || {};

  if(!this.dataTable) {
    return;
  }
  try {
    currentView = new pentaho.DataView(this.dataTable);

    var className = visualization['class'];

    // Set chart options
    var options = {'title':this.title,
      'width':this.visualPanelElement.offsetWidth,
      'height':this.visualPanelElement.offsetHeight,
      metrics: this.metrics,
      palette: this.palette,
      controller: this,
      action: this.currentAction,
      selections: this.highlights
    };

    if( visualization.needsColorGradient ) {
      var gradMap = [ [255,0,0],[255,255,0],[0,0,255],[0,255,0] ];
//            var idx = document.getElementById('colorGradient1Select').selectedIndex;
      options.color1 = gradMap[0];
//            idx = document.getElementById('colorGradient2Select').selectedIndex;
      options.color2 = gradMap[3];
    }


    // see if we have additional properties to set
    var propMap = visualization.propMap;
    if(propMap) {
      for(var propNo=0; propNo<propMap.length; propNo++) {
        var prop = propMap[propNo];
        var propValue = null;
        if( prop.source == 'columnlabel') {
          propValue = currentView.getColumnLabel(prop.position);
        }
        if( prop.source == 'maxvalue') {
          propValue = this.metrics[prop.position].range.max;
        }
        if( prop.source == 'minvalue') {
          propValue = this.metrics[prop.position].range.min;
        }
        var obj = options;
        for( var nameNo=0; nameNo<prop.name.length; nameNo++) {
          if(nameNo < prop.name.length-1) {
            // make sure the parent parts exist
            if( !obj[prop.name[nameNo]] ) {
              obj[prop.name[nameNo]] = {};
            }
            obj = obj[prop.name[nameNo]]
          }
          else {
            // we are at the end
            obj[prop.name[nameNo]] = propValue;
          }
        }
      }
    }

    if(visualization.args) {
      for(var x in visualization.args) {
        options[x] = visualization.args[x];
      }
    }
    for(var x in this.userDefinedOptions) {
      options[x] = this.userDefinedOptions[x];
    }

    options.memberPalette = this.memberPalette ? this.memberPalette : {};
    
    var id = 'chart_div'+this.id;

    if( this.chart && this.chart.vizId == visualization.id ) {
      // same control no need to change
    } else {
      var chartDiv = this.visualPanelElement;
      eval( 'this.chart = new '+className+'(chartDiv)');
      pentaho.events.addListener(this.chart, 'select', function(){ return myself.chartSelectHandler.apply(myself,arguments||[]);} );
      pentaho.events.addListener(this.chart, 'doubleclick', function(){ return myself.chartDoubleClickHandler.apply(myself,arguments||[]);} );
      pentaho.events.addListener(this.chart, 'onmouseover', function(){ return myself.chartMouseOverHandler.apply(myself,arguments||[]);} );
      pentaho.events.addListener(this.chart, 'onmouseout', function(){ return myself.chartMouseOutHandler.apply(myself,arguments||[]);} );
    }

    // Instantiate and draw our chart, passing in some options.

    var myself = this;
    this.chart.controller = this;
    this.chart.id = 'viz'+this.id;
    this.chart.vizId = visualization.id;

    if( !currentView ) {
      alert('No suitable dataset');
      document.getElementById('chart_div').innerHTML = '';
      return;
    }

    try {
      this.chart.draw(currentView, options);
    } catch (e) {
      alert(e)
    }
    this.currentViz = visualization;
    return true;
  } catch (e) {
    this.lastError = e;
    return false;
  }
}

/*
 chartSelectHandler
 Called when the user clicks on something in the visualization
 */
pentaho.VizController.prototype.chartSelectHandler = function(args) {
  this.processHighlights(args);
  pentaho.events.trigger( this, "select", args );
}

pentaho.VizController.prototype.chartDoubleClickHandler = function(args) {
//    this.processHighlights(args);
  pentaho.events.trigger( this, "doubleclick", args );
}

pentaho.VizController.prototype.processHighlights = function(args) {
  var mode = args.selectionMode || "TOGGLE";

  if (mode == "REPLACE") {
    // only use the selections from the arguments passed in
    this.highlights = [];
  }

  for (var i = 0; i < args.selections.length; i++) {
    var selectedItem = args.selections[i];

    var rowItem;
    var colId;
    var colLabel;
    var value;
    var colItem;
    var rowId;
    var rowLabel;

    if(selectedItem.rowItem) {
      rowItem = selectedItem.rowItem;
      rowId = selectedItem.rowId;
      rowLabel = selectedItem.rowLabel;
    }
    if(selectedItem.column || selectedItem.column == 0) {
      colId = selectedItem.columnId;
      colLabel = selectedItem.columnLabel;
      colItem = selectedItem.columnItem;
    }
    if((selectedItem.row || selectedItem.row == 0) && selectedItem.column) {
      value = selectedItem.value;
    }
    //  alert(rowItem+','+colLabel+'='+value);

    // see if this is already highlighted
    var removed = false;
    var modified = false;

    if(mode == "TOGGLE") {
      // previous selection should be retained or if re-selected should be toggled
      for( var hNo=0; hNo<this.highlights.length; hNo++) {
        var highlightRowItem = this.highlights[hNo].rowItem;
        var highlightColItem = this.highlights[hNo].colItem;
        var rowItemsSame = highlightRowItem
            && (highlightRowItem == rowItem
            || (highlightRowItem.join && ( highlightRowItem.join('-') == rowItem.join('-') ) ) );

        var colItemsSame = highlightColItem
            && (highlightColItem == colItem
            || (highlightColItem.join && ( highlightColItem.join('-') == colItem.join('-') ) ) );

        if(typeof colItemsSame == 'undefined') {
          colItemsSame = true;
        }

        if( rowItemsSame && colItemsSame && this.highlights[hNo].colId && this.highlights[hNo].colId == colId && this.highlights[hNo].type == 'column' && selectedItem.type == 'cell') {
          // switch this
          this.highlights[hNo].type = 'row';
          highlight.id = selectedItem.rowId;
          highlight.value = rowItem;
          modified = true;
          break;
        }
        else if( rowItemsSame && colItemsSame && this.highlights[hNo].colId && this.highlights[hNo].colId == colId && this.highlights[hNo].type == 'column') {
          // remove this
          this.highlights.splice( hNo, 1 );
          removed = true;
          break;
        }
        else if( rowItemsSame && colItemsSame ) {
          // remove this
          this.highlights.splice( hNo, 1 );
          removed = true;
          break;
        }
      }
    }
    if(!removed && !modified) {
      highlight = { rowItem: rowItem, colId: colId, colLabel: colLabel, colItem: colItem, rowId: rowId, rowLabel: rowLabel };
      highlight.type = selectedItem.type;
      if( selectedItem.type == 'row' ) {
        highlight.id = rowId;
        highlight.value = rowItem;
      }
      else if( selectedItem.type == 'column' ) {
        highlight.type = 'column';
        highlight.id = colId;
        highlight.value = colLabel;
      }
      else if( selectedItem.type == 'cell' ) {
        highlight.type = 'cell';
        highlight.id = colId;
        highlight.value = colLabel;
      }
      this.highlights.push( highlight );
    }
  }
//    this.updateHighlights();
}


pentaho.VizController.prototype.createCombination = function() {

  // assume the highlighted items are of the same type
  var type, columnId, values = [];
  for( var idx=0; idx<this.highlights.length; idx++ ) {
    if( idx==0) {
      type = this.highlights[idx].type;
      values.push(this.highlights[idx].value);
      columnId = this.highlights[idx].id;
    }
    else if(this.highlights[idx].id == columnId) {
      values.push(this.highlights[idx].value);
    }
  }
  this.combinations.push( {
    values: values,
    columnId: columnId
  });
  this.setupTable();
  // now clear the selections
  this.highlights = [];
  this.updateVisualization();

}

/*
 updateHighlights
 Updates all of the highlights on the visualization
 */
pentaho.VizController.prototype.updateHighlights = function() {

  if( this.chart.setHighlights ) {
    this.chart.setHighlights(this.highlights);
  }

}

/*
 updateHighlights
 Clears all of the highlights on the visualization
 */
pentaho.VizController.prototype.clearSelections = function() {
  this.highlights = [];
}


pentaho.VizController.prototype.setupTable = function( ) {

  if(!this.origTable) {
    return;
  }

  this.metrics = [];
  this.dataTable = this.origTable;

  // apply any local combinations
  if( this.combinations && this.combinations.length > 0 ) {
    var rows = this.origTable.getFilteredRows([{column: 0, combinations: this.combinations}]);
    var view = new pentaho.DataView(table);
    view.setRows( rows );
    this.dataTable = view;
  }

  // get metrics across the entire dataset in case we need them
  for( var colNo=0; colNo<this.dataTable.getNumberOfColumns(); colNo++) {
    if( this.dataTable.getColumnType(colNo) == 'string' ) {
      var values = this.dataTable.getDistinctValues(colNo);
      var paletteMap = pentaho.VizController.createPaletteMap( values, this.palette );
      // TODO add longest sting length to the metrics
      this.metrics.push({
        values: values,
        paletteMap: paletteMap
      });
    }
    else if( this.dataTable.getColumnType(colNo) == 'number' ) {
      var range = this.dataTable.getColumnRange(colNo);
      this.metrics.push({range: range});
    }
  }

}

function sort( columnIdx, direction ) {

  var rows = this.dataTable.sort([{column: columnIdx, desc: direction == pentaho.pda.Column.SORT_TYPES.DESCENDING}]);
  clearDataDisplay();
  displayData();
}


/*
 createPaletteMap
 Static function to create a palette map
 */
pentaho.VizController.createPaletteMap = function( items, palette ) {
  var map = {};
  for(var itemNo=0; itemNo<items.length && itemNo<palette.colors.length; itemNo++) {
    map[items[itemNo]] = palette.colors[itemNo];
  }
  // are there more items than colors in the palette?
  for(var itemNo=palette.colors.length; itemNo<items.length; itemNo++) {
    map[items[itemNo]] = "#000000";
  }

  return map;
}

/*
 createPaletteMap
 Static function to create a color within a color gradient
 Return  an RGB() color
 */
pentaho.VizController.getRrbGradient = function(value, min, max, color1, color2) {
  if(max - min <= 0) {
    return pentaho.VizController.getRrbColor(color2[0], color2[1], color2[2]);
  }
  var inRange = (value-min)/(max-min);
  var cols = new Array(3);
  cols[0] = Math.floor( inRange * (color2[0] - color1[0]) + color1[0] );
  cols[1] = Math.floor( inRange * (color2[1] - color1[1]) + color1[1] );
  cols[2] = Math.floor( inRange * (color2[2] - color1[2]) + color1[2] );
  return pentaho.VizController.getRrbColor(cols[0], cols[1], cols[2]);
}

/*
 createPaletteMap
 Static function to create a color within a color gradient
 Return  an RGB() color
 */
pentaho.VizController.getRgbGradientFromMultiColorHex = function(value, min, max, colors) {

  var steps = colors.length-1;
  var range = max-min;

  if(range <= 0) {
    var start = colors.length-1;
    var end = start;
  } else {
    var start = Math.floor(((value-min)/range) * steps);
    var end = Math.ceil(((value-min)/range) * steps);
  }
  var color1 = pentaho.VizController.convertToRGB(colors[start]);
  var color2 = pentaho.VizController.convertToRGB(colors[end]);

  var rangeMin = (start == 0) ? 1 : (start / steps) * max;
  var rangeMax = (end / steps) * max;

  var inRange
  if(rangeMin == rangeMax){
    inRange = 1;
  } else {
    inRange = (value-rangeMin)/(rangeMax-rangeMin);
  }
  var cols = new Array(3);
  cols[0] = Math.floor( inRange * (color2[0] - color1[0]) + color1[0] );
  cols[1] = Math.floor( inRange * (color2[1] - color1[1]) + color1[1] );
  cols[2] = Math.floor( inRange * (color2[2] - color1[2]) + color1[2] );
  return pentaho.VizController.getRrbColor(cols[0], cols[1], cols[2]);
}

// Adapted from protovis
pentaho.VizController.getDarkerFromColorHex = function(color, k) {
  var comps = pentaho.VizController.convertToRGB(color);
  k = Math.pow(0.7, k != null ? k : 1);
  return pentaho.VizController.getRrbColor(
        Math.max(0, Math.floor(k * comps[0])),
        Math.max(0, Math.floor(k * comps[1])),
        Math.max(0, Math.floor(k * comps[2])));
};

pentaho.VizController.getRgbStepFromMultiColorHex = function(value, min, max, colors) {

  var steps = colors.length-1;
  var range = max-min;


  var step = Math.round(((value-min)/range) * steps);

  var color = pentaho.VizController.convertToRGB(colors[step]);
  return pentaho.VizController.getRrbColor(color[0], color[1], color[2]);
}

pentaho.VizController.convertToRGB = function(hex){
  if(hex.indexOf("#") == 0){
    hex = hex.substring(1);
  } else {
    hex = pentaho.VizController.CSS_Names[hex.toLowerCase()];
  }
  return [
    parseInt(hex.substring(0,2),16),
    parseInt(hex.substring(2,4),16),
    parseInt(hex.substring(4,6),16)
  ];
}

/*
 createPaletteMap
 Static function to create a RGB color
 Return  an RGB() color
 */
pentaho.VizController.getRrbColor = function(r, g, b) {
  return 'RGB('+r+','+g+','+b+')';
}

pentaho.VizController.prototype.resize = function(width, height) {
  this.visualPanelElement.style.width = width+"px";
  this.visualPanelElement.style.height = height+"px";
  this.chart.resize(width, height);
}


pentaho.VizController.dashboardMode = false;
try{
  window.parent && typeof(window.parent.PentahoDashboardController) !== "undefined";
} catch(ignored){/*XSS*/}



pentaho.VizController.CSS_Names = {"aliceblue" : "F0F8FF",
  "antiquewhite" : "FAEBD7",
  "aqua" : "00FFFF",
  "aquamarine" : "7FFFD4",
  "azure" : "F0FFFF",
  "beige" : "F5F5DC",
  "bisque" : "FFE4C4",
  "black" : "000000",
  "blanchedalmond" : "FFEBCD",
  "blue" : "0000FF",
  "blueviolet" : "8A2BE2",
  "brown" : "A52A2A",
  "burlywood" : "DEB887",
  "cadetblue" : "5F9EA0",
  "chartreuse" : "7FFF00",
  "chocolate" : "D2691E",
  "coral" : "FF7F50",
  "cornflowerblue" : "6495ED",
  "cornsilk" : "FFF8DC",
  "crimson" : "DC143C",
  "cyan" : "00FFFF",
  "darkblue" : "00008B",
  "darkcyan" : "008B8B",
  "darkgoldenRod" : "B8860B",
  "darkgray" : "A9A9A9",
  "darkgrey" : "A9A9A9",
  "darkgreen" : "006400",
  "darkkhaki" : "BDB76B",
  "darkmagenta" : "8B008B",
  "darkoliveGreen" : "556B2F",
  "darkorange" : "FF8C00",
  "darkorchid" : "9932CC",
  "darkred" : "8B0000",
  "darksalmon" : "E9967A",
  "darkseagreen" : "8FBC8F",
  "darkslateblue" : "483D8B",
  "darkslategray" : "2F4F4F",
  "darkslategrey" : "2F4F4F",
  "darkturquoise" : "00CED1",
  "darkviolet" : "9400D3",
  "deeppink" : "FF1493",
  "deepskyblue" : "00BFFF",
  "dimgray" : "696969",
  "dimgrey" : "696969",
  "dodgerblue" : "1E90FF",
  "firebrick" : "B22222",
  "floralwhite" : "FFFAF0",
  "forestgreen" : "228B22",
  "fuchsia" : "FF00FF",
  "gainsboro" : "DCDCDC",
  "ghostwhite" : "F8F8FF",
  "gold" : "FFD700",
  "goldenrod" : "DAA520",
  "gray" : "808080",
  "grey" : "808080",
  "green" : "008000",
  "greenyellow" : "ADFF2F",
  "honeydew" : "F0FFF0",
  "hotpink" : "FF69B4",
  "indianred" : "CD5C5C",
  "indigo" : "4B0082",
  "ivory" : "FFFFF0",
  "khaki" : "F0E68C",
  "lavender" : "E6E6FA",
  "lavenderblush" : "FFF0F5",
  "lawngreen" : "7CFC00",
  "lemonchiffon" : "FFFACD",
  "lightblue" : "ADD8E6",
  "lightcoral" : "F08080",
  "lightcyan" : "E0FFFF",
  "lightgoldenrodyellow" : "FAFAD2",
  "lightgray" : "D3D3D3",
  "lightgrey" : "D3D3D3",
  "lightgreen" : "90EE90",
  "lightpink" : "FFB6C1",
  "lightsalmon" : "FFA07A",
  "lightseagreen" : "20B2AA",
  "lightskyblue" : "87CEFA",
  "lightslategray" : "778899",
  "lightslategrey" : "778899",
  "lightsteelblue" : "B0C4DE",
  "lightyellow" : "FFFFE0",
  "lime" : "00FF00",
  "limegreen" : "32CD32",
  "linen" : "FAF0E6",
  "magenta" : "FF00FF",
  "maroon" : "800000",
  "mediumaquamarine" : "66CDAA",
  "mediumblue" : "0000CD",
  "mediumorchid" : "BA55D3",
  "mediumpurple" : "9370D8",
  "mediumseagreen" : "3CB371",
  "mediumslateblue" : "7B68EE",
  "mediumspringgreen" : "00FA9A",
  "mediumturquoise" : "48D1CC",
  "mediumvioletred" : "C71585",
  "midnightblue" : "191970",
  "mintcream" : "F5FFFA",
  "mistyrose" : "FFE4E1",
  "moccasin" : "FFE4B5",
  "navajowhite" : "FFDEAD",
  "navy" : "000080",
  "oldlace" : "FDF5E6",
  "olive" : "808000",
  "olivedrab" : "6B8E23",
  "orange" : "FFA500",
  "orangered" : "FF4500",
  "orchid" : "DA70D6",
  "palegoldenrod" : "EEE8AA",
  "palegreen" : "98FB98",
  "paleturquoise" : "AFEEEE",
  "palevioletRed" : "D87093",
  "papayawhip" : "FFEFD5",
  "peachpuff" : "FFDAB9",
  "peru" : "CD853F",
  "pink" : "FFC0CB",
  "plum" : "DDA0DD",
  "powderblue" : "B0E0E6",
  "purple" : "800080",
  "red" : "FF0000",
  "rosybrown" : "BC8F8F",
  "royalblue" : "4169E1",
  "saddlebrown" : "8B4513",
  "salmon" : "FA8072",
  "sandybrown" : "F4A460",
  "seagreen" : "2E8B57",
  "seashell" : "FFF5EE",
  "sienna" : "A0522D",
  "silver" : "C0C0C0",
  "skyblue" : "87CEEB",
  "slateblue" : "6A5ACD",
  "slategray" : "708090",
  "slategrey" : "708090",
  "snow" : "FFFAFA",
  "springgreen" : "00FF7F",
  "steelblue" : "4682B4",
  "tan" : "D2B48C",
  "teal" : "008080",
  "thistle" : "D8BFD8",
  "tomato" : "FF6347",
  "turquoise" : "40E0D0",
  "violet" : "EE82EE",
  "wheat" : "F5DEB3",
  "white" : "FFFFFF",
  "whitesmoke" : "F5F5F5",
  "yellow" : "FFFF00",
  "yellowgreen" : "9ACD32"}
