const videosData = {
    Ey001: "https://www.youtube.com/embed/agFnN0u0X8Q",
    Ey002: "https://www.youtube.com/embed/ScMzIvxBSi4",
    Ey003: "https://www.youtube.com/embed/3JZ_D3ELwOQ"
};

// دالة لقص الصورة باستخدام canvas
function cropThumbnailImage(imgElement, videoId, targetDiv) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "Anonymous"; // للتعامل مع الصور من مصادر خارجية
    img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    img.onload = () => {
        const cropPercentage = 0.15; // قص 15% من الأعلى والأسفل
        const sourceHeight = img.height;
        const cropHeight = sourceHeight * cropPercentage;
        const newHeight = sourceHeight - 2 * cropHeight;

        // ضبط أبعاد الـ canvas
        canvas.width = img.width;
        canvas.height = newHeight;

        // رسم الصورة المقصوصة
        ctx.drawImage(
            img,
            0, cropHeight, // نقطة البداية (x, y)
            img.width, newHeight, // حجم الجزء المقصوص
            0, 0, // الموقع في الـ canvas
            img.width, newHeight // حجم الرسم
        );

        // تحويل الـ canvas إلى صورة جديدة
        const croppedImg = document.createElement("img");
        croppedImg.src = canvas.toDataURL();
        croppedImg.alt = "Video Thumbnail";
        croppedImg.style.width = "100%"; // لضمان عرض الصورة بشكل صحيح
        targetDiv.replaceChild(croppedImg, imgElement);
    };

    img.onerror = () => {
        console.error(`Failed to load thumbnail for video ${videoId}`);
    };
}

// Dynamically create video elements
const videosContainer = document.getElementById("videosContainer");
Object.keys(videosData).forEach(id => {
    const videoId = videosData[id].split("/").pop().split("?")[0];
    const videoDiv = document.createElement("div");
    videoDiv.className = "mbvideo-d";
    videoDiv.id = id;
    videoDiv.innerHTML = `
        <div class="mbvideo-im Wave-cloud"><img alt="Video Thumbnail" src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg"></div>
        <div class="description">
            <div><img src="image/مشروع جديد (1).png" alt=""><txt class="video-description" id="desc-${id}">Loading description...</txt></div>
            <a>New</a>
        </div>
    `;
    videosContainer.appendChild(videoDiv);

    // قص الصورة المصغرة
    const imgElement = videoDiv.querySelector(".mbvideo-im img");
    cropThumbnailImage(imgElement, videoId, videoDiv.querySelector(".mbvideo-im"));

    // Fetch and set description
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then(response => response.json())
        .then(data => {
            const descElement = document.getElementById(`desc-${id}`);
            descElement.textContent = data.title || "لا يوجد وصف متاح";
        })
        .catch(error => {
            console.error(`Error fetching description for video ${id}:`, error);
            document.getElementById(`desc-${id}`).textContent = "فشل تحميل الوصف";
        });
});

let adTimes = [];
let shownAdTimes = [];
const modal = document.getElementById("videoModal");
const videoContainer = document.getElementById("videoContainer");
const adModal = document.getElementById("adModal");
const countdownSpan = document.getElementById("countdown");
const closeBtn = document.querySelector(".close");
const openYouTubeBtn = document.querySelector(".open-youtube");
let player = null;
let currentTime = 0;
let countdownInterval = null;
let checkAdInterval = null;
let currentVideoId = null;

// دالة لتوليد نقاط زمنية عشوائية للإعلانات
function generateRandomAdTimes(duration, count = 3) {
    const times = [];
    const minGap = 10;
    for (let i = 0; i < count; i++) {
        let randomTime;
        do {
            randomTime = Math.floor(Math.random() * (duration - 5)) + 5;
        } while (times.some(t => Math.abs(t - randomTime) < minGap));
        times.push(randomTime);
    }
    return times.sort((a, b) => a - b);
}

// إضافة النقاط الصفراء على شريط التقدم
function addYellowDots(duration) {
    const playerIframe = videoContainer.querySelector("iframe");
    if (!playerIframe) return;

    const existingProgressBar = videoContainer.querySelector(".progress-bar");
    if (existingProgressBar) existingProgressBar.remove();

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    videoContainer.appendChild(progressBar);

    adTimes.forEach(time => {
        if (time < duration) {
            const dot = document.createElement("div");
            dot.className = "yellow-dot";
            dot.dataset.time = time;
            dot.style.left = `${(time / duration) * 100}%`;
            progressBar.appendChild(dot);
        }
    });
}

// إزالة النقطة الصفراء بناءً على النقطة الزمنية
function removeYellowDot(adTime, duration) {
    const progressBar = videoContainer.querySelector(".progress-bar");
    if (!progressBar) return;

    const dots = progressBar.querySelectorAll(".yellow-dot");
    dots.forEach(dot => {
        if (Math.abs(parseFloat(dot.dataset.time) - adTime) < 0.5) {
            dot.remove();
        }
    });

    adTimes = adTimes.filter(time => Math.abs(time - adTime) >= 0.5);
}

