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
 * Copyright (c) 2002-2018 Hitachi Vantara.  All rights reserved.
 */

package org.pentaho.common.ui.models;

import java.util.List;

import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileDto;
import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileTreeDto;

/**
 * @author Rowell Belen
 */
public class TreeBrowserModelUtils {

  public interface RepositoryFileDtoVisitor {
    public void visit( RepositoryFileDto repositoryFileDto );
  }

  public interface TreeBrowserModelVisitor {
    public void visit( TreeBrowserModel treeBrowserModel );
  }

  public static void traverse( RepositoryFileTreeDto root, RepositoryFileDtoVisitor repositoryFileDtoVisitor ) {

    if ( root == null ) {
      return;
    }

    if ( repositoryFileDtoVisitor != null ) {
      RepositoryFileDto file = root.getFile();
      repositoryFileDtoVisitor.visit( file );
    }

    List<RepositoryFileTreeDto> children = root.getChildren();
    if ( children != null ) {
      for ( RepositoryFileTreeDto repositoryFileTreeDto : children ) {
        traverse( repositoryFileTreeDto, repositoryFileDtoVisitor );
      }
    }
  }

  public static void traverse( TreeBrowserModel root, TreeBrowserModelVisitor treeBrowserModelVisitor ) {

    if ( root == null ) {
      return;
    }

    if ( treeBrowserModelVisitor != null ) {
      treeBrowserModelVisitor.visit( root );
    }

    List<TreeBrowserModel> children = root.getChildren();
    if ( children != null ) {
      for ( TreeBrowserModel treeBrowserModel : children ) {
        traverse( treeBrowserModel, treeBrowserModelVisitor );
      }
    }
  }

}
