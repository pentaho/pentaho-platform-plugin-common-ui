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
 * Copyright (c) 2002-2017 Pentaho Corporation..  All rights reserved.
 */

package org.pentaho.common.ui.metadata.service;

import org.junit.Assert;
import org.mockito.Mockito;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.common.ui.metadata.model.impl.Model;
import org.pentaho.common.ui.metadata.model.impl.ModelInfo;
import org.pentaho.common.ui.metadata.model.impl.Query;
import org.pentaho.commons.connection.IPentahoMetaData;
import org.pentaho.commons.connection.IPentahoResultSet;
import org.pentaho.commons.connection.marshal.MarshallableResultSet;
import org.pentaho.metadata.model.Domain;
import org.pentaho.metadata.model.LogicalModel;
import org.pentaho.metadata.model.concept.types.LocalizedString;
import org.pentaho.metadata.query.model.util.QueryXmlHelper;
import org.pentaho.metadata.repository.IMetadataDomainRepository;

public class MetadataServiceTest {

  private static final String DEFAULT_LOCALE = "en";
  private static final String[] DEFAULT_LOCALES_CODES = new String[] { DEFAULT_LOCALE };

  private static final String DOMAIN_NAME = "testDomain";
  private static final String MODEL_ID = "visibleModelId";
  private static final String MODEL_NAME = " visibleModelName";
  private static final String CTX = "testContext";


  private MetadataService metadataService;

  private IMetadataDomainRepository mockDomainRepo;
  private LogicalModel visibleModel;
  private Domain validDomain;
  private MetadataServiceUtil util;
  private MetadataServiceUtil2 util2;
  private QueryXmlHelper helper;

  @Before
  public void setUp() throws Exception {
    metadataService = Mockito.spy( new MetadataService() );

    mockDomainRepo = Mockito.mock( IMetadataDomainRepository.class );

    visibleModel = Mockito.mock( LogicalModel.class );
    Mockito.doReturn( "testCtx0," + CTX ).when( visibleModel ).getProperty( "visible" );
    Mockito.doReturn( MODEL_ID ).when( visibleModel ).getId();
    Mockito.doReturn( MODEL_NAME ).when( visibleModel ).getName( DEFAULT_LOCALE );
    Mockito.doReturn( new LocalizedString() ).when( visibleModel ).getDescription();
    Mockito.doReturn( "visibleModelDescLocale" ).when( visibleModel ).getDescription( DEFAULT_LOCALE );

    LogicalModel invisibleModel = Mockito.mock( LogicalModel.class );
    Mockito.doReturn( "testCtx0,testCtx1" ).when( invisibleModel ).getProperty( "visible" );

    List<LogicalModel> listModels = new ArrayList<LogicalModel>( 2 );
    listModels.add( visibleModel );
    listModels.add( invisibleModel );


    validDomain = Mockito.mock( Domain.class );
    Mockito.doReturn( listModels ).when( validDomain ).getLogicalModels();
    Mockito.doReturn( DEFAULT_LOCALES_CODES ).when( validDomain ).getLocaleCodes();
    Mockito.doReturn( visibleModel ).when( validDomain ).findLogicalModel( MODEL_ID );
    Mockito.doReturn( validDomain ).when( mockDomainRepo ).getDomain( DOMAIN_NAME );
    Set<String> domainIds = new HashSet<String>();
    domainIds.add( DOMAIN_NAME );
    Mockito.doReturn( domainIds ).when( mockDomainRepo ).getDomainIds();
    Mockito.doReturn( mockDomainRepo ).when( metadataService ).getMetadataRepository();

    util = Mockito.mock( MetadataServiceUtil.class );
    Mockito.doReturn( util ).when( metadataService ).getMetadataServiceUtil();

    util2 = Mockito.mock( MetadataServiceUtil2.class );
    Mockito.doReturn( util2 ).when( metadataService ).getMetadataServiceUtil2();

    helper = Mockito.mock( QueryXmlHelper.class );
    Mockito.doReturn( helper ).when( metadataService ).getHelper();
  }

  @Test
  public void testListBusinessModelsWithoutRepository() throws Exception {
    Mockito.doReturn( null ).when( metadataService ).getMetadataRepository();
    ModelInfo[] result = metadataService.listBusinessModels( StringUtils.EMPTY, StringUtils.EMPTY );
    Assert.assertNull( result );
  }

