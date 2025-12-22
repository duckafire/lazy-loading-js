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

// I Intersection Observer Options
interface IIOOptions
{
	root: HTMLElement;
	rootMargin: string;
	scrollMargin: string;
	threshold: number | number[];
}

interface ILLImagesOptions
{
	waitToStart: boolean;
	styleClasses: IStyleClasses;
	observerOptions: IIOOptions;
	useSrcAsFallbackToLazySrc: boolean;
}



interface IStartToObserve
{
	startToObserve: (api?: IntersectionObserver) => void;
}

interface IApiUnavailable
{
	apiUnavailable: () => void;
}


const __LL_ElemStatus__ = Object.freeze({
	NULL: 0,
	HIGH: 1,
	LAZY: 2,
} as const);

const __LL_SrcGroup__ = Object.freeze({
	HIGH: "high",
	LAZY: "lazy",
} as const);

type TElemStatus = typeof __LL_ElemStatus__[keyof typeof __LL_ElemStatus__];
type TSrcGroup   = typeof __LL_SrcGroup__[  keyof typeof __LL_SrcGroup__  ];


abstract class __LL_UseSrc__<T extends IStyleClasses | number | IntersectionObserverEntry>
{
	abstract useSrc(stuff: T, group: TSrcGroup): void;
}


// Type Validator
class __LL_TV__
{
	private readonly value: unknown;
	private fallbackValue: unknown;
	private isValidValue: boolean;

	// default message
	private exceptionMessage: string = "A type error occur.";
	private fallbackWarning: Error = null;

