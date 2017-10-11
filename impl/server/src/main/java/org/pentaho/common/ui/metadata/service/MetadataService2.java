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

package org.pentaho.common.ui.metadata.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.StringTokenizer;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.pentaho.common.ui.messages.Messages;
import org.pentaho.commons.connection.IPentahoResultSet;
import org.pentaho.commons.connection.marshal.MarshallableResultSet;
import org.pentaho.metadata.datatable.DataTable;
import org.pentaho.metadata.model.Domain;
import org.pentaho.metadata.model.LogicalModel;
import org.pentaho.metadata.model.thin.Model;
import org.pentaho.metadata.model.thin.ModelInfo;
import org.pentaho.metadata.model.thin.ModelInfoComparator;
import org.pentaho.metadata.model.thin.ModelProvider;
import org.pentaho.metadata.model.thin.Provider;
import org.pentaho.metadata.model.thin.Query;
import org.pentaho.metadata.query.model.util.QueryXmlHelper;
import org.pentaho.metadata.repository.IMetadataDomainRepository;
import org.pentaho.platform.api.engine.ILogger;
import org.pentaho.platform.engine.core.system.PentahoBase;
import org.pentaho.platform.engine.core.system.PentahoSessionHolder;
import org.pentaho.platform.engine.core.system.PentahoSystem;
import org.pentaho.platform.plugin.action.pentahometadata.MetadataQueryComponent;
import org.pentaho.platform.util.messages.LocaleHelper;
import org.pentaho.pms.core.exception.PentahoMetadataException;

import flexjson.JSONSerializer;

/**
 * An object that makes lightweight, serializable metadata models available to callers, and allow queries to be
 * executed. All objects are simple POJOs. This object can be used as a Axis web service.
 * 
 * @author jamesdixon
 * 
 */
public class MetadataService2 extends PentahoBase implements ModelProvider {

  public static final String PROVIDER_ID = "MetadataImpl";

  private static final long serialVersionUID = 8481450224870463494L;

  private Log logger = LogFactory.getLog( MetadataService2.class );

  private MetadataServiceUtil2 util2 = new MetadataServiceUtil2();
  private QueryXmlHelper helper = new QueryXmlHelper();
  private Provider provider;

  public MetadataService2() {
    setLoggingLevel( ILogger.ERROR );
    provider = new Provider();
    provider.setId( PROVIDER_ID );
    provider.setName( "Relational Metadata" );
  }

  /**
   * Returns a list of the available business models
   * 
   * @param domainName
   *          optional domain to limit the results
   * @param context
   *          Area to check for model visibility
   * @return list of ModelInfo objects representing the available models
   */
  @Override
  public ModelInfo[] getModelList( String providerId, String domain, String match ) {

    if ( providerId != null && !providerId.equals( PROVIDER_ID ) ) {
      return new ModelInfo[0];
    }
    List<ModelInfo> models = new ArrayList<ModelInfo>();

    // get hold of the metadata repository
    IMetadataDomainRepository repo = getMetadataRepository();
    if ( repo == null ) {
      error( Messages.getErrorString( "MetadataService.ERROR_0001_BAD_REPO" ) ); //$NON-NLS-1$
      return null;
    }

    try {
      if ( StringUtils.isEmpty( domain ) ) {
        // if no domain has been specified, loop over all of them
        for ( String aDomain : repo.getDomainIds() ) {
          getModelInfos( match, aDomain, models );
        }
      } else {
        // get the models for the specified domain
        getModelInfos( match, domain, models );
      }
    } catch ( Throwable t ) {
      error( Messages.getErrorString( "MetadataService.ERROR_0002_BAD_MODEL_LIST" ), t ); //$NON-NLS-1$
    }

    Collections.sort( models, new ModelInfoComparator() );
    return models.toArray( new ModelInfo[models.size()] );
  }

