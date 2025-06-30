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

class LazyLoadImage {
    constructor(selector) {
        this.images = document.querySelectorAll(selector);
    }

    init() {
        if ('IntersectionObserver' in window)
            this.observeWithIntersectionObserver();
        else
            this.loadImagesImmediately();
    }

    observeWithIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        this.images.forEach(image => {
            observer.observe(image);
        });
    }

    loadImagesImmediately() {
        console.log('WARNING: your browser do not have support to "IntersectionObserver" (object)');
        this.images.forEach(image => this.loadImage(image));
    }

    loadImage(image) {
        image.src = image.dataset.src;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = LazyImage;