  @Test
  public void testListBusinessModelsWithoutDomainName() throws Exception {
    ModelInfo[] result = metadataService.listBusinessModels( StringUtils.EMPTY, CTX );
    Assert.assertNotNull( result );
    Assert.assertEquals( 1, result.length );
    Assert.assertEquals( DOMAIN_NAME, result[0].getDomainId() );
    Assert.assertEquals( visibleModel.getId(), result[0].getModelId() );
    Assert.assertEquals( visibleModel.getName( DEFAULT_LOCALE ), result[0].getModelName() );
    Assert.assertEquals( visibleModel.getDescription( DEFAULT_LOCALE ), result[0].getModelDescription() );
  }

  @Test
  public void testListBusinessModels() throws Exception {
    ModelInfo[] result = metadataService.listBusinessModels( DOMAIN_NAME, CTX );
    Assert.assertNotNull( result );
    Assert.assertEquals( 1, result.length );
    Assert.assertEquals( DOMAIN_NAME, result[0].getDomainId() );
    Assert.assertEquals( visibleModel.getId(), result[0].getModelId() );
    Assert.assertEquals( visibleModel.getName( DEFAULT_LOCALE ), result[0].getModelName() );
    Assert.assertEquals( visibleModel.getDescription( DEFAULT_LOCALE ), result[0].getModelDescription() );
  }

  @Test
  public void testListBusinessModelsJson() throws IOException {
    String json = metadataService.listBusinessModelsJson( DOMAIN_NAME, CTX );
    Assert.assertEquals(
        "[{\"class\":\"org.pentaho.common.ui.metadata.model.impl.ModelInfo\",\"domainId\":\"testDomain\",\"modelDescription\":\"visibleModelDescLocale\",\"modelId\":\"visibleModelId\",\"modelName\":\" visibleModelName\"}]",
        json );
  }

  @Test
  public void testLoadModel() {
    Model model = metadataService.loadModel( null, null );
    Assert.assertNull( model );

    model = metadataService.loadModel( DOMAIN_NAME, null );
    Assert.assertNull( model );

    model = metadataService.loadModel( "invalid_domain", "invalid_model" );
    Assert.assertNull( model );

    model = metadataService.loadModel( DOMAIN_NAME, "invalid_model" );
    Assert.assertNull( model );

    Model mockModel = Mockito.mock( Model.class );
    Mockito.doReturn( mockModel ).when( util ).createThinModel( visibleModel, DOMAIN_NAME );
    model = metadataService.loadModel( DOMAIN_NAME, MODEL_ID );
    Assert.assertEquals( mockModel, model );
  }

  @Test
  public void testLoadModelJson() {
    String dId = "dom_id";
    String mId = "model_id";
    Model model = new Model();
    model.setId( mId );
    model.setName( "name" );
    model.setDomainId( dId );
    Mockito.doReturn( model ).when( metadataService ).loadModel( dId, mId );

    String json = metadataService.loadModelJson( dId, mId );
    Assert.assertEquals(
        "{\"categories\":[],\"class\":\"org.pentaho.common.ui.metadata.model.impl.Model\",\"description\":null,\"domainId\":\"dom_id\",\"id\":\"model_id\",\"name\":\"name\"}",
        json );
  }

  @Test
  public void testDoQuery() {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";
    Query query = Mockito.mock( Query.class );
    MarshallableResultSet mockRS = Mockito.mock( MarshallableResultSet.class );
    org.pentaho.metadata.query.model.Query mockQuery = Mockito.mock( org.pentaho.metadata.query.model.Query.class );
    Mockito.doReturn( mockQuery ).when( util ).convertQuery( query );
    Mockito.doReturn( xml ).when( helper ).toXML( mockQuery );
    Mockito.doReturn( mockRS ).when( metadataService ).doXmlQuery( xml, rowLimit );

    MarshallableResultSet result = metadataService.doQuery( query, rowLimit );
    Assert.assertEquals( mockRS, result );
  }

  @Test
  public void testDoXmlQuery() {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";

    Mockito.doReturn( null ).when( metadataService ).executeQuery( xml, rowLimit );
    MarshallableResultSet result = metadataService.doXmlQuery( xml, rowLimit );
    Assert.assertNull( result );

    IPentahoMetaData mockedMetadata = Mockito.mock( IPentahoMetaData.class );
    Mockito.doReturn( new Object[][] { { "tt" } } ).when( mockedMetadata ).getColumnHeaders();
    IPentahoResultSet mockedResult = Mockito.mock( IPentahoResultSet.class );
    Mockito.doReturn( 1 ).when( mockedResult ).getColumnCount();
    Mockito.doReturn( 1 ).when( mockedResult ).getRowCount();
    Mockito.doReturn( null ).when( mockedResult ).next();
    Mockito.doReturn( mockedMetadata ).when( mockedResult ).getMetaData();

    Mockito.doReturn( mockedResult ).when( metadataService ).executeQuery( xml, rowLimit );
    result = metadataService.doXmlQuery( xml, rowLimit );
    Assert.assertNotNull( result );
    Assert.assertEquals( 0, result.getNumColumnHeaderSets() );
    Assert.assertEquals( 0, result.getNumRowHeaderSets() );
    Assert.assertEquals( "tt", result.getColumnNames().getColumnName()[0] );
  }

