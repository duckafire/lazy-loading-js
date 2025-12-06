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

class __TypeValidator__
{
	private value: unknown = null;
	private fallbackValue: unknown = null;
	private exceptionMessage: string = "A type error occur.";
	private validValue: boolean = false;
	private safe: boolean = false;

	constructor(v: unknown)
	{
		this.value = v;
	}

	expectType(t: string): __TypeValidator__
	{
		const TYPE = typeof this.value;

		return this.expectStuff(
			(TYPE !== t),
			`Expecting type "${t}", instead "${TYPE}".`,
		);
	}

	expectTag(): __TypeValidator__
	{
		return this.expectStuff(
			(this.value instanceof HTMLImageElement),
			`Expecting instance of "HTMLElement", instead "${(this.value as Function).constructor.name}".`,
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

	validate(): unknown
	{
		if(this.validValue)
			return this.value;

		if(this.fallbackValue !== null)
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
};

// LLI === Lazy Loading Image

interface IImgSrc
{
	high: string;
	lazy: string;
};

interface IStyleClasses
{
	high: string[];
	lazy: string[];
};

class __LLI_Element__
{
	private readonly elem: HTMLImageElement;
	private readonly imgSrc: IImgSrc;
	private readonly styleClasses: IStyleClasses;

	constructor(elem: HTMLImageElement, srcIsLazy: boolean = true)
	{
		this.elem = new __TypeValidator__(elem)
			.expectTag()
			.validate();

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

	useHigh(highClasses: string[], lazyClasses: string[]): void
	{
		this.toggleSrc( this.imgSrc.high, true );
		this.toggleStyle( this.styleClasses.lazy, this.styleClasses.high );
		this.toggleStyle( lazyClasses, highClasses );
	}

	useLazy(highClasses: string[], lazyClasses: string[]): void
	{
		this.toggleSrc( this.imgSrc.high );
		this.toggleStyle( this.styleClasses.high, this.styleClasses.lazy );
		this.toggleStyle( highClasses, lazyClasses );
	}

	private catchAttr(field: string, useSrc: boolean = false): string
	{
		return this.elem.dataset[ field ] ?? (useSrc ? this.elem.src : null);
	}

	private clearElemAttr(): void
	{
		for(const ATTR of ["high", "lazy", "styleHigh", "styleLazy"])
			delete this.elem.dataset[ ATTR as keyof DOMStringMap ];
	}

	private toggleSrc(src: string): void
	{
		if(this.elem.src !== src)
			this.elem.src = src;
	}

	private toggleStyle(toAdd: string[], toRmv: string[]): void
	{
		if(toRmv !== null)
			this.elem.classList.remove( ...toRmv );

		if(toAdd !== null)
			this.elem.classList.add(    ...toAdd );
	}
};
