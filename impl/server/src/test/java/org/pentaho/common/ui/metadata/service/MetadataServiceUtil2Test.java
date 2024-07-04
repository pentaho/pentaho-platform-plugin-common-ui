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
 * Copyright (c) 2002-2017 Hitachi Vantara..  All rights reserved.
 */

package org.pentaho.common.ui.metadata.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.commons.connection.IPentahoMetaData;
import org.pentaho.commons.connection.IPentahoResultSet;
import org.pentaho.metadata.model.Category;
import org.pentaho.metadata.model.Domain;
import org.pentaho.metadata.model.IPhysicalColumn;
import org.pentaho.metadata.model.LogicalColumn;
import org.pentaho.metadata.model.LogicalModel;
import org.pentaho.metadata.model.concept.Concept;
import org.pentaho.metadata.model.concept.types.AggregationType;
import org.pentaho.metadata.model.concept.types.Alignment;
import org.pentaho.metadata.model.concept.types.DataType;
import org.pentaho.metadata.model.concept.types.FieldType;
import org.pentaho.metadata.model.concept.types.LocalizedString;
import org.pentaho.metadata.model.thin.Condition;
import org.pentaho.metadata.model.thin.Element;
import org.pentaho.metadata.model.thin.Model;
import org.pentaho.metadata.model.thin.ModelInfo;
import org.pentaho.metadata.model.thin.Order;
import org.pentaho.metadata.model.thin.Parameter;
import org.pentaho.metadata.model.thin.Query;
import org.pentaho.metadata.query.model.CombinationType;
import org.pentaho.metadata.query.model.Constraint;
import org.pentaho.metadata.query.model.Order.Type;
import org.pentaho.metadata.query.model.Selection;
import org.pentaho.metadata.repository.IMetadataDomainRepository;

public class MetadataServiceUtil2Test {

  private static final String DEFAULT_LOCALE = "en";
  private static final String DOMAIN_ID = "domain_id";

  private MetadataServiceUtil2 spyMetadataServiceUtil = spy( new MetadataServiceUtil2() );

  @Before
  public void setUp() {
    doReturn( DEFAULT_LOCALE ).when( spyMetadataServiceUtil ).getLocale();
  }

  @Test
  public void testCreateThinModel() {
    LogicalColumn column =
        createMockColumn( "id_column", "name_column", "description_column", DataType.STRING, FieldType.ATTRIBUTE );
    List<LogicalColumn> listColumns = new ArrayList<LogicalColumn>( 1 );
    listColumns.add( column );
    Category category = createMockCategory( "id_category", "name_category", "description_category", listColumns );
    List<Category> listCategories = new ArrayList<Category>( 1 );
    listCategories.add( category );
    LogicalModel lmodel = createMockModel( "id", "name", "description", listCategories );

    Model model = spyMetadataServiceUtil.createThinModel( lmodel, DOMAIN_ID );

    assertModels( lmodel, model, DOMAIN_ID );
    assertEquals( 2, model.getElements().length );
    Element elemCat = model.getElements()[0];
    assertElements( category, elemCat );
    Element elemCol = model.getElements()[1];
    assertColumns( column, elemCol, category.getId() );
  }

  @Test
  public void testCreateCdaJson() throws JSONException {
    String result = spyMetadataServiceUtil.createCdaJson( null, DEFAULT_LOCALE );
    assertNull( result );

    Object[][] headers = new Object[][] { { new String( "Header_0" ), new String( "Header_1" ) } };
    IPentahoMetaData mockMetaData = mock( IPentahoMetaData.class );
    doReturn( headers ).when( mockMetaData ).getColumnHeaders();
    doReturn( DataType.STRING ).when( mockMetaData ).getAttribute( 0, 0, IPhysicalColumn.DATATYPE_PROPERTY );
    doReturn( DataType.BOOLEAN ).when( mockMetaData ).getAttribute( 0, 1, IPhysicalColumn.DATATYPE_PROPERTY );
    doReturn( new LocalizedString( DEFAULT_LOCALE, "name_0" ) ).when( mockMetaData ).getAttribute( 0, 0,
        Concept.NAME_PROPERTY );
    doReturn( new LocalizedString( DEFAULT_LOCALE, "name_1" ) ).when( mockMetaData ).getAttribute( 0, 1,
        Concept.NAME_PROPERTY );
    IPentahoResultSet mockResultSet = mock( IPentahoResultSet.class );
    doReturn( 2 ).when( mockResultSet ).getColumnCount();
    doReturn( 2 ).when( mockResultSet ).getRowCount();
    doReturn( "val_00" ).when( mockResultSet ).getValueAt( 0, 0 );
    doReturn( "val_01" ).when( mockResultSet ).getValueAt( 0, 1 );
    doReturn( "val_10" ).when( mockResultSet ).getValueAt( 1, 0 );
    doReturn( "val_11" ).when( mockResultSet ).getValueAt( 1, 1 );
    doReturn( mockMetaData ).when( mockResultSet ).getMetaData();

    result = spyMetadataServiceUtil.createCdaJson( mockResultSet, DEFAULT_LOCALE );
    assertNotNull( result );
    JSONObject resultObj = new JSONObject( result );
    assertTrue( resultObj.has( "metadata" ) );
    assertTrue( resultObj.has( "resultset" ) );
    JSONArray resultset = resultObj.getJSONArray( "resultset" );
    assertEquals( "[[\"val_00\",\"val_01\"],[\"val_10\",\"val_11\"]]", resultset.toString() );
    JSONArray metadata = resultObj.getJSONArray( "metadata" );
    makeMetadataObjectAssertions( metadata.getJSONObject( 0 ), 0, "STRING" );
    makeMetadataObjectAssertions( metadata.getJSONObject( 1 ), 1, "BOOLEAN" );
  }

