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
import java.util.ArrayList;
import java.util.List;


/**
 * @author Rowell Belen
 */
@XmlRootElement
@XmlAccessorType( XmlAccessType.FIELD )
public class TreeBrowserModel {

  @XmlElement
  private String id;

  @XmlElement
  private String name;

  @XmlElement
  private String description;

  @XmlElement
  private String localizedName;

  @XmlElement
  private boolean isFolder;

  @XmlElement
  private String path;

  @XmlElement
  private String owner;

  @XmlElement
  private List<TreeBrowserModel> children = new ArrayList<TreeBrowserModel>();

  @XmlElement
  private PermissionsModel permissions;

  public String getId() {
    return id;
  }

  public void setId( String id ) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName( String name ) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription( String description ) {
    this.description = description;
  }

  public String getLocalizedName() {
    return localizedName;
  }

  public void setLocalizedName( String localizedName ) {
    this.localizedName = localizedName;
  }

  public boolean isFolder() {
    return isFolder;
  }

  public void setFolder( boolean isFolder ) {
    this.isFolder = isFolder;
  }

  public String getPath() {
    return path;
  }

  public void setPath( String path ) {
    this.path = path;
  }

  public List<TreeBrowserModel> getChildren() {
    return children;
  }

  public void setChildren( List<TreeBrowserModel> children ) {
    this.children = children;
  }

  public PermissionsModel getPermissions() {
    return permissions;
  }

  public void setPermissions( PermissionsModel permissions ) {
    this.permissions = permissions;
  }

  public String getOwner() {
    return owner;
  }

  public void setOwner( String owner ) {
    this.owner = owner;
  }
}
