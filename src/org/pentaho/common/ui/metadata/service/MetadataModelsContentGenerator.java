package org.pentaho.common.ui.metadata.service;

import java.io.OutputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.metadata.datatable.DataTable;
import org.pentaho.metadata.model.thin.MetadataModelsService;
import org.pentaho.metadata.model.thin.Model;
import org.pentaho.metadata.model.thin.ModelInfo;
import org.pentaho.metadata.model.thin.Query;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.engine.services.solution.SimpleContentGenerator;

import flexjson.JSONDeserializer;
import flexjson.JSONSerializer;

public class MetadataModelsContentGenerator extends SimpleContentGenerator {

	private static final long serialVersionUID = -3934988366302705814L;

	private Log logger = LogFactory.getLog(MetadataModelsContentGenerator.class);
	
	public static final String LIST_MODELS_ACTION = "listmodels"; //$NON-NLS-1$
	public static final String GET_MODEL_ACTION = "getmodel"; //$NON-NLS-1$
	public static final String QUERY_ACTION = "query"; //$NON-NLS-1$
	
	@Override
	public void createContent(OutputStream output) throws Exception {

		IParameterProvider params = parameterProviders.get(IParameterProvider.SCOPE_REQUEST);
		String action = params.getStringParameter("action", null); //$NON-NLS-1$

		if( LIST_MODELS_ACTION.equals(action) ) {
			String providerId = params.getStringParameter("providerid", null); //$NON-NLS-1$
			String groupId = params.getStringParameter("groupid", null); //$NON-NLS-1$
			String match = params.getStringParameter("match", null); //$NON-NLS-1$
			MetadataModelsService svc = new MetadataModelsService();
			ModelInfo infos[] = svc.getModelList(providerId,groupId,match);
			writeJson( infos, output );
		}
		else if( GET_MODEL_ACTION.equals(action) ) {
			String id = params.getStringParameter("id", null); //$NON-NLS-1$
			MetadataModelsService svc = new MetadataModelsService();
			Model model = svc.getModel( id );
			writeJson( model, output );
		}
		else if( QUERY_ACTION.equals(action) ) {
			String queryStr = params.getStringParameter("query", null); //$NON-NLS-1$
			int rowLimit = (int) params.getLongParameter("rowlimit", -1); //$NON-NLS-1$
			JSONDeserializer<Query> de = new JSONDeserializer<Query>();
			Query query = de.deserialize(queryStr);
			MetadataModelsService svc = new MetadataModelsService();
			DataTable table = svc.executeQuery(query, rowLimit);
			writeJson( table, output );
		}
		
	}

	protected void writeJson( Object object, OutputStream output) {
		try {
			JSONSerializer json = new JSONSerializer();
			String jsonStr = json.deepSerialize(object);
			output.write(jsonStr.getBytes());
		} catch (Exception e) {
			logger.error("Could not write JSON to output stream", e);
		}
		
	}
	
	@Override
	public String getMimeType() {
		return "application/json"; //$NON-NLS-1$
	}

	@Override
	public Log getLogger() {
		return logger;
	}

}
