document.addEventListener("DOMContentLoaded", () => {
    // متغير عالمي لتتبع عدد الفيديوهات الجديدة
    let newFavoritesCount = 0;
    
    // دالة لتنسيق التاريخ بالصيغة المطلوبة
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // دالة لحفظ المفضلة في localStorage
    function saveFavorites(favorites) {
        localStorage.setItem('videoFavorites', JSON.stringify(favorites));
    }

    // دالة لتحميل المفضلة من localStorage
    function loadFavorites() {
        const favorites = localStorage.getItem('videoFavorites');
        return favorites ? JSON.parse(favorites) : [];
    }

    // دالة لتحميل عداد الفيديوهات الجديدة من localStorage
    function loadNewFavoritesCount() {
        const savedCount = localStorage.getItem('newFavoritesCount');
        return savedCount ? parseInt(savedCount) : 0;
    }

    // دالة لحفظ عداد الفيديوهات الجديدة في localStorage
    function saveNewFavoritesCount(count) {
        localStorage.setItem('newFavoritesCount', count.toString());
        newFavoritesCount = count;
    }

    // دالة لتحميل معرفات الفيديوهات الجديدة من localStorage
    function loadNewFavoritesIds() {
        const ids = localStorage.getItem('newFavoritesIds');
        return ids ? JSON.parse(ids) : [];
    }

    // دالة لإخفاء/إظهار badge المفضلة الجديدة
    function toggleNewFavoritesBadge(show = false) {
        const badge = document.getElementById("newFavoritesBadge");
        const countSpan = document.getElementById("newFavoritesCount");
        
        if (!badge || !countSpan) return;
        
        if (show) {
            badge.classList.remove("hidden");
            countSpan.textContent = newFavoritesCount;
        } else {
            badge.classList.add("hidden");
            countSpan.textContent = "0";
        }
    }

    // دالة لإنشاء مراقب للإشعارات عند ظهور box234
    function setupBox234Observer() {
        const box234 = document.getElementById("box234");
        
        if (!box234) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && (node.id === 'box234' || node.querySelector('#box234'))) {
                                const targetBox = node.id === 'box234' ? node : node.querySelector('#box234');
                                if (targetBox) {
                                    setupNotificationsObserver(targetBox);
                                }
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            return;
        }

        setupNotificationsObserver(box234);
    }

    // دالة لإعداد المراقب على box234 للكشف عن الإشعارات
    function setupNotificationsObserver(box234) {
        const observer = new MutationObserver((mutations, obs) => {
            let hasChanges = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    hasChanges = true;
                }
            });

            if (hasChanges && isVisible(box234)) {
                if (newFavoritesCount > 0) {
                    toggleNewFavoritesBadge(false);
                    saveNewFavoritesCount(0);
                    localStorage.setItem('newFavoritesIds', JSON.stringify([]));
                }
                obs.disconnect();
            }
        });

        observer.observe(box234, { 
            attributes: true, 
            childList: true, 
            subtree: true,
            attributeFilter: ['class', 'style', 'display']
        });

        if (isVisible(box234) && newFavoritesCount > 0) {
            toggleNewFavoritesBadge(false);
            saveNewFavoritesCount(0);
            localStorage.setItem('newFavoritesIds', JSON.stringify([]));
            observer.disconnect();
        }

        const closeObserver = new MutationObserver((mutations) => {
            let isClosed = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'class' || mutation.attributeName === 'style') &&
                    !isVisible(box234)) {
                    isClosed = true;
                }
            });

            if (isClosed) {
                setTimeout(() => {
                    if (newFavoritesCount > 0) {
                        setupNotificationsObserver(box234);
                    }
                }, 100);
            }
        });

        closeObserver.observe(box234, {
            attributes: true,
            attributeFilter: ['class', 'style', 'display']
        });
    }

    // دالة لعرض إشعار الفيديوهات الجديدة مع التحقق من نوع العملية
    function showNewFavoritesNotification(count, operation = 'add') {
        const badge = document.getElementById("newFavoritesBadge");
        const countSpan = document.getElementById("newFavoritesCount");

        if (!badge || !countSpan) return;

        saveNewFavoritesCount(count);
        
        if (count > 0) {
            toggleNewFavoritesBadge(true);
            setupBox234Observer();
        } else {
            toggleNewFavoritesBadge(false);
            saveNewFavoritesCount(0);
        }
    }

    // دالة تتحقق إن كان العنصر ظاهر فعلياً على الشاشة
    function isVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
            return false;
        }
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               rect.top < window.innerHeight && 
               rect.bottom > 0;
    }

    // دالة لتحديث عداد المفضلة
    function updateFavoritesCounter(count) {
        const counterSpan = document.getElementById("favoritesCounter");
        if (counterSpan) {
            if (count === 0) {
                counterSpan.textContent = "0";
                counterSpan.style.display = 'none';
            } else {
                counterSpan.textContent = count.toString();
                counterSpan.style.display = 'inline';
            }
        }
    }

    // دالة لحذف جميع المفضلة
    function clearAllFavorites() {
        saveFavorites([]);
        renderFavorites();
        updateFavoritesCounter(0);
        saveNewFavoritesCount(0);
        localStorage.setItem('newFavoritesIds', JSON.stringify([]));
        showNewFavoritesNotification(0, 'clear');
        Object.keys(videosData).forEach(id => {
            updateHeartButton(id, false);
        });
    }

    // دالة لإضافة فيديو للمفضلة
    function addToFavorites(videoData) {
        const favorites = loadFavorites();
        const exists = favorites.some(fav => fav.id === videoData.id);
        if (!exists) {
            favorites.unshift(videoData);
            saveFavorites(favorites);
            renderFavorites();
            updateFavoritesCounter(favorites.length);
            
            const currentNewCount = loadNewFavoritesCount();
            const newTotalCount = currentNewCount + 1;
            saveNewFavoritesCount(newTotalCount);
            
            const newFavoritesIds = loadNewFavoritesIds();
            newFavoritesIds.push(videoData.id);
            localStorage.setItem('newFavoritesIds', JSON.stringify(newFavoritesIds));
            
            showNewFavoritesNotification(newTotalCount, 'add');
            
            return true;
        }
        return false;
    }

    // دالة لحذف فيديو من المفضلة
    function removeFromFavorites(videoId) {
        let favorites = loadFavorites();
        const oldLength = favorites.length;
        favorites = favorites.filter(fav => fav.id !== videoId);
        saveFavorites(favorites);
        renderFavorites();
        updateFavoritesCounter(favorites.length);
        
        let newFavoritesIds = loadNewFavoritesIds();
        const isNewFavorite = newFavoritesIds.includes(videoId);
        newFavoritesIds = newFavoritesIds.filter(id => id !== videoId);
        localStorage.setItem('newFavoritesIds', JSON.stringify(newFavoritesIds));
        
        let updatedCount = loadNewFavoritesCount();
        if (isNewFavorite && updatedCount > 0) {
            updatedCount = Math.max(0, updatedCount - 1);
            saveNewFavoritesCount(updatedCount);
            showNewFavoritesNotification(updatedCount, 'remove');
        }
        
        Object.keys(videosData).forEach(id => {
            updateHeartButton(id, isFavorited(id));
        });
        
        return updatedCount;
    }

    // دالة لعرض المفضلة
    function renderFavorites() {
        const favorites = loadFavorites();
        const container = document.getElementById("favoritesContainer");
        const clearAllBtn = document.getElementById("clearAllBtn");
        if (!container) return;
        
        updateFavoritesCounter(favorites.length);
        
        if (favorites.length === 0) {
            container.innerHTML = '<div class="no-favorites">لا توجد فيديوهات في المفضلة</div>';
            if (clearAllBtn) {
                clearAllBtn.style.display = 'none';
            }
            return;
        }

        if (clearAllBtn) {
            clearAllBtn.style.display = 'flex';
        }

        container.innerHTML = favorites.map(fav => `
            <button class="favorite-item" data-video-id="${fav.id}">
              <div class="fffder">
                <xx class="flex"><img class="favorite-thumbnail" src="${fav.thumbnail}" alt="${fav.title}"></xx>
                <div class="fffrr">
                    <div class="favorite-title">${fav.title}</div>
                    <span class="favorite-date">${fav.date}</span>
                </div>
              </div>
                <div class="favorite-meta">
                    <a class="delete-favorite Wave-cloud ve" data-video-id="${fav.id}">
                        <svg class="close-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                        </svg>
                    </a>
                </div>
            </button>
        `).join('');
    }

    // دالة للتحقق من وجود فيديو في المفضلة
    function isFavorited(videoId) {
        const favorites = loadFavorites();
        return favorites.some(fav => fav.id === videoId);
    }

    // دالة لإنشاء أيقونة القلب
    function createHeartIcon(filled = false) {
        return filled ? 
            '<svg class="heart-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' :
            '<svg class="heart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    }

    // دالة لتحديث حالة زر المفضلة
    function updateHeartButton(videoId, isLiked) {
        const button = document.querySelector(`#${videoId} .mbvideo-heart`);
        if (button) {
            const iconElement = button.querySelector('.heart-icon-container');
            if (iconElement) {
                iconElement.innerHTML = createHeartIcon(isLiked);
                if (isLiked) {
                    button.classList.add('liked', 'heart-check');
                } else {
                    button.classList.remove('liked', 'heart-check');
                }
            }
        }
    }

    // دالة لقص الصورة باستخدام canvas
    function cropThumbnailImage(imgElement, videoId, targetDiv) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        img.onload = () => {
            const cropPercentage = 0.15;
            const sourceHeight = img.height;
            const cropHeight = sourceHeight * cropPercentage;
            const newHeight = sourceHeight - 2 * cropHeight;

            canvas.width = img.width;
            canvas.height = newHeight;

            ctx.drawImage(
                img,
                0, cropHeight,
                img.width, newHeight,
                0, 0,
                img.width, newHeight
            );

            const croppedImg = document.createElement("img");
            croppedImg.src = canvas.toDataURL();
            croppedImg.alt = "Video Thumbnail";
            croppedImg.style.width = "100%";
            targetDiv.replaceChild(croppedImg, imgElement);
        };

        img.onerror = () => {
            console.error(`Failed to load thumbnail for video ${videoId}`);
        };
    }

    // تهيئة عداد الفيديوهات الجديدة عند تحميل الصفحة
    newFavoritesCount = loadNewFavoritesCount();
    if (newFavoritesCount > 0) {
        showNewFavoritesNotification(newFavoritesCount, 'init');
    } else {
        toggleNewFavoritesBadge(false);
    }

    // Check if videosData is defined
    if (typeof videosData === "undefined") {
        console.error("videosData is not defined. Ensure videosData.js is loaded correctly. Check the file path and ensure it is accessible.");
        return;
    }

    // إنشاء الفيديوهات ديناميكياً بشكل تدريجي
    const videosContainer = document.getElementById("videosContainer");
    const videoIds = Object.keys(videosData);
    let currentIndex = 0;

    function addVideoDiv() {
        if (currentIndex >= videoIds.length) return; // إذا انتهت الفيديوهات، توقف

        const id = videoIds[currentIndex];
        const videoId = videosData[id].split("/").pop().split("?")[0];
        const videoDiv = document.createElement("div");
        videoDiv.className = "mbvideo-d";
        videoDiv.id = id;
        videoDiv.innerHTML = `
            <button class="mbvideo-heart Wave-cloud" data-video-id="${id}">
                <div class="heart-icon-container">
                    ${createHeartIcon(false)}
                </div>
            </button>
            <div class="mbvideo-im Wave-cloud">
                <img alt="Video Thumbnail" src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" loading="lazy">
            </div>
            <div class="description">
                <div class="eerr444">
                    <img class="channel-img" src="image/مشروع جديد (1).png" alt="Channel Image">
                    <div class="ffr544">
                        <txt class="video-description" id="desc-${id}">Loading description...</txt>
                        <div id="Views-${id}" class="channel-name">Loading channel...</div>
                    </div>
                </div>
                <a>New</a>
            </div>
        `;
        videosContainer.appendChild(videoDiv);

        // إضافة مستمع الحدث للنقر على الفيديو
        videoDiv.addEventListener("click", (e) => {
            if (!e.target.closest('.mbvideo-heart')) {
                playVideo(id);
            }
        });

        const imgElement = videoDiv.querySelector(".mbvideo-im img");
        cropThumbnailImage(imgElement, videoId, videoDiv.querySelector(".mbvideo-im"));

        fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
            .then(response => response.json())
            .then(data => {
                const descElement = document.getElementById(`desc-${id}`);
                const titleText = data.title || "لا يوجد وصف متاح";
                descElement.textContent = titleText;
                descElement.setAttribute("title", titleText);
                
                const channelDiv = document.getElementById(`Views-${id}`);
                channelDiv.textContent = data.author_name || "قناة غير معروفة";

                window[`videoData_${id}`] = {
                    id: id,
                    title: titleText,
                    author: data.author_name || "قناة غير معروفة",
                    thumbnail: imgElement.src,
                    videoId: videoId,
                    url: videosData[id]
                };

                updateHeartButton(id, isFavorited(id));
            })
            .catch(error => {
                console.error(`Error fetching description for video ${id}:`, error);
                const descElement = document.getElementById(`desc-${id}`);
                descElement.textContent = "فشل تحميل الوصف";
                descElement.setAttribute("title", "فشل تحميل الوصف");
                document.getElementById(`Views-${id}`).textContent = "فشل تحميل اسم القناة";
                
                window[`videoData_${id}`] = {
                    id: id,
                    title: "فشل تحميل الوصف",
                    author: "فشل تحميل اسم القناة",
                    thumbnail: imgElement.src,
                    videoId: videoId,
                    url: videosData[id]
                };
                
                updateHeartButton(id, isFavorited(id));
            });

        currentIndex++;
        // إضافة الفيديو التالي بعد تأخير قصير
        setTimeout(() => {
            requestAnimationFrame(addVideoDiv);
        }, 100); // تأخير 100 مللي ثانية بين كل فيديو
    }

    // بدء عملية الإضافة التدريجية
    requestAnimationFrame(addVideoDiv);

    // معالجة النقر على زر المفضلة
    document.addEventListener('click', function(e) {
        if (e.target.closest('.mbvideo-heart') && e.target.closest('.mbvideo-d')) {
            e.stopPropagation();
            const button = e.target.closest('.mbvideo-heart');
            const videoId = button.dataset.videoId;
            const videoData = window[`videoData_${videoId}`];
            
            if (!videoData) {
                alert('بيانات الفيديو غير جاهزة بعد');
                return;
            }

            const isCurrentlyLiked = isFavorited(videoId);
            const iconContainer = button.querySelector('.heart-icon-container');

            if (isCurrentlyLiked) {
                removeFromFavorites(videoId);
                if (iconContainer) {
                    iconContainer.innerHTML = createHeartIcon(false);
                }
                button.classList.remove('liked', 'heart-check');
            } else {
                const newFavorite = {
                    ...videoData,
                    date: formatDate(new Date()) // استخدام الدالة الجديدة لتنسيق التاريخ
                };
                addToFavorites(newFavorite);
                if (iconContainer) {
                    iconContainer.innerHTML = createHeartIcon(true);
                }
                button.classList.add('liked', 'heart-check');
            }
            return;
        }

        if (e.target.closest('.delete-favorite')) {
            e.stopPropagation();
            e.preventDefault();
            const button = e.target.closest('.delete-favorite');
            const videoId = button.dataset.videoId;
            removeFromFavorites(videoId);
            
            const heartButton = document.querySelector(`#${videoId} .mbvideo-heart`);
            if (heartButton) {
                const iconContainer = heartButton.querySelector('.heart-icon-container');
                if (iconContainer) {
                    iconContainer.innerHTML = createHeartIcon(false);
                }
                heartButton.classList.remove('liked', 'heart-check');
            }
            return;
        }

        if (e.target.closest('#clearAllBtn')) {
            e.stopPropagation();
            e.preventDefault();
            if (confirm('هل أنت متأكد من رغبتك في حذف جميع الفيديوهات من المفضلة؟')) {
                clearAllFavorites();
            }
            return;
        }

        if (e.target.closest('.favorite-item') && !e.target.closest('.delete-favorite') && !e.target.closest('#clearAllBtn')) {
            e.stopPropagation();
            const item = e.target.closest('.favorite-item');
            const videoId = item.dataset.videoId;
            if (videoId && videosData[videoId]) {
                playVideo(videoId);
            }
            return;
        }
    });

    // عرض المفضلة عند التحميل
    renderFavorites();

    // باقي الكود يبقى كما هو...
    let adTimes = [];
    let shownAdTimes = [];
    const modal = document.getElementById("videoModal");
    const videoContainer = document.getElementById("videoContainer");
    const adModal = document.getElementById("adModal");
    const countdownSpan = document.getElementById("countdown");
    const closeBtn = document.querySelector(".close");
    const openYouTubeBtn = document.querySelector(".open-youtube");
    const prevVideoBtn = document.getElementById("prevVideo");
    const nextVideoBtn = document.getElementById("nextVideo");
    let player = null;
    let currentTime = 0;
    let countdownInterval = null;
    let checkAdInterval = null;
    let currentVideoId = null;

    function removeCocoClass() {
        document.querySelectorAll('.mbvideo-im').forEach(div => {
            div.classList.remove('coco');
        });
        document.querySelectorAll('.favorite-item').forEach(item => {
            item.classList.remove('coco');
        });
    }

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

    window.playVideo = async function(id) {
        currentVideoId = id;
        const videoURL = videosData[id] + "?enablejsapi=1";
        videoContainer.innerHTML = `<iframe src="${videoURL}" allowfullscreen></iframe>`;
        modal.style.display = "flex";
        
        removeCocoClass();
        const videoDiv = document.getElementById(id);
        if (videoDiv) {
            const mbvideoIm = videoDiv.querySelector(".mbvideo-im");
            if (mbvideoIm) {
                mbvideoIm.classList.add("coco");
            }
        }
        
        const favoriteItem = document.querySelector(`[data-video-id="${id}"]`);
        if (favoriteItem) {
            favoriteItem.classList.add("coco");
        }
        
        updateNavigationButtons();
        try {
            await loadYouTubeAPI();
            await initializePlayer(id);
        } catch (error) {
            console.error("Error initializing player:", error);
        }
    }

    function updateNavigationButtons() {
        const videoIds = Object.keys(videosData);
        const currentIndex = videoIds.indexOf(currentVideoId);
        prevVideoBtn.disabled = currentIndex <= 0;
        nextVideoBtn.disabled = currentIndex >= videoIds.length - 1;
    }

    prevVideoBtn.addEventListener("click", () => {
        const videoIds = Object.keys(videosData);
        const currentIndex = videoIds.indexOf(currentVideoId);
        if (currentIndex > 0) {
            if (player) player.destroy();
            adTimes = [];
            shownAdTimes = [];
            playVideo(videoIds[currentIndex - 1]);
        }
    });

    nextVideoBtn.addEventListener("click", () => {
        const videoIds = Object.keys(videosData);
        const currentIndex = videoIds.indexOf(currentVideoId);
        if (currentIndex < videoIds.length - 1) {
            if (player) player.destroy();
            adTimes = [];
            shownAdTimes = [];
            playVideo(videoIds[currentIndex + 1]);
        }
    });

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

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        videoContainer.innerHTML = "";
        if (checkAdInterval) clearInterval(checkAdInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        adModal.style.display = "none";
        if (player) player.destroy();
        adTimes = [];
        shownAdTimes = [];
        currentVideoId = null;
        removeCocoClass();
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            videoContainer.innerHTML = "";
            if (checkAdInterval) clearInterval(checkAdInterval);
            if (countdownInterval) clearInterval(countdownInterval);
            adModal.style.display = "none";
            if (player) player.destroy();
            adTimes = [];
            shownAdTimes = [];
            currentVideoId = null;
            removeCocoClass();
        }
    });

    window.removeFromFavorites = removeFromFavorites;
    window.clearAllFavorites = clearAllFavorites;
    window.playVideo = playVideo;
    window.renderFavorites = renderFavorites;
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

    let index = 0;
    let interval;
    let touchStartX = 0;
    let touchEndX = 0;

    function showBox(i) {
      buttons.forEach(btn => btn.classList.remove("coc"));
      boxes.forEach(box => box.classList.remove("show"));
      buttons[i].classList.add("coc");
      boxes[i].classList.add("show");
      index = i;
    }

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        showBox(i);
        resetInterval();
      });
    });

    function startInterval() {
      interval = setInterval(() => {
        let nextIndex = (index + 1) % buttons.length;
        showBox(nextIndex);
      }, 4000);
    }

    function resetInterval() {
      clearInterval(interval);
      startInterval();
    }

    // التعامل مع أحداث اللمس
    const banerDiv = document.querySelector(".baner-div");
    banerDiv.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    banerDiv.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });

    // التعامل مع أحداث الماوس
    let isDragging = false;
    banerDiv.addEventListener("mousedown", (e) => {
      isDragging = true;
      touchStartX = e.screenX;
    });

    banerDiv.addEventListener("mouseup", (e) => {
      if (isDragging) {
        touchEndX = e.screenX;
        handleSwipe();
        isDragging = false;
      }
    });

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      const minSwipeDistance = 50; // الحد الأدنى لمسافة السحب

      if (swipeDistance > minSwipeDistance) {
        // السحب لليمين: الانتقال إلى الفيديو السابق
        let prevIndex = (index - 1 + buttons.length) % buttons.length;
        showBox(prevIndex);
        resetInterval();
      } else if (swipeDistance < -minSwipeDistance) {
        // السحب لليسار: الانتقال إلى الفيديو التالي
        let nextIndex = (index + 1) % buttons.length;
        showBox(nextIndex);
        resetInterval();
      }
    }

    // بدء الحلقة التلقائية وعرض أول فيديو
    showBox(index);
    startInterval();




