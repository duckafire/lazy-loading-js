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

// LLI === Lazy Loading Image

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

// I Intersection Observer Options
interface IIOOptions
{
	root: HTMLElement;
	rootMargin: string;
	scrollMargin: string;
	threshold: number | number[];
}

interface IStartToObserve
{
	startToObserve: (api?: IntersectionObserver) => void;
}

interface ILLIOptions
{
	styleClasses: IStyleClasses;
	observerOptions: IIOOptions;
	useSrcAsFallbackToLazySrc: boolean;
}


const __LLI_ElemStatus__ = Object.freeze({
	NULL: 0,
	HIGH: 1,
	LAZY: 2,
} as const);

const __LLI_SrcGroup__ = Object.freeze({
	HIGH: "high",
	LAZY: "lazy",
} as const);

type TElemStatus = typeof __LLI_ElemStatus__[keyof typeof __LLI_ElemStatus__];
type TSrcGroup   = typeof __LLI_SrcGroup__[  keyof typeof __LLI_SrcGroup__  ];


abstract class __LLI_UseSrc__<T extends IStyleClasses | number | IntersectionObserverEntry>
{
	abstract useSrc(T, group: TSrcGroup): void;
}


// Type Validator
class __LLI_TV__
{
	private readonly value: unknown;
	private fallbackValue: unknown;
	private isValidValue: boolean;

	// default message
	private exceptionMessage: string = "A type error occur.";

	constructor(v: unknown)
	{
		this.isUndef(v);
		this.value = v;
	}

	expect(t: string | Function): this
	{
		this.isExpAlreadyDefined();
		this.isUndef(t);
		const T_TYPE = typeof t;

		if(T_TYPE === "string")
		{
			const VALUE_TYPE = typeof this.value;

			this.isValidValue     = (t === "array" ? Array.isArray(this.value) : VALUE_TYPE === t);
			this.exceptionMessage = `Expecting type "${t}", instead "${VALUE_TYPE}".`;
			return this;
		}

		if(T_TYPE !== "function")
			throw new TypeError(`Expecting constructor, instead "${T_TYPE}".`);

		// Using `any` to avoid an
		// unnecessary verbosity.
		this.isValidValue     = (this.value instanceof HTMLImageElement);
		this.exceptionMessage = `Expecting instance or heir of \`${(t as any).constructor.name}\`, instead \`${((this.value as any)?.constructor)?.name}\`.`;
		return this;
	}

	fallback(v: unknown): this
	{
		if(this.fallback !== undefined)
			throw new SyntaxError("Fallback already defined.");

		this.isUndef(v);
		this.fallbackValue = v;
		return this;
	}

	val(): any
	{
		if(this.isValidValue === undefined)
			throw new SyntaxError("Expected value not defined.");

		if(this.isValidValue)
			return this.value;

		if(this.fallbackValue !== undefined)
			return this.fallbackValue;

		throw new TypeError( this.exceptionMessage );
	}

	private isUndef(s: unknown): void
	{
		if(s === undefined)
			throw new TypeError("`undefined` is invalid.");
	}

	private isExpAlreadyDefined(): void
	{
		if(this.isValidValue !== undefined)
			throw new SyntaxError("Expected value already defined.");
	}
}


class __LLI_Element__ extends __LLI_UseSrc__<IStyleClasses>
{
	private readonly elem: HTMLImageElement;
	private readonly imgSrc: IImgSrc;
	private readonly styleClasses: IStyleClasses;

	private status: TElemStatus = __LLI_ElemStatus__.NULL;

	constructor(elem: HTMLElement, useSrcAsFallbackToLazySrc: boolean = false)
	{
		super();
		this.elem = (new __LLI_TV__(elem).expect(HTMLImageElement).val() as HTMLImageElement);

		this.imgSrc = {
			high: this.catchSrc(__LLI_SrcGroup__.HIGH, !useSrcAsFallbackToLazySrc),
			lazy: this.catchSrc(__LLI_SrcGroup__.LAZY,  useSrcAsFallbackToLazySrc),
		};

		this.styleClasses = {
			high: this.catchStyles(__LLI_SrcGroup__.HIGH),
			lazy: this.catchStyles(__LLI_SrcGroup__.LAZY),
		};

		this.clearBootAttr();
	}

	useSrc(styleClasses: IStyleClasses, group: TSrcGroup)
	{
		if(group === __LLI_SrcGroup__.HIGH)
		{
			if(this.toggleSrc( __LLI_ElemStatus__.HIGH, this.imgSrc.high ))
				this.toggleStyles( __LLI_ElemStatus__.HIGH, styleClasses );

			return;
		}

		if(group !== __LLI_SrcGroup__.LAZY)
			throw new SyntaxError(`Invalid source group: "${group}".`);

		if(this.toggleSrc( __LLI_ElemStatus__.LAZY, this.imgSrc.lazy ))
			this.toggleStyles( __LLI_ElemStatus__.LAZY, styleClasses );
	}

	setGroupIndex(id: number): void
	{
		this.elem.dataset.llId = id.toString();
	}

	getAsHTMLImg(): HTMLImageElement
	{
		return this.elem;
	}