  /**
   * Returns a list of ModelInfo objects for the specified domain. These objects are small and this list is intended to
   * allow a client to provide a list of models to a user so the user can pick which one they want to work with.
   * 
   * @param domain
   * @param context
   *          Area to check for model visibility
   * @param models
   */
  private void getModelInfos( final String match, final String domain, List<ModelInfo> models ) {

    IMetadataDomainRepository repo = getMetadataRepository();

    String context = null;
    Domain domainObject = repo.getDomain( domain );
    if ( domainObject == null ) {
      // the domain does not exist
      return;
    }

    // find the best locale
    String locale = LocaleHelper.getClosestLocale( LocaleHelper.getLocale().toString(), domainObject.getLocaleCodes() );

    // iterate over all of the models in this domain
    for ( LogicalModel model : domainObject.getLogicalModels() ) {
      String vis = (String) model.getProperty( "visible" );
      if ( vis != null ) {
        String[] visibleContexts = vis.split( "," );
        boolean visibleToContext = false;
        for ( String c : visibleContexts ) {
          if ( c.equals( context ) ) {
            // TODO investigate situation. Now context always is null.
            visibleToContext = true;
            break;
          }
        }
        if ( !visibleToContext ) {
          continue;
        }
      }
      // create a new ModelInfo object and give it the envelope information about the model
      ModelInfo modelInfo = new ModelInfo();
      modelInfo.setGroupId( domain );
      modelInfo.setModelId( model.getId() );
      modelInfo.setName( model.getName( locale ) );
      modelInfo.setProvider( provider );
      if ( model.getDescription() != null ) {
        String modelDescription = model.getDescription( locale );
        modelInfo.setDescription( modelDescription );
      }
      models.add( modelInfo );
    }
    return;
  }

  /**
   * Returns a Model object for the requested model. The model will include the basic metadata - categories and columns.
   * 
   * @param domainId
   * @param modelId
   * @return
   */
  @Override
  public Model getModel( String id ) {

    // parse out the id
    StringTokenizer tokenizer = new StringTokenizer( id, "~" );

    String providerId = null;
    String domainId = null;
    String modelId = null;
    while ( tokenizer.hasMoreElements() ) {
      String str = tokenizer.nextToken();
      if ( providerId == null ) {
        providerId = str;
      } else if ( domainId == null ) {
        domainId = str;
      } else {
        modelId = str;
      }
    }

    if ( domainId == null ) {
      // we can't do this without a model
      error( Messages.getErrorString( "MetadataService.ERROR_0003_NULL_DOMAIN" ) ); //$NON-NLS-1$
      return null;
    }

    if ( modelId == null ) {
      // we can't do this without a model
      error( Messages.getErrorString( "MetadataService.ERROR_0004_NULL_Model" ) ); //$NON-NLS-1$
      return null;
    }

    // because it's lighter weight, check the thin model
    Domain domain = getMetadataRepository().getDomain( domainId );
    if ( domain == null ) {
      error( Messages.getErrorString( "MetadataService.ERROR_0005_DOMAIN_NOT_FOUND", domainId ) ); //$NON-NLS-1$
      return null;
    }

    LogicalModel model = domain.findLogicalModel( modelId );

    if ( model == null ) {
      // the model cannot be found or cannot be loaded
      error( Messages.getErrorString( "MetadataService.ERROR_0006_MODEL_NOT_FOUND", modelId ) ); //$NON-NLS-1$
      return null;
    }

    // create the thin metadata model and return it
    MetadataServiceUtil2 util = getMetadataServiceUtil2();
    util.setDomain( domain );
    Model thinModel = util.createThinModel( model, domainId );
    thinModel.setProvider( provider );
    return thinModel;

  }

  /**
   * Executes a query model and returns a serializable result set
   * 
   * @param query
   * @param rowLimit
   *          An optional row limit, -1 or null means all rows
   * @return
   */
  @Override
  public DataTable executeQuery( Query query, int rowLimit ) {
    return null;
  }

  public MarshallableResultSet doQuery( Query query, Integer rowLimit ) {

    MetadataServiceUtil2 util = getMetadataServiceUtil2();

    Model model = getModel( query.getSourceId() );

    org.pentaho.metadata.query.model.Query fullQuery = util.convertQuery( query, model );
    QueryXmlHelper helper = getHelper();
    String xml = helper.toXML( fullQuery );
    return doXmlQuery( xml, rowLimit );
  }

  /**
   * Executes a XML query and returns a serializable result set
   * 
   * @param query
   * @param rowLimit
   *          An optional row limit, -1 or null means all rows
   * @return
   */
  public MarshallableResultSet doXmlQuery( String xml, Integer rowLimit ) {
    IPentahoResultSet resultSet = executeQuery( xml, rowLimit );
    if ( resultSet == null ) {
      return null;
    }
    MarshallableResultSet result = new MarshallableResultSet();
    result.setResultSet( resultSet );
    return result;
  }

  /**
   * Executes a XML query and returns a JSON serialization of the result set
   * 
   * @param query
   * @param rowLimit
   * @return
   */
  public String doXmlQueryToJson( String xml, int rowLimit ) {
    MarshallableResultSet resultSet = doXmlQuery( xml, rowLimit );
    if ( resultSet == null ) {
      return null;
    }
    JSONSerializer serializer = new JSONSerializer();
    String json = serializer.deepSerialize( resultSet );
    return json;
  }

