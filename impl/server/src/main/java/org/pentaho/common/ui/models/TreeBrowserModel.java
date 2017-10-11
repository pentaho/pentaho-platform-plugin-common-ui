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
 * Copyright (c) 2002-2017 Hitachi Vantara..  All rights reserved.
 */

package org.pentaho.common.ui.models;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
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
