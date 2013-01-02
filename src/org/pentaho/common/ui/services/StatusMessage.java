package org.pentaho.common.ui.services;

/**
 * A message object used to transport messages from the server to the client
 * @author jamesdixon
 *
 */
public class StatusMessage {

  private String code;
  private String message;
  public String getCode() {
    return code;
  }
  public void setCode(String code) {
    this.code = code;
  }
  public String getMessage() {
    return message;
  }
  public void setMessage(String message) {
    this.message = message;
  }
  
}
