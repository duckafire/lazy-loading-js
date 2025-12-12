/*
 * Zlib License
 *
 * Copyright (C) 2025 DuckAfire <duckafire.github.io/nest>
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 * */

interface IImgSrc
{
	high: string;
	lazy: string;
}

interface IStyleClasses
{
	high: string[];
	lazy: string[];
}

interface IIntersectionObserverOptions
{
	// All they are optional because I
	// do not want to have to create an
	// object to satisfy the compiler every
	// time when I use this interface in
	// optional parameters.
	root?: HTMLElement,
	rootMargin?: string,
	scrollMargin?: string,
	threshold?: number | number[],
}

interface ILazyLoadingImageOptions
{
	// Read the NOTE in the
	// interface above.
	observerOptions?: IIntersectionObserverOptions;
	styleClasses?: IStyleClasses;
	srcIsLazy?: boolean;
}

class __TypeValidator__
{
	private value: unknown = null;
	private fallbackValue: unknown = null;
	private fallbackNull: unknown = {};
	private exceptionMessage: string = "A type error occur.";
	private validValue: boolean = false;
	private safe: boolean = false;

	constructor(v: unknown)
	{
		this.value = v;
		this.fallbackValue = this.fallbackNull;
	}

	expectType(t: string): __TypeValidator__
	{
		const TYPE = typeof this.value;

		return this.expectStuff(
			(t === "array" ? Array.isArray(this.value) : TYPE === t),
			`Expecting type "${t}", instead "${TYPE}".`,
		);
	}

	expectTag(): __TypeValidator__
	{
		return this.expectStuff(
			(this.value instanceof HTMLElement),
			`Expecting instance of "HTMLElement", instead "${!this.value ? this.value : (this.value as Function).constructor.name}".`,
		);
	}

	fallback(v: unknown): __TypeValidator__
	{
		// It, indirectly, enables
		// "safe mode".
		this.fallbackValue = v;
		return this;
	}

	noException(): __TypeValidator__
	{
		this.safe = true;
		return this;
	}

	validate(): any
	{
		if(this.validValue)
			return this.value;

		if(this.fallbackValue !== this.fallbackNull)
			return this.fallbackValue;

		if(!this.safe)
			throw new TypeError( this.exceptionMessage );

		return null;
	}
	
	onlyValidate(): boolean
	{
		return this.validValue
	}

	private expectStuff(condit: boolean, exMessage: string): __TypeValidator__
	{
		this.validValue = condit;
		this.exceptionMessage = exMessage;
		return this;
	}
}

// LLI === Lazy Loading Image

class __LLI_Element__
{
	private readonly elem: HTMLImageElement;
	private readonly imgSrc: IImgSrc;
	private readonly styleClasses: IStyleClasses;

	constructor(elem: HTMLImageElement, srcIsLazy: boolean = true)
	{
		this.elem = new __TypeValidator__(elem).expectTag().validate();

		this.imgSrc = {
			high: this.catchAttr("high", !srcIsLazy),
			lazy: this.catchAttr("lazy",  srcIsLazy),
		};

		this.styleClasses = {
			high: (this.catchAttr("styleHigh", !srcIsLazy)?.split(",")) || null,
			lazy: (this.catchAttr("styleLazy",  srcIsLazy)?.split(",")) || null,
		};

		this.clearElemAttr();
	}

	useSrc(origin: string, highClasses: string[], lazyClasses: string[]): void
	{
		if(origin === "high")
		{
			if(!this.toggleSrc( this.imgSrc.high ))
				return;

			this.toggleStyle( this.styleClasses.lazy, this.styleClasses.high );
			this.toggleStyle( lazyClasses, highClasses );
		}

		if(origin !== "lazy")
			throw new Error(`Invalid origin: "${origin}"`);

		if(!this.toggleSrc( this.imgSrc.high ))
			return;

		this.toggleStyle( this.styleClasses.high, this.styleClasses.lazy );
		this.toggleStyle( highClasses, lazyClasses );
	}

	preparateToBeObserved(id: number): HTMLImageElement
	{
		// Lazy Library Image InDex
		this.elem.dataset.lliId = id.toString();
		return this.elem;
	}

	private catchAttr(field: string, useSrc: boolean = false): string
	{
		return this.elem.dataset[ field ] ?? (useSrc ? this.elem.src : null);
	}

