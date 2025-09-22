function applyWaveEffect(btn) {
  let ripple = null;

  const create = (e) => {
    // منع التأثير عند النقر بالزر الأيمن
    if (e.button === 2) return;

    if (ripple) return;

    try {
      const r = btn.getBoundingClientRect();
      const s = Math.max(r.width, r.height) * 0.5;

      // دعم إحداثيات اللمس
      let clientX = e.clientX || 0,
        clientY = e.clientY || 0;
      
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX || 0;
        clientY = e.touches[0].clientY || 0;
      }

      // تعديل هنا لجعل الموجة تبدأ من 80% من الارتفاع
      const startFromTopPercentage = 0.8; // 80%
      
      ripple = Object.assign(document.createElement("span"), {
        className: "ripple",
        style: `width:${s}px;height:${s}px;left:${
          clientX - r.left - s / 2
        }px;top:${(clientY - r.top - s / 2) * startFromTopPercentage}px`,
      });

      // التأكد من أن btn لا يزال موجوداً قبل إضافته
      if (btn && btn.parentNode) {
        btn.appendChild(ripple);
        requestAnimationFrame(() => {
          if (ripple && ripple.classList) {
            ripple.classList.add("expand");
          }
        });
      }
    } catch (error) {
      console.warn('Error creating ripple effect:', error);
      ripple = null;
    }
  };

  const release = () => {
    if (!ripple) return;
    
    try {
      const current = ripple;
      ripple = null;
      
      if (current && current.classList) {
        setTimeout(() => {
          if (current && current.classList) {
            current.classList.add("fade-out");
            
            // إزالة المستمع بعد الانتهاء من التحول
            const transitionEndHandler = () => {
              if (current && current.parentNode) {
                current.remove();
              }
            };
            
            current.addEventListener("transitionend", transitionEndHandler, { once: true });
            
            // تنظيف المستمع في حال لم يتم تشغيل transitionend
            setTimeout(() => {
              current.removeEventListener("transitionend", transitionEndHandler);
              if (current && current.parentNode) {
                current.remove();
              }
            }, 1000);
          }
        }, 400);
      }
    } catch (error) {
      console.warn('Error in release ripple effect:', error);
      if (ripple && ripple.parentNode) {
        ripple.remove();
      }
      ripple = null;
    }
  };

  // إزالة أي مستمعين سابقين لتجنب التكرار
  const removeExistingListeners = (element, events) => {
    events.forEach(event => {
      const newEvent = event.replace('touch', 'pointer').replace('mouse', 'pointer');
      element.removeEventListener(event, create);
      element.removeEventListener(newEvent, create);
    });
  };

  // إضافة منع النقر الأيمن إلى الأحداث
  const startEvents = ["mousedown", "touchstart"];
  const endEvents = ["mouseup", "touchend", "mouseleave", "touchcancel"];
  
  startEvents.forEach((event) => {
    // إزالة المستمع القديم أولاً
    btn.removeEventListener(event, create);
    btn.addEventListener(event, create, { passive: true });
  });
  
  endEvents.forEach((event) => {
    // إزالة المستمع القديم أولاً
    btn.removeEventListener(event, release);
    btn.addEventListener(event, release, { passive: true });
  });

  // منع قائمة السياق عند النقر بالزر الأيمن (اختياري)
  btn.addEventListener("contextmenu", (e) => {
    // e.preventDefault(); // يمنع فتح قائمة السياق إذا أردت
  }, { passive: true });
}

// تطبيق التأثير على الأزرار الموجودة حال التحميل
document.addEventListener("DOMContentLoaded", function () {
  try {
    document.querySelectorAll(".Wave-cloud").forEach(btn => {
      if (btn && !btn._waveEffectApplied) {
        applyWaveEffect(btn);
        btn._waveEffectApplied = true; // علامة لمنع التطبيق المزدوج
      }
    });
  } catch (error) {
    console.warn('Error applying wave effect on load:', error);
  }
});

// مراقبة DOM لتطبيق التأثير على الأزرار الجديدة
const observer = new MutationObserver((mutations) => {
  try {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          // إذا كانت العقدة عنصرًا وتحوي أزرار Wave-cloud
          if (node.nodeType === 1) {
            // التحقق من العنصر نفسه
            if (node.classList && node.classList.contains("Wave-cloud") && !node._waveEffectApplied) {
              applyWaveEffect(node);
              node._waveEffectApplied = true;
            }

            // التحقق من العناصر الفرعية أيضًا
            if (node.querySelectorAll) {
              const waveButtons = node.querySelectorAll(".Wave-cloud");
              waveButtons.forEach(btn => {
                if (btn && !btn._waveEffectApplied) {
                  applyWaveEffect(btn);
                  btn._waveEffectApplied = true;
                }
              });
            }
          }
        });
      }
    });
  } catch (error) {
    console.warn('Error in MutationObserver:', error);
  }
});

// بدء المراقبة على body مع مراقبة العناصر الفرعية
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
} else {
  // في حالة عدم وجود body بعد
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  });
}

// تنظيف عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
  observer.disconnect();
});
