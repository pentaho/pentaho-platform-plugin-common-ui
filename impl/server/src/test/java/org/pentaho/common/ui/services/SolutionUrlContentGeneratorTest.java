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


package org.pentaho.common.ui.services;

import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.io.OutputStream;
import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.junit.Before;
import org.junit.Test;
import org.pentaho.platform.api.engine.IContentGenerator;
import org.pentaho.platform.api.engine.IOutputHandler;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginManager;
import org.pentaho.platform.api.repository.IContentItem;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.repository2.unified.fileio.RepositoryFileInputStream;

public class SolutionUrlContentGeneratorTest {

  // private static final String FILE_PATH = "http://localhost/test.doc";
  private static final String PATH_PARAM = "path";
  private static final String MIME_TYPE = "application/msword";

  private SolutionUrlContentGenerator generator;

  private IOutputHandler outputHandler;
  private IParameterProvider provider;
  private OutputStream output;
  private IContentItem contentItem;
  private IContentGenerator contentGenerator;
  private IPluginManager pluginManager;
  private RepositoryFileInputStream in;

  @Before
  public void setUp() throws Exception {
    generator = spy( new SolutionUrlContentGenerator() );
    output = mock( OutputStream.class );
    contentItem = mock( IContentItem.class );
    outputHandler = mock( IOutputHandler.class );
    provider = mock( IParameterProvider.class );
    contentGenerator = mock( IContentGenerator.class );
    pluginManager = mock( IPluginManager.class );
    in = mock( RepositoryFileInputStream.class );
    SimpleParameterProvider simpleProvider = mock( SimpleParameterProvider.class );

    doReturn( contentGenerator ).when( pluginManager ).getContentGenerator( "doc", null );
    doReturn( pluginManager ).when( generator ).getPluginManager();
    doReturn( output ).when( contentItem ).getOutputStream( null );
    doReturn( contentItem ).when( outputHandler ).getOutputContentItem( "response", "content", null, MIME_TYPE );
    doReturn( in ).when( generator ).createRepositoryFileInputStream( "local/resources/web/test.doc" );
    doReturn( 1 ).doReturn( 0 ).doReturn( -1 ).when( in ).read( any( byte[].class ) );

    generator.setOutputHandler( outputHandler );

    Map<String, IParameterProvider> providers = new HashMap<String, IParameterProvider>();
    providers.put( "path", provider );
    providers.put( IParameterProvider.SCOPE_REQUEST, simpleProvider );
    generator.setParameterProviders( providers );
  }

  @Test( expected = InvalidParameterException.class )
  public void testCreateContentWithoutOutputHandler() throws Exception {
    generator.setOutputHandler( null );
    generator.createContent();
  }

  @Test
  public void testCreateContentWithoutPath() throws Exception {
    doReturn( StringUtils.EMPTY ).when( provider ).getStringParameter( PATH_PARAM, null );
    generator.createContent();
    verify( generator, times( 1 ) ).error( anyString() );
    verify( contentGenerator, never() ).createContent();
    verify( output, never() ).write( any( byte[].class ), anyInt(), anyInt() );
  }

  @Test
  public void testCreateContentWithSystemPath() throws Exception {
    doReturn( "system/test" ).when( provider ).getStringParameter( PATH_PARAM, null );
    generator.createContent();
    verify( generator, times( 1 ) ).error( anyString() );
    verify( contentGenerator, never() ).createContent();
    verify( output, never() ).write( any( byte[].class ), anyInt(), anyInt() );
  }

  @Test
  public void testCreateContentByContentGenerator() throws Exception {
    doReturn( "http://localhost/test.doc" ).when( provider ).getStringParameter( PATH_PARAM, null );
    generator.createContent();
    verify( generator, never() ).error( anyString() );
    verify( contentGenerator, times( 1 ) ).createContent();
    verify( output, never() ).write( any( byte[].class ), anyInt(), anyInt() );
  }

  @Test
  public void testCreateContentWithoutContentGenerator() throws Exception {
    doReturn( null ).when( pluginManager ).getContentGenerator( StringUtils.EMPTY, null );
    doReturn( "http://localhost/test" ).when( provider ).getStringParameter( PATH_PARAM, null );
    generator.createContent();
    verify( generator, times( 1 ) ).warn( anyString() );
    verify( generator, never() ).error( anyString() );
    verify( contentGenerator, never() ).createContent();
    verify( output, never() ).write( any( byte[].class ), anyInt(), anyInt() );
  }

  @Test( expected = InvalidParameterException.class )
  public void testCreateContentWithoutConetentItem() throws Exception {
    doReturn( null ).when( pluginManager ).getContentGenerator( "doc", null );
    doReturn( null ).when( outputHandler ).getOutputContentItem( "response", "content", null, MIME_TYPE );
    doReturn( "local/resources/web/test.doc" ).when( provider ).getStringParameter( PATH_PARAM, null );
    generator.createContent();
  }

  @Test( expected = InvalidParameterException.class )
  public void testCreateContentWithoutOutputStream() throws Exception {
    doReturn( null ).when( pluginManager ).getContentGenerator( "doc", null );
    doReturn( null ).when( contentItem ).getOutputStream( any() );
    doReturn( "local/resources/web/test.doc" ).when( provider ).getStringParameter( PATH_PARAM, null );
    generator.createContent();
  }

  @Test
  public void testCreateContentWithoutFile() throws Exception {
    doReturn( null ).when( pluginManager ).getContentGenerator( "doc", null );
    doReturn( "local/resources/web/test.doc" ).when( provider ).getStringParameter( PATH_PARAM, null );
    doReturn( null ).when( generator ).createRepositoryFileInputStream( "local/resources/web/test.doc" );
    generator.createContent();
    verify( generator, never() ).warn( anyString() );
    verify( generator, times( 1 ) ).error( anyString() );
    verify( contentGenerator, never() ).createContent();
    verify( output, never() ).write( any( byte[].class ), anyInt(), anyInt() );
  }

  @Test
  public void testCreateContent() throws Exception {
    doReturn( null ).when( pluginManager ).getContentGenerator( "doc", null );
    doReturn( "local/resources/web/test.doc" ).when( provider ).getStringParameter( PATH_PARAM, null );
    generator.createContent();
    verify( generator, never() ).warn( anyString() );
    verify( generator, never() ).error( anyString() );
    verify( contentGenerator, never() ).createContent();
    verify( output, times( 2 ) ).write( any( byte[].class ), anyInt(), anyInt() );
  }
}
