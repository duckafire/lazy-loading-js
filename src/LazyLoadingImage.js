/*
Zlib License

Copyright (C) 2025 DuckAfire <duckafire.github.io/nest>

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

class LazyLoadingImage {
	#items; #hasSupport;

	#started = false;

	#ELEMENT_INSTANCE = HTMLImageElement;

	#AWATING = -1;
	#SHOWED  =  0;
	#HIDED   =  1;
	#state   = this.#AWATING;

	constructor(query, startWarning, awaitToStart) {
		this.#items = document.querySelectorAll(query);

		if(this.#items.length == 0)
			throw new Error(`None was found. Query: "${query}"`);

		this.#items.forEach(item => {
			if(!(item instanceof this.#ELEMENT_INSTANCE))
				throw new Error(`Invalid instance. Expected "${this.constructor.name}" instead "${item.constructor.name}".` );

			if(item instanceof HTMLImageElement)
				item.loading = "lazy";
		});

		if(!awaitToStart)
			this.start(startWarning);
	}

	start(warning) {
		if(this.#started){
			if(warning){
				console.warn(
					(this.hasSupport)
					? "This instance already was started."
					: "This browser do not support the Intersection Observer API."
				);
			}

			return;
		}

		this.#started = true;
		this.#hasSupport = ("IntersectionObserver" in window)

		if(this.#hasSupport){
			this.#connectToObserver();
			return;
		}

		this.showAllWithoutObserver();

		if(warning){
			console.error(
				"This browser do not suppor the Intersection Observer API - from JavaScript. " +
				"So the resources that depend of it it will be loaded without optimizations of loading."
			);
		}
	}

	showAllWithoutObserver(){
		this.#items.forEach(item => {
			this.showSource(item);
		});
	}

	#connectToObserver(){
		const api = new IntersectionObserver(entities => {
			entities.forEach(entity => {
				if(entity.isIntersecting && this.#state != this.#SHOWED){
					this.#state = this.#SHOWED;
					this.showSource(entity.target);

				}else if(this.#state != this.#HIDED){
					this.#state = this.#HIDED;
					this.hideSource(entity.target);
				}
			});
		});

		this.#items.forEach(item => {
			api.observe(item);
			item.src = item.dataset.placeholder;
		});

		this.disconnectFromObserver = () => {
			this.#started = false;
			this.#state   = AWATING;

			this.#items.forEach(item => {
				api.unobserve(item);
			});
		}
	}

	#updateSource(item, dataProperty){
		if(item.dataset[dataProperty] != undefined){
			// avoid unnecessary reload
			if(item.src != item.dataset[dataProperty])
				item.src = item.dataset[dataProperty];

			return;
		}

		throw new Error(`Data property "data-${dataProperty}" not found.`);
	}

	showSource(item){
		this.#updateSource(item, "src");
	}

	hideSource(item){
		this.#updateSource(item, "placeholder");
	}
}
