---
title: Create a Pentaho Web Project for a Web Package and its Dependencies
description: Explains the core concepts and walks through the creation of a KAR file for deploying a web package and its dependencies in the Pentaho Platform.
parent-title: ""
layout: 7.1_default
---

The Pentaho platform is built on top of an [OSGi](https://www.osgi.org/) container 
([Apache Karaf](https://karaf.apache.org)).
It allows for a simple modular approach at both development time and runtime, 
reducing complexity and facilitating deployment.

## OSGi/Karaf Artifacts

A **bundle** is the deployment unit in OSGi. 
Basically, a bundle is just a JAR file with special bundle headers in its `META-INF/MANIFEST.MF` file.

Apache Karaf allows grouping bundles into 
[**features**](https://karaf.apache.org/manual/latest/provisioning#_feature_and_resolver). 
This facilitates the provisioning of the application, 
by automatically resolving and installing all bundles described in the feature.

Finally, Apache Karaf also provides a special type of artifact, 
that packages the feature definition together with all of the described bundles. 
This artifact is named a [**KAR** (KAraf aRchive)](https://karaf.apache.org/manual/latest/kar). 
Using a KAR file avoids the need to download artifacts from remote repositories.

Typically, to deploy your visualization you'll need a _bundle_ with your code, 
a _feature_ grouping it together with its dependencies, 
and a _KAR_ file, so you don't need to publish your bundle to a remote (or even local) repository and 
your dependencies are available without the need for a network connection.


## Prerequisites

- Java 1.8
- Maven 3+
- This [settings.xml](https://github.com/pentaho/maven-parent-poms/blob/master/maven-support-files/settings.xml) 
in your <user-home>/.m2 directory


## Recommended Maven project directory layout

Pentaho maven OSGi projects are commonly composed by a [root project](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html) that contains an `impl` 
folder for bundle implementation [modules](https://maven.apache.org/guides/mini/guide-multiple-modules.html) and an `assemblies` folder for modules concerning the provisioning of those bundles.

If the project contemplates multiple bundles then `impl` will itself include multiple 
modules, one for each bundle. If the project only has a single bundle then it is OK for `impl` to 
directly contain the bundle implementation module without the need for a sub module.

A provisioning module, in the context of a Pentaho OSGi project, is a module that automates, 
as much as possible, the creation of a feature file and potentially the KAR file that allows that feature 
to be easily deployed. 
One reason why multiple provisioning modules might exist is that it may be desirable to deploy the bundle(s) in 
different products such as Pentaho Server and PDI. The different 
targets may warrant different configurations or dependency provisioning and thus different features 
and KAR files.

In order to take advantage of Pentaho conventions and build pipeline, the root project should have 
[`pentaho-ce-bundle-parent-pom`](https://github.com/pentaho/maven-parent-poms/blob/7.1.0.0-R/pentaho-ce-parent-pom/pentaho-ce-jar-parent-pom/pentaho-ce-bundle-parent-pom/pom.xml) as its parent project.


### Bundle modules

Consider the following example folder structure for `impl`:

```
|____rootProject
  |____impl
    |____src
      |____main
        |____config
        | |____javascript
        |   |____osgi
        |____javascript
        | |____web
        |____resources
          |____META-INF
          | |____js
          |____OSGI-INF
            |____blueprint
```

On this example case, we have a single bundle and as such its source folder is directly under the `impl` 
folder  (`impl/src`) instead of being on a dedicated sub module (`impl/myBundleModule/src`).

The `impl/src/main/config/javascript/osgi` folder contains the configuration file for the optimization that
is to be performed by the [RequireJS optimizer](http://requirejs.org/docs/optimization.html) when building 
the bundle. If the configuration file exists but does not specify any configuration option then, by default, 
each javascript file is minified in place and source maps are generated.

The `impl/src/main/resources/META-INF/js` folder is where the [`package.json`](./web-package) descriptor should 
be placed.

The `impl/src/main/resources/OSGI-INF/blueprint` folder contains one or more [blueprint descriptor files](https://www.ibm.com/developerworks/library/os-osgiblueprint/). For web projects, the blueprint descriptor is mostly used 
to register bundle resources so that they become available at a given URL. This is done by declaring a 
[service](https://www.ibm.com/developerworks/library/os-osgiblueprint/#servman) that implements the resource 
mapping from the [whiteboard extender](http://ops4j.github.io/pax/web/SNAPSHOT/User-Guide.html#WhiteboardExtender-Howdoesithelponresourceregistration). For example, a descriptor file (e.g. `blueprint.xml`) would contain:

```xml
<service interface="org.ops4j.pax.web.extender.whiteboard.ResourceMapping">
  <bean class="org.ops4j.pax.web.extender.whiteboard.runtime.DefaultResourceMapping">
    <property name="alias" value="/urlWhereResourceWillBeAvailable"/>
    <property name="path" value="pathRelativeToBundleRootThatContainsResources"/>
  </bean>
</service>
```

Finally, the Javascript source code is to be placed in `impl/src/main/javascript/web`. The `web` 
folder name is a convention. The project creator may change it as long as the value of 
the `path` property for the resource mapping service is changed accordingly in the blueprint descriptor.


### Provisioning modules

Consider the following example folder structure for `assemblies`:

```
|____rootProject
  |____assemblies
    |____src
      |____main
        |____feature
```

As it was the case for the `impl` folder example, here we have a single module for provisioning, located 
directly in the `assemblies` folder. It is this module that is responsible for building
the KAR file for deployment.

Not only your bundle, but also the client-side dependencies of your package declared in the 
[`package.json`](./web-package) file, must be provided to the platform as bundles. 

If they are third-party code, that means you would have to bundle them yourself, creating separate modules, etc. 
Fortunately, there is a project that already packages client-side web libraries as JAR files. 
It is appropriately called [WebJars](http://www.webjars.org). All you have to do is to look for the needed 
libraries (the [NPM flavor](http://www.webjars.org/npm) is recommended), choose the right versions and copy 
their Maven artifact information (groupId, artifactId and version).
If you can't find the library, or the right version, you can create a new WebJar (light blue button on the 
top right corner).

With the artifact information you can add the dependency to your feature definition file located at 
`assemblies/src/main/feature`. However, given that webJars are just plain JAR files without the manifest headers 
needed to make it an OSGi bundle, you need to specify a special deployer to handle them. The Pentaho platform 
provides such a Apache Karaf deployer named `pentaho-webjars`. 
To add webJar dependencies you should add them to the feature descriptor using the following form:
```xml
<bundle>pentaho-webjars:mvn:org.webjars.FLAVOR/ARTIFACT_ID/VERSION</bundle>
```

You should add bundle descriptions for each dependency that is declared in the [`package.json`](./web-package) file.
If any, skip the Pentaho Platform API dependencies, such as the Visualization API dependency, 
as these are provided by the platform.

## Building it

To build the project, execute the following command at the root project folder:

```shell
mvn package
```

This will build all implementation and provisioning modules. The result of the build will be placed in a 
`target` folder located in the folder of the corresponding module.

For the example given above, after building and if all went well, the `impl/target` folder will contain a JAR 
file that corresponds to your bundle. If you would like to check its content, simply unzip it. 

Likewise, The KAR file will be located at `assemblies/target` and you can check that your feature file, bundle and 
bundle dependencies are zipped within it. 

If you want to know how to deploy the built artifact to a Pentaho product,
see [OSGi/Karaf Artifacts Deployment](osgi-deployment).