	private catchSrc(attr: TSrcGroup, srcAsFallback: boolean): string
	{
		return this.elem.dataset[ attr ] || (srcAsFallback ? this.elem.src : null);
	}

	private catchStyles(group: TSrcGroup): string[]
	{
		return (this.elem.getAttribute( "data-style-" + group )?.split(",")) || null;
	}

	private clearBootAttr(): void
	{
		delete this.elem.dataset.high,
				this.elem.dataset.lazy,
				this.elem.dataset.styleHigh,
				this.elem.dataset.styleLazy;
	}

	private toggleSrc(status: TElemStatus, src: string): boolean
	{
		if(this.status === status)
			return false;

		this.status = status;
		this.elem.src = src;
		return true;
	}

	private toggleStyles(status: TElemStatus, externStyleClasses: IStyleClasses): void
	{
		this.toggleIndieStyles( status, externStyleClasses );
		this.toggleIndieStyles( status, this.styleClasses );
	}

	private toggleIndieStyles(status: TElemStatus, styles: IStyleClasses): void
	{
		let rmv = styles.lazy;
		let add = styles.high;

		if(status === __LLI_ElemStatus__.LAZY)
		{
			rmv = styles.high;
			add = styles.lazy;
		}

		if(rmv !== null)
			this.elem.classList.remove( ...rmv )

		if(add !== null)
			this.elem.classList.add( ...add );
	}
}

class __LLI_ElementsGroup__ extends __LLI_UseSrc__<number> implements IStartToObserve
{
	private readonly styleClasses: IStyleClasses;

	private elements: __LLI_Element__[] = [];

	constructor(query: string, useSrcAsFallbackToLazySrc: boolean, style: IStyleClasses)
	{
		super();
		this.styleClasses = {
			high: this.valStyle( style.high ),
			lazy: this.valStyle( style.lazy ),
		};

		this.catchElements(
			new __LLI_TV__(query).expect("string").val(),
			useSrcAsFallbackToLazySrc,
		);
	}

	useSrc(elemId: number, group: TSrcGroup)
	{
		this.elements[ elemId ].useSrc( this.styleClasses, group );
	}

	startToObserve(api: IntersectionObserver): void
	{
		this.elements.forEach((elem: __LLI_Element__, id: number): void =>
		{
			elem.setGroupIndex( id );
			api.observe( elem.getAsHTMLImg() );
		});
	}

	private valStyle(group: string[]): string[]
	{
		if(!group)
			return null;

		for(const CLASS of group)
			new __LLI_TV__(CLASS).expect("string").val();

		return group;
	}

	private catchElements(query: string, useSrc: boolean): void
	{
		document.querySelectorAll( query ).forEach((elem: unknown): void =>
		{
			this.elements.push( new __LLI_Element__((elem as HTMLImageElement), useSrc) );
		});
	}
}

class __LLI_Observer__ extends __LLI_UseSrc__<IntersectionObserverEntry> implements IStartToObserve
{
	private readonly api: IntersectionObserver;
	private readonly elementsGroup: __LLI_ElementsGroup__;

	constructor(opt: IIOOptions, elementsGroup: __LLI_ElementsGroup__)
	{
		super();
		const OPT: IIOOptions = {
			root:         new __LLI_TV__(opt.root).expect(HTMLElement).fallback(null).val(),
			rootMargin:   new __LLI_TV__(opt.rootMargin).expect("string").fallback("0px 0px 0px 0px").val(),
			scrollMargin: new __LLI_TV__(opt.scrollMargin).expect("string").fallback("0px 0px 0px 0px").val(),
			threshold:    this.valThreshold( opt.threshold ),
		};

		this.api = this.startAPI(OPT);
		this.startToObserve();
	}

	useSrc(entry: IntersectionObserverEntry, group: TSrcGroup): void
	{
		this.elementsGroup.useSrc(
			parseInt( (entry.target as HTMLElement).dataset.lliId ),
			group,
		);
	}

	startToObserve(): void
	{
		this.elementsGroup.startToObserve( this.api );
	}

	private valThreshold(threshold: number | number []): number | number[]
	{
		if(!Array.isArray(threshold))
			return new __LLI_TV__(threshold).expect("number").fallback(1.0).val();

		for(const NUM of threshold)
			new __LLI_TV__(NUM).expect("number").val();

		return threshold;
	}

	private startAPI(opt: IIOOptions): IntersectionObserver
	{
		return new IntersectionObserver((entries: IntersectionObserverEntry[]) =>
		{
			entries.forEach((entry: IntersectionObserverEntry) =>
			{
				this.useSrc(entry,
					entry.isIntersecting
					? __LLI_SrcGroup__.HIGH
					: __LLI_SrcGroup__.LAZY
				);
			});
		}, opt);
	}
}

class LazyLoadingImage
{
	constructor(query: string, opt: ILLIOptions = {} as ILLIOptions)
	{
		new __LLI_Observer__(
			opt.observerOptions || ({} as IIOOptions),
			new __LLI_ElementsGroup__(
				query,
				opt.useSrcAsFallbackToLazySrc,
				opt.styleClasses,
			),
		);
	}
}
