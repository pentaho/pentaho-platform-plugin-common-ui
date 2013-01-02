/*
                         pentaho.pda.SvcHandler
*/
pentaho.pda.SvcHandler = function svcHandler(sandbox) {
	pentaho.pda.Handler.call(this, sandbox);
    this.type = pentaho.pda.SOURCE_TYPE_SVC;
    this.SERVICE_URL = CONTEXT_PATH+'content/MetadataModelsSvc'; 
}

inheritPrototype(pentaho.pda.SvcHandler, pentaho.pda.Handler); //borrow the parent's methods

pentaho.pda.SvcHandler.prototype.getSources = function(callback, options) {
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
    
            // get the info about the models from the server
            var url = this.SERVICE_URL+'?action=listmodels';
            var contextName = options['context'];
            var query = "domainName=&"+((contextName)? 'context='+contextName : "");
            var jsonStr = pentahoPost( url, query, null, 'text/text' );
            var rawModels = eval( '('+jsonStr+')' );

            for(var idx=0; idx<rawModels.length; idx++ ) {
                model = this.addModelInfoFromNode( rawModels[idx] );
                this.sources.push(model);
				if (filter == null) {
					callback(model);
				} else {
					if (model[filter.property] == filter.value) {
						callback(each);
					}
				}
            }

	}
}  //end discoverModels

pentaho.pda.SvcHandler.prototype.newModelFromState = function( state ) {
    var model = state;    
    model.modelId = state.id;
    model.type = model.providerId;
    return model;
}

pentaho.pda.SvcHandler.prototype.addModelInfoFromNode = function addModelInfoFromNode( node ) {
	return new pentaho.pda.model.svc(this.newModelFromState(node), this);
} //end addModelInfoFromNode

/* ******************************************
                        pentaho.pda.model.svc
   ******************************************						
*/
pentaho.pda.model.svc = function(obj, handler) {
	pentaho.pda.model.call(this, obj); //call parent object
	    
    this.categories = new Array();
    this.id = obj.id;
    this.modelId = obj.modelId;
    this.modelName = obj.modelName || '';
    this.modelDescription = obj.modelDescription || '';
    this.handler = handler;
    this.type = 'svc';
    this.state = obj;
}

inheritPrototype(pentaho.pda.model.svc, pentaho.pda.model); //borrow the parent's methods

pentaho.pda.model.svc.prototype.discoverModelDetail = function() {

	// get the info about the models from the server
	var url = this.handler.SERVICE_URL+'?action=getmodel&id='+escape(this.id);
	var resultStr = pentahoPost( url, '', null, 'text/text' );
	// parse the XML

    this.state = eval( '('+resultStr+')' );
    
    this.categories = this.state.categories;
    this.capabilities = this.state.capabilities;
    if( this.capabilities == null ) {
        this.capabilities = {};
    }
    this.elements = this.state.elements;
    
}
    
pentaho.pda.model.svc.prototype.getAllColumns = function() {
        var columns = new Array();

        for( var idx2 = 0; idx2<this.elements.length; idx2++ ) {
            if(this.elements[idx2].isQueryElement) {
                columns.push( this.elements[idx2] );
            }
        }
        return columns;
}
        
pentaho.pda.model.svc.prototype.searchColumn = function( column, searchStr, rowLimit, callback ) {
        var query = this.createQuery();
        var selection = query.addSelectionById( column.id );
        var sort = query.addSortById( column.id, pentaho.pda.Column.SORT_TYPES.ASCENDING );
        if( searchStr ) {
            query.addConditionById(column.id,pentaho.pda.Column.CONDITION_TYPES.CONTAINS,searchStr,pentaho.pda.Column.OPERATOR_TYPES.OR);
        }
        return this.submitQuery( query, rowLimit, callback );
    }
    
pentaho.pda.model.svc.prototype.getAllValuesForColumn = function( column, rowLimit ) {
        return this.searchColumn( column, undefined, rowLimit );
    }
    
    // create a new query
pentaho.pda.model.svc.prototype.createQuery = function() {

    var query = new pentaho.pda.query.svc(this);

    query.setSourceId( this.id );
    return query;
}


// create a new query from a serialized state
pentaho.pda.model.svc.prototype.createQueryFromJson = function( json ) {

    var query = new pentaho.pda.query.svc(this);

    var state;
    if( json["class"] ) {
        state = json;
    } else {
        state = eval( '('+json+')' );
    }

    query.setSourceId( this.id );
    query.setState(state);
    return query;
}

    // get the results of the query
