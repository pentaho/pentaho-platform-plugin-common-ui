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
import static org.junit.Assert.assertNotNull;

import org.junit.Test;

public class JsonUtilTest {

  private static final String TEST_MSG = "test msg";
  private static final String TEST_CODE = "test code";

  private JsonUtil jsonUtil = new JsonUtil();

  @Test
  public void testCreateMessage() {
    StatusMessage result = jsonUtil.createMessage( TEST_MSG, TEST_CODE );
    assertNotNull( result );
    assertEquals( TEST_MSG, result.getMessage() );
    assertEquals( TEST_CODE, result.getCode() );
  }

  @Test
  public void testCreateJsonMessage() {
    String result = jsonUtil.createJsonMessage( TEST_MSG, TEST_CODE );
    assertNotNull( result );
    assertEquals( "{\"class\":\"org.pentaho.common.ui.services.StatusMessage\",\"code\":\"" + TEST_CODE
        + "\",\"message\":\"" + TEST_MSG + "\"}", result );
  }
}
