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
 * Copyright (c) 2002-2015 Pentaho Corporation..  All rights reserved.
 */

package org.pentaho.common.ui.metadata.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.json.JSONException;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.common.ui.metadata.model.impl.Column;
import org.pentaho.common.ui.metadata.model.impl.Condition;
import org.pentaho.common.ui.metadata.model.impl.Model;
import org.pentaho.common.ui.metadata.model.impl.Order;
import org.pentaho.common.ui.metadata.model.impl.Parameter;
import org.pentaho.common.ui.metadata.model.impl.Query;
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
import org.pentaho.metadata.query.model.CombinationType;
import org.pentaho.metadata.query.model.Constraint;
import org.pentaho.metadata.query.model.Order.Type;
import org.pentaho.metadata.query.model.Selection;
import org.pentaho.metadata.repository.IMetadataDomainRepository;

public class MetadataServiceUtilTest {

  private static final String DEFAULT_LOCALE = "en";
  private static final String DOMAIN_ID = "domain_id";

  private MetadataServiceUtil spyMetadataServiceUtil = spy( new MetadataServiceUtil() );

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
    assertEquals( 1, model.getCategories().length );
    org.pentaho.common.ui.metadata.model.impl.Category cat = model.getCategories()[0];
    assertCategories( category, cat );
    assertEquals( 1, cat.getColumns().length );
    Column col = cat.getColumns()[0];
    assertColumns( column, col, category.getId() );
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
    assertEquals(
        "{\"resultset\":[[\"val_00\",\"val_01\"],[\"val_10\",\"val_11\"]],\"metadata\":[{\"colLabel\":\"name_0\",\"colIndex\":0,\"colType\":\"STRING\",\"colName\":\"Header_0\"},{\"colLabel\":\"name_1\",\"colIndex\":1,\"colType\":\"BOOLEAN\",\"colName\":\"Header_1\"}]}",
        result );
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

    org.pentaho.metadata.query.model.Query result = spyMetadataServiceUtil.convertQuery( srcQuery );

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

    doReturn( Collections.<Category> emptyList() ).when( logicalModel ).getCategories();
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
        "{\"class\":\"org.pentaho.common.ui.metadata.model.impl.Query\",\"columns\":[{\"aggTypes\":[],"
            + "\"category\":\"MY_ORDERS\",\"class\":\"org.pentaho.common.ui.metadata.model.impl.Column\","
            + "\"defaultAggType\":\"SUM\",\"description\":null,\"fieldType\":null,\"formatMask\":null,"
            + "\"hiddenForUser\":false,\"horizontalAlignment\":\"LEFT\",\"id\":\"MY_COLUMN_ID\","
            + "\"name\":null,\"selectedAggType\":\"SUM\",\"type\":null}],\"conditions\":[{\"category\":\"MY_CATEGORY\","
            + "\"class\":\"org.pentaho.common.ui.metadata.model.impl.Condition\",\"column\":\"MY_COL_COND\","
            + "\"combinationType\":\"AND\",\"operator\":\"EQUAL\",\"parameterized\":false,\"selectedAggType\":null,"
            + "\"value\":[\"Val_0\"]}],\"defaultParameterMap\":null,\"disableDistinct\":false,"
            + "\"domainName\":\"my_test_domain\",\"modelId\":\"my_test_model_id\",\"orders\":[{\"category\":\"MY_CATEGORY\","
            + "\"class\":\"org.pentaho.common.ui.metadata.model.impl.Order\",\"column\":\"my_order_column\","
            + "\"orderType\":\"ASC\"}],\"parameters\":[]}";
    Query result = spyMetadataServiceUtil.deserializeJsonQuery( json );
    assertNotNull( result );
    assertEquals( "my_test_model_id", result.getModelId() );
    assertEquals( "my_test_domain", result.getDomainName() );
    assertFalse( result.getDisableDistinct() );
    assertEquals( 1, result.getColumns().length );
    Column column = result.getColumns()[0];
    assertEquals( "MY_COLUMN_ID", column.getId() );
    assertNull( column.getName() );
    assertNull( column.getDescription() );
    assertNull( column.getFieldType() );
    assertNull( column.getFormatMask() );
    assertNull( column.getType() );
    assertEquals( "SUM", column.getDefaultAggType() );
    assertEquals( "MY_ORDERS", column.getCategory() );
    assertEquals( "LEFT", column.getHorizontalAlignment() );
    assertEquals( "SUM", column.getSelectedAggType() );
    assertEquals( 1, result.getConditions().length );
    Condition condition = result.getConditions()[0];
    assertEquals( "MY_CATEGORY", condition.getCategory() );
    assertEquals( "MY_COL_COND", condition.getColumn() );
    assertEquals( "AND", condition.getCombinationType() );
    assertEquals( "EQUAL", condition.getOperator() );
    assertFalse( condition.isParameterized() );
    assertNull( condition.getSelectedAggType() );
    Assert.assertArrayEquals( new String[] { "Val_0" }, condition.getValue() );
    assertEquals( 1, result.getOrders().length );
    Order order = result.getOrders()[0];
    assertEquals( "MY_CATEGORY", order.getCategory() );
    assertEquals( "my_order_column", order.getColumn() );
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