  private void makeMetadataObjectAssertions( JSONObject obj, int idx, String type ) throws JSONException {
    assertEquals( "name_" + idx, obj.getString( "colLabel" ) );
    assertEquals( idx, obj.getInt( "colIndex" ) );
    assertEquals( type, obj.getString( "colType" ) );
    assertEquals( "Header_" + idx, obj.getString( "colName" ) );
  }

  @Test
  public void testConvertQuery() {
    String domainName = "test_domain";
    String modelId = "model_id";
    String columnId = "column_id";
    LogicalColumn mockColumn = mock( LogicalColumn.class );
    doReturn( DataType.STRING ).when( mockColumn ).getDataType();
    doReturn( columnId ).when( mockColumn ).getId();
    LogicalModel mockModel = mock( LogicalModel.class );
    doReturn( mockColumn ).when( mockModel ).findLogicalColumn( columnId );
    Domain mockDomain = mock( Domain.class );
    doReturn( mockModel ).when( mockDomain ).findLogicalModel( modelId );
    IMetadataDomainRepository mockRepo = mock( IMetadataDomainRepository.class );
    doReturn( mockDomain ).when( mockRepo ).getDomain( domainName );
    org.pentaho.metadata.model.Category category = mock( org.pentaho.metadata.model.Category.class );
    doReturn( category ).when( spyMetadataServiceUtil ).getCategory( columnId, mockModel );
    doReturn( mockRepo ).when( spyMetadataServiceUtil ).getDomainRepository();

    Query srcQuery = createMockQuery( domainName, modelId, columnId );
    ModelInfo info = new ModelInfo();
    info.setGroupId( domainName );
    info.setModelId( modelId );

    org.pentaho.metadata.query.model.Query result = spyMetadataServiceUtil.convertQuery( srcQuery, info );

    assertNotNull( result );
    assertEquals( mockDomain, result.getDomain() );
    assertFalse( result.getDisableDistinct() );
    assertEquals( mockModel, result.getLogicalModel() );
    assertEquals( 1, result.getSelections().size() );
    Selection selection = result.getSelections().get( 0 );
    assertEquals( mockColumn, selection.getLogicalColumn() );
    assertEquals( category, selection.getCategory() );
    assertEquals( AggregationType.SUM, selection.getActiveAggregationType() );
    assertEquals( AggregationType.SUM, selection.getAggregationType() );
    assertEquals( 1, result.getConstraints().size() );
    Constraint constraint = result.getConstraints().get( 0 );
    assertEquals( CombinationType.AND, constraint.getCombinationType() );
    assertNull( constraint.getFormula() );
    assertEquals( 1, result.getOrders().size() );
    org.pentaho.metadata.query.model.Order resOrder = result.getOrders().get( 0 );
    assertEquals( selection, resOrder.getSelection() );
    assertEquals( Type.ASC, resOrder.getType() );
    assertEquals( 1, result.getParameters().size() );
    org.pentaho.metadata.query.model.Parameter param = result.getParameters().get( 0 );
    assertEquals( "parameter_name", param.getName() );
    assertEquals( "val_0", param.getDefaultValue() );
    assertEquals( DataType.STRING, param.getType() );
  }

