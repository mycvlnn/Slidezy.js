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
    this.prevButton = document.createElement("button");
    this.nextButton = document.createElement("button");
    this.prevButton.classList.add("slidezy-prev");
    this.nextButton.classList.add("slidezy-next");
    this.prevButton.innerText = "<";
    this.nextButton.innerText = ">";
    this.container.append(this.prevButton, this.nextButton);

    // Add events
    this.prevButton.onclick = () => this.moveSlide(-1);
    this.nextButton.onclick = () => this.moveSlide(1);
};

Slidezy.prototype._checkDisabledNavigation = function () {
    if (this.options.loop) return; // Trong trường hợp loop thì không cần kiểm tra

    const updateButtonState = (button, condition) => {
        if (condition) {
            button.setAttribute("disabled", true);
            button.classList.add("disabled");
        } else {
            button.removeAttribute("disabled");
            button.classList.remove("disabled");
        }
    };

    updateButtonState(this.prevButton, this.currentSlideIndex === 0);
    updateButtonState(
        this.nextButton,
        this.currentSlideIndex >= this.slides.length - this.options.items
    );
};

// Hàm thực hiện cập nhật vị trí của track
Slidezy.prototype._updatePosition = function (instant = false) {
    this.offset = -(this.currentSlideIndex * (100 / this.options.items));
    this.track.style.transform = `translateX(${this.offset}%)`;
    this.track.style.transition = instant ? "none" : "transform 0.3s ease";
};

// Hàm thực hiện di chuyển slide
// step = 1: next, step = -1: prev
Slidezy.prototype.moveSlide = function (step) {
    if (this._isTransitioning) return;

    // Trường hợp cho phép loop
    if (this.options.loop) {
        this._isTransitioning = true;
        this.currentSlideIndex =
            (this.currentSlideIndex + step + this.slides.length) % this.slides.length;
        this.track.ontransitionend = () => {
            const maxIndex = this.slides.length - this.options.items;
            if (this.currentSlideIndex <= 0) {
                this.currentSlideIndex = maxIndex - this.options.items;
                this._updatePosition(true);
            } else if (this.currentSlideIndex >= maxIndex) {
                this.currentSlideIndex = this.options.items;
                this._updatePosition(true);
            }
            this._isTransitioning = false;
        };
    } else {
        // Trường hợp thông thường
        this.currentSlideIndex = Math.min(
            Math.max(this.currentSlideIndex + step, 0),
            this.slides.length - this.options.items
        );
    }

    this._updatePosition();
    this._checkDisabledNavigation();
};

Slidezy.prototype._init = function () {
    this.container.classList.add("slidezy-wrapper");
    this._createTrack();
    this._createNavigation();
    this._checkDisabledNavigation();
    this._updatePosition();
};

function Slidezy(selector, options) {
    this.options = Object.assign(
        {
            items: 1,
            loop: false,
        },
        options
    );
    this.container = document.querySelector(selector);
    if (!this.container) {
        throw new Error(`Container not found: ${selector}`);
    }

    this.slides = Array.from(this.container.children);
    this.currentSlideIndex = this.options.loop ? this.options.items : 0;

    this._init();
}

const mySlider = new Slidezy("#my-slider", {
    loop: true,
    items: 3,
});