  /**
   * Executes a XML query and returns a CDA compatible JSON serialization of the result set
   * 
   * @param query
   * @param rowLimit
   * @return
   */
  public String doXmlQueryToCdaJson( String xml, int rowLimit ) {
    IPentahoResultSet resultSet = executeQuery( xml, rowLimit );
    if ( resultSet == null ) {
      return null;
    }
    String json = null;
    try {
      MetadataServiceUtil2 util = getMetadataServiceUtil2();
      Domain domain = util.getDomainObject( xml );
      util.setDomain( domain );
      String locale = LocaleHelper.getClosestLocale( LocaleHelper.getLocale().toString(), domain.getLocaleCodes() );
      json = util.createCdaJson( resultSet, locale );
    } catch ( JSONException e ) {
      error( Messages.getErrorString( "MetadataService.ERROR_0007_JSON_ERROR" ), e ); //$NON-NLS-1$
    } catch ( PentahoMetadataException e ) {
      error( Messages.getErrorString( "MetadataService.ERROR_0007_BAD_QUERY_DOMAIN" ), e ); //$NON-NLS-1$
    }
    return json;
  }

  /**
   * Executes a XML query and returns a serializable result set
   * 
   * @param query
   * @param rowLimit
   *          An optional row limit, -1 or null means all rows
   * @return
   */
  public MarshallableResultSet doJsonQuery( String json, Integer rowLimit ) {

    // return the results
    return doXmlQuery( getQueryXmlFromJson( json ), rowLimit );
  }

  /**
   * Executes a XML query and returns a JSON serialization of the result set
   * 
   * @param query
   * @param rowLimit
   * @return
   */
  public String doJsonQueryToJson( String json, int rowLimit ) {
    // return the results
    return doXmlQueryToJson( getQueryXmlFromJson( json ), rowLimit );
  }

  /**
   * Executes a XML query and returns a CDA compatible JSON serialization of the result set
   * 
   * @param query
   * @param rowLimit
   * @return
   */
  public String doJsonQueryToCdaJson( String json, int rowLimit ) {
    // return the results
    return doXmlQueryToCdaJson( getQueryXmlFromJson( json ), rowLimit );
  }

  /**
   * Executes a XML query and returns a native result set
   * 
   * @param query
   * @param rowLimit
   *          An optional row limit, -1 or null means all rows
   * @return
   */
  protected IPentahoResultSet executeQuery( String query, Integer rowLimit ) {
    // create a component to execute the query
    MetadataQueryComponent dataComponent = new MetadataQueryComponent();
    dataComponent.setQuery( query );
    dataComponent.setLive( false );
    dataComponent.setUseForwardOnlyResultSet( true );
    if ( rowLimit != null && rowLimit > -1 ) {
      // set the row limit
      dataComponent.setMaxRows( rowLimit );
    }
    if ( dataComponent.execute() ) {
      return dataComponent.getResultSet();
    }
    return null;
  }

  /**
   * Converts a JSON query into a full Query object by going via a thin Query object
   * 
   * @param json
   * @return
   */
  protected String getQueryXmlFromJson( String json ) {
    MetadataServiceUtil2 util = getMetadataServiceUtil2();
    Query query = util.deserializeJsonQuery( json );
    try {
      // convert the thin query model into a full one
      Model model = getModel( query.getSourceId() );
      org.pentaho.metadata.query.model.Query fullQuery = util.convertQuery( query, model );

      // get the XML for the query
      QueryXmlHelper helper = getHelper();
      String xml = helper.toXML( fullQuery );
      return xml;
    } catch ( Exception e ) {
      error( Messages.getErrorString( "MetadataService.ERROR_0008_BAD_QUERY" ), e ); //$NON-NLS-1$
    }
    return null;
  }

  /**
   * Returns a instance of the IMetadataDomainRepository for the current session
   * 
   * @return
   */
  protected IMetadataDomainRepository getMetadataRepository() {
    IMetadataDomainRepository mdr =
        PentahoSystem.get( IMetadataDomainRepository.class, PentahoSessionHolder.getSession() );
    if ( mdr instanceof ILogger ) {
      ( (ILogger) mdr ).setLoggingLevel( getLoggingLevel() );
    }
    return mdr;
  }

  @Override
  public Log getLogger() {
    return logger;
  }

  @Override
  public String getId() {
    return PROVIDER_ID;
  }

  /**
   * package-local visibility for testing purposes
   */
  MetadataServiceUtil2 getMetadataServiceUtil2() {
    return util2;
  }

  /**
   * package-local visibility for testing purposes
   */
  QueryXmlHelper getHelper() {
    return helper;
  }
}
