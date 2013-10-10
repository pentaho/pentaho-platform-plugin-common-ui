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

import java.io.File;

import org.pentaho.common.ui.services.LocalizationService;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.plugin.services.pluginmgr.PluginResourceLoader;
import org.pentaho.test.platform.engine.core.MicroPlatform;

import junit.framework.TestCase;

@SuppressWarnings( "nls" )
public class LocalizationServiceTest extends TestCase {

  MicroPlatform mp;

  public LocalizationServiceTest() throws ClassNotFoundException, ObjectFactoryException {
    mp = new MicroPlatform( "" );
    mp.define( IPluginResourceLoader.class, TstPluginResourceLoader.class );
  }

  public static class TstPluginResourceLoader extends PluginResourceLoader {
    @Override
    protected PluginClassLoader getOverrideClassloader() {
      return new PluginClassLoader( new File( "test-res/pentaho-solutions/system/common-ui" ), getClass()
          .getClassLoader() );
    }
  };

  public void testLocalizationService() {

    LocalizationService svc = new LocalizationService();

    String json = svc.getJSONBundle();

    assertNotNull( json );
    System.out.println( json );
    assertEquals( "{\"", json.substring( 0, 2 ) );

  }

}
