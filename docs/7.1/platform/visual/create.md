---
title: Create a Custom Visualization
description: Complete walk-through on how to create a visualization for the Pentaho platform.
parent-title: Visualization API
layout: 7.1_default
---

This walk-through guides you through the creation of a custom visualization for the Pentaho platform, 
from developing the visualization itself to building an OSGi Artifact that can be deployed to Pentaho products.

## 1. Develop the Visualization in a Sandbox

You will start by developing the visualization in a controlled sandbox environment.
Then, you will drop the sandbox and package the visualization's files in a way that
it can be deployed to Pentaho products.

Do the [Bar/D3 Visualization in Sandbox](samples/bar-d3-sandbox) walk-through, 
which guides you through the development of a custom visualization having a [D3](https://d3js.org/)-based view.

## 2. Create the Pentaho Web Package

In the previous section you developed a custom visualization and tested it in a controlled sandbox environment.

If you exclude the sandbox specific files, 
you are left with `model.js`, `view-d3.js`, `config.js` and a `css` folder.
However, note, one important feature — the AMD/RequireJS configuration — was part of the sandbox `index.html` file.
Also, the D3 dependency was declared in the sandbox's `npm` `package.json` file.
 
When developing for the Pentaho platform, 
equivalent information needs to be provided in a _Pentaho Web Package descriptor_ file, 
which, not coincidentally, is called `package.json`.
We call the set of web resources plus its package descriptor a [Pentaho Web Package](../web-package).

At a minimum, the `package.json` file requires the `name` and `version` fields.
We choose the package name to match the AMD/RequireJS identifier prefix by which we want the resources to be available.

The D3 library dependency, is declared similarly to how it was declared.

Your visualization must be advertised to the platform so that applications like Analyzer and PDI can offer it to users.
This is done by registering 
the visualization's [`Model`]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.visual.base.Model'}}) module
with [`pentaho/service`]({{site.refDocsUrlPattern7 | replace: '$', 'pentaho.service'}}),
as a service of type `pentaho/visual/base`.

The default configuration module that you developed also needs to be advertised to the configuration system,
by registering it with `pentaho/service` as a service of type `pentaho.config.spec.IRuleSet`.

The result is the following `package.json` content:

```json
{ 
  "name": "pentaho-visual-samples-bar",
  "version": "0.0.1",
  
  "config": {
    "pentaho/service": {
      "pentaho-visual-samples-bar_0.0.1/model": "pentaho/visual/base",
      "pentaho-visual-samples-bar_0.0.1/config": "pentaho.config.spec.IRuleSet"
    }
  },
  
  "dependencies": {
    "d3": "^4.8.0"
  }
}
```

## 3. Create the Pentaho Web Project

The Pentaho platform is built on top of an OSGi container, 
so developers must provide their code as an OSGi/Karaf artifact. 
Additionally, any client-side dependencies must also be provided to the platform as OSGi bundles.

The recommended way is to put the visualization bundle, its dependencies, 
and corresponding feature definition together into a single KAR file.

If you are not familiar with  details about Pentaho Web projects please see [Create a Pentaho Web Project for a Web Package and its Dependencies](../web-project).

To do so we've prepared a maven project that can be used as the foundation to create the KAR file for the
D3 visualization developed in the previous sections.

1. Clone the repository `https://github.com/pentaho/pentaho-engineering-samples`.
1. Checkout the `7.1` branch.
1. Copy the stub maven project at `Samples_for_Extending_Pentaho/javascript-apis/platform/pentaho/visual/samples/web-project/` to a folder of your choice, e.g. `myWebProject`. Make sure the folder path does not contain whitespaces. 
1. Do a recursive find and replace for the following strings:
   1. _myGroupId_ - Replace with the group identifier of your choice. Commonly associated with the company or organization where the artifact was developed.
   1. _myArtifactId_ - Replace with the `name` set in your `package.json` (i.e. `pentaho-visual-samples-bar`).
1. Copy the resources developed during the [Bar/D3 Visualization in Sandbox](samples/bar-d3-sandbox) walk-through. Put the css folder and `model.js`, `view-d3.js` and `config.js` files at `impl/src/main/javascript/web`.
1. Create a `package.json` file at `impl/src/main/resources/META-INF/js` with the content defined in the [previous section](#2-create-the-pentaho-web-package).
1. Edit the feature descriptor at `assemblies/src/main/feature/feature.xml` to include the dependency on D3:
   
   ```xml
   <features name="${project.artifactId}-repo" xmlns="http://karaf.apache.org/xmlns/features/v1.2.1">
     <feature name="${project.artifactId}" version="${project.version}">
       <feature>pentaho-requirejs-osgi-manager</feature>
       <feature>pentaho-deployers</feature>
       <bundle>pentaho-webjars:mvn:org.webjars.npm/d3/4.8.0</bundle>
     </feature>
   </features>
   ```
1. Run `mvn package` at the root maven project (e.g. `myWebProject`).
1. Your KAR file for deployment should now be available at `assemblies/target`.


## 4. Next Steps

To learn how to deploy the visualization,
continue reading at [Deploy the visualization](.#deploying-the-visualization).