// This is a synchronous call unless a callback is provided. see pentaho-ajax's pentahoAction() documentation
// for types of callbacks.
pentaho.pda.model.svc.prototype.submitQuery = function( queryObject, rowLimit, callback ) {
        var json = queryObject.getJson(); 
//        alert(json);
        return this.submit(json, rowLimit, callback);
}

pentaho.pda.model.svc.prototype.submit = function( jsonString, rowLimit, callback ) {
    
        var results = {
            metadata:[],
            resultset:[]
        }            
        if (!rowLimit) {
            rowLimit = -1;
        }
//        alert(jsonString);
        var handleResultCallback = dojo.hitch(this, function(resultJson) {
//alert(resultJson);
          var jsonTable = eval('('+resultJson+')');
          result = new pentaho.DataTable(jsonTable);
          if (callback) {
            callback(result);
          }
          return result;
        });
        
        try {
            // get the info about the models from the server
            var url = this.handler.SERVICE_URL;
            var query = "action=query&query="+jsonString;
            var resultJson = pentahoPost( url, query, callback ? handleResultCallback : undefined, 'text/text');
            if (!callback) {
              return handleResultCallback(resultJson);
            }
        } catch (e) {
            alert(e.message);
        }
        return null;

    }

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
                        pentaho.pda.query.svc
   ******************************************						
*/
pentaho.pda.query.svc = function(model) {
	pentaho.pda.query.call(this,model); //call parent object
	
    this.state = {
        "class":"org.pentaho.metadata.model.thin.Query",
        "elements":[],
        "conditions":[],
        "defaultParameterMap":null,
        "disableDistinct":null,
        "orders":[],
        "parameters":[],
        "sourceId":""
    };
}

inheritPrototype(pentaho.pda.query.svc, pentaho.pda.query); //borrow the parent's methods

pentaho.pda.query.svc.prototype.setState = function(state) {
    this.state = state;
}

pentaho.pda.query.svc.prototype.canQueryReturnData = function() {
    return this.state.elements.length > 0;
}

pentaho.pda.query.svc.prototype.setSourceId = function(sourceId) {
        this.state.sourceId = sourceId;
    }
    
pentaho.pda.query.svc.prototype.prepare = function( ) {
    // nothing to do here
    }    
    
pentaho.pda.query.svc.prototype.createSelection = function() {
        var selection = {
            "class":"org.pentaho.metadata.model.thin.Element",
            "elementType":null,
            "id":"time",
            "name":null,
            "selectedAggregation":null,
            "dataType":null
        }
        
        return selection;
    }
    
pentaho.pda.query.svc.prototype.createSort = function() {
        var sort = {
            "class" : "org.pentaho.metadata.model.thin.Order",
            "parentId" : null,
            "elementId" : null,
            "orderType" : pentaho.pda.Column.SORT_TYPES.ASCENDING
        }
        return sort;
    }
    
pentaho.pda.query.svc.prototype.createCondition = function() {
        var condition = {
            "class" : "org.pentaho.common.ui.metadata.model.impl.Condition",
            "parentId" : null,
            "elementId" : null,
            "operator" : null,
            "value" : null,
            "combinationType" : pentaho.pda.Column.OPERATOR_TYPES.AND,
            "parameterized": false,
            "selectedAggType": null
        }
        return condition;
    }
    
pentaho.pda.query.svc.prototype.createParameter = function() {
        var parameter = {
            "class" : "org.pentaho.common.ui.metadata.model.impl.Parameter",
            "elementId": null,
            "name": null,
            "type" : null,
            "value" : null,
            "defaultValue" : null
        }
        return parameter;
    }
    
pentaho.pda.query.svc.prototype.addSelectionById = function( columnId ) {
        var column = this.model.getColumnById( columnId );
        if(column != null) {
            var selection = this.createSelection();
            selection.id = columnId;
            selection.parentId = column.parentId;
            selection.selectedAggregation = selection.defaultAggType = column.defaultAggregation;
            this.addSelection( selection );
            return selection;
        }
        return null;
    }
    