// الحصول على السنة الحالية تلقائيًا
    const year = new Date().getFullYear();
    document.getElementById("currentYear").textContent = year;
    






document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter')
    const options = {
        root: null,
        threshold: 0.5
    }
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                // إزالة الفواصل من القيمة
                const target = parseInt(counter.getAttribute('data-target').replace(/,/g, ''));
                let count = 0;
                const speed = 2000; // المدة الزمنية (مللي ثانية
                // تحديث العداد مع إضافة الفواصل للعرض
                const updateCounter = () => {
                    const increment = target / (speed / 16);
                    count += increment;
                    if (count < target) {
                        // تنسيق الرقم مع الفواصل للعرض
                        counter.textContent = Math.ceil(count).toLocaleString('en-US');
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString('en-US');
                    }
                }
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, options)
    counters.forEach(counter => {
        observer.observe(counter);
    });
});



document.addEventListener('DOMContentLoaded', function() {
    // منع الكليك يمين على الصور الموجودة مسبقًا
    const images = document.getElementsByTagName('img');
    for (let img of images) {
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }

    // مراقبة الصور التي يتم إضافتها ديناميكيًا
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'IMG') {
                        node.addEventListener('contextmenu', function(e) {
                            e.preventDefault();
                        });
                    }
                    // التحقق من الصور داخل العناصر المضافة
                    if (node.querySelectorAll) {
                        const newImages = node.querySelectorAll('img');
                        newImages.forEach(function(img) {
                            img.addEventListener('contextmenu', function(e) {
                                e.preventDefault();
                            });
                        });
                    }
                });
            }
        });
    });

    // إعداد المراقب
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});




