/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/


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