	constructor(v: unknown)
	{
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

			this.isValidValue = (
				t === "object"
				? (this.value !== null && VALUE_TYPE === t)
				: (t === "array"
					? Array.isArray(this.value)
					: VALUE_TYPE === t
				)
			);
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

	fallback(v: unknown, warning: boolean = false): this
	{
		if(this.fallbackValue !== undefined)
			throw new SyntaxError("Fallback already defined.");

		this.isUndef(v);

		if(warning)
			this.fallbackWarning = new Error(`Invalid value type. Using fallback.`);

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
		{
			if(this.fallbackWarning !== null)
				console.warn(this.fallbackWarning);

			return this.fallbackValue;
		}

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

class APIUnavailableError extends Error
{
	constructor()
	{
		super("Intersection Observer API is unavailable. High quality images are in use.");
	}
}


class __LL_Element__ extends __LL_UseSrc__<IStyleClasses> implements IApiUnavailable
{
	private readonly elem: HTMLImageElement;
	private readonly imgSrc: IImgSrc;
	private readonly styleClasses: IStyleClasses;

	private status: TElemStatus = __LL_ElemStatus__.NULL;

	constructor(elem: HTMLElement, useSrcAsFallbackToLazySrc: boolean = false)
	{
		super();
		this.elem = (new __LL_TV__(elem).expect(HTMLImageElement).val() as HTMLImageElement);
		this.setAttribute();

		this.imgSrc = {
			high: this.catchSrc(__LL_SrcGroup__.HIGH, !useSrcAsFallbackToLazySrc),
			lazy: this.catchSrc(__LL_SrcGroup__.LAZY,  useSrcAsFallbackToLazySrc),
		};

		this.styleClasses = {
			high: this.catchStyles(__LL_SrcGroup__.HIGH),
			lazy: this.catchStyles(__LL_SrcGroup__.LAZY),
		};

		this.clearBootAttr();
	}

	useSrc(stuff: IStyleClasses, group: TSrcGroup)
	{
		if(group === __LL_SrcGroup__.HIGH)
		{
			if(this.toggleSrc( __LL_ElemStatus__.HIGH, this.imgSrc.high ))
				this.toggleStyles( __LL_ElemStatus__.HIGH, stuff );

			return;
		}

		if(group !== __LL_SrcGroup__.LAZY)
			throw new SyntaxError(`Invalid source group: "${group}".`);

		if(this.toggleSrc( __LL_ElemStatus__.LAZY, this.imgSrc.lazy ))
			this.toggleStyles( __LL_ElemStatus__.LAZY, stuff );
	}

	setAttribute()
	{
		// It is not defined "directly"
		// (as a JS property) to force
		// its declaration in old browser,
		// because this attribute is new
		// (Baseline 2023; written in 2025).
		if(this.elem.getAttribute("loading") === null)
			this.elem.setAttribute("loading", "lazy");
	}

	setGroupIndex(id: number): void
	{
		this.elem.dataset.lliId = id.toString();
	}

	getAsHTMLImg(): HTMLImageElement
	{
		return this.elem;
	}

	apiUnavailable(): void
	{
		// If it is call, `lliId`
		// is not defined.
		this.useSrc({high: null, lazy: null}, __LL_SrcGroup__.HIGH);
	}

	private catchSrc(attr: TSrcGroup, srcAsFallback: boolean): string
	{
		if(this.elem.dataset[attr] !== undefined)
			return this.elem.dataset[attr];

		if(srcAsFallback)
			return this.elem.src;

		throw new Error(`Element attribute not found: \`data-${attr}\`.`);
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

		if(status === __LL_ElemStatus__.LAZY)
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

class __LL_ElementsGroup__ extends __LL_UseSrc__<number> implements IStartToObserve, IApiUnavailable
{
	private readonly styleClasses: IStyleClasses;

	private elements: __LL_Element__[] = [];

	constructor(query: string, useSrcAsFallbackToLazySrc: boolean, style: IStyleClasses)
	{
		super();
		this.styleClasses = {
			high: this.valStyle( style.high ),
			lazy: this.valStyle( style.lazy ),
		};

		this.catchElements(
			new __LL_TV__(query).expect("string").val(),
			useSrcAsFallbackToLazySrc,
		);
	}

	useSrc(stuff: number, group: TSrcGroup)
	{
		this.elements[ stuff ].useSrc( this.styleClasses, group );
	}

	startToObserve(api: IntersectionObserver): void
	{
		this.elements.forEach((elem: __LL_Element__, id: number): void =>
		{
			elem.setGroupIndex( id );
			api.observe( elem.getAsHTMLImg() );
		});
	}

	apiUnavailable(): void
	{
		for(let i = 0; i < this.elements.length; i++)
			this.apiUnavailable()
	}

	private valStyle(group: string[]): string[]
	{
		if(!group)
			return null;

		for(const CLASS of (new __LL_TV__(group).expect("array").val()))
			new __LL_TV__(CLASS).expect("string").val();

		return group;
	}

	private catchElements(query: string, useSrc: boolean): void
	{
		document.querySelectorAll( query ).forEach((elem: unknown): void =>
		{
			this.elements.push( new __LL_Element__((elem as HTMLImageElement), useSrc) );
		});
	}
}

class __LL_Observer__ extends __LL_UseSrc__<IntersectionObserverEntry> implements IStartToObserve
{
	private readonly api: IntersectionObserver;
	private readonly elementsGroup: __LL_ElementsGroup__;

	constructor(opt: IIOOptions, elementsGroup: __LL_ElementsGroup__)
	{
		super();
		const OPT: IIOOptions = {
			root:         new __LL_TV__(opt.root).expect(HTMLElement).fallback(null).val(),
			rootMargin:   new __LL_TV__(opt.rootMargin).expect("string").fallback("0px 0px 0px 0px").val(),
			scrollMargin: new __LL_TV__(opt.scrollMargin).expect("string").fallback("0px 0px 0px 0px").val(),
			threshold:    this.valThreshold( opt.threshold ),
		};

		this.isAvailable();
		this.api = this.startAPI(OPT);
		this.elementsGroup = elementsGroup;
	}

	useSrc(stuff: IntersectionObserverEntry, group: TSrcGroup): void
	{
		this.elementsGroup.useSrc(
			parseInt( (stuff.target as HTMLElement).dataset.lliId ),
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
			return new __LL_TV__(threshold).expect("number").fallback(0.0).val();

		for(const NUM of threshold)
			new __LL_TV__(NUM).expect("number").val();

		return threshold;
	}

	private isAvailable(): void
	{
		if(window.IntersectionObserver !== undefined)
			return;

		this.elementsGroup.apiUnavailable();
		throw new APIUnavailableError();
	}

	private startAPI(opt: IIOOptions): IntersectionObserver
	{
		return new IntersectionObserver((entries: IntersectionObserverEntry[]) =>
		{
			entries.forEach((entry: IntersectionObserverEntry) =>
			{
				this.useSrc(entry,
					entry.isIntersecting
					? __LL_SrcGroup__.HIGH
					: __LL_SrcGroup__.LAZY
				);
			});
		}, opt);
	}
}

class LazyLoadingImages implements IStartToObserve
{
	private observer: __LL_Observer__;

	private isApiAvail: boolean = true;
	private started: boolean = false;

	constructor(query: string, opt: ILLImagesOptions)
	{
		const OPT: ILLImagesOptions = new __LL_TV__(opt)
			.expect("object")
			.fallback({}, true)
			.val();

		try
		{
			this.observer = new __LL_Observer__(
				OPT.observerOptions || ({} as IIOOptions),
				new __LL_ElementsGroup__(
					query,
					OPT.useSrcAsFallbackToLazySrc || true,
					OPT.styleClasses || ({} as IStyleClasses),
				),
			);
		}
		catch(ex)
		{
			if(ex instanceof APIUnavailableError)
				this.isApiAvail = false;

			throw ex;
		}

		if(!OPT.waitToStart)
			this.startToObserve();
	}

	isApiAvailable(): boolean
	{
		return this.isApiAvail;
	}

	isStarted(): boolean
	{
		return this.started;
	}

	startToObserve(): void
	{
		if(this.started)
		{
			console.warn(new Error("API already started."))
			return;
		}

		this.started = true;
		this.observer.startToObserve();
	}
}
