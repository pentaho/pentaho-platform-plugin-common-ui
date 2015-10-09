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
