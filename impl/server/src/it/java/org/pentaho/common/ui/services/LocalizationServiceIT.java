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

import java.io.File;

import junit.framework.TestCase;

import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.plugin.services.pluginmgr.PluginResourceLoader;
import org.pentaho.test.platform.engine.core.MicroPlatform;
import static org.pentaho.common.ui.IntegrationTestConstants.SOLUTION_PATH;

public class LocalizationServiceIT extends TestCase {

  private MicroPlatform mp;
  private LocalizationService svc;

  public LocalizationServiceIT() throws ClassNotFoundException, ObjectFactoryException {
    mp = new MicroPlatform( "" );
    mp.define( IPluginResourceLoader.class, TstPluginResourceLoader.class );

    svc = new LocalizationService();
  }

  public static class TstPluginResourceLoader extends PluginResourceLoader {
    @Override
    protected PluginClassLoader getOverrideClassloader() {
      return new PluginClassLoader( new File( SOLUTION_PATH + "/system/common-ui" ), getClass()
          .getClassLoader() );
    }
  };

  public void testGetJSONBundle() {
    String json = svc.getJSONBundle();
    assertNotNull( json );
    assertEquals( "{\"messagebundleid\":\"commons-ui\"}", json );
  }

  public void testGetHelpJSONBundle() {
    String json = svc.getHelpJSONBundle();
    assertNotNull( json );
    assertEquals( "{\"messagebundleid\":\"commons-ui\"}", json );
  }
}
