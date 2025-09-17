document.addEventListener('DOMContentLoaded', function() {
    // تعريف الكائن الذي يحتوي على الكلاسات ونصوص الـ title المقابلة
    const titleMap = {
        't1': 'Open in new',
        't2': 'Close',
        't3': 'Back',
        't4': 'Forward'
    };

    // البحث عن جميع العناصر التي تحتوي على الكلاسات المحددة
    for (const [className, titleText] of Object.entries(titleMap)) {
        const elements = document.getElementsByClassName(className);
        // إضافة الـ title لكل عنصر
        Array.from(elements).forEach(element => {
            element.setAttribute('title', titleText);
        });
    }
});
