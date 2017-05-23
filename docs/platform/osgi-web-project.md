---
title: Create an OSGi Web Project for a Web Package and its Dependencies
description: Explains the core concepts and walks through the creation of a KAR file for deploying a web package and its dependencies in the Pentaho Platform.
parent-title: ""
layout: default
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

To ease the process, a Maven Archetype is provided that lays out the recommended project structure for you.

## Prerequisites

- Java 1.8
- Maven >= 3.0.3

## Recommended Maven project directory layout

### Using the Archetype

```shell
mvn archetype:generate ...
```

>  - Maven project structure starting with the maven archetype. 
>    - _Do not inherit from pentaho parent POMs_
>    - _We need to check where/how to publish the archetype_

## Explain the folder structure

>  - Explain the folder structure
>    - What are the assemblies (generating kar) 
>    - What are the impl (the actual viz)
>      - ~Blueprint~ Keep it to a minimum. Just mentioned that this file is used to specify where (URL) the JS code will be available from

## Adding your dependencies

The client-side dependencies of your package — declared in the `package.json` file — 
must also be provided to the platform as bundles.

If they are third-party code that means you would have to bundle them yourself, creating separate modules, etc..

Luckily there is a project that already packages client-side web libraries as JAR files. 
It is appropriately called [WebJars](http://www.webjars.org).

All you have to do is to look for the needed libraries (the [NPM flavor](http://www.webjars.org/npm) is recommended), 
choose the right versions and copy their Maven artifact information (groupId, artifactId and version).

If you can't find the library, or the right version, you can create a new WebJar (light blue button on the top right corner).

With the artifact information you can add the dependency to your feature definition.
Just build the Maven artifact URL in the form `mvn:GROUP_ID/ARTIFACT_ID/VERSION`.

However, WebJars are just plain JAR files without the manifest headers needed to make it an OSGi bundle.
The Pentaho platform provides an Apache Karaf deployer that solves the problem:
just prepend `pentaho-webjars:` to the artifact URL.

In the end the bundle description in the feature file will look like this:
```xml
<bundle>pentaho-webjars:mvn:org.webjars.npm/whatwg-fetch/2.0.1</bundle>
```

You should add bundle descriptions for each dependency that is declared in the `package.json` file.
If any, skip the Pentaho Platform API dependencies, such as the Visualization API dependency, 
as these are provided by the platform.

## Building it

To build the project, execute:

```shell
mvn clean package
```

If everything went well, the KAR artifact will be located at `assemblies/target`.

If you want to know how to deploy the built artifact to a Pentaho product,
see [OSGi/Karaf Artifacts Deployment](osgi-deployment).
