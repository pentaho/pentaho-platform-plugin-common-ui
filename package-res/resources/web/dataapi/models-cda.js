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
define(['common-data/oop', 'common-data/controller'], function(){
pentaho.pda.CDAHandler = function CDAHandler(sandbox) {
	pentaho.pda.Handler.call(this, sandbox);
    this.type = pentaho.pda.SOURCE_TYPE_CDA;
}

inheritPrototype(pentaho.pda.CDAHandler, pentaho.pda.Handler); //borrow the parent's methods

pentaho.pda.CDAHandler.prototype.discoverModels = function(  ) {
	var that = this;
	pentaho.cda.discoverDescriptors(
		function(files){
			var i=0,j=0,datasource, descriptor;
			for (i=0,j=files.length;i<j;i++) {
				descriptor = new pentaho.cda.Descriptor({name:files[i].name, path:files[i].path});
				datasource = new pentaho.pda.model.cda(
					{id:files[i].name,
					name:files[i].name,
					type:pentaho.pda.SOURCE_TYPE_CDA,
					description:''
					});
				datasource.descriptor = descriptor;
				that.modelList.push(datasource);
			}
		}
	)
	return this.sources;		
}

pentaho.pda.model.cda = function(obj) {
	pentaho.pda.model.call(this, obj); //call parent object
	this.path = '';
}

inheritPrototype(pentaho.pda.model.cda, pentaho.pda.model); //borrow the parent's methods

	
pentaho.pda.model.cda.prototype.discoverModelDetail = function( forceLoad ) {

	var that =this
	this.descriptor.discoverQueries(function(queries){
		var i=0,j=0,datasource;
		for (i=0,j=queries.length;i<j;i++) {
            var query = new pentaho.pda.dataelement();
            query.dataType = pentaho.pda.Column.DATA_TYPES.NONE;
            query.elementType = pentaho.pda.Column.ELEMENT_TYPES.QUERY;
            query.id         = queries[i].id;
            query.name       = queries[i].name;
            query.query_type = queries[i].type;
            query.isMeasures = false;
            query.isTime = false;
            that.addElement( query );

			that.addCapability(pentaho.pda.CAPABILITIES.HAS_ACROSS_AXIS);
			that.addCapability(pentaho.pda.CAPABILITIES.IS_ACROSS_CUSTOM);
			that.addCapability(pentaho.pda.CAPABILITIES.HAS_FILTERS);
			that.addCapability(pentaho.pda.CAPABILITIES.IS_FILTER_CUSTOM);
			that.addCapability(pentaho.pda.CAPABILITIES.CAN_SORT);
		};
	});
}
return pentaho.pda.CDAHandler;
});