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

	#HIDED    = "-1";
	#AWAITING =  "0";
	#SHOWED   =  "1";

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
			this.#items.forEach(item => {
				this.#awaitToWorking(item);
				this.#connectToObserver(item);
			});
			return;
		}

		this.#showAllWithoutObserver();

		if(warning){
			console.error(
				"This browser do not suppor the Intersection Observer API - from JavaScript. " +
				"So the resources that depend of it it will be loaded without optimizations of loading."
			);
		}
	}

	#showAllWithoutObserver(){
		this.#items.forEach(item => {
			this.#showSource(item);
		});
	}

	#checkItemPosition(pos0, pos1, isWidth){
		const max = window["inner" + (isWidth ? "Width" : "Height")];

		return (pos0 >= 0 && pos0 <= max) || (pos1 >= 0 && pos1 <= max);
	}

	#awaitToWorking(item){
		this.#setItemProperties(item);

		item.onload = () => {
			let loader = new Image();
			loader.src = item.dataset.src;

			loader.onload = () => {
				loader = null; // "throw" in the collect garbage
				item.dataset.awaiting = "no";

				// hitbox
				const hb = item.getBoundingClientRect();

				// if the screen was maintened stopped, after page (re)load,
				// the Intersection... will not update
				if(this.#checkItemPosition(hb.top, hb.bottom) || this.#checkItemPosition(hb.left, hb.right, true))
					this.#showSource(item, this.#SHOWED);
			}
		}
	}

	#setItemProperties(item){
		item.src = item.dataset.placeholder;
		item.dataset.currentSrc = item.dataset.placeholder;
		item.dataset.state    = this.#AWAITING;
		item.dataset.awaiting = "yes";
	}

	#connectToObserver(item){
		const api = new IntersectionObserver(entities => {
			entities.forEach(entity => {
				if(entity.target.dataset.awaiting == "yes")
					return;

				if(entity.isIntersecting)
					this.#showSource(entity.target, this.#SHOWED);

				else
					this.#hideSource(entity.target, this.#HIDED);
			});
		});

		api.observe(item);

		if(this.disconnectFromObserver == undefined){
			this.disconnectFromObserver = () => {
				this.#started = false;

				this.#items.forEach(item => {
					api.unobserve(item);
					entity.target.dataset.state = this.#AWAITING;
				});
			}
		}
	}

	#updateSource(item, state, dataProperty){
		if(item.dataset[dataProperty] != undefined){
			// avoid unnecessary reload
			if((item.dataset.state != state || item.dataset.state == this.#AWAITING) && item.dataset.currentSrc != item.dataset[dataProperty]){
				item.dataset.state = state;
				item.src = item.dataset[dataProperty];
				item.dataset.currentSrc = item.dataset[dataProperty];
			}

			return;
		}

		throw new Error(`Data property "data-${dataProperty}" not found.`);
	}

	#showSource(item, state){
		this.#updateSource(item, state, "src");
	}

	#hideSource(item, state){
		this.#updateSource(item, state, "placeholder");
	}
}
