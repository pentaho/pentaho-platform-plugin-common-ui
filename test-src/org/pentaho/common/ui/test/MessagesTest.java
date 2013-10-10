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

import static org.junit.Assert.assertEquals;

import java.io.File;

import org.junit.Test;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.plugin.services.pluginmgr.PluginResourceLoader;
import org.pentaho.test.platform.engine.core.MicroPlatform;

import org.pentaho.common.ui.messages.Messages;

@SuppressWarnings( "nls" )
public class MessagesTest {
  MicroPlatform mp;

  public MessagesTest() throws ClassNotFoundException, ObjectFactoryException {
    mp = new MicroPlatform( "" );
  }

  public static class TstPluginResourceLoader extends PluginResourceLoader {
    @Override
    protected PluginClassLoader getOverrideClassloader() {
      return new PluginClassLoader( new File( "test-res/pentaho-solutions/system/common-ui" ), getClass()
          .getClassLoader() );
    }
  };

  @Test
  public void testMessages() {

    mp.define( IPluginResourceLoader.class, TstPluginResourceLoader.class );

    new Messages();

    assertEquals( "Wrong message returned", "test message", Messages.getString( "TEST.MESSAGE1" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

    assertEquals( "Wrong message returned", "test message 2: A", Messages.getString( "TEST.MESSAGE2", "A" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$

    assertEquals( "Wrong message returned", "test message 3: A B", Messages.getString( "TEST.MESSAGE3", "A", "B" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$ //$NON-NLS-5$

    assertEquals(
        "Wrong message returned", "test message 4: A B C", Messages.getString( "TEST.MESSAGE4", "A", "B", "C" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$ //$NON-NLS-5$ //$NON-NLS-6$

    assertEquals(
        "Wrong message returned", "test message 5: A B C D", Messages.getString( "TEST.MESSAGE5", "A", "B", "C", "D" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$ //$NON-NLS-5$ //$NON-NLS-6$ //$NON-NLS-7$

  }

  @Test
  public void testErrorMessages() {

    assertEquals(
        "Wrong message returned", "TEST.ERROR_0001 - test error 1", Messages.getErrorString( "TEST.ERROR_0001" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

    assertEquals(
        "Wrong message returned", "TEST.ERROR_0002 - test error 2: A", Messages.getErrorString( "TEST.ERROR_0002", "A" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$

    assertEquals(
        "Wrong message returned", "TEST.ERROR_0003 - test error 3: A B", Messages.getErrorString( "TEST.ERROR_0003", "A", "B" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$ //$NON-NLS-5$

    assertEquals(
        "Wrong message returned", "TEST.ERROR_0004 - test error 4: A B C", Messages.getErrorString( "TEST.ERROR_0004", "A", "B", "C" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$ //$NON-NLS-5$ //$NON-NLS-6$

  }

  @Test
  public void testBadKey() {

    assertEquals( "Wrong message returned", "!bogus key!", Messages.getString( "bogus key" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

    assertEquals(
        "Wrong message returned", "test.ERROR_0001 - !test.ERROR_0001_BOGUS!", Messages.getErrorString( "test.ERROR_0001_BOGUS" ) ); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$

  }

  @Test
  public void testBadEncoding() {

    // the messages.properties file has a bad encoding for the test.encode1 property, this causes a
    // MissingResourceException which
    // manifests as a returned string of !<key>! for all getString calls including the good strings
    assertEquals( "!test.bad_encode1!", Messages.getString( "test.bad_encode1" ) ); //$NON-NLS-1$ //$NON-NLS-2$
    // it seems that the successful retrieval of a good message inside a bundle that has a bad encoding is not
    // consistent.
    // Therefore, the following check is not very useful.
    //    assertEquals("!test.MESSAGE1!", Messages.getString("test.MESSAGE1")); //$NON-NLS-1$ //$NON-NLS-2$
  }

}