	private clearElemAttr(): void
	{
		delete this.elem.dataset.high,
			   this.elem.dataset.lazy,
			   this.elem.dataset.styleHigh,
			   this.elem.dataset.styleLazy;
	}

	private toggleSrc(src: string): boolean
	{
		if(this.elem.src !== src)
		{
			this.elem.src = src;

			// processed
			return true;
		}

		// not-processed
		return false;
	}

	private toggleStyle(toAdd: string[], toRmv: string[]): void
	{
		if(toRmv !== null)
			this.elem.classList.remove( ...toRmv );

		if(toAdd !== null)
			this.elem.classList.add(    ...toAdd );
	}
}

class __LLI_ElementsGroup__
{
	private readonly query: string;
	private readonly srcIsLazy: boolean;
	private readonly styleClasses: IStyleClasses;
	private readonly elements: __LLI_Element__[];

	constructor(query: string, srcIsLazy: boolean, styleClasses: IStyleClasses)
	{
		this.query     = new __TypeValidator__(query).expectType("string").validate();
		this.srcIsLazy = srcIsLazy;

		this.styleClasses = {
			high: this.catchStyleClasses( styleClasses.high ),
			lazy: this.catchStyleClasses( styleClasses.lazy ),
		};

		this.elements = [];
		document.querySelectorAll( this.query ).forEach((elem: unknown): void =>
		{
			this.elements.push( new __LLI_Element__(elem as HTMLImageElement, this.srcIsLazy) );
		});
	}

	startToObserve(watcher: IntersectionObserver)
	{
		this.elements.forEach((elem: __LLI_Element__, groupPositionId: number): void =>
		{
			watcher.observe( elem.preparateToBeObserved( groupPositionId ) );
		});
	}

	useSrc(id: number, origin: string): any
	{
		this.elements[ id ].useSrc(
			origin,
			this.styleClasses.high,
			this.styleClasses.lazy
		);
	}

	private catchStyleClasses(storage: string[]): string[]
	{
		if(!storage)
			return null;

		for(const CLASS of new __TypeValidator__(storage).expectType("array").validate())
			new __TypeValidator__(CLASS).expectType("string").validate();

		return storage;
	}
}

class __LLI_Observer__
{
	private readonly api: IntersectionObserver;
	private readonly elementsGroup: __LLI_ElementsGroup__;
	private readonly options: IIntersectionObserverOptions;

	constructor(options: IIntersectionObserverOptions, elementsGroup: __LLI_ElementsGroup__)
	{
		const THRESHOLD: number | number[] = (
			Array.isArray(options.threshold)
			? new __TypeValidator__(options.threshold).expectType("number").fallback(1.0).validate()
			: this.validateThresholdArrayOpt( (options.threshold as unknown) as number[] )
		);

		this.options = {
			root:         new __TypeValidator__(options.root).expectTag().fallback(null).validate(),
			rootMargin:   new __TypeValidator__(options.rootMargin).expectType("string").fallback("0px").validate(),
			scrollMargin: new __TypeValidator__(options.scrollMargin).expectType("string").fallback("0px").validate(),
			threshold:    THRESHOLD,
		};

		this.api = new IntersectionObserver( this.algorithm(), this.options );
		this.elementsGroup = elementsGroup;
	}

	useSrc(entry: IntersectionObserverEntry, origin: string): void
	{
		this.elementsGroup.useSrc(
			parseInt( (entry.target as HTMLElement).dataset.lliId ),
			origin
		);
	}

	private validateThresholdArrayOpt(thresholdOpt: number[]): number[]
	{
		if(!thresholdOpt)
			return null;

		for(const ITEM of thresholdOpt)
			new __TypeValidator__( ITEM ).expectType("number").validate();

		return thresholdOpt;
	}

	private algorithm()
	{
		return (entries: IntersectionObserverEntry[]) =>
		{
			entries.forEach((entry: IntersectionObserverEntry) =>
			{
				if(entry.isIntersecting)
					this.useSrc(entry, "high");
				else
					this.useSrc(entry, "lazy");
			});
		};
	}
}

class LazyLoadingImage
{
	private readonly observer;
	private readonly elementsGroup;

	constructor(query: string, options: ILazyLoadingImageOptions = {})
	{
		this.elementsGroup = new __LLI_ElementsGroup__(
			query,
			options.srcIsLazy,
			options.styleClasses,
		);

		this.observer = new __LLI_Observer__(
			options.observerOptions || {},
			this.elementsGroup,
		);
	}
}
