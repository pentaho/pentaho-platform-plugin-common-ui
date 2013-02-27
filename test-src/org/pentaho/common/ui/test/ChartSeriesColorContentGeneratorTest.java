package org.pentaho.common.ui.test;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
import org.pentaho.common.ui.services.ChartSeriesColorContentGenerator;
import org.pentaho.platform.api.engine.IParameterProvider;
import org.pentaho.platform.api.engine.IPluginResourceLoader;
import org.pentaho.platform.api.engine.ObjectFactoryException;
import org.pentaho.platform.engine.core.solution.SimpleParameterProvider;
import org.pentaho.platform.plugin.services.pluginmgr.PluginClassLoader;
import org.pentaho.platform.plugin.services.pluginmgr.PluginResourceLoader;
import org.pentaho.test.platform.engine.core.MicroPlatform;

@SuppressWarnings({ "all" })
public class ChartSeriesColorContentGeneratorTest {

	MicroPlatform mp;

	public ChartSeriesColorContentGeneratorTest() throws ClassNotFoundException, ObjectFactoryException {
		mp = new MicroPlatform("");
		mp.define(IPluginResourceLoader.class, TestPluginResourceLoader.class);
	}

	public static class TestPluginResourceLoader extends PluginResourceLoader {
		@Override
		protected PluginClassLoader getOverrideClassloader() {
			return new PluginClassLoader(new File("package-res"), getClass().getClassLoader());
		}
	};

	@Test
	public void testMdxType() throws Exception {
		ChartSeriesColorContentGenerator cg = new ChartSeriesColorContentGenerator();

		Map<String, IParameterProvider> parameterProviders = new HashMap<String, IParameterProvider>();

		SimpleParameterProvider requestParams = new SimpleParameterProvider();
		requestParams.setParameter("type", "mdx");
		parameterProviders.put(IParameterProvider.SCOPE_REQUEST, requestParams);

		cg.setParameterProviders(parameterProviders);

		ByteArrayOutputStream output = new ByteArrayOutputStream();
		cg.createContent(output);

		String result = output.toString();
		Assert.assertTrue(result.contains("Region"));
	}

}