  private void assertColumns( LogicalColumn lcolumn, Column column, String categoryId ) {
    assertEquals( lcolumn.getId(), column.getId() );
    assertEquals( lcolumn.getName( DEFAULT_LOCALE ), column.getName() );
    assertEquals( lcolumn.getDescription( DEFAULT_LOCALE ), column.getDescription() );
    assertEquals( lcolumn.getDataType().getName().toUpperCase(), column.getType() );
    assertEquals( lcolumn.getFieldType().name(), column.getFieldType() );
    assertEquals( categoryId, column.getCategory() );
    Assert.assertArrayEquals( new String[] { "SUM", "COUNT", "AVERAGE" }, column.getAggTypes() );
    assertEquals( lcolumn.getAggregationType().name(), column.getDefaultAggType() );
    assertEquals( lcolumn.getAggregationType().name(), column.getSelectedAggType() );
    assertEquals( "LEFT", column.getHorizontalAlignment() );
    assertEquals( "test_mask", column.getFormatMask() );
    Assert.assertFalse( column.isHiddenForUser() );
  }

  private void assertCategories( Category category, org.pentaho.common.ui.metadata.model.impl.Category cat ) {
    assertEquals( category.getId(), cat.getId() );
    assertEquals( category.getName( DEFAULT_LOCALE ), cat.getName() );
    assertEquals( category.getDescription( DEFAULT_LOCALE ), cat.getDescription() );
  }

  private void assertModels( LogicalModel lmodel, Model model, String domainId ) {
    assertNotNull( model );
    assertEquals( lmodel.getId(), model.getId() );
    assertEquals( domainId, model.getDomainId() );
    assertEquals( lmodel.getName( DEFAULT_LOCALE ), model.getName() );
    assertEquals( lmodel.getDescription( DEFAULT_LOCALE ), model.getDescription() );
  }

  private Query createMockQuery( String domainName, String modelId, String columnId ) {
    Column column = new Column();
    column.setSelectedAggType( "SUM" );
    column.setId( columnId );
    Condition condition = mock( Condition.class );
    doReturn( "test_condition" ).when( condition ).getCondition( "String", null );
    doReturn( "AND" ).when( condition ).getCombinationType();
    doReturn( columnId ).when( condition ).getColumn();
    Order order = mock( Order.class );
    doReturn( columnId ).when( order ).getColumn();
    doReturn( "ASC" ).when( order ).getOrderType();
    Parameter paramater = mock( Parameter.class );
    doReturn( new String[] { "val_0", "val_1" } ).when( paramater ).getValue();
    doReturn( "parameter_name" ).when( paramater ).getName();
    doReturn( columnId ).when( paramater ).getColumn();
    Query srcQuery = mock( Query.class );
    doReturn( domainName ).when( srcQuery ).getDomainName();
    doReturn( modelId ).when( srcQuery ).getModelId();
    doReturn( new Column[] { column } ).when( srcQuery ).getColumns();
    doReturn( new Condition[] { condition } ).when( srcQuery ).getConditions();
    doReturn( Boolean.FALSE ).when( srcQuery ).getDisableDistinct();
    doReturn( new Order[] { order } ).when( srcQuery ).getOrders();
    doReturn( new Parameter[] { paramater } ).when( srcQuery ).getParameters();
    return srcQuery;
  }
}
