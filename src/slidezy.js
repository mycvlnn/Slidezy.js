Slidezy.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.classList.add("slidezy-track");
    this.slides.forEach((slide) => {
        slide.classList.add("slidezy-slide");
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
    this.container.appendChild(this.prevButton);
    this.container.appendChild(this.nextButton);

    this.prevButton.onclick = () => this.moveSlide(-1);
    this.nextButton.onclick = () => this.moveSlide(1);
};

Slidezy.prototype.moveSlide = function (step) {
    console.log(`Moving slide by ${step}`);
};

Slidezy.prototype._init = function () {
    this.container.classList.add("slidezy-wrapper");
    this._createTrack();
    this._createNavigation();
};

function Slidezy(selector, options) {
    this.options = Object.assign(
        {
            duration: 300,
            autoPlay: false,
            autoPlayInterval: 3000,
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
    duration: 500,
    autoPlay: true,
    autoPlayInterval: 2000,
    loop: true,
});
