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

public class StateMessage {

  public static final String STATUS_FAILED = "FAILED"; //$NON-NLS-1$

  public static final String STATUS_SUCCESS = "SUCCESS"; //$NON-NLS-1$

  public static final String STATUS_WARNIGN = "SUCCESS_WITH_WARNINGS"; //$NON-NLS-1$

  private String status;

  private String message;

  private String state;

  public String getState() {
    return state;
  }

  public void setState( String state ) {
    this.state = state;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus( String status ) {
    this.status = status;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage( String message ) {
    this.message = message;
  }

}
