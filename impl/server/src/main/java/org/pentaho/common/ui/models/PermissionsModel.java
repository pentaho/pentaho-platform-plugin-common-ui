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
 * Copyright (c) 2002-2024 Hitachi Vantara..  All rights reserved.
 */

package org.pentaho.common.ui.models;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * @author Rowell Belen
 */
@XmlRootElement
@XmlAccessorType( XmlAccessType.FIELD )
public class PermissionsModel {

  @XmlElement
  private boolean read;

  @XmlElement
  private boolean write;

  @XmlElement
  private boolean execute;

  public boolean isRead() {
    return read;
  }

  public void setRead( boolean read ) {
    this.read = read;
  }

  public boolean isWrite() {
    return write;
  }

  public void setWrite( boolean write ) {
    this.write = write;
  }

  public boolean isExecute() {
    return execute;
  }

  public void setExecute( boolean execute ) {
    this.execute = execute;
  }
}