document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btn");
  const box = document.getElementById("box234");
  const videoModal = document.getElementById("videoModal");
  const overlay = document.getElementById("ffffd");

  // دالة لإعادة تعيين الـ styles الأساسية للـ box
  function resetBoxStyles() {
    box.style.transform = "";
    box.style.opacity = "";
    box.style.transition = "";
    box.style.marginLeft = "";
    box.style.marginRight = "";
    box.style.display = "";
    box.removeAttribute("data-box-height");
    box.removeAttribute("data-original-margin");
    box.classList.remove("swiping", "closing");
  }

  // دالة لإظهار box234 مع الـ overlay
  function showBox234() {
    resetBoxStyles();
    box.classList.add("visible");
    box.setAttribute("aria-hidden", "false");
    btn.classList.add("active");

    if (window.innerWidth < 400) {
      const boxHeight = box.offsetHeight;
      const marginValue = "16px";

      box.style.transform = `translateY(${boxHeight}px)`;
      box.style.opacity = "0";
      box.style.marginLeft = "0";
      box.style.marginRight = "0";
      box.style.transition = "none";

      requestAnimationFrame(() => {
        box.style.transform = "translateY(0)";
        box.style.opacity = "1";
        box.style.marginLeft = marginValue;
        box.style.marginRight = marginValue;
        box.style.transition =
          "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-out, margin 0.4s ease-out";
      });

      box.dataset.originalMargin = marginValue;
      box.dataset.initiallyShown = "true";
      box.dataset.swipeInitialized = "true";
      startSwipeDetection();
    } else {
      box.style.transform = "";
      box.style.opacity = "1";
      box.style.transition = "opacity 0.3s ease-out";
      box.dataset.initiallyShown = "true";
    }

    if (overlay) {
      overlay.classList.add("active");
      overlay.style.display = "block";
    }
  }

  // دالة لإخفاء box234 مع الـ overlay
  function hideBox234() {
    box.classList.remove("visible");
    box.setAttribute("aria-hidden", "true");
    btn.classList.remove("active");

    if (overlay) {
      overlay.classList.remove("active");
      overlay.style.display = "none";
    }

    stopSwipeDetection();
    resetBoxStyles();
    delete box.dataset.initiallyShown;
    delete box.dataset.swipeInitialized;
  }

  // دالة للإغلاق المتحرك (سحب للأسفل واختفاء مع تقليل المargin)
  function animateClose() {
    if (box.classList.contains("closing")) return;

    const boxHeight = box.offsetHeight;
    box.dataset.boxHeight = boxHeight;
    const originalMargin = box.dataset.originalMargin || "16px";

    box.classList.add("closing");

    box.style.transform = `translateY(${boxHeight}px)`;
    box.style.opacity = "0";
    box.style.marginLeft = "0";
    box.style.marginRight = "0";
    box.style.transition =
      "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-out, margin 0.4s ease-out";

    setTimeout(() => {
      if (box.classList.contains("closing")) {
        hideBox234();
        box.classList.remove("closing");
      }
    }, 400);
  }

  // متغيرات لنظام السحب
  let startY = 0;
  let currentY = 0;
  let isSwiping = false;
  const SWIPEABLE_AREA = 50;
  const SWIPE_THRESHOLD = 20;

  // دالة لتشغيل كشف السحب
  function startSwipeDetection() {
    if (window.innerWidth >= 400) return;

    box.addEventListener("touchstart", handleTouchStart, { passive: true });
    box.addEventListener("touchmove", handleTouchMove, { passive: false });
    box.addEventListener("touchend", handleTouchEnd, { passive: true });
    box.addEventListener("mousedown", handleMouseDown);
  }

  // دالة لإيقاف كشف السحب
  function stopSwipeDetection() {
    box.removeEventListener("touchstart", handleTouchStart);
    box.removeEventListener("touchmove", handleTouchMove);
    box.removeEventListener("touchend", handleTouchEnd);
    box.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }

  // معالجة بداية اللمس
  function handleTouchStart(e) {
    if (window.innerWidth >= 400 || box.classList.contains("closing")) return;

    const touchY = e.touches[0].clientY;
    const boxRect = box.getBoundingClientRect();
    const boxTop = boxRect.top;

    if (touchY > boxTop + SWIPEABLE_AREA) return;

    startY = e.touches[0].clientY;
    isSwiping = true;
    currentY = startY;

    const boxHeight = box.offsetHeight;
    const originalMargin = box.dataset.originalMargin || "16px";
    box.dataset.boxHeight = boxHeight;
    box.dataset.originalMargin = originalMargin;
    box.dataset.currentMargin = originalMargin;

    box.classList.add("swiping");
    box.dataset.originalTransition = box.style.transition;
  }

  // معالجة حركة اللمس
  function handleTouchMove(e) {
    if (
      !isSwiping ||
      window.innerWidth >= 400 ||
      box.classList.contains("closing")
    )
      return;

    e.preventDefault();

    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
      const boxHeight = parseFloat(box.dataset.boxHeight) || box.offsetHeight;
      const originalMargin = box.dataset.originalMargin || "16px";
      const translateY = Math.min(deltaY, boxHeight);
      const marginPercentage = 1 - translateY / boxHeight;
      const currentMargin = Math.max(marginPercentage * 16, 0);

      box.style.transform = `translateY(${translateY}px)`;
      box.style.marginLeft = `${currentMargin}px`;
      box.style.marginRight = `${currentMargin}px`;
      box.style.transition = "none";
      box.style.opacity = Math.max(1 - deltaY / boxHeight, 0);
      box.dataset.currentMargin = `${currentMargin}px`;
    }
  }

  // معالجة انتهاء اللمس
  function handleTouchEnd(e) {
    if (
      !isSwiping ||
      window.innerWidth >= 400 ||
      box.classList.contains("closing")
    )
      return;

    isSwiping = false;
    const deltaY = currentY - startY;
    const boxHeight = parseFloat(box.dataset.boxHeight) || box.offsetHeight;
    const originalMargin = box.dataset.originalMargin || "16px";
    const swipePercentage = (deltaY / boxHeight) * 100;

    box.style.transition =
      box.dataset.originalTransition ||
      "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-out, margin 0.3s ease-out";

    if (swipePercentage > SWIPE_THRESHOLD) {
      animateClose();
    } else {
      box.style.transform = "translateY(0)";
      box.style.opacity = "1";
      box.style.marginLeft = originalMargin;
      box.style.marginRight = originalMargin;
      box.classList.remove("swiping");
    }

    startY = 0;
    currentY = 0;
    delete box.dataset.originalTransition;
  }

  // معالجات الماوس
  function handleMouseDown(e) {
    if (window.innerWidth >= 400 || box.classList.contains("closing")) return;

    const mouseY = e.clientY;
    const boxRect = box.getBoundingClientRect();
    const boxTop = boxRect.top;

    if (mouseY > boxTop + SWIPEABLE_AREA) return;

    startY = e.clientY;
    isSwiping = true;
    currentY = startY;

    const boxHeight = box.offsetHeight;
    const originalMargin = box.dataset.originalMargin || "16px";
    box.dataset.boxHeight = boxHeight;
    box.dataset.originalMargin = originalMargin;
    box.dataset.currentMargin = originalMargin;

    box.dataset.originalTransition = box.style.transition;
    box.classList.add("swiping");

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  }

  function handleMouseMove(e) {
    if (
      !isSwiping ||
      window.innerWidth >= 400 ||
      box.classList.contains("closing")
    )
      return;

    currentY = e.clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
      const boxHeight = parseFloat(box.dataset.boxHeight) || box.offsetHeight;
      const originalMargin = box.dataset.originalMargin || "16px";
      const translateY = Math.min(deltaY, boxHeight);
      const marginPercentage = 1 - translateY / boxHeight;
      const currentMargin = Math.max(marginPercentage * 16, 0);

      box.style.transform = `translateY(${translateY}px)`;
      box.style.marginLeft = `${currentMargin}px`;
      box.style.marginRight = `${currentMargin}px`;
      box.style.transition = "none";
      box.style.opacity = Math.max(1 - deltaY / boxHeight, 0);
      box.dataset.currentMargin = `${currentMargin}px`;
    }
  }

  function handleMouseUp(e) {
    if (
      !isSwiping ||
      window.innerWidth >= 400 ||
      box.classList.contains("closing")
    )
      return;

    isSwiping = false;
    const deltaY = currentY - startY;
    const boxHeight = parseFloat(box.dataset.boxHeight) || box.offsetHeight;
    const originalMargin = box.dataset.originalMargin || "16px";
    const swipePercentage = (deltaY / boxHeight) * 100;

    box.style.transition =
      box.dataset.originalTransition ||
      "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-out, margin 0.3s ease-out";

    if (swipePercentage > SWIPE_THRESHOLD) {
      animateClose();
    } else {
      box.style.transform = "translateY(0)";
      box.style.opacity = "1";
      box.style.marginLeft = originalMargin;
      box.style.marginRight = originalMargin;
      box.classList.remove("swiping");
    }

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    startY = 0;
    currentY = 0;
    delete box.dataset.originalTransition;
  }

  // عند النقر على الزر
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (
      box.classList.contains("visible") ||
      box.classList.contains("closing")
    ) {
      if (box.classList.contains("closing")) {
        box.classList.remove("closing");
        box.style.transition = "none";
        hideBox234();
        setTimeout(() => {
          box.style.transition = "";
        }, 50);
      } else {
        hideBox234();
      }
    } else {
      showBox234();
    }
  });

  // إضافة event listener للـ overlay
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        if (box.classList.contains("closing")) {
          box.classList.remove("closing");
          box.style.transition = "none";
          hideBox234();
          setTimeout(() => {
            box.style.transition = "";
          }, 50);
        } else {
          hideBox234();
        }
      }
    });

    overlay.addEventListener(
      "touchstart",
      (e) => {
        if (e.target === overlay) {
          if (box.classList.contains("closing")) {
            box.classList.remove("closing");
            box.style.transition = "none";
            hideBox234();
            setTimeout(() => {
              box.style.transition = "";
            }, 50);
          } else {
            hideBox234();
          }
        }
      },
      { passive: true }
    );
  }

  // مراقبة تغيير حجم الشاشة
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (box.classList.contains("closing")) return;

      if (window.innerWidth >= 400) {
        stopSwipeDetection();
        if (box.classList.contains("visible")) {
          resetBoxStyles();
          box.style.opacity = "1";
          box.style.transform = "";
          box.style.marginLeft = "";
          box.style.marginRight = "";
          box.style.transition = "opacity 0.3s ease-out";
          delete box.dataset.originalMargin;
          delete box.dataset.swipeInitialized;
        }
      } else if (window.innerWidth < 400 && box.classList.contains("visible")) {
        if (!box.dataset.swipeInitialized) {
          startSwipeDetection();
          box.dataset.swipeInitialized = "true";
        }

        if (!box.dataset.initiallyShown) {
          const boxHeight = box.offsetHeight;
          const marginValue = "16px";
          box.dataset.originalMargin = marginValue;
          box.dataset.initiallyShown = "true";

          box.style.transform = `translateY(${boxHeight}px)`;
          box.style.opacity = "0";
          box.style.marginLeft = "0";
          box.style.marginRight = "0";
          box.style.transition = "none";

          requestAnimationFrame(() => {
            box.style.transform = "translateY(0)";
            box.style.opacity = "1";
            box.style.marginLeft = marginValue;
            box.style.marginRight = marginValue;
            box.style.transition =
              "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-out, margin 0.4s ease-out";
          });
        }
      }
    }, 100);
  });

  // مراقبة ظهور videoModal
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const isVideoModalVisible =
          videoModal.classList.contains("show") ||
          videoModal.style.display === "block" ||
          videoModal.style.visibility === "visible";

        if (isVideoModalVisible) {
          if (box.classList.contains("closing")) {
            box.classList.remove("closing");
            box.style.transition = "none";
            hideBox234();
            setTimeout(() => {
              box.style.transition = "";
            }, 50);
          } else {
            hideBox234();
          }
        }
      }
    });
  });

  observer.observe(videoModal, {
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  // مراقبة display style
  const styleObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "style"
      ) {
        const computedStyle = window.getComputedStyle(videoModal);
        const isVideoModalVisible =
          computedStyle.display !== "none" &&
          computedStyle.visibility !== "hidden";

        if (isVideoModalVisible) {
          if (box.classList.contains("closing")) {
            box.classList.remove("closing");
            box.style.transition = "none";
            hideBox234();
            setTimeout(() => {
              box.style.transition = "";
            }, 50);
          } else {
            hideBox234();
          }
        }
      }
    });
  });

  styleObserver.observe(videoModal, {
    attributes: true,
    attributeFilter: ["style"],
  });
});





document.addEventListener("DOMContentLoaded", function () {
      const darkBtn = document.getElementById("darkModeBtn");
      const body = document.body;

      // دالة لتحديث شكل الزر
      function updateButton() {
        if (body.classList.contains("body-dark")) {
          darkBtn.innerHTML = '<icon class="icon">sun</icon>'; // نهاري
        } else {
          darkBtn.innerHTML = '<icon class="icon">moon</icon>'; // ليلي
        }
      }

      // تحقق من LocalStorage
      const savedTheme = localStorage.getItem("theme");

      if (savedTheme) {
        if (savedTheme === "dark") {
          body.classList.add("body-dark");
        }
      } else {
        // إذا لم يوجد حفظ، نتبع تفضيل النظام
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          body.classList.add("body-dark");
        }
      }

      // تحديث الزر عند تحميل الصفحة
      updateButton();

      // عند الضغط على الزر
      darkBtn.addEventListener("click", () => {
        body.classList.toggle("body-dark");

        // حفظ الحالة
        if (body.classList.contains("body-dark")) {
          localStorage.setItem("theme", "dark");
        } else {
          localStorage.setItem("theme", "light");
        }

        // تحديث الزر
        updateButton();
      });
    });
