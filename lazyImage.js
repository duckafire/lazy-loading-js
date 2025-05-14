class LazyImage {
    constructor(selector) {
        this.images = document.querySelectorAll(selector);
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observeWithIntersectionObserver();
        } else {
            this.loadImagesImmediately();
        }
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
        console.log('WARNING: you browser do not have support to "IntersectionObserver" (object)');
        this.images.forEach(image => this.loadImage(image));
    }

    loadImage(image) {
        if (src)
            image.src = image.getAttribute('data-src');
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = LazyImage;
