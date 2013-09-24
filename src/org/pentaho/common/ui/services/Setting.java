package org.pentaho.common.ui.services;

/**
 * Simple name/value object used to get and set property values from the client
 * @author jamesdixon
 *
 */
public class Setting {

    private String name = null;
    private String value = null;
    public String getName() {
      return name;
    }
    public void setName(String name) {
      this.name = name;
    }
    public String getValue() {
      return value;
    }
    public void setValue(String value) {
      this.value = value;
    }
    
  
}
