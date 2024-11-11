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


package org.pentaho.common.ui.models;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

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