  @Test
  public void testGetCategory() {
    String columnId = "my_test_column_id";
    LogicalModel logicalModel = mock( LogicalModel.class );

    doReturn( Collections.<Category>emptyList() ).when( logicalModel ).getCategories();
    Category result = spyMetadataServiceUtil.getCategory( columnId, logicalModel );
    assertNull( result );

    LogicalColumn mockColumn = mock( LogicalColumn.class );
    Category mockCat1 = mock( Category.class );
    Category mockCat2 = mock( Category.class );
    doReturn( null ).when( mockCat1 ).findLogicalColumn( columnId );
    doReturn( mockColumn ).when( mockCat2 ).findLogicalColumn( columnId );
    List<Category> listCategories = new ArrayList<Category>( 2 );
    listCategories.add( mockCat1 );
    listCategories.add( mockCat2 );
    doReturn( listCategories ).when( logicalModel ).getCategories();
    result = spyMetadataServiceUtil.getCategory( columnId, logicalModel );
    assertEquals( mockCat2, result );
  }

  @Test
  public void testDeserializeJsonQuery() {
    String json =
        "{\"class\":\"org.pentaho.metadata.model.thin.Query\",\"conditions\":[{\"class\":\"org.pentaho.metadata.model.thin.Condition\","
            + "\"combinationType\":\"AND\",\"elementId\":\"MY_ELEM_ID\",\"operator\":\"EQUAL\",\"parameterized\":false,"
            + "\"parentId\":\"MY_PARENT_ID\",\"selectedAggregation\":\"SUM\",\"value\":[ ]}],\"defaultParameterMap\":null,"
            + "\"disableDistinct\":false,\"elements\":[{\"availableAggregations\":null,\"capabilities\":null,"
            + "\"class\":\"org.pentaho.metadata.model.thin.Element\",\"dataType\":null,\"defaultAggregation\":\"NONE\","
            + "\"description\":null,\"elementType\":null,\"formatMask\":null,\"hiddenForUser\":false,\"horizontalAlignment\":\"LEFT\","
            + "\"id\":\"MY_ELEM_ID\",\"isQueryElement\":true,\"name\":null,\"parentId\":\"PARENT_ID\",\"selectedAggregation\":\"SUM\"}],"
            + "\"orders\":[{\"class\":\"org.pentaho.metadata.model.thin.Order\",\"elementId\":\"MY_ELEM_ID\",\"orderType\":\"ASC\","
            + "\"parentId\":\"MY_PARENT_ID\"}],\"parameters\":[],\"sourceId\":\"MY_DOMAIN_ID\"}";
    Query result = spyMetadataServiceUtil.deserializeJsonQuery( json );
    assertNotNull( result );
    assertEquals( "MY_DOMAIN_ID", result.getSourceId() );
    assertFalse( result.getDisableDistinct() );
    assertEquals( 1, result.getElements().length );
    Element column = result.getElements()[0];
    assertEquals( "MY_ELEM_ID", column.getId() );
    assertNull( column.getName() );
    assertNull( column.getDescription() );
    assertNull( column.getElementType() );
    assertNull( column.getFormatMask() );
    assertNull( column.getDataType() );
    assertFalse( column.isHiddenForUser() );
    assertEquals( "NONE", column.getDefaultAggregation() );
    assertEquals( "PARENT_ID", column.getParentId() );
    assertEquals( "LEFT", column.getHorizontalAlignment() );
    assertEquals( "SUM", column.getSelectedAggregation() );
    assertEquals( 1, result.getConditions().length );
    Condition condition = result.getConditions()[0];
    assertEquals( "MY_PARENT_ID", condition.getParentId() );
    assertEquals( "MY_ELEM_ID", condition.getElementId() );
    assertEquals( "AND", condition.getCombinationType() );
    assertEquals( "EQUAL", condition.getOperator() );
    assertFalse( condition.isParameterized() );
    assertEquals( "SUM", condition.getSelectedAggregation() );
    Assert.assertArrayEquals( new String[] {  }, condition.getValue() );
    assertEquals( 1, result.getOrders().length );
    Order order = result.getOrders()[0];
    assertEquals( "MY_ELEM_ID", order.getElementId() );
    assertEquals( "MY_PARENT_ID", order.getParentId() );
    assertEquals( "ASC", order.getOrderType() );
    assertEquals( 0, result.getParameters().length );
  }

  private LogicalColumn createMockColumn( String id, String name, String desc, DataType dataType, FieldType fieldType ) {
    LogicalColumn column = mock( LogicalColumn.class );
    doReturn( name ).when( column ).getName( DEFAULT_LOCALE );
    doReturn( id ).when( column ).getId();
    doReturn( desc ).when( column ).getDescription( DEFAULT_LOCALE );
    doReturn( dataType ).when( column ).getDataType();
    doReturn( fieldType ).when( column ).getFieldType();
    List<AggregationType> aggList = new ArrayList<AggregationType>( 2 );
    aggList.add( AggregationType.SUM );
    aggList.add( AggregationType.COUNT );
    doReturn( aggList ).when( column ).getAggregationList();
    doReturn( AggregationType.AVERAGE ).when( column ).getAggregationType();
    doReturn( Alignment.LEFT ).when( column ).getProperty( "alignment" );
    doReturn( "test_mask" ).when( column ).getProperty( "mask" );
    doReturn( Boolean.FALSE ).when( column ).getProperty( "hidden" );
    return column;
  }