// تحميل YouTube IFrame API
function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        return Promise.resolve();
    }
    return new Promise(resolve => {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => {
            resolve();
        };
    });
}

// تهيئة مشغل الفيديو
function initializePlayer(videoId) {
    return new Promise(resolve => {
        const iframe = videoContainer.querySelector("iframe");
        if (!iframe) {
            console.error("No iframe found");
            return;
        }
        player = new YT.Player(iframe, {
            events: {
                onReady: event => {
                    const duration = event.target.getDuration();
                    adTimes = generateRandomAdTimes(duration);
                    shownAdTimes = [];
                    addYellowDots(duration);
                    event.target.playVideo();
                    resolve();
                },
                onStateChange: onPlayerStateChange
            }
        });
    });
}

// تشغيل الفيديو عند الضغط على div
Object.keys(videosData).forEach(id => {
    document.getElementById(id).addEventListener("click", async () => {
        currentVideoId = id;
        const videoURL = videosData[id] + "?enablejsapi=1";
        videoContainer.innerHTML = `<iframe src="${videoURL}" allowfullscreen></iframe>`;
        modal.style.display = "flex";
        try {
            await loadYouTubeAPI();
            await initializePlayer(id);
        } catch (error) {
            console.error("Error initializing player:", error);
        }
    });
});

// فتح الفيديو في يوتيوب
openYouTubeBtn.addEventListener("click", () => {
    if (currentVideoId && videosData[currentVideoId]) {
        const youtubeURL = videosData[currentVideoId].replace("/embed/", "/watch?v=");
        window.open(youtubeURL, "_blank");
    }
});

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if (checkAdInterval) clearInterval(checkAdInterval);
        checkAdTime();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        if (checkAdInterval) clearInterval(checkAdInterval);
    }
}

// التحقق من النقاط الزمنية لعرض الإعلان
function checkAdTime() {
    checkAdInterval = setInterval(() => {
        if (!player || !player.getCurrentTime) {
            console.warn("Player not ready or getCurrentTime not available");
            return;
        }
        currentTime = player.getCurrentTime();
        const adTime = adTimes.find(time => Math.abs(currentTime - time) < 0.5);
        if (adTime && !shownAdTimes.includes(adTime)) {
            player.pauseVideo();
            shownAdTimes.push(adTime);
            showAd(adTime);
            clearInterval(checkAdInterval);
        }
    }, 500);
}

// عرض الإعلان مع العداد التنازلي
function showAd(adTime) {
    adModal.style.display = "flex";
    let countdown = 5;
    countdownSpan.textContent = countdown;
    countdownInterval = setInterval(() => {
        countdown--;
        countdownSpan.textContent = countdown;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            adModal.style.display = "none";
            removeYellowDot(adTime, player.getDuration());
            if (player && player.seekTo) {
                player.seekTo(currentTime, true);
                player.playVideo();
                if (shownAdTimes.length < adTimes.length) {
                    checkAdTime();
                }
            } else {
                console.error("Player or seekTo not available");
            }
        }
    }, 1000);
}

// إغلاق النافذة وإزالة الفيديو
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    videoContainer.innerHTML = "";
    if (checkAdInterval) clearInterval(checkAdInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    adModal.style.display = "none";
    player = null;
    adTimes = [];
    shownAdTimes = [];
    currentVideoId = null;
});

// إغلاق عند الضغط خارج المحتوى
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        videoContainer.innerHTML = "";
        if (checkAdInterval) clearInterval(checkAdInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        adModal.style.display = "none";
        player = null;
        adTimes = [];
        shownAdTimes = [];
        currentVideoId = null;
    }
});



        

        const buttons = [
  document.getElementById("btn1"),
  document.getElementById("btn2"),
  document.getElementById("btn3"),
  document.getElementById("btn4")
];

const boxes = [
  document.getElementById("box1"),
  document.getElementById("box2"),
  document.getElementById("box3"),
  document.getElementById("box4")
];

let index = 0; // يبدأ من 0 لتتناسب مع أول ديف ظاهر
let interval;

function showBox(i) {
  // إزالة الكلاس من جميع الأزرار والديفات
  buttons.forEach(btn => btn.classList.remove("coc"));
  boxes.forEach(box => box.classList.remove("show"));

  // إضافة الكلاس للزر والديف الحالي
  buttons[i].classList.add("coc");
  boxes[i].classList.add("show");

  index = i; // تحديث الفهرس الحالي
}

// إضافة إمكانية النقر على الأزرار للتنقل
buttons.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    showBox(i);
    resetInterval(); // إعادة ضبط التوقيت بعد النقر
  });
});

// بدء التغيير التلقائي
function startInterval() {
  interval = setInterval(() => {
    let nextIndex = (index + 1) % buttons.length;
    showBox(nextIndex);
  }, 4000);
}

// إعادة ضبط المؤقت
function resetInterval() {
  clearInterval(interval);
  startInterval();
}

// بدء الحلقة التلقائية عند تحميل الصفحة
showBox(index); // عرض أول ديف
startInterval();




// الحصول على السنة الحالية تلقائيًا
    const year = new Date().getFullYear();
    document.getElementById("currentYear").textContent = year;
