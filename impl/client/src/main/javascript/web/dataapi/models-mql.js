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


/*
 pentaho.pda.MqlHandler
 */
define("common-data/models-mql", ['common-data/oop', 'common-data/controller', 'common-repo/pentaho-ajax'], function(){
pentaho.pda.MqlHandler = function mqlHandler(sandbox) {
  pentaho.pda.Handler.call(this, sandbox);
  this.type = pentaho.pda.SOURCE_TYPE_MQL;
  this.METADATA_SERVICE_URL = '../../../../plugin/data-access/api/metadataDA';
}

inheritPrototype(pentaho.pda.MqlHandler, pentaho.pda.Handler); //borrow the parent's methods

pentaho.pda.MqlHandler.prototype.getSources = function(callback, options) {
  options = options || {};
  var filter = options['filter'];
  var _sources = [], i=0,j=0, each;
  if (this.sources.length > 0) {
    if (filter == null ) {
      for (var i=0,j=this.sources.length;i<j;i++) {
        callback(this.sources[i]);
      }
    } else {
      for (var i=0,j=this.sources.length;i<j;i++) {
        each = this.sources[i];
        try {
          if (each[filter.property] == filter.value) {
            callback(each);
          }
        } catch(e) {
          //just move on to next
        }
      }
    }
  } else {

    //try {
    // get the info about the models from the server
    var url = this.METADATA_SERVICE_URL+'/listBusinessModels';
    var contextName = options['context'];
    var query = "domainName=&"+((contextName)? 'context='+contextName : "");
    var result = pentahoGet( url, query );

    // parse the XML
    var xml = parseXML( result ),
        nodes = xml.getElementsByTagName('modelInfo');
    for( var idx=0; idx<nodes.length; idx++ ) {
      each = this.addModelInfoFromNode( nodes[idx] ) || {};
      each.addCapability(pentaho.pda.CAPABILITIES.HAS_DOWN_AXIS);
      each.addCapability(pentaho.pda.CAPABILITIES.IS_DOWN_CUSTOM);
      each.addCapability(pentaho.pda.CAPABILITIES.HAS_FILTERS);
      each.addCapability(pentaho.pda.CAPABILITIES.IS_FILTER_CUSTOM);
      each.addCapability(pentaho.pda.CAPABILITIES.CAN_SORT);
      this.sources.push(each);
      if (filter == null) {
        callback(each);
      } else {
        if (each[filter.property] == filter.value) {
          callback(each);
        }
      }
    }
    //} catch (e) {
    //alert( e.message );
    //}
  }
}  //end discoverModels

pentaho.pda.MqlHandler.prototype.getModelInfoFromNode = function getModelInfoFromNode(node) {

  var model = {};
  model.domainId = this.getNodeText( node, 'domainId' );
  model.modelId  = this.getNodeText( node, 'modelId' );
  model.id       = model.domainId +':'+ model.modelId;
  model.name     = this.getNodeText( node, 'modelName' );
  model.type     = pentaho.pda.SOURCE_TYPE_MQL;
  model.description = this.getNodeText( node, 'modelDescription' );

  return model;
}

pentaho.pda.MqlHandler.prototype.addModelInfoFromNode = function addModelInfoFromNode( node ) {
  return new pentaho.pda.model.mql(this.getModelInfoFromNode(node), this);
} //end addModelInfoFromNode

pentaho.pda.MqlHandler.prototype.getModelFromNode = function( node, modelAccess, datasourceConfig ) {
  var id = datasourceConfig.id;
  var name = datasourceConfig.name;
  var description = datasourceConfig.description;
  var model = new pentaho.pda.model( id, name, modelAccess, datasourceConfig );
  // get the model attributes
  model.domainId = this.getNodeText( node, 'domainId' );
  model.modelId = this.getNodeText( node, 'id' );

  // get the categories
  var nodes = node.getElementsByTagName('categories');
  for( var idx=0; idx<nodes.length; idx++ ) {
    this.addCategoryFromNode( nodes[idx], model );
  }
  return model;

}  //end getModelFromNode

pentaho.pda.MqlHandler.prototype.addCategoryFromNode = function( node, model ) {
  var category = new pentaho.pda.dataelement();
  category.dataType = pentaho.pda.Column.DATA_TYPES.NONE;
  category.elementType = pentaho.pda.Column.ELEMENT_TYPES.CATEGORY;
  category.id = this.getNodeText( node, 'id' );
  category.name = this.getNodeText( node, 'name' );
  category.isQueryElement = false;
  model.addElement( category );
  // get the columns
  var nodes = node.getElementsByTagName('columns');
  for( var idx=0; idx<nodes.length; idx++ ) {
    this.addColumnFromNode( nodes[idx], model, category );
  }
} //addCategoryFromNode

pentaho.pda.MqlHandler.prototype.addColumnFromNode = function( node, model, category ) {
  var element = new pentaho.pda.dataelement();

  element.id = this.getNodeText( node, 'id' );
  element.name = this.getNodeText( node, 'name' );
  element.elementType = this.getNodeText( node, 'fieldType' );
  element.dataType = this.getNodeText( node, 'type' );
  element.horzizontalAlignment = this.getNodeText( node, 'horizontalAlignment' );
  element.formatMask = this.getNodeText( node, 'formatMask' );
  element.selectedAggregation = this.getNodeText( node, 'selectedAggType' );
  element.defaultAggregation = this.getNodeText( node, 'defaultAggType' );
  element.parent = category;
  element.isQueryElement = true;
  category.addChild(element);

  var nodes = node.getElementsByTagName('aggTypes');
  for( var idx=0; idx<nodes.length; idx++ ) {
    element.availableAggregations.push( this.getText( nodes[idx] ) );
  }

  model.addElement( element );
} //addColumnFromNode

pentaho.pda.MqlHandler.prototype.getNodeText = function( node, tag ) {
  for( var idx=0; idx<node.childNodes.length; idx++ ) {
    if(node.childNodes[idx].nodeName == tag) {
      return this.getText( node.childNodes[idx] );
    }
  }
  return null;
} //getNodeText

pentaho.pda.MqlHandler.prototype.getNodeTextOfChild = function( node, tag1, tag2 ) {
  for( var idx=0; idx<node.childNodes.length; idx++ ) {
    if(node.childNodes[idx].nodeName == tag1) {
      return this.getNodeText( node.childNodes[idx], tag2 );
    }
  }
  return null;
} //getNodeTextOfChild

pentaho.pda.MqlHandler.prototype.getText = function(node) {
  if(!node || !node.firstChild) return null;
  if(typeof(node.textContent) != "undefined") return node.textContent;
  return node.firstChild.nodeValue;
} //getText

/* ******************************************
 pentaho.pda.model.mql
 ******************************************
 */
pentaho.pda.model.mql = function(obj, handler) {
  pentaho.pda.model.call(this, obj); //call parent object

  this.categories = new Array();
  this.domainId = obj.domainId;
  this.modelId = obj.modelId;
  this.modelName = obj.modelName || '';
  this.modelDescription = obj.modelDescription || '';
  this.handler = handler;
  this.type = 'mql';
}

inheritPrototype(pentaho.pda.model.mql, pentaho.pda.model); //borrow the parent's methods

pentaho.pda.model.mql.prototype.discoverModelDetail = function() {

  // get the info about the models from the server
  var url = this.handler.METADATA_SERVICE_URL+'/loadModel';
  var query = 'domainId='+encodeURIComponent(this.domainId)+'&modelId='+encodeURIComponent(this.modelId);
  var result = pentahoGet( url, query );
  // parse the XML
  var xml = parseXML( result );
  this.categories = [];

  var nodes = xml.getElementsByTagName('model');
  if( nodes && nodes.length> 0 ) {
    //return this.getDetailFromNode( nodes[0], modelAccess, datasourceConfig );
    // get the categories
    var catnodes = nodes[0].getElementsByTagName('categories');
    for( var idx=0; idx<catnodes.length; idx++ ) {
      //this.addCategoryFromNode( nodes[idx], model );
      var category = new pentaho.pda.dataelement();
      category.dataType = pentaho.pda.Column.DATA_TYPES.NONE;
      category.elementType = pentaho.pda.Column.ELEMENT_TYPES.CATEGORY;
      category.id = this.getNodeText( catnodes[idx], 'id' );
      category.name = this.getNodeText( catnodes[idx], 'name' );
      category.description = this.getNodeText( catnodes[idx], 'description' );
      category.isQueryElement = false;
      this.categories.push(category);
      //console.log(category);
      this.addElement( category );
      // get the columns
      var colnodes = catnodes[idx].getElementsByTagName('columns');
      for( var idx2=0; idx2<colnodes.length; idx2++ ) {
        //this.addColumnFromNode( nodes[idx], model, category );
        var element = new pentaho.pda.dataelement();

        element.id = this.getNodeText( colnodes[idx2], 'id' );
        element.name = this.getNodeText( colnodes[idx2], 'name' );
        element.description = this.getNodeText( colnodes[idx2], 'description' );
        element.elementType = this.getNodeText( colnodes[idx2], 'fieldType' );
        element.dataType = this.getNodeText( colnodes[idx2], 'type' );
        element.horizontalAlignment = this.getNodeText( colnodes[idx2], 'horizontalAlignment' );
        element.formatMask = this.getNodeText( colnodes[idx2], 'formatMask' );
        element.selectedAggregation = this.getNodeText( colnodes[idx2], 'selectedAggType' );
        element.defaultAggregation = this.getNodeText( colnodes[idx2], 'defaultAggType' );
        element.hiddenForUser = this.getNodeText( colnodes[idx2], 'hiddenForUser' );
        element.parent = category;
        element.isQueryElement = true;
        element.category = category;
        category.addChild(element);

        var aggnodes = colnodes[idx2].getElementsByTagName('aggTypes');
        for( var idx3=0; idx3<aggnodes.length; idx3++ ) {
          element.availableAggregations.push( this.getText( aggnodes[idx3] ) );
        }

        this.addElement( element );

      }

    }

  }
  // return the number of models loaded
}

pentaho.pda.model.mql.prototype.getAllColumns = function() {
  var columns = new Array();

  for( var idx2 = 0; idx2<this.elements.length; idx2++ ) {
    if(this.elements[idx2].elementType != pentaho.pda.Column.ELEMENT_TYPES.CATEGORY) {
      columns.push( this.elements[idx2] );
    }
  }
  return columns;
}

pentaho.pda.model.mql.prototype.searchColumn = function( column, searchStr, rowLimit, callback ) {
  var query = this.createQuery();
  var selection = query.addSelectionById( column.id );
  var sort = query.addSortById( column.id, pentaho.pda.Column.SORT_TYPES.ASCENDING );
  if( searchStr ) {
    query.addConditionById(column.id,pentaho.pda.Column.CONDITION_TYPES.CONTAINS,searchStr,pentaho.pda.Column.OPERATOR_TYPES.OR);
  }
  // TODO submit this thru CDA
  return this.submitQuery( query, rowLimit, callback );
}

pentaho.pda.model.mql.prototype.getAllValuesForColumn = function( column, rowLimit ) {
  return this.searchColumn( column, undefined, rowLimit );
}

// create a new query
pentaho.pda.model.mql.prototype.createQuery = function() {

  var query = new pentaho.pda.query.mql(this);

  query.setDomainId( this.domainId );
  query.setModelId( this.modelId );
  return query;
}

// get the results of the query
// This is a synchronous call unless a callback is provided. see pentaho-ajax's pentahoAction() documentation
// for types of callbacks.
pentaho.pda.model.mql.prototype.submitQuery = function( queryObject, rowLimit, callback ) {
  var json = queryObject.getJson();
//        alert(json);
  return this.submit(json, rowLimit, callback);
}

pentaho.pda.model.mql.prototype.submit = function( jsonString, rowLimit, callback ) {

  var results = {
    metadata:[],
    resultset:[]
  }
  if (!rowLimit) {
    rowLimit = -1;
  }
  var handleResultCallback = dojo.hitch(this, function(resultJson) {
//          alert(resultJson);
    var result = JSON.parse(resultJson);
    if (callback) {
      callback(result);
    }
    return result;
  });

  try {
    // get the info about the models from the server
    var url = this.handler.METADATA_SERVICE_URL+'/doJsonQueryToCdaJson';
    var query = 'json='+encodeURIComponent(jsonString)+'&rowLimit='+rowLimit;

    var resultXml = pentahoGet( url, query, callback ? handleResultCallback : undefined);
    if (!callback) {
      return handleResultCallback(resultXml);
    }
  } catch (e) {
    alert(e.message);
  }
  return null;

//        alert( query.serialize() );

}

// get the results of the query by submiting XML
pentaho.pda.model.mql.prototype.submitXmlQuery = function( queryObject, rowLimit ) {
  var xml = queryObject.serialize();
//        alert(json);
  if (!rowLimit) {
    rowLimit = -1;
  }

  try {
    // get the info about the models from the server
    var url = this.handler.METADATA_SERVICE_URL+'/doXmlQueryToCdaJson';
    var query = 'xml='+escape(xml)+'&rowLimit='+rowLimit;

    resultJson = pentahoGet( url, query );
//            alert(resultJson);
    var result = JSON.parse(resultJson);
    return result;
  } catch (e) {
    alert(e.message);
  }
  return null;

//        alert( query.toString() );

}

// parse the results XML into a MetadataQuery.Results object
pentaho.pda.model.mql.prototype.parseResultSetXml = function(xml) {
  var oXML  = parseXML(xml);
  var rowNodes = oXML.getElementsByTagName('rows');        //initialize array of all DATA-ROW returned in SOAP
  var colNameNodes = oXML.getElementsByTagName('columnNames'); //initialize array of all COLUMN-HDR-ITEM in SOAP
  var colTypeNodes = oXML.getElementsByTagName('columnTypes'); //initialize array of all COLUMN-HDR-ITEM in SOAP
  if( !colNameNodes || colNameNodes.length == 0 ) {
    return null;
  }
  colNameNodes = colNameNodes[0].getElementsByTagName('names');
  colTypeNodes = colTypeNodes[0].getElementsByTagName('columnType');

  var results = new MetadataQuery.Results();     // create a new results object
  var columnNames = new Array();
  var columns = new Array();
  // store the column names, and the column objects (if the model is populated)
  for (var i=0; i<colNameNodes.length; i++) {
    columnNames.push( colNameNodes[i].firstChild.nodeValue );
    columns.push( this.getColumnById( columnNames[columnNames.length-1] ) );
  }
  results.columnNames = columnNames;
  results.columns = columns;

  // store the column types
  var columnTypes = new Array();
  for (var i=0; i<colTypeNodes.length; i++) {
    columnTypes.push( colTypeNodes[i].firstChild.nodeValue );
  }
  results.columnTypes = columnTypes;

  // store the data values as a 2D array
  results.rows = new Array();
  for (var i=0; i<rowNodes.length; i++) {
    cellNodes = rowNodes[i].getElementsByTagName('cell'); //get the next row
    results.rows[i] = new Array(); //initialize each row with an empty array
    for (var j=0; j<cellNodes.length; j++) {
      if( cellNodes[j].firstChild ) {
        var value = cellNodes[j].firstChild.nodeValue;
        // TODO convert data types
        if( results.columnTypes[j] == 'decimal' || results.columnTypes[j] == 'double' ) {
          value = parseFloat( value );
        }
        results.rows[i].push( value );
      } else {
        // this cell is null
        results.rows[i].push( 'null' );
      }
    }
  }

  // TODO set the sorting information on the result set

  return results;
}
/*
 Category = function() {
 this.categoryId;
 this.categoryName;
 this.columns = new Array();
 }

 Column = function() {
 this.id;
 this.name;
 this.fieldType = pentaho.pda.Column.ELEMENT_TYPES.UNKNOWN;
 this.dataType;
 this.selectedAggType;
 this.defaultAggType;
 this.category;
 this.aggTypes = new Array();
 }
 */
// this helps show values from columns for the user to select from during parameter creation
FilterHelper = function( filterColumn, filterEditBoxId, filterParameterState, model ) {

  this.filterEditBoxId = filterEditBoxId;
  this.filterColumn = filterColumn;
  this.filterParameterState = filterParameterState;
  this.model = model;
  this.filterKeyTimeout = null;
  this.filterId = null;
  this.searchListElement = null;
  this.searchListDiv = null;

  this.endFilterSelection = function() {
    this.searchListDiv.style.display = 'none';
  }

  this.handleFilterKeyUp = function( evt ) {

    var code = evt.keyCode;

    if (code==13) { return }; // return
    if (code==37) { return }; // left
    if (code==38){ return }; // up
    if (code==39){ return }; // right
    if (code==27){ this.endFilterSelection(); return }; // escape
    if (code==40){ // down
      this.searchListElement.focus();
      this.searchListElement.selectedIndex = 0;
      return;
    }
    this.filterParameterState.value = document.getElementById( this.filterEditBoxId ).value;
    this.filterParameterState.defaultValue = this.filterParameterState.value;
    if( this.filterColumn != null ) {
      if( this.filterKeyTimeout != null) {
        clearTimeout( this.filterKeyTimeout );
      }
      this.filterKeyTimeout = setTimeout( "filterHelper.searchFilterValues()", 500 );
    }
  }

  this.filterListKeyUp = function( evt ) {

    var code = evt.keyCode;

    if( code == 27 ) {  // escape
      this.searchListDiv.style.display = 'none';
    }

    if (code==38){ // up arrow
      if( this.searchListElement.selectedIndex > 0 ) {
        return;
      }
      var editbox = document.getElementById( this.filterEditBoxId );
      editbox.focus();
      this.searchListElement.selectedIndex = -1;
    }
    if( code==13 ) { // return
      var editbox = document.getElementById( this.filterEditBoxId );
      this.selectFilterValue();
      editbox.focus();
    }
  }

  this.searchFilterValues = function( ) {

    if( this.filterKeyTimeout != null) {
      clearTimeout( this.filterKeyTimeout );
    }
    this.filterKeyTimeout = null;
    this.searchListElement.options.length = 0;
    var value = document.getElementById( this.filterEditBoxId ).value;
    if( value == '' ) {
      return;
    }

    var result = this.model.searchColumn( this.filterColumn, value );
    if( !result ) {
      return;
    }

    var editbox = document.getElementById( filterEditBoxId );

    var pos = this.findPosition(editbox);

    this.searchListDiv.style.left = ''+pos.x+'px';
    this.searchListDiv.style.width = ''+editbox.style.width;
    this.searchListDiv.style.top = ''+(pos.y+parseInt(editbox.style.height))+'px';
    var rows = result.resultset;
    for( var idx=0; idx<rows.length; idx++ ) {
      var option = new Option( rows[idx][0] );
      this.searchListElement.options[ this.searchListElement.options.length ] = option
      if( this.searchListElement.options.length < 9 ) {
        this.searchListElement.size = Math.max( this.searchListElement.options.length, 2 );
      }
    }
    this.searchListDiv.style.display='block';
  }

  this.findPosition = function(element) {
    var p = {x: element.offsetLeft || 0, y:element.offsetTop || 0};
    while (element = element.offsetParent) {
      p.x += element.offsetLeft;
      p.y += element.offsetTop;
    }
    return p;
  }

  this.selectFilterValue = function() {
    var idx = this.searchListElement.selectedIndex;
    if( idx >= 0 ) {
      var value = this.searchListElement.options[idx].value;
      var editbox = document.getElementById( filterEditBoxId );
      editbox.value = value;
      this.filterParameterState.value = value;
      this.filterParameterState.defaultValue = this.filterParameterState.value;
      if( this.filterValueSelected ) {
        this.filterValueSelected(this.filterParameterState);
      }
      this.searchListDiv.style.display='none';
    }
  }

}

/* ******************************************
 pentaho.pda.query.mql
 ******************************************
 */
pentaho.pda.query.mql = function(model) {
  pentaho.pda.query.call(this,model); //call parent object

  this.state = {
    "class" : "org.pentaho.platform.dataaccess.metadata.model.impl.Query",
    "domainName" : null,
    "modelId" : null,
    "disableDistinct" : false,
    "columns" : [],
    "defaultParameterMap" : null,
    "conditions": [],
    "orders": [],
    "parameters" : []
  };

  // XML Attribute values must not include: <, & or "   (http://www.w3.org/TR/xml/#NT-AttValue)
  this.XML_CHARACTER_MAPPING = {
    '&': '&amp;',
    '<': '&lt;',
    '"': '&quot;'
  };
  this.XML_ILLEGAL_CHARACTERS_PATTERN = /[&<"]/g;
}

inheritPrototype(pentaho.pda.query.mql, pentaho.pda.query); //borrow the parent's methods

pentaho.pda.query.mql.prototype.canQueryReturnData = function() {
  return this.state.columns.length > 0;
}

pentaho.pda.query.mql.prototype.setDomainId = function(domainName) {
  this.state.domainName = domainName;
}

pentaho.pda.query.mql.prototype.setModelId = function(modelId) {
  this.state.modelId = modelId;
}

pentaho.pda.query.mql.prototype.prepare = function( ) {
  // nothing to do here
}

pentaho.pda.query.mql.prototype.createSelection = function() {
  var selection = {
    "class":"org.pentaho.platform.dataaccess.metadata.model.impl.Column",
    "aggTypes":[],
    "category":null,
    "defaultAggType":null,
    "fieldType":null,
    "id":null,
    "name":null,
    "selectedAggType":null,
    "type":null
  };
  return selection;
}

pentaho.pda.query.mql.prototype.createSort = function() {
  var sort = {
    "class" : "org.pentaho.platform.dataaccess.metadata.model.impl.Order",
    "category" : null,
    "column" : null,
    "orderType" : pentaho.pda.Column.SORT_TYPES.ASCENDING
  }
  return sort;
}

pentaho.pda.query.mql.prototype.createCondition = function() {
  var condition = {
    "class" : "org.pentaho.platform.dataaccess.metadata.model.impl.Condition",
    "category" : null,
    "column" : null,
    "operator" : null,
    "value" : null,
    "combinationType" : pentaho.pda.Column.OPERATOR_TYPES.AND,
    "parameterized": false,
    "selectedAggType": null
  }
  return condition;
}

pentaho.pda.query.mql.prototype.createParameter = function() {
  var parameter = {
    "class" : "org.pentaho.platform.dataaccess.metadata.model.impl.Parameter",
    "column": null,
    "name": null,
    "type" : null,
    "value" : null,
    "defaultValue" : null
  }
  return parameter;
}

pentaho.pda.query.mql.prototype.addSelectionById = function( columnId ) {
  var column = this.model.getColumnById( columnId );
  if(column != null) {
    var selection = this.createSelection();
    selection.id = columnId;
    selection.category = column.parent.id;
    selection.selectedAggType = selection.defaultAggType = column.defaultAggregation;
    this.addSelection( selection );
    return selection;
  }
  return null;
}

pentaho.pda.query.mql.prototype.addSortById = function( columnId, orderType ) {
  var column = this.model.getColumnById( columnId );
  if(column != null) {
    var sort = this.createSort();
    sort.column = columnId;
    sort.category = column.parent.id;
    sort.orderType = orderType;
    this.addSort( sort );
    return sort;
  }
  return null;
}

pentaho.pda.query.mql.prototype.addConditionById = function(columnId, operator, value, combinationType, parameterized, selectedAggType) {
  var column = this.model.getColumnById( columnId );
  if(column != null) {
    var condition = this.createCondition();
    condition.column = columnId;
    condition.category = column.parent.id;
    condition.operator = operator;
    condition.parameterized = true === parameterized;
    if(typeof value == 'object' && value.length) {
      condition.value = value;
    } else {
      condition.value = [ value ];
    }
    condition.combinationType = combinationType;
    if (selectedAggType && column.defaultAggregation !== selectedAggType && pentaho.pda.Column.AGG_TYPE_MAP[selectedAggType]) {
      condition.selectedAggType = selectedAggType;
    }
    this.addCondition( condition );
    return condition;
  }
  return null;
}

pentaho.pda.query.mql.prototype.addParameterById = function(columnId, name, value, defaultValue) {
  var column = this.model.getColumnById( columnId );
  if(column != null) {
    var parameter = this.createParameter();
    parameter.column = columnId;
    parameter.name = name;
    parameter.type = column.dataType;
    parameter.value = value;
    parameter.defaultValue = defaultValue;
    if (parameter.defaultValue == undefined) {
      parameter.defaultValue = parameter.value;
    }
  }
  this.addParameter(parameter);
  return parameter;
}

pentaho.pda.query.mql.prototype.couldReturnData = function() {
  return this.state.columns.length > 0;
}

pentaho.pda.query.mql.prototype.addSelection = function( selection ) {
  this.state.columns.push( selection );
}

pentaho.pda.query.mql.prototype.addSort = function( sort ) {
  this.state.orders.push( sort );
}

pentaho.pda.query.mql.prototype.addCondition = function( condition ) {
  this.state.conditions.push( condition );
}

pentaho.pda.query.mql.prototype.addParameter = function( parameter ) {
  this.state.parameters.push( parameter );
}

pentaho.pda.query.mql.prototype.getJson = function() {
  return dojo.toJson(this.state);
}

pentaho.pda.query.mql.prototype.getQueryStr = function() {
  return this.getJson();
}

pentaho.pda.query.mql.prototype.serialize = function() {
  var xml = '';
  xml += '<mql>\n<domain_type>relational</domain_type>\n';
  xml += '<domain_id><![CDATA['+this.model.domainId+']]></domain_id>\n';
  xml += '<model_id>'+this.model.modelId+'</model_id>\n';
  xml += "<options>\n";
  xml += "<disable_distinct>" + this.state.disableDistinct + "</disable_distinct>\n";
  xml += "</options>\n";

  xml += '<parameters>\n';
  for( var idx=0; idx<this.state.parameters.length; idx++ ) {
    xml += this.getParameterXML( this.state.parameters[idx] );
  }
  xml += '</parameters>\n';
  xml += '<selections>\n';
  for( var idx=0; idx<this.state.columns.length; idx++ ) {
    xml += this.getSelectionXML( this.state.columns[idx] );
  }
  xml += '</selections>\n';
  xml += '<constraints>\n';
  for( var idx=0; idx<this.state.conditions.length; idx++ ) {
    if(this.state.conditions[idx].value.indexOf('::mql::') == 0){
      xml += this.getMQLFilterXML(this.state.conditions[idx].value.replace('::mql::',''));
    }
    else{
      xml += this.getFilterXML( this.state.conditions[idx], this.state.parameters );
    }
  }
  xml += '</constraints>\n';
  xml += '<orders>\n';
  for( var idx=0; idx<this.state.orders.length; idx++ ) {
    xml += this.getSortXML( this.state.orders[idx] );
  }
  xml += '</orders>\n';
  xml += '</mql>\n';
  return xml;
}

pentaho.pda.query.mql.prototype.getParameterXML = function( parameter ) {
  var xml = '';
  var column = this.model.getColumnById(parameter.column);
  xml += '<parameter defaultValue="';
  var defaultValue;
  if(parameter.value != null) {
    defaultValue = this.getParameterValueString(column, parameter.value);
  } else {
    defaultValue = this.getParameterValueString(column, parameter.defaultValue);
  }
  if (   column.dataType === pentaho.pda.Column.DATA_TYPES.STRING
      || column.dataType === pentaho.pda.Column.DATA_TYPES.UNKNOWN) {
    defaultValue = this.encodeXmlAttribute(defaultValue) || '';
  }
  xml += defaultValue;
  xml += '" name="'+parameter.name;
  xml += '" type="'+parameter.type+'"/>';
  return xml;
}

pentaho.pda.query.mql.prototype.encodeXmlAttribute = function(value) {
  if (!value) { return; }
  // XML Attribute values must not include: <, & or "   (http://www.w3.org/TR/xml/#NT-AttValue)
  var mapping = this.XML_CHARACTER_MAPPING;
  return value.replace(this.XML_ILLEGAL_CHARACTERS_PATTERN, function(c) {
    return mapping[c];
  });
}

pentaho.pda.query.mql.prototype.getParameterValueString = function ( column, value ) {
  if (value == null || value == '') {
    return '';
  }
  if( value.constructor.toString().indexOf("Array") != -1 ) {
    // we have an array of values
    var str = '';
    for( var idx=0; idx<value.length; idx++ ) {
      if( idx > 0 ) {
        str += '|';
      }
      str += this.getParameterValueString(column,value[idx]);
    }
    return str;
  }
  if( column.dataType == pentaho.pda.Column.DATA_TYPES.DATE ) {
    return ''+value;
  }
  if( column.dataType == pentaho.pda.Column.DATA_TYPES.NUMERIC ) {
    return ''+value;
  }
  if( column.dataType == pentaho.pda.Column.DATA_TYPES.BOOLEAN ) {
    return ''+value;
  }
  return '"'+value+'"';
}

pentaho.pda.query.mql.prototype.getSelectionXML = function( selection ) {
  if( selection && selection.id && selection.category ) {
    var xml = '';
    xml += '<selection>\n';
    xml += '<table>'+selection.category+'</table>\n';
    xml += '<column>'+selection.id+'</column>\n';
    // MQL Editor requires a selection to have an aggregation type
    var aggType = selection.selectedAggType;
    if (!aggType) {
      aggType = selection.defaultAggType;
    }
    xml += '<aggregation>'+aggType+'</aggregation>';
    xml += '</selection>\n';
    return xml;
  } else {
    return '';
  }
}

pentaho.pda.query.mql.prototype.getSortXML = function( sort ) {
  if( !sort ) {
    return;
  }
  var xml = '';
  xml += '<order>\n';
  xml += '<direction>'+sort.orderType+'</direction>\n';
  xml += '<view_id>'+sort.category+'</view_id>\n';
  xml += '<column_id>'+sort.column+'</column_id>\n';
  xml += '</order>\n';
  return xml;
}

pentaho.pda.query.mql.prototype.getFilterXML = function( filter, parameters ) {
  var xml = '';
  xml += '<constraint>\n';
  xml += '<operator>'+filter.combinationType+'</operator>\n';
  xml += '<condition><![CDATA['+this.getFilterConditionString( filter.column, filter.category, filter.operator, filter.value, filter.parameterized, parameters, filter.selectedAggType )+']]></condition>\n';
  xml += '</constraint>\n';
  return xml;
}

pentaho.pda.query.mql.prototype.getMQLFilterXML = function(mqlCondition) {
  var combinationType = 'AND';
  var xml = '';
  xml += '<constraint>\n';
  xml += '<operator>'+combinationType+'</operator>\n';
  xml += '<condition><![CDATA['+mqlCondition+']]></condition>\n';
  xml += '</constraint>\n';
  return xml;
}

pentaho.pda.query.mql.prototype.getFilterConditionString = function( columnId, category, operator, value, parameterName, parameters, aggregationType ) {
  operator = operator.toUpperCase();
  var column = this.model.getColumnById( columnId );
  var operand = '[' + category + '.' + columnId + (aggregationType ? '.' + aggregationType : '') + ']';
  var isArrayValues = value.constructor.toString().indexOf("Array") != -1;
  if( operator == pentaho.pda.Column.CONDITION_TYPES.LIKE ) {
    return 'LIKE('+operand+';"%'+this.getFilterValueString(column, value, parameterName, parameters)+'%")';
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.EQUAL && (!isArrayValues || value.length == 1)) {
    return 'EQUALS('+operand+';'+this.getFilterValueString(column, value, parameterName, parameters) + ')';
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.IN || (operator == pentaho.pda.Column.CONDITION_TYPES.EQUAL && isArrayValues)) {
    return 'IN('+operand+';'+this.getFilterValueString(column, value, parameterName, parameters)+")";
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.LESS_THAN ) {
    return operand+' <'+this.getFilterValueString(column, value, parameterName, parameters);
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.LESS_THAN_OR_EQUAL ) {
    return operand+' <='+this.getFilterValueString(column, value, parameterName, parameters);
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.MORE_THAN ) {
    return operand+' >'+this.getFilterValueString(column, value, parameterName, parameters);
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.MORE_THAN_OR_EQUAL ) {
    return operand+' >='+this.getFilterValueString(column, value, parameterName, parameters);
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.CONTAINS) {
    return 'CONTAINS('+operand+';'+this.getFilterValueString(column, value, parameterName, parameters)+")";
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.NOT_CONTAINS) {
    return 'NOT(CONTAINS('+operand+';'+this.getFilterValueString(column, value, parameterName, parameters)+"))";
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.BEGINSWITH) {
    return 'BEGINSWITH('+operand+';'+this.getFilterValueString(column, value, parameterName, parameters)+")";
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.ENDSWITH) {
    return 'ENDSWITH('+operand+';'+this.getFilterValueString(column, value, parameterName, parameters)+")";
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.IS_NULL) {
    return 'ISNA('+operand+')';
  }
  else if( operator == pentaho.pda.Column.CONDITION_TYPES.NOT_NULL) {
    return 'NOT(ISNA('+operand+'))';
  }
}

pentaho.pda.query.mql.prototype.getFilterValueString = function( column, value, parameterName, parameters ) {
  if (value == null) {
    return '';
  }
  if ( parameterName && parameterName != null && parameterName.length > 0 ) {
    // If this filter is parameterized it's value is the name of the parameter
    // see if we have parameters
    for(var idx=0; idx<parameters.length; idx++) {
      if( parameters[idx].name === parameterName ) {
        // this has a parameter
        var param = '[param:'+parameters[idx].name+']';
        if( column.dataType == pentaho.pda.Column.DATA_TYPES.DATE ) {
          param = 'DATEVALUE('+param+')';
        }
        return param;
      }
    }
    throw new Error("unable to find parameter '" + value + "' for condition on column " + column + ".");
  }

  if( value.constructor.toString().indexOf("Array") != -1 ) {
    // we have an array of values
    var str = '';
    for( var idx=0; idx<value.length; idx++ ) {
      if( idx > 0 ) {
        str += ';';
      }
      str += this.getFilterValueString(column,value[idx]);
    }
    return str;
  }
  if( column.dataType == pentaho.pda.Column.DATA_TYPES.NUMERIC ) {
    return ''+value;
  }
  if( column.dataType == pentaho.pda.Column.DATA_TYPES.DATE ) {
    return 'DATEVALUE("'+value+'")';
  }
  if( column.dataType == pentaho.pda.Column.DATA_TYPES.BOOLEAN ) {
    return ''+value;
  }
  return '"'+value+'"';
}
  return pentaho.pda.MqlHandler;
})