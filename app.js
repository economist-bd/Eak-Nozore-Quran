const url = 'book.pdf'; 

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d'),
    bookPage = document.querySelector('#book-page'); // কন্টেইনার ধরা হলো

const renderPage = num => {
    pageIsRendering = true;

    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        };
        
        const renderTask = page.render(renderCtx);

        renderTask.promise.then(() => {
            pageIsRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });

        document.querySelector('#page-num').textContent = `Page: ${num}`;
    });
};

const queueRenderPage = num => {
    if (pageIsRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
};

// --- পাতা উল্টানোর লজিক ---

const showPrevPage = () => {
    if (pageNum <= 1) return;
    
    // অ্যানিমেশন ক্লাস যোগ করা (উল্টো দিক থেকে)
    bookPage.classList.add('page-turning-back');

    setTimeout(() => {
        pageNum--;
        queueRenderPage(pageNum);
        // অ্যানিমেশন ক্লাস রিমুভ করা যাতে পাতা আবার সোজা হয়
        bookPage.classList.remove('page-turning-back');
    }, 300); // ৩০০ মিলি সেকেন্ড পর কন্টেন্ট লোড হবে (অ্যানিমেশনের অর্ধেক সময়)
};

const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;

    // অ্যানিমেশন ক্লাস যোগ করা
    bookPage.classList.add('page-turning');

    setTimeout(() => {
        pageNum++;
        queueRenderPage(pageNum);
        // অ্যানিমেশন ক্লাস রিমুভ করা
        bookPage.classList.remove('page-turning');
    }, 300); 
};

pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    renderPage(pageNum);
}).catch(err => {
    console.error('Error: ', err);
});

document.querySelector('#prev-btn').addEventListener('click', showPrevPage);
document.querySelector('#next-btn').addEventListener('click', showNextPage);

// Service Worker (আগের মতোই থাকবে)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW Registered'));
    });
}
