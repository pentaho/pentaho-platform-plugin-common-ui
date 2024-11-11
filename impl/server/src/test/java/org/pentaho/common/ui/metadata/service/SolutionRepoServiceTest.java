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
