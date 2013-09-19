/*!
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
* Foundation.
*
* You should have received a copy of the GNU Lesser General Public License along with this
* program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
* or from the Free Software Foundation, Inc.,
* 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
* without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
* See the GNU Lesser General Public License for more details.
*
* Copyright (c) 2002-2013 Pentaho Corporation..  All rights reserved.
*/

package org.pentaho.common.ui.test;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

import junit.framework.Assert;

import org.junit.Test;
import org.pentaho.common.ui.metadata.service.MetadataModelsContentGenerator;
import org.pentaho.metadata.datatable.DataTable;
import org.pentaho.metadata.model.thin.Column;
import org.pentaho.metadata.model.thin.Element;
import org.pentaho.metadata.model.thin.Query;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;

import flexjson.JSONDeserializer;
import flexjson.JSONSerializer;

@SuppressWarnings({"all"})
public class MetadataModelsContentGeneratorTest {

	static {
		TestModelProvider.getInstance();
	}
	
	@Test
	public void testNoAction() throws Exception {
		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		
		Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
		
		SimpleParameterProvider requestParams = new SimpleParameterProvider();
		requestParams.setParameter("action", "");
		parameterProviders.put(IParameterProvider.SCOPE_REQUEST, requestParams);
		
		cg.setParameterProviders(parameterProviders);
		
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		cg.createContent(output);
		
		String result = output.toString();
		Assert.assertNotNull("result is null",result);
		Assert.assertEquals("Wrong contents","", result);
		
	}	
	
	@Test
	public void testBadStream() throws Exception {
		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		
		Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
		
		SimpleParameterProvider requestParams = new SimpleParameterProvider();
		requestParams.setParameter("action", MetadataModelsContentGenerator.LIST_MODELS_ACTION);
		parameterProviders.put(IParameterProvider.SCOPE_REQUEST, requestParams);
		
		cg.setParameterProviders(parameterProviders);
		
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		cg.createContent(null);
		
		String result = output.toString();
		Assert.assertNotNull("result is null",result);
		Assert.assertEquals("Wrong contents","", result);
		
	}

	@Test
	public void testGetModelList() throws Exception {
		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		
		Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
		
		SimpleParameterProvider requestParams = new SimpleParameterProvider();
		requestParams.setParameter("action", MetadataModelsContentGenerator.LIST_MODELS_ACTION);
		parameterProviders.put(IParameterProvider.SCOPE_REQUEST, requestParams);
		
		cg.setParameterProviders(parameterProviders);
		
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		cg.createContent(output);
		
		String result = output.toString();
		System.out.println( result );
		
		Assert.assertNotNull("result is null",result);
		Assert.assertTrue("Wrong contents",result.indexOf("org.pentaho.metadata.model.thin.ModelInfo") > 0);
		Assert.assertTrue("Wrong contents",result.indexOf("test provider") > 0);
		Assert.assertTrue("Wrong contents",result.indexOf("test group") > 0);
		Assert.assertTrue("Wrong contents",result.indexOf("test model id") > 0);
		
	}

	@Test
	public void testGetModels() throws Exception {
		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		
		Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
		
		SimpleParameterProvider requestParams = new SimpleParameterProvider();
		requestParams.setParameter("action", MetadataModelsContentGenerator.LIST_MODELS_ACTION);
		requestParams.setParameter("match", TestModelProvider.MODEL_ID);
		
		parameterProviders.put(IParameterProvider.SCOPE_REQUEST, requestParams);
		
		cg.setParameterProviders(parameterProviders);
		
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		cg.createContent(output);
		
		String result = output.toString();
		System.out.println( result );

		Assert.assertNotNull("result is null",result);
		Assert.assertTrue("Wrong contents",result.indexOf("org.pentaho.metadata.model.thin.ModelInfo") > 0);
		Assert.assertTrue("Wrong contents",result.indexOf("test provider") > 0);
		Assert.assertTrue("Wrong contents",result.indexOf("test group") > 0);
		Assert.assertTrue("Wrong contents",result.indexOf("test model id") > 0);
		
	}
	
	@Test
	public void testGetModel() throws Exception {
		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		
		Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
		
		SimpleParameterProvider requestParams = new SimpleParameterProvider();
		requestParams.setParameter("action", MetadataModelsContentGenerator.GET_MODEL_ACTION);
		String id = TestModelProvider.getInstance().getModelList(null,null,null)[0].getId();
		requestParams.setParameter("id", id);
		
		parameterProviders.put(IParameterProvider.SCOPE_REQUEST, requestParams);
		
		cg.setParameterProviders(parameterProviders);
		
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		cg.createContent(output);
		
		String result = output.toString();
		System.out.println( result );

		Assert.assertNotNull("result is null",result);
		Assert.assertTrue("Wrong contents",result.indexOf("org.pentaho.metadata.model.thin.Element") > 0);
		Assert.assertTrue("Wrong contents",result.indexOf("test model id") > 0);
		
	}
	
	@Test
	public void testQuery() throws Exception {
		
		// A query with no condition
		Query query = new Query();
		String id = TestModelProvider.getInstance().getModelList(null,null,null)[0].getId();
		query.setSourceId(id);
		Element timeColumn = new Element();
		timeColumn.setId("element1");
		Element freeColumn = new Element();
		freeColumn.setId("element2");
		
		Element columns[] = new Element[] {timeColumn, freeColumn};
		columns[0] = timeColumn;
		query.setElements(columns);

		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		
		Map<String,IParameterProvider> parameterProviders = new HashMap<String,IParameterProvider>();
		
		SimpleParameterProvider requestParams = new SimpleParameterProvider();
		requestParams.setParameter("action", MetadataModelsContentGenerator.QUERY_ACTION);
		JSONSerializer ser = new JSONSerializer();
		String queryJson = ser.deepSerialize(query);
		System.out.println( queryJson );
		requestParams.setParameter("query", queryJson);
		
		parameterProviders.put(IParameterProvider.SCOPE_REQUEST, requestParams);
		
		cg.setParameterProviders(parameterProviders);
		
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		cg.createContent(output);
		
		String result = output.toString();
		System.out.println( result );
		JSONDeserializer<DataTable> de = new JSONDeserializer<DataTable>();
		DataTable table = de.deserialize(result);
		
		Assert.assertNotNull("Data table is null", table);
		
		Assert.assertEquals("Wrong number of columns", 2, table.getCols().length);
		Assert.assertEquals("Wrong column name", "element1", table.getCols()[0].getId());
		Assert.assertEquals("Wrong column name", "element2", table.getCols()[1].getId());
		
		// we should have at least 10 rows
		Assert.assertEquals("Wrong number of rows", 1, table.getRows().length);
		
	}
	
	@Test
	public void testMimeType() {
		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		String mime = cg.getMimeType();
		Assert.assertEquals("application/json", mime);
	}
	
	@Test
	public void testLogger() {
		MetadataModelsContentGenerator cg = new MetadataModelsContentGenerator();
		Assert.assertNotNull(cg.getLogger());
	}
	
}
