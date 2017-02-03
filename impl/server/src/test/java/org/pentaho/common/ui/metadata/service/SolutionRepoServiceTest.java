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

import static org.apache.commons.lang.StringUtils.EMPTY;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.junit.Test;
import org.pentaho.common.ui.services.SolutionRepoService;
import org.pentaho.common.ui.services.StateMessage;

public class SolutionRepoServiceTest {

  private static final String FILE_PATH = "http://localhost/test";

  private SolutionRepoService service = new SolutionRepoService();

  @Test
  public void testSaveStateString() throws Exception {
    String state = "state";
    String type = "type";
    Boolean replace = false;
    String title = "title";
    String description = "desc";

    StateMessage result = service.saveStateString( EMPTY, state, type, replace, title, description );
    assertNotNull( result );
    assertEquals( StateMessage.STATUS_FAILED, result.getStatus() );

    result = service.saveStateString( FILE_PATH, EMPTY, type, replace, title, description );
    assertNotNull( result );
    assertEquals( StateMessage.STATUS_FAILED, result.getStatus() );

    result = service.saveStateString( FILE_PATH, state, EMPTY, replace, title, description );
    assertNotNull( result );
    assertEquals( StateMessage.STATUS_FAILED, result.getStatus() );

    result = service.saveStateString( FILE_PATH, state, type, replace, title, description );
    assertNull( result );
  }

  @Test
  public void testLoadState() throws Exception {
    StateMessage result = service.loadState( EMPTY );
    assertNotNull( result );
    assertEquals( StateMessage.STATUS_FAILED, result.getStatus() );

    result = service.loadState( FILE_PATH );
    assertNull( result );
  }

}
