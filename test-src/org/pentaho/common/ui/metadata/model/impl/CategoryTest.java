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
 * Copyright (c) 2017 Pentaho Corporation..  All rights reserved.
 */
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

    Assert.assertFalse( category.getId().contains( "<" ) );
    Assert.assertFalse( category.getName().contains( "<" ) );
  }
}
