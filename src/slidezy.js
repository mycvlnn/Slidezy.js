Slidezy.prototype._createContent = function () {
    this.content = document.createElement("div");
    this.content.classList.add("slidezy-content");
    this.container.appendChild(this.content);
};

Slidezy.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.classList.add("slidezy-track");
    if (this.options.loop) {
        const clonedHead = this.slides.slice(-this.clonedItems).map((node) => node.cloneNode(true));
        const clonedTail = this.slides
            .slice(0, this.clonedItems)
            .map((node) => node.cloneNode(true));
        this.slides = [...clonedHead, ...this.slides, ...clonedTail];
    }
    this.slides.forEach((slide) => {
        slide.classList.add("slidezy-slide");
        slide.style.flexBasis = `${100 / this.options.slideToShow}%`;
        this.track.appendChild(slide);
    });

    this.content.appendChild(this.track);
};

Slidezy.prototype._createNavigation = function () {
    if (!this.options.arrows) return;

    this.prevButton = this.options.prevArrowButton
        ? document.querySelector(this.options.prevArrowButton)
        : document.createElement("button");

    this.nextButton = this.options.nextArrowButton
        ? document.querySelector(this.options.nextArrowButton)
        : document.createElement("button");

    if (!this.options.prevArrowButton) {
        this.prevButton.classList.add("slidezy-prev");
        this.prevButton.innerText = this.options.arrowsText[0];
        this.content.appendChild(this.prevButton);
    }

    if (!this.options.nextArrowButton) {
        this.nextButton.classList.add("slidezy-next");
        this.nextButton.innerText = this.options.arrowsText[1];
        this.content.appendChild(this.nextButton);
    }

    // Add events
    if (this.prevButton)
        this.prevButton.onclick = () => this.moveSlide(-this.options.slidesToScroll);

    if (this.nextButton)
        this.nextButton.onclick = () => this.moveSlide(this.options.slidesToScroll);
};

Slidezy.prototype._checkDisabledNav = function () {
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

    if (this.currentSlideIndex >= this.slides.length - this.options.slideToShow) {
        this.nextDisabled = true;
        this.nextButton.setAttribute("disabled", true);
        this.nextButton.classList.add("disabled");
    } else {
        this.nextDisabled = false;
        this.nextButton.removeAttribute("disabled");
        this.nextButton.classList.remove("disabled");
    }
};

// Lấy ra số lượng slide nhìn bằng mắt thường thực tế mà không tính slide giả lập (2 đầu và 2 cuối)
Slidezy.prototype._getRealSlideCount = function () {
    return this.slides.length - (this.options.loop ? this.clonedItems * 2 : 0);
};

Slidezy.prototype._handleTransitionEnd = function () {
    // Trường hợp cho phép loop
    if (this.options.loop) {
        this._isTransitioning = true;

        setTimeout(() => {
            const slideCount = this._getRealSlideCount();
            if (this.currentSlideIndex < this.clonedItems) {
                this.currentSlideIndex += slideCount;
                this._updatePosition(true);
            } else if (this.currentSlideIndex >= slideCount + this.clonedItems) {
                this.currentSlideIndex -= slideCount;
                this._updatePosition(true);
            }
            this._isTransitioning = false;
        }, this.options.speed);
    }
};

Slidezy.prototype._handleChange = function () {
    if (this.options.onChange) {
        const realIndex = this._getRealIndex();
        this.options.onChange(realIndex);
    }
};

// Hàm thực hiện cập nhật vị trí của track
Slidezy.prototype._updatePosition = function (instant = false) {
    this.offset = -(this.currentSlideIndex * (100 / this.options.slideToShow));
    this.track.style.transform = `translateX(${this.offset}%)`;
    this.track.style.transition = instant ? "none" : `transform ${this.options.speed}ms ease`;
    if (!instant) {
        this._updateDot();
    }

    if (this.currentSlideIndex !== this.prevSlideIndex) {
        this.prevSlideIndex = this.currentSlideIndex;
        this._handleChange();
    }
};

// Lấy ra index thực tế trừ đi số lượng clone ở đầu
Slidezy.prototype._getRealIndex = function () {
    const slideCount = this._getRealSlideCount();
    return this.options.loop
        ? (this.currentSlideIndex - this.clonedItems + slideCount) % slideCount
        : this.currentSlideIndex;
};

Slidezy.prototype._getMaxSlideIndex = function () {
    return this.slides.length - this.options.slideToShow;
};

Slidezy.prototype.slideToIndex = function (index) {
    if (this._isTransitioning) return;
    const maxIndex = this._getMaxSlideIndex();
    const realIndex = this.options.loop ? index + this.clonedItems : index;
    this.currentSlideIndex = Math.min(Math.max(realIndex, 0), maxIndex);
    this._handleTransitionEnd();
    this._updatePosition();
    this._checkDisabledNav();
};

