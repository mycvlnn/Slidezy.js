Slidezy.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.classList.add("slidezy-track");
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
    this._checkDisabledNavigation();

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

Slidezy.prototype.moveSlide = function (step) {
    if (this.options.loop) {
        this.currentSlideIndex =
            (this.currentSlideIndex + step + this.slides.length) % this.slides.length;
    } else {
        this.currentSlideIndex = Math.min(
            Math.max(this.currentSlideIndex + step, 0),
            this.slides.length - this.options.items
        );
    }

    this.offset = -(this.currentSlideIndex * (100 / this.options.items));
    this.track.style.transform = `translateX(${this.offset}%)`;
    this._checkDisabledNavigation();
};

Slidezy.prototype._init = function () {
    this.container.classList.add("slidezy-wrapper");
    this._createTrack();
    this._createNavigation();
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
    this.currentSlideIndex = 0;

    this._init();
}

const mySlider = new Slidezy("#my-slider", {
    loop: true,
    items: 1,
});
