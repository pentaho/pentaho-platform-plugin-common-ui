package org.pentaho.common.ui.models;

import java.util.List;

import org.pentaho.platform.repository2.unified.webservices.RepositoryFileDto;
import org.pentaho.platform.repository2.unified.webservices.RepositoryFileTreeDto;

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
