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

	private expectStuff(condit: boolean, exMessage: string): __TypeValidator__
	{
		this.validValue = condit;
		this.exceptionMessage = exMessage;
		return this;
	}

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
};
