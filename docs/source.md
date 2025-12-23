[main-readme]: ../README.md#index "User documentation"
[int-ob]: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API "Intersection Observer API"
[main-readme]: ../README.md#lazyloadingimages "LazyLoadingImages constructor"
[builder-dp]: https://refactoring.guru/design-patterns/builder "Refactoring.guru: Builder Design Pattern"
[required-data-attr]: ../README.md#element-attributes "Required data attributes"

* [Interfaces](#interfaces)
	* [To typing](#to-typing)
		* [IImgSrc](#iimgsrc)
		* [IStyleClasses](#istyleclasses)
		* [IIOOptions](#iiooptions)
		* [ILLImagesOptions](#illimagesoptions)
	* [To implementing](#to-implementing)
		* [IStartToObserve](#istarttoobserve)
		* [IApiUnavailable](#iapiunavailable)
		* [IUseSrc](#iusesrc)
* [Enumerators](#enumerators)
	* [\_\_LL\_SrcGroup\_\_](#__ll_srcgroup__)
* [Classes](#classes)
	* [Exceptions](#exceptions)
		* [APIUnavailable](#apiunavailable)
	* [Private](#private)
		* [\_\_LL\_TV\_\_](#__ll_tv__)
		* [\_\_LL\_Element\_\_](#__ll_element__)
		* [\_\_LL\_ElementGroup\_\_](#__ll_elementgroup__)
		* [\_\_LL\_Observer\_\_](#__ll_observer__)

> [!IMPORTANT]
> User *things*, that are explained in the *main README*, are available here. Visit
> [user documentation][public-classes].

## Interfaces

### To typing

---

#### `IImgSrc`

* `high: string`
* `lazy: string`

> Target: to store the path of high/lazy quality images.

---

#### `IStyleClasses`

* `high: string[]`
* `lazy: string[]`

> Target: to store CSS class they will be used to apply specific styles to the catched
  elements, based in the throwing of the show/hide event.

---

#### `IIOOptions`

* `root: HTMLElement`
* `rootMargin: string`
* `scrollMargin: string`
* `threshold: number | number[]`

> Target: to store options used in the `IntersectionObserver` constructor, see more
  information about them [here][int-ob].

---

#### `ILLImagesOptions`

* `waitToStart: boolean`
* `styleClasses: IStyleClasses`
* `observerOptions: IIOOptions`
* `useSrcAsFallbackToLazySrc: boolean`

> Target: to store options used in the `LazyLoadingImages` constructor, see more
  informations about them [here][main-readme].

---

### To implementing

> They are representated as `itsName...` in the documentation snippet of the classes
> that implement them.

---

#### `IStartToObserve`

* `startToObserve: (api: IntersectionObserver) => void`

> Target: it contains the behavior applied to an object instance when the API is
  started. It is called in chain.

---

#### `IApiUnavailable`

* `apiUnavailable: () => void`

> Target: it contains the behavior applied to an object instance when
  `APIUnavailableError` is throwed. It is called in chain.

---

#### `IUseSrc`

* `useSrc: (stuff: unknown, group: TSrcGroup) => void`

> Target: it contains the behavior applied to an object instance when a show/hide event
  occur. It is called in chain.

## Enumerators

#### `__LL_SrcGroup__`

* `INIT` (initial value; used only in declarations)
* `HIGH`
* `LAZY`

> Target: it represents the show/hide event, and the showing/hiding status. It is used
  to say what event is occuring and what image must be attributed to `src`.

## Classes

### Exceptions

---

#### `APIUnavailableError extends Error`


> Target: used to indicate Intersection Observer API is unavailable.

---

### Private

---

#### `__LL_TV__` (Type Validator)

* `constructor(v: unknown)`: catches the value that will be validated.
* `expect(t: string | Function): this`: catches the expected type or constructor.
* `fallback(v: unknown, warning: boolean = false): this`: defines a fallback value.
* `val(): any`: validate the catched value.

> Target: it validates the type, or constructor, of a value. It will generate a
  `TypeError` if nothing fallback is given before to call `val()`.

> [!NOTE]
> This class is inspired in the [Builder Design Pattern][builder-dp].

> [!TIP]
> ```typescript
> // example
> let foo: number = new __LL_TV__(bar).expect("number").fallback(-1).val();
> ```

---

#### `__LL_Element__ implements IUseSrc, IApiUnavailable`

* `constructor(elem: HTMLElement, useSrcAsFallbackToLazySrc: boolean)`: validates the
  catched elements, in addition to validate, catch, and clean the values from their
  *attributes* - see more about them [here][required-data-attr].
* `useSrc...`: it updates the value of `src`.
* `getGroupIndex(id: number): void`: sets the value of `data-lli-id`.
* `getAsHTMLImg(): HTMLImageElement`: returned the catched element.
* `apiUnavailable...`: attributes the high quality image path to `src`.

> Target: storing, validating, and managing the catched elements (`<img/>`) and their
  attributes.

---

#### `__LL_ElementGroup__ implements IUseSrc, IStartToObserve, IApiUnavailable`

* `useSrc...`: it calls `useSrc` of one of its elements, giving the
  *global style classes*.
* `startToObserve...`: it attributes the `data-lli-id` value and linking the started
  `IntersectionObserver` instance with each of its elements.
* `apiUnavailable...`: it iterates with each of its elements and it calls the method
  `apiUnavailable` of each them.

> Target: storing and managing all catched elements. It is the bridge between
  `__LL_Element__` and `__LL_Observer__`.

---

#### `__LL_Observer__ implements IUseSrc, IStartToObserve`

* `constructor(opt: IIOOptions, elementsGroup: __LL_ElementsGroup__)`: verifies if the
  Intersection Observer API is available, and validates `IntersectionObserver` options.
* `useSrc...`: calls `useSrc` from `__LL_ElementsGroup__` instance giving the index
  (from `data-lli-id`) of an element that entered/left the `root` (defined in its
  options).
* `startToObserve...`: calls `startToObserve` from `__LL_ElementsGroup__` instance
  giving the `IntersectionObserver` instance as argument.

> Target: Managing the `IntersectionObserver` instance and sharing show/hide events with
  `__LL_ElementGroups__`.

---
