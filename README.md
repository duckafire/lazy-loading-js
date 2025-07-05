<a href="https://github.com/sponsors/duckafire" title="GitHub Sponsors"><img align="right" src="https://img.shields.io/badge/Buy%20me%20a%20coffee-E5DB2F?&logo=buy-me-a-coffee&style=flat-square&logoColor=000"></a>

## Lazy loading

Small and simple JS API, developed to easily the application of the Lazy Loading
tecnique to images, in order to optimize website pages.

### Index

* [Usage](#usage)
	* [Import the API](#import-the-api)
	* [Set the properties](#set-the-properties)
	* [Choose a class](#choose-a-class)
	* [Start the API](#start-the-api)
* [API Methods](#api-methods)
	* [Constructor](#constructor)
	* [`start`](#start)
	* [`disconnectFromObserver`](#disconnectfromobserver)
* [Incompatibility browsers](#incompatibility-browsers)

### Usage

#### Import the API

Import the API in your HTML code:

``` html
<script src="https://cdn.jsdelivr.net/gh/duckafire/lazy-loading-js@main/src/Image.js"></script>
```

[source]: https://github.com/duckafire/lazy-loading-js/tree/main/src/ "Lazy loading API source code"

> Or download the file(s), from [here][source].

#### Set the properties

Choose which `img` will use the API, then set the properties below:

* `data-src`: contains the original image - high quality. It will be used when
the `img` is visible.

* `data-placeholder`: contains an low quality image that will be used when image
is not visible. Used for avoid the breaking of the page layout.

``` html
<script src="https://cdn.jsdelivr.net/gh/duckafire/lazy-loading-js@main/src/Image.js"></script>

<img data-src="./foo.png" data-placeholder="./foo-placeholder.png"/>
```

#### Choose a class

Attribute a specific class to all elements whose visibility will be controlled
by the API.

``` html
<script src="https://cdn.jsdelivr.net/gh/duckafire/lazy-loading-js@main/src/Image.js"></script>

<img class="foo" data-src="./foo.png" data-placeholder="./foo-placeholder.png"/>
```

#### Start the API

Instance a object using the class (choosed in the last step) as first argument and enjoy!


``` html
<script src="https://cdn.jsdelivr.net/gh/duckafire/lazy-loading-js@main/src/Image.js"></script>

<img class="foo" data-src="./foo.png" data-placeholder="./foo-placeholder.png"/>

<script>
	new LazyLoadingImage(".foo");

	// OR:
	// const api_unit = new LazyLoadingImage(".foo");
</script>
```

### API methods

#### Constructor

Instance the object and it validate the HTML elements that were obtained by
the query specificed.

| Parameters   | Type    | Default   | Description                                   |
| :--          | :--     | :--       | :--                                           |
| query        | string  | undefined | CSS query to get specific HTML elements.      |
| startWarning | boolean | false     | it allows console warning and error messages. |
| awaitToStart | boolean | false     | set that the API will be started manually.    |

> [!IMPORTANT]
> Parameters that have `undefined` as default value they are mandatory.

##### Exceptions

* None element was found with the specified query.
* Element type (`img`, `div`, ...) invalid - only `img` is allow.

##### Console

###### Warnings

* All [`start`](#start) warnings.

###### Errors

* All [`start`](#start) errors.

#### `start`

Used to start the API manually.

| Parameters | Type    | Default   | Description                                     |
| :--        | :--     | :--       | :--                                             |
| warning    | boolean | false     | it allows console warning and error messages. |

##### Exceptions

* *None.*

##### Console

###### Warnings

* The API already was started.

###### Errors

* The browser do not have support to *Intersection Observer API* (API from JS
standard, use as base to this project).

#### `disconnectFromObserver`

Used to end API work.

> [!NOTE]
> This method is declared inside `#connectToObserver` (*private* method).

| Parameters | Type    | Default   | Description |
| :--        | :--     | :--       | :--         |
| *None*     | | | |

##### Exceptions

* *None.*

##### Console

###### Warnings

* *None.*

###### Errors

* *None.*

### Incompatibility browsers

This API is based in other API, from JS Standard, named *Intersection Observer
API*. If the user's browser do not have support to this Standard API, the
`data-src` image will load without lazy loading.