  private Category createMockCategory( String id, String name, String desc, List<LogicalColumn> columns ) {
    Category category = mock( Category.class );
    doReturn( name ).when( category ).getName( DEFAULT_LOCALE );
    doReturn( id ).when( category ).getId();
    doReturn( desc ).when( category ).getDescription( DEFAULT_LOCALE );
    doReturn( columns ).when( category ).getLogicalColumns();
    return category;
  }

  private LogicalModel createMockModel( String id, String name, String desc, List<Category> categories ) {
    LogicalModel lmodel = mock( LogicalModel.class );
    doReturn( name ).when( lmodel ).getName( DEFAULT_LOCALE );
    doReturn( id ).when( lmodel ).getId();
    doReturn( desc ).when( lmodel ).getDescription( DEFAULT_LOCALE );
    doReturn( categories ).when( lmodel ).getCategories();
    return lmodel;
  }

  private void assertColumns( LogicalColumn lcolumn, Element column, String categoryId ) {
    assertEquals( lcolumn.getId(), column.getId() );
    assertEquals( lcolumn.getName( DEFAULT_LOCALE ), column.getName() );
    assertEquals( lcolumn.getDescription( DEFAULT_LOCALE ), column.getDescription() );
    assertEquals( categoryId, column.getParentId() );
    assertEquals( lcolumn.getDataType().getName().toUpperCase(), column.getDataType() );
    assertEquals( lcolumn.getFieldType().name(), column.getElementType() );
    Assert.assertArrayEquals( new String[] { "SUM", "COUNT", "AVERAGE" }, column.getAvailableAggregations() );
    assertEquals( lcolumn.getAggregationType().name(), column.getDefaultAggregation() );
    assertEquals( lcolumn.getAggregationType().name(), column.getSelectedAggregation() );
    assertEquals( "LEFT", column.getHorizontalAlignment() );
    assertEquals( "test_mask", column.getFormatMask() );
    Assert.assertFalse( column.isHiddenForUser() );
  }

  private void assertElements( Category category, Element element ) {
    assertEquals( category.getId(), element.getId() );
    assertEquals( category.getName( DEFAULT_LOCALE ), element.getName() );
    assertEquals( category.getDescription( DEFAULT_LOCALE ), element.getDescription() );
    assertFalse( element.getIsQueryElement() );
    assertNull( element.getParentId() );
  }

  private void assertModels( LogicalModel lmodel, Model model, String domainId ) {
    assertNotNull( model );
    assertEquals( lmodel.getId(), model.getModelId() );
    assertEquals( domainId, model.getGroupId() );
    assertEquals( lmodel.getName( DEFAULT_LOCALE ), model.getName() );
    assertEquals( lmodel.getDescription( DEFAULT_LOCALE ), model.getDescription() );
  }

  private Query createMockQuery( String domainName, String modelId, String columnId ) {
    Element elem = new Element();
    elem.setSelectedAggregation( "SUM" );
    elem.setId( columnId );
    Condition condition = mock( Condition.class );
    doReturn( "test_condition" ).when( condition ).getCondition( "String", null );
    doReturn( "AND" ).when( condition ).getCombinationType();
    doReturn( columnId ).when( condition ).getElementId();
    Order order = mock( Order.class );
    doReturn( columnId ).when( order ).getElementId();
    doReturn( "ASC" ).when( order ).getOrderType();
    Parameter paramater = mock( Parameter.class );
    doReturn( new String[] { "val_0", "val_1" } ).when( paramater ).getValue();
    doReturn( "parameter_name" ).when( paramater ).getName();
    doReturn( columnId ).when( paramater ).getElementId();
    Query srcQuery = mock( Query.class );
    doReturn( new Element[] { elem } ).when( srcQuery ).getElements();
    doReturn( new Condition[] { condition } ).when( srcQuery ).getConditions();
    doReturn( Boolean.FALSE ).when( srcQuery ).getDisableDistinct();
    doReturn( new Order[] { order } ).when( srcQuery ).getOrders();
    doReturn( new Parameter[] { paramater } ).when( srcQuery ).getParameters();
    return srcQuery;
  }
}
