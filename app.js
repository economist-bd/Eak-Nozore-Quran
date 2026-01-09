const url = 'book.pdf'; // আপনার পিডিএফ ফাইলের নাম এখানে থাকতে হবে

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

// পেজ রেন্ডার ফাংশন
const renderPage = num => {
    pageIsRendering = true;

    // পেজ আনা
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };

        const renderTask = page.render(renderCtx);

        // রেন্ডার শেষ হলে
        renderTask.promise.then(() => {
            pageIsRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });

        // পেজ নম্বর আপডেট
        document.querySelector('#page-num').textContent = `Page: ${num}`;
    });
};

// কিউতে পেজ রাখা
const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
};

// পূর্ববর্তী পেজ
const showPrevPage = () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
};

// পরবর্তী পেজ
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
};

// পিডিএফ ডকুমেন্ট লোড করা
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    renderPage(pageNum);
}).catch(err => {
    console.error('PDF লোড করতে সমস্যা হচ্ছে: ', err);
    // অফলাইনে থাকলে ক্যাশ থেকে লোড করার লজিক এখানে যোগ করা যায়
});

// বাটন ইভেন্ট
document.querySelector('#prev-btn').addEventListener('click', showPrevPage);
document.querySelector('#next-btn').addEventListener('click', showNextPage);

// --- PWA সার্ভিস ওয়ার্কার রেজিস্টার ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registered'))
            .catch(err => console.log('Service Worker Error: ', err));
    });
}
