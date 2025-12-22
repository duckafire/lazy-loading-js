[wiki-lazy-load]: https://en.wikipedia.org/wiki/Lazy_loading "Wikipedia: Lazy Loading technique"
[int-ob]: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API "Intersection Observer API"
[caiuse-int-ob]: https://caniuse.com/intersectionobserver "Can I use IntersectionObserver API?"
[origin-repo]: https://github.com/gyanprabhat7/LazyLoad.JS "From GitHub"
[int-ob-opt]: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#creating_an_intersection_observer "IntersectionObserver constructor options"

## LazyLoading.js

This project is a no-dependence library that aims to available simple and light
implementations of the [Lazy Loading][wiki-lazy-load] technique to improve the
optimization of specific elements, objects, and/or components from FrontEnd WEB pages.
Currently, it supports:

* Images (`<img/>`).

```html
<!-- CDN (jsDelivr) URL -->
<script src="https://cdn.jsdelivr.net/npm/@duckafire/lazy-loading-js@3/dist/LazyLoadingImage.min.js"></script>
```

> [!IMPORTANT]
> If [`IntersectionObserver`][int-ob] (**core** of this project) is not available in the
> client's browser, nothing fallback observer algorithm will be implemented and the
> high quality image will be attributed to `src`.
> See more about the availability of this class [here][caniuse-int-ob].

> [!NOTE]
> This project is a fork from [gyanprabhat7/LazyLoad.JS][origin-repo].



#### Index

* [LazyLoadingImages](#lazyloadingimages)

> [!IMPORTANT]
> To improve the understanding of this documentation, types was added to 



### LazyLoadingImages

---

* `constructor(query: string, [options: ILLImagesOptions])`
	* `query`: query selector used to catch target elements.
	* `options`: set of options to customize API behavior.

| Options                            | Default | Description |
| :--                                | :-:     | :--         |
| waitToStart: boolean               | false   | it defines API do not have to be started after to create the object. |
| styleClasses: IStyleClasses        | {}      | set of lists of CSS classes they have to be added/removed to/from the catched elements when the show/hide event occur. |
| observerOptions: IIOOptions        | {}      | options to `IntersectionObserver` constructor. See [this][int-ob-opt] to get more information about. |
| useSrcAsFallbackToLazySrc: boolean | true    | if `true`, it defines `src` content is the lazy quality image if `data-lazy` is undefined, else it defines `src` content is the high quality image if `data-high` is undefined. |

---

* `isApiAvailable(): boolean`

* Behavior: verify if the API is available.
* Return: result, in boolean.

---

* `isStarted(): boolean`

* Behavior: verify if the API algorithm was started.
* Return: result, in boolean.

---

* `startToObserve(): void`

* Behavior: start the API algorithm.
* Return: none.

> [!NOTE]
> It prints a *warning* in the console, if API is already started.

---
