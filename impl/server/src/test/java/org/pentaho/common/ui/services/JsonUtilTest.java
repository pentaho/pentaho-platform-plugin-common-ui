/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 - 2026 by Pentaho Canada Inc. : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2030-06-15
 ******************************************************************************/



package org.pentaho.common.ui.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.fasterxml.jackson.core.JsonProcessingException;

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
    // Jackson output does not include the "class" field by default; assert on actual properties
    assertEquals( "{\"code\":\"" + TEST_CODE + "\",\"message\":\"" + TEST_MSG + "\"}", result );
  }

  @Test
  public void testCreateJsonMessageWrapsSerializationFailureInUncheckedException() {
    JsonUtil failingUtil = new JsonUtil() {
      private static final long serialVersionUID = 1L;

      @Override
      public StatusMessage createMessage( String message, String code ) {
        return new StatusMessage() {
          @Override
          public String getMessage() {
            throw new IllegalArgumentException( "boom" );
          }
        };
      }
    };

    try {
      failingUtil.createJsonMessage( TEST_MSG, TEST_CODE );
      fail( "Expected IllegalStateException" );
    } catch ( IllegalStateException e ) {
      assertTrue( e.getCause() instanceof JsonProcessingException );
    }
  }
}
