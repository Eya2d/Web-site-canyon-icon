function applyWaveEffect(btn) {
  let ripple = null;

  const create = (e) => {
    // منع التأثير عند النقر بالزر الأيمن
    if (e.button === 2) return;

    if (ripple) return;

    const r = btn.getBoundingClientRect();
    const s = Math.max(r.width, r.height) * 0.5;

    // دعم إحداثيات اللمس
    let clientX = e.clientX,
      clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // تعديل هنا لجعل الموجة تبدأ من 80% من الارتفاع
    const startFromTopPercentage = 0.8; // 80%
    ripple = Object.assign(document.createElement("span"), {
      className: "ripple",
      style: `width:${s}px;height:${s}px;left:${
        clientX - r.left - s / 2
      }px;top:${(clientY - r.top - s / 2) * startFromTopPercentage}px`,
    });

    btn.appendChild(ripple);
    requestAnimationFrame(() => ripple.classList.add("expand"));
  };

  const release = () => {
    if (!ripple) return;
    const current = ripple;
    ripple = null;
    setTimeout(() => {
      current.classList.add("fade-out");
      current.addEventListener(
        "transitionend",
        () => {
          if (current.parentNode) current.remove();
        },
        { once: true }
      );
    }, 400);
  };

  // إضافة منع النقر الأيمن إلى الأحداث
  ["mousedown", "touchstart"].forEach((e) => btn.addEventListener(e, create));
  ["mouseup", "touchend", "mouseleave", "touchcancel"].forEach((e) =>
    btn.addEventListener(e, release)
  );

  // منع قائمة السياق عند النقر بالزر الأيمن (اختياري)
  btn.addEventListener("contextmenu", (e) => {
    // e.preventDefault(); // يمنع فتح قائمة السياق إذا أردت
  });
}

// تطبيق التأثير على الأزرار الموجودة حال التحميل
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".Wave-cloud").forEach(applyWaveEffect);
});

// مراقبة DOM لتطبيق التأثير على الأزرار الجديدة
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      // إذا كانت العقدة عنصرًا وتحوي أزرار Wave-cloud
      if (node.nodeType === 1) {
        if (node.classList && node.classList.contains("Wave-cloud")) {
          applyWaveEffect(node);
        }

        // التحقق من العناصر الفرعية أيضًا
        const waveButtons = node.querySelectorAll
          ? node.querySelectorAll(".Wave-cloud")
          : [];
        waveButtons.forEach(applyWaveEffect);
      }
    });
  });
});

// بدء المراقبة على body مع مراقبة العناصر الفرعية
observer.observe(document.body, {
  childList: true,
  subtree: true,
});