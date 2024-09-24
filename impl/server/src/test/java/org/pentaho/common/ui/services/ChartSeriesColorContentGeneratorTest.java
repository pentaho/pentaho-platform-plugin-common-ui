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
