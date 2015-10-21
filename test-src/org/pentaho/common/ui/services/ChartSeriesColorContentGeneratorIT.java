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

package org.pentaho.common.ui.services;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.plugin.services.pluginmgr.PluginResourceLoader;
import org.pentaho.test.platform.engine.core.MicroPlatform;

@SuppressWarnings( { "all" } )
public class ChartSeriesColorContentGeneratorIT {

  MicroPlatform mp;

  public ChartSeriesColorContentGeneratorIT() throws ClassNotFoundException, ObjectFactoryException {
    mp = new MicroPlatform( "" );
    mp.define( IPluginResourceLoader.class, TestPluginResourceLoader.class );
  }

  public static class TestPluginResourceLoader extends PluginResourceLoader {
    @Override
    protected PluginClassLoader getOverrideClassloader() {
      return new PluginClassLoader( new File( "package-res" ), getClass().getClassLoader() );
    }
  };

  @Test
  public void testMdxType() throws Exception {
    ChartSeriesColorContentGenerator cg = new ChartSeriesColorContentGenerator();

    Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();

    SimpleParameterProvider requestParams = new SimpleParameterProvider();
    requestParams.setParameter( "type", "mdx" );
    parameterProviders.put( IParameterProvider.SCOPE_REQUEST, requestParams );

    cg.setParameterProviders( parameterProviders );

    ByteArrayOutputStream output = new ByteArrayOutputStream();
    cg.createContent( output );

    String result = output.toString();
    Assert.assertTrue( result.contains( "Region" ) );
  }

}
