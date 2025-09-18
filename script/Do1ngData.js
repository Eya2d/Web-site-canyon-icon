// Data array to hold the content details
        const contentData = [
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
            const container = document.getElementById('content-container');
            contentData.forEach(item => {
                const div = document.createElement('div');
                div.className = 'mbvideo-d';
                div.onclick = () => window.open(item.url, '_blank');
                div.innerHTML = `
                    <div class="mbvideo-im Wave-cloud">
                        <img src="${item.imgSrc}">
                    </div>
                    <div class="description">
                        <div class="eerr444">
                            <img src="${item.iconSrc}" alt="">
                            <div class="ffr544">
                                <txt class="video-description" title="${item.description}">${item.description}</txt>
                                <div class="channel-name">${item.price}</div>
                            </div>
                        </div>
                        <a>Code</a>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        // Call the function to generate content when the page loads
        window.onload = generateContent;