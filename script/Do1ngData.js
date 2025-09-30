(function () {
    "use strict"; // Enable strict mode for better error handling

    // Data array to hold the content details
    const contentData = [
        {
            url: 'https://do1ng.com/products/web-scraper-script',
            imgSrc: 'https://do1ng.com/_next/image?url=https%3A%2F%2Fapi.do1ng.com%2Fstorage%2F928%2Flocalhost_3000_.png&w=1920&q=75',
            description: 'Key Features: Precise Data Extraction Extracts text, HTML structure, attributes, and classes from any page element using CSS selectors. Supports waiting for dynamic content with the Wait For Selector option. User-Friendly Interface A modern design with an attractive color scheme and intuitive layout. Displays results in three formats: Table, JSON, and Raw Text. Advanced Options Customizable timeout settings to prevent errors on slow-loading pages. Option to include HTML code of extracted elements. Data Export Export results to JSON and CSV formats with a single click. Element Details Viewer A detailed modal displays all attributes and HTML code of the selected element. High Performance Runs in the background using Puppeteer for efficient data extraction, even from complex pages. Supports security configurations like `--no-sandbox` for compatibility across different servers. How It Works? Enter the website URL and the CSS selector for the data you want to extract. Adjust advanced settings if needed. Click Scrape Now to begin extraction. View results or download them in your preferred format. Technologies Used: Backend: Node.js, Express.js, Puppeteer Frontend: HTML5, CSS3, Vanilla JavaScript Formats: JSON, CSV',
            price: '$7.00',
            iconSrc: 'image/apple-icon-180.webp'
        },
        {
            url: 'https://do1ng.com/products/sign-in-&-sign-up-(1)',
            imgSrc: 'https://do1ng.com/_next/image?url=https%3A%2F%2Fapi.do1ng.com%2Fstorage%2F1136%2Fsnap2-(1).png&w=1920&q=75',
            description: 'The login interface is smooth and simple with cheerful colors.',
            price: '$7.00',
            iconSrc: 'image/apple-icon-180.webp'
        },
        {
            url: 'https://do1ng.com/products/cloud-core',
            imgSrc: 'https://do1ng.com/_next/image?url=https%3A%2F%2Fapi.do1ng.com%2Fstorage%2F1093%2FScreenshot-2025-08-11-092634.png&w=1920&q=75',
            description: 'At [Cloud Core], we work to provide innovative technology solutions that help businesses and individuals...',
            price: '$7.00',
            iconSrc: 'image/apple-icon-180.webp'
        },
        {
            url: 'https://do1ng.com/products/canyon-icon-gallery',
            imgSrc: 'https://do1ng.com/_next/image?url=https%3A%2F%2Fapi.do1ng.com%2Fstorage%2F1205%2Fimage.webp&w=1920&q=75',
            description: 'Gallery of more than 1500 icons',
            price: '$7.00',
            iconSrc: 'image/apple-icon-180.webp'
        },
        {
            url: 'https://do1ng.com/products/language-list-of-more-than-100-languages',
            imgSrc: 'https://do1ng.com/_next/image?url=https%3A%2F%2Fapi.do1ng.com%2Fstorage%2F1169%2Fimage-(1).png&w=1920&q=75',
            description: 'List of languages: More than 100 languages. We do not support Hebrew.',
            price: '$7.99',
            iconSrc: 'image/apple-icon-180.webp'
        }
    ];

    // Function to generate HTML content dynamically
    function generateContent() {
        const container = document.getElementById('content-container2');
        
        // Check if container exists
        if (!container) {
            console.error('Error: Container with ID "content-container2" not found.');
            return;
        }

        // Clear container to prevent duplicate content
        container.innerHTML = '';

        // Generate content for each item
        contentData.forEach(item => {
            // Validate item data
            if (!item.url || !item.imgSrc || !item.description || !item.price || !item.iconSrc) {
                console.warn('Invalid data for item:', item);
                return;
            }

            const div = document.createElement('div');
            div.className = 'mbvideo-d';
            div.addEventListener('click', () => window.open(item.url, '_blank'));
            div.innerHTML = `
                <div class="mbvideo-im Wave-cloud">
                    <img src="${item.imgSrc}" alt="Product image" loading="lazy">
                </div>
                <div class="description">
                    <div class="eerr444">
                        <img src="${item.iconSrc}" alt="Icon" loading="lazy">
                        <div class="ffr544">
                            <txt class="video-description" title="${item.description.replace(/"/g, '&quot;')}">${item.description}</txt>
                            <div class="channel-name">${item.price}</div>
                        </div>
                    </div>
                    <a>Code</a>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Initialize when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function () {
        try {
            generateContent();
        } catch (error) {
            console.error('Error generating content:', error);
        }
    });
})();
