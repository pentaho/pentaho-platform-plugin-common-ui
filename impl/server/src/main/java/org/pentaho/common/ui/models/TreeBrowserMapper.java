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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.repository2.unified.jcr.LocalizationUtil;
import org.pentaho.platform.api.repository2.unified.webservices.LocaleMapDto;
import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileDto;
import org.pentaho.platform.api.repository2.unified.webservices.RepositoryFileTreeDto;
import org.pentaho.platform.api.repository2.unified.webservices.StringKeyStringValueDto;

/**
 * @author Rowell Belen
 */
public class TreeBrowserMapper {

  private Log logger = LogFactory.getLog( TreeBrowserMapper.class );

  private static String FILE_NAME_KEY = "file.title";

  private PermissionsModelMapper permissionsModelMapper;

  private Locale locale = Locale.getDefault();

  public TreeBrowserMapper( Locale locale ) {
    this.locale = locale;
  }

  public void setPermissionsModelMapper( PermissionsModelMapper permissionsModelMapper ) {
    this.permissionsModelMapper = permissionsModelMapper;
  }

  public TreeBrowserModel convert( RepositoryFileDto repositoryDto ) {

    TreeBrowserModel treeBrowserModel = new TreeBrowserModel();

    try {
      BeanUtils.copyProperties( treeBrowserModel, repositoryDto );

      // Map owner
      treeBrowserModel.setOwner( repositoryDto.getRepositoryFileAclDto().getOwner() );
    } catch ( Exception e ) {
      logger.warn( ExceptionUtils.getFullStackTrace( e ) );
    }

    // Map localized name
    treeBrowserModel.setLocalizedName( getLocalizedName( this.locale, repositoryDto, FILE_NAME_KEY, repositoryDto
        .getName() ) );

    // Initialize permissions
    PermissionsModel permissionsModel = new PermissionsModel();
    if ( permissionsModelMapper != null ) {
      permissionsModel = permissionsModelMapper.map( treeBrowserModel );
    }
    treeBrowserModel.setPermissions( permissionsModel );

    return treeBrowserModel;
  }

  public TreeBrowserModel convert( RepositoryFileTreeDto repositoryFileTreeDto ) {

    RepositoryFileDto repositoryFileDto = repositoryFileTreeDto.getFile();
    TreeBrowserModel treeBrowserModel = convert( repositoryFileDto );
    mapTree( repositoryFileTreeDto, treeBrowserModel );
    return treeBrowserModel;
  }

  private void mapTree( RepositoryFileTreeDto root, TreeBrowserModel treeBrowserModel ) {

    List<RepositoryFileTreeDto> children = root.getChildren();
    List<TreeBrowserModel> models = new ArrayList<TreeBrowserModel>();

    if ( children != null ) {
      for ( RepositoryFileTreeDto repositoryFileTreeDto : children ) {

        RepositoryFileDto file = repositoryFileTreeDto.getFile();
        TreeBrowserModel model = convert( file );

        mapTree( repositoryFileTreeDto, model );

        models.add( model );
      }
    }

    treeBrowserModel.setChildren( models );
  }

  public Map<String, Properties> toPropertiesMap( List<LocaleMapDto> propertiesMapEntries ) {

    Map<String, Properties> propertiesMap = new HashMap<String, Properties>();

    if ( propertiesMapEntries != null ) {
      for ( LocaleMapDto localeMapDto : propertiesMapEntries ) {
        Properties props = new Properties();
        List<StringKeyStringValueDto> properties = localeMapDto.getProperties();
        if ( properties != null ) {
          for ( StringKeyStringValueDto stringKeyStringValueDto : properties ) {
            props.put( stringKeyStringValueDto.getKey(), stringKeyStringValueDto.getValue() );
          }
        }
        propertiesMap.put( localeMapDto.getLocale(), props );
      }
    }

    return propertiesMap;
  }

  public String getLocalizedName( Locale locale, RepositoryFileDto repositoryDto, String propertyName,
      String defaultValue ) {

    // convert List<LocaleMapDto> to Map<String, Properties>
    Map<String, Properties> localePropertiesMap = toPropertiesMap( repositoryDto.getLocalePropertiesMapEntries() );

    LocalizationUtil localizationUtil = new LocalizationUtil( localePropertiesMap, locale );
    return localizationUtil.resolveLocalizedString( propertyName, defaultValue );
  }
}
