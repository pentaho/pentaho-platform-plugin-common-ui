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

package org.pentaho.common.ui.metadata.model.impl;

import org.junit.Test;
import org.junit.Assert;


public class CategoryTest {
  private static final String XSS_STRING = "<iMg SrC=x OnErRoR=alert(11113)>";
  private Category category = new Category();

  @Test
  public void testGetIdAndName() {
    category.setId( XSS_STRING );
    category.setName( XSS_STRING );

    Assert.assertFalse( category.getId().contains("<") );
    Assert.assertFalse( category.getName().contains("<") );
  }
}