  @Test
  public void testDoXmlQueryToJson() {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";

    Mockito.doReturn( null ).when( metadataService ).doXmlQuery( xml, rowLimit );
    String result = metadataService.doXmlQueryToJson( xml, rowLimit );
    Assert.assertNull( result );

    MarshallableResultSet resultSet = new MarshallableResultSet();
    resultSet.setNumColumnHeaderSets( 2 );
    resultSet.setNumRowHeaderSets( 1 );
    Mockito.doReturn( resultSet ).when( metadataService ).doXmlQuery( xml, rowLimit );
    result = metadataService.doXmlQueryToJson( xml, rowLimit );
    Assert.assertNotNull( result );
  }

  @Test
  public void testDoXmlQueryToCdaJson() throws Exception {
    Integer rowLimit = new Integer( 10 );
    String xml = "xml";
    String json = "json";

    Mockito.doReturn( null ).when( metadataService ).executeQuery( xml, rowLimit );
    String result = metadataService.doXmlQueryToCdaJson( xml, rowLimit );
    Assert.assertNull( result );

    IPentahoResultSet mockedResult = Mockito.mock( IPentahoResultSet.class );
    Mockito.doReturn( mockedResult ).when( metadataService ).executeQuery( xml, rowLimit );
    Mockito.doReturn( validDomain ).when( util2 ).getDomainObject( xml );
    Mockito.doReturn( json ).when( util2 ).createCdaJson( mockedResult, DEFAULT_LOCALE );
    result = metadataService.doXmlQueryToCdaJson( xml, rowLimit );
    Assert.assertEquals( json, result );
  }

  @Test
  public void testDoJsonQuery() {
    Integer rowLimit = new Integer( 10 );
    String json = "json";
    String query = "query";

    MarshallableResultSet rs = Mockito.mock( MarshallableResultSet.class );
    Mockito.doReturn( query ).when( metadataService ).getQueryXmlFromJson( json );
    Mockito.doReturn( rs ).when( metadataService ).doXmlQuery( query, rowLimit );
    MarshallableResultSet result = metadataService.doJsonQuery( json, rowLimit );
    Assert.assertEquals( rs, result );
  }

  @Test
  public void testDoJsonQueryToJson() {
    Integer rowLimit = new Integer( 10 );
    String json = "json";
    String query = "query";
    String rs = "result";

    Mockito.doReturn( query ).when( metadataService ).getQueryXmlFromJson( json );
    Mockito.doReturn( rs ).when( metadataService ).doXmlQueryToJson( query, rowLimit );
    String result = metadataService.doJsonQueryToJson( json, rowLimit );
    Assert.assertEquals( rs, result );
  }

  @Test
  public void testDoJsonQueryToCdaJson() {
    Integer rowLimit = new Integer( 10 );
    String json = "json";
    String query = "query";
    String rs = "result";

    Mockito.doReturn( query ).when( metadataService ).getQueryXmlFromJson( json );
    Mockito.doReturn( rs ).when( metadataService ).doXmlQueryToCdaJson( query, rowLimit );
    String result = metadataService.doJsonQueryToCdaJson( json, rowLimit );
    Assert.assertEquals( rs, result );
  }

  @Test
  public void testGetQueryXmlFromJson() {
    String json = "json";
    String resultXml = "result";

    Query query = Mockito.mock( Query.class );
    org.pentaho.metadata.query.model.Query modelQuery = Mockito.mock( org.pentaho.metadata.query.model.Query.class );
    Mockito.doReturn( query ).when( util ).deserializeJsonQuery( json );
    Mockito.doReturn( modelQuery ).when( util ).convertQuery( query );
    Mockito.doReturn( resultXml ).when( helper ).toXML( modelQuery );

    String result = metadataService.getQueryXmlFromJson( json );
    Assert.assertEquals( resultXml, result );
  }

}
