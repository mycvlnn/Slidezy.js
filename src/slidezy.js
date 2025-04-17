Slidezy.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.classList.add("slidezy-track");
    if (this.options.loop) {
        const clonedHead = this.slides
            .slice(-this.options.items)
            .map((node) => node.cloneNode(true));
        const clonedTail = this.slides
            .slice(0, this.options.items)
            .map((node) => node.cloneNode(true));
        this.slides = [...clonedHead, ...this.slides, ...clonedTail];
    }
    this.slides.forEach((slide) => {
        slide.classList.add("slidezy-slide");
        slide.style.flexBasis = `${100 / this.options.items}%`;
        this.track.appendChild(slide);
    });

    this.container.appendChild(this.track);
};

Slidezy.prototype._createNavigation = function () {
    if (!this.options.arrows) return;

    if (typeof this.options.renderPrevArrow === "function") {
        this.prevButton = this.options.renderPrevArrow({
            className: "slidezy-prev",
        });
    } else {
        this.prevButton = document.createElement("button");
        this.prevButton.classList.add("slidezy-prev");
        this.prevButton.innerText = "<";
    }

    if (this.options.renderNextArrow) {
        this.nextButton = this.options.renderNextArrow({
            className: "slidezy-next",
        });
    } else {
        this.nextButton = document.createElement("button");
        this.nextButton.classList.add("slidezy-next");
        this.nextButton.innerText = ">";
    }

    if (this.prevButton && this.nextButton) {
        // Add events
        this.prevButton.onclick = () => this.moveSlide(-this.options.slidesToScroll);
        this.nextButton.onclick = () => this.moveSlide(this.options.slidesToScroll);

        this.container.append(this.prevButton, this.nextButton);
    }
};

Slidezy.prototype._checkDisabledNavigation = function () {
    if (this.options.loop) return; // Trong trường hợp loop thì không cần kiểm tra

    if (this.currentSlideIndex <= 0) {
        this.prevDisabled = true;
        this.prevButton.setAttribute("disabled", true);
        this.prevButton.classList.add("disabled");
    } else {
        this.prevDisabled = false;
        this.prevButton.removeAttribute("disabled");
        this.prevButton.classList.remove("disabled");
    }

    if (this.currentSlideIndex >= this.slides.length - this.options.items) {
        this.nextDisabled = true;
        this.nextButton.setAttribute("disabled", true);
        this.nextButton.classList.add("disabled");
    } else {
        this.nextDisabled = false;
        this.nextButton.removeAttribute("disabled");
        this.nextButton.classList.remove("disabled");
    }
};

// Hàm thực hiện cập nhật vị trí của track
Slidezy.prototype._updatePosition = function (instant = false) {
    this.offset = -(this.currentSlideIndex * (100 / this.options.items));
    this.track.style.transform = `translateX(${this.offset}%)`;
    this.track.style.transition = instant ? "none" : "transform 0.5s ease";
};

// Hàm thực hiện di chuyển slide
// step = 1: next, step = -1: prev
Slidezy.prototype.moveSlide = function (step) {
    if (this._isTransitioning) return;
    const maxIndex = this.slides.length - this.options.items;
    this.currentSlideIndex = Math.min(Math.max(this.currentSlideIndex + step, 0), maxIndex);

    // Trường hợp cho phép loop
    if (this.options.loop) {
        this._isTransitioning = true;

        this.track.ontransitionend = () => {
            if (this.currentSlideIndex <= 0) {
                this.currentSlideIndex = maxIndex - this.options.items;
                this._updatePosition(true);
            } else if (this.currentSlideIndex >= maxIndex) {
                this.currentSlideIndex = this.options.items;
                this._updatePosition(true);
            }
            this._isTransitioning = false;
        };
    }

    this._updatePosition();
    this._checkDisabledNavigation();
};

Slidezy.prototype._autoplay = function () {
    if (this.options.autoplay) {
        this.autoplayInterval = setInterval(() => {
            this.moveSlide(this.options.slidesToScroll);
        }, this.options.autoplaySpeed);
        this.container.onmouseenter = () => {
            clearInterval(this.autoplayInterval);
        };
        this.container.onmouseleave = () => {
            this._autoplay();
        };
    }
};

Slidezy.prototype._init = function () {
    this.container.classList.add("slidezy-wrapper");
    this._createTrack();
    this._createNavigation();
    this._checkDisabledNavigation();
    this._updatePosition();
    this._autoplay();
};

function Slidezy(selector, options) {
    this.options = Object.assign(
        {
            items: 1,
            loop: false,
            slidesToScroll: 1,
            autoplay: false,
            autoplaySpeed: 3000,
            dots: false,
            arrows: true,
            renderPrevArrow: null,
            renderNextArrow: null,
            renderDots: null,
        },
        options
    );
    this.container = document.querySelector(selector);
    if (!this.container) {
        throw new Error(`Container not found: ${selector}`);
    }

    this.slides = Array.from(this.container.children);
    this.currentSlideIndex = this.options.loop ? this.options.items : 0;
    this.prevDisabled = false;
    this.nextDisabled = false;

    this._init();
}

const mySlider = new Slidezy("#my-slider", {
    loop: true,
    items: 3,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 5000,
    dots: true,
    arrows: true,
});