// Hàm thực hiện di chuyển slide
// step = 1: next, step = -1: prev
Slidezy.prototype.moveSlide = function (step) {
    if (this._isTransitioning) return;
    const maxIndex = this._getMaxSlideIndex();
    this.currentSlideIndex = Math.min(Math.max(this.currentSlideIndex + step, 0), maxIndex);
    this._handleTransitionEnd();
    this._updatePosition();
    this._checkDisabledNav();
};

Slidezy.prototype._stopAutoplay = function () {
    if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
    }
};

Slidezy.prototype._autoplay = function () {
    if (!this.options.autoplay) return;

    this._stopAutoplay();

    this.autoplayInterval = setInterval(() => {
        this.moveSlide(this.options.slidesToScroll);
    }, this.options.autoplayTimeout);

    if (this.options.autoplayHoverPause) {
        this.container.onmouseenter = () => {
            this._stopAutoplay();
        };

        this.container.onmouseleave = () => {
            this._autoplay();
        };
    }
};

// Hàm cập nhật trạng thái của các dấu chấm
Slidezy.prototype._updateDot = function () {
    if (!this.options.dots) return;
    const realIndex = this._getRealIndex();
    const pageIndex = Math.floor(realIndex / this.options.slideToShow);

    this.dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === pageIndex);
    });
};

// Hàm tạo các dấu chấm
Slidezy.prototype._createDots = function () {
    if (!this.options.dots) return;
    this.dotsContainer = document.createElement("div");
    this.dotsContainer.classList.add("slidezy-dots");
    const slideCount = this._getRealSlideCount();
    const pageCount = Math.ceil(slideCount / this.options.slideToShow);
    for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement("button");
        dot.classList.add("slidezy-dot");
        if (i === 0) dot.classList.add("active");

        // Xử lý sự kiện click cho từng dot
        dot.onclick = () => {
            this.currentSlideIndex = this.options.loop
                ? i * this.options.slideToShow + this.clonedItems
                : i * this.options.slideToShow;
            this._updatePosition();
        };
        this.dotsContainer.appendChild(dot);
    }

    this.dots = Array.from(this.dotsContainer.children);

    this.container.appendChild(this.dotsContainer);
};

Slidezy.prototype._addSwipeEvents = function () {
    if (!this.options.swipeAble) return;

    let startX = 0;
    let isDragging = false;

    const onDragStart = (e) => {
        isDragging = true;
        startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
        this._stopAutoplay(); // Dừng autoplay khi kéo
    };

    const onDragMove = (e) => {
        if (!isDragging) return;
        const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
        const diffX = currentX - startX;
        this.track.style.transform = `translateX(${
            this.offset + (diffX / this.container.clientWidth) * 100
        }%)`;
    };

    const onDragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.type.includes("mouse") ? e.pageX : e.changedTouches[0].clientX;
        const diff = endX - startX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.moveSlide(-this.options.slidesToScroll); // Swipe sang phải
            } else {
                this.moveSlide(this.options.slidesToScroll); // Swipe sang trái
            }
        }

        this._autoplay(); // Khởi động lại autoplay nếu cần
    };

    this.track.addEventListener("mousedown", onDragStart);
    this.track.addEventListener("mousemove", onDragMove);
    this.track.addEventListener("mouseup", onDragEnd);
    this.track.addEventListener("mouseleave", onDragEnd);

    this.track.addEventListener("touchstart", onDragStart, { passive: true });
    this.track.addEventListener("touchmove", onDragMove, { passive: true });
    this.track.addEventListener("touchend", onDragEnd);
};

Slidezy.prototype._init = function () {
    this._createContent();
    this._createTrack();
    this._createNavigation();
    this._checkDisabledNav();
    this._createDots();
    this._updatePosition();
    this._autoplay();
    this._addSwipeEvents();
};

function Slidezy(selector, options) {
    this.options = Object.assign(
        {
            slideToShow: 1,
            loop: false,
            slidesToScroll: 1,
            autoplay: false,
            speed: 500,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            dots: false,
            arrows: true,
            arrowsText: ["<", ">"],
            prevArrowButton: null,
            nextArrowButton: null,
            swipeAble: true,
            onChange: null,
        },
        options
    );
    this.container = document.querySelector(selector);
    if (!this.container) {
        throw new Error(`Container not found: ${selector}`);
    }

    this.container.classList.add("slidezy-wrapper");
    this.slides = Array.from(this.container.children);
    this.clonedItems = this.options.loop
        ? this.options.slideToShow + this.options.slidesToScroll
        : 0;
    this.prevSlideIndex = this.clonedItems;
    this.currentSlideIndex = this.clonedItems;
    this.prevDisabled = false;
    this.nextDisabled = false;

    this._init();
}

const mySlider = new Slidezy("#my-slider", {
    loop: true,
    slideToShow: 2,
    slidesToScroll: 2,
    autoplay: true,
    autoplayTimeout: 3000,
    // autoplayHoverPause: false,
    speed: 500,
    dots: true,
    arrows: true,
    // prevArrowButton: ".nav-prev",
    // nextArrowButton: ".nav-next",
    // arrowsText: ["Lùi", "Tiến"],
    swipeAble: true,
    onChange: (index) => {
        console.log("Slide changed to index:", index);
    },
});