pentaho.pda.query.svc.prototype.addSortById = function( columnId, orderType ) {
        var column = this.model.getColumnById( columnId );
        if(column != null) {
            var sort = this.createSort();
            sort.elementId = columnId;
            sort.parentId = column.parentId;
            sort.orderType = orderType;
            this.addSort( sort );
            return sort;
        }
        return null;
    }
    
pentaho.pda.query.svc.prototype.addConditionById = function(columnId, operator, value, combinationType, parameterized, selectedAggType) {
        var column = this.model.getColumnById( columnId );
        if(column != null) {
            var condition = this.createCondition();
            condition.elementId = columnId;
            condition.parentId = column.parentId;
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
    
pentaho.pda.query.svc.prototype.addParameterById = function(columnId, name, value, defaultValue) {
        var column = this.model.getColumnById( columnId );
        if(column != null) {
            var parameter = this.createParameter();
            parameter.elementId = columnId;
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
    
pentaho.pda.query.svc.prototype.couldReturnData = function() {
    return this.state.elements.length > 0;
}
    
pentaho.pda.query.svc.prototype.addSelection = function( selection ) {
        this.state.elements.push( selection );
    }
    
pentaho.pda.query.svc.prototype.addSort = function( sort ) {
        this.state.orders.push( sort );
    }
    
pentaho.pda.query.svc.prototype.addCondition = function( condition ) {
        this.state.conditions.push( condition );
    }
    
pentaho.pda.query.svc.prototype.addParameter = function( parameter ) {
        this.state.parameters.push( parameter );
    }
    
pentaho.pda.query.svc.prototype.getJson = function() {
        return dojo.toJson(this.state);
    }
    
pentaho.pda.query.svc.prototype.getQueryStr = function() {
        return this.getJson();
    }

pentaho.pda.query.svc.prototype.getParameterValueString = function ( column, value ) {
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

pentaho.pda.query.svc.prototype.getFilterConditionString = function( columnId, category, operator, value, parameterized, parameters, aggregationType ) {
        operator = operator.toUpperCase();
        var column = this.model.getColumnById( columnId );
        var operand = '[' + category + '.' + columnId + (aggregationType ? '.' + aggregationType : '') + ']';
        var isArrayValues = value.constructor.toString().indexOf("Array") != -1;
        if( operator == pentaho.pda.Column.CONDITION_TYPES.LIKE ) {
            return 'LIKE('+operand+';"%'+this.getFilterValueString(column, value, parameterized, parameters)+'%")'; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.EQUAL && (!isArrayValues || value.length == 1)) {
            return 'EQUALS('+operand+';'+this.getFilterValueString(column, value, parameterized, parameters) + ')'; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.EQUAL && isArrayValues) {
            return 'IN('+operand+';'+this.getFilterValueString(column, value, parameterized, parameters)+")"; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.LESS_THAN ) {
            return operand+' <'+this.getFilterValueString(column, value, parameterized, parameters); 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.LESS_THAN_OR_EQUAL ) {
            return operand+' <='+this.getFilterValueString(column, value, parameterized, parameters); 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.MORE_THAN ) {
            return operand+' >'+this.getFilterValueString(column, value, parameterized, parameters); 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.MORE_THAN_OR_EQUAL ) {
            return operand+' >='+this.getFilterValueString(column, value, parameterized, parameters); 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.CONTAINS) {
            return 'CONTAINS('+operand+';'+this.getFilterValueString(column, value, parameterized, parameters)+")"; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.NOT_CONTAINS) {
            return 'NOT(CONTAINS('+operand+';'+this.getFilterValueString(column, value, parameterized, parameters)+"))"; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.BEGINSWITH) {
            return 'BEGINSWITH('+operand+';'+this.getFilterValueString(column, value, parameterized, parameters)+")"; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.ENDSWITH) {
            return 'ENDSWITH('+operand+';'+this.getFilterValueString(column, value, parameterized, parameters)+")"; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.IS_NULL) {
            return 'ISNA('+operand+')'; 
        }
        else if( operator == pentaho.pda.Column.CONDITION_TYPES.NOT_NULL) {
            return 'NOT(ISNA('+operand+'))'; 
        }
    }
    
pentaho.pda.query.svc.prototype.getFilterValueString = function( column, value, parameterized, parameters ) {
        if (value == null) {
            return '';
        }
        if (parameterized) {
          // If this filter is parameterized it's value is the name of the parameter
          // see if we have parameters
          for(var idx=0; idx<parameters.length; idx++) {
              if( parameters[idx].name === value[0] ) {
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
