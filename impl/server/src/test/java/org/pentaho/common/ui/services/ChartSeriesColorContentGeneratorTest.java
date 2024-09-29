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

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginResourceLoader;

public class ChartSeriesColorContentGeneratorTest {

  private static final String JSON_STR = "test json";

  private ChartSeriesColorContentGenerator generator;

  private IParameterProvider provider;
  private IPluginResourceLoader resLoader;

  @Before
  public void setUp() throws UnsupportedEncodingException {
    generator = spy( new ChartSeriesColorContentGenerator() );

    provider = mock( IParameterProvider.class );
    Map<String, IParameterProvider> providers = new HashMap<String, IParameterProvider>();
    providers.put( IParameterProvider.SCOPE_REQUEST, provider );
    generator.setParameterProviders( providers );

    resLoader = mock( IPluginResourceLoader.class );
    doReturn( resLoader ).when( generator ).getPluginResourceLoader();

    doReturn( null ).when( resLoader ).getResourceAsString( ChartSeriesColorContentGenerator.class,
        "resources/chartseriescolor/mdx.json" );
    doReturn( JSON_STR ).when( resLoader ).getResourceAsString( ChartSeriesColorContentGenerator.class,
        "resources/chartseriescolor/relational.json" );
  }

  @Test( expected = IllegalStateException.class )
  public void testCreateContentWithUnknownType() throws Exception {
    OutputStream output = mock( OutputStream.class );
    doReturn( "Incorrect_type" ).when( provider ).getStringParameter( "type", "mdx" );
    generator.createContent( output );
  }

  @Test
  public void testCreateContentWithMDXType() throws Exception {
    OutputStream output = mock( OutputStream.class );
    doReturn( ChartSeriesColorContentGenerator.TYPE_MDX ).when( provider ).getStringParameter( "type", "mdx" );
    generator.createContent( output );
    verify( resLoader, times( 1 ) ).getResourceAsString( ChartSeriesColorContentGenerator.class,
        "resources/chartseriescolor/mdx.json" );
    verify( output, times( 1 ) ).write( "{}".getBytes() );
  }

  @Test
  public void testCreateContentWithRelationalType() throws Exception {
    OutputStream output = mock( OutputStream.class );
    doReturn( ChartSeriesColorContentGenerator.TYPE_RELATIONAL ).when( provider ).getStringParameter( "type", "mdx" );
    generator.createContent( output );
    verify( resLoader, times( 1 ) ).getResourceAsString( ChartSeriesColorContentGenerator.class,
        "resources/chartseriescolor/relational.json" );
    verify( output, times( 1 ) ).write( JSON_STR.getBytes() );
  }

  @Test
  public void testGetMimeType() {
    String type = generator.getMimeType();
    assertEquals( "application/json", type );
  }
}
