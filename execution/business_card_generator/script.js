document.addEventListener("DOMContentLoaded", () => {
    // Input elements
    const nameInput = document.getElementById("input-name");
    const titleInput = document.getElementById("input-title");
    const phoneInput = document.getElementById("input-phone");
    const emailInput = document.getElementById("input-email");
    const websiteInput = document.getElementById("input-website");
    const addressInput = document.getElementById("input-address");

    // Preview elements
    const namePreview = document.getElementById("preview-name");
    const titlePreview = document.getElementById("preview-title");
    const phonePreview = document.getElementById("preview-phone");
    const emailPreview = document.getElementById("preview-email");
    const websitePreview = document.getElementById("preview-website");
    const addressPreview = document.getElementById("preview-address");

    // Add event listeners for real-time updates
    const inputs = [
        { input: nameInput, preview: namePreview },
        { input: titleInput, preview: titlePreview },
        { input: phoneInput, preview: phonePreview },
        { input: emailInput, preview: emailPreview },
        { input: websiteInput, preview: websitePreview },
        { input: addressInput, preview: addressPreview }
    ];

    inputs.forEach(obj => {
        obj.input.addEventListener("input", (e) => {
            obj.preview.textContent = e.target.value;
        });
    });

    // PDF Generation Logic
    const downloadBtn = document.getElementById("btn-download");
    
    downloadBtn.addEventListener("click", () => {
        const element = document.getElementById('pdf-wrapper');
        
        // Configuration for html2pdf
        const opt = {
            margin:       0,
            filename:     `Wizytowka_${nameInput.value.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 4, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: [90, 50], orientation: 'landscape' }
        };

        // We want to generate a multi-page PDF (Front and Back)
        // html2pdf automatically handles page breaks if we set css page-break rules,
        // but here we can just create PDF explicitly or trust html2pdf to split by default.
        // For accurate 90x50 sizes, we can export the front and back as separate pages.
        
        // A simple trick to ensure front and back are on separate 90x50 pages is setting height dynamically
        // Or using jsPDF API directly. Let's use standard html2pdf and let it do its job.
        
        // Add a temporary class to fix dimensions for PDF printing
        const front = document.getElementById('card-front');
        const back = document.getElementById('card-back');
        const spacer = document.querySelector('.spacer');
        
        // Hide UI shadows/borders for print, force exact pixel sizes that map to 90x50mm
        front.style.border = 'none';
        front.style.boxShadow = 'none';
        back.style.border = 'none';
        back.style.boxShadow = 'none';
        spacer.style.display = 'none'; // hide spacer

        // Set page-break
        back.style.pageBreakBefore = 'always';

        // Wait a slight moment, then generate PDF
        setTimeout(() => {
            html2pdf().set(opt).from(element).output('blob').then(async (pdfBlob) => {
                // Restore styles
                front.style.border = '';
                front.style.boxShadow = '';
                back.style.border = '';
                back.style.boxShadow = '';
                spacer.style.display = 'block';
                back.style.pageBreakBefore = '';

                // Try to use the modern File System Access API to let the user choose the directory
                if (window.showSaveFilePicker) {
                    try {
                        const fileHandle = await window.showSaveFilePicker({
                            suggestedName: opt.filename,
                            types: [{
                                description: 'Wizytówka w formacie PDF',
                                accept: { 'application/pdf': ['.pdf'] },
                            }],
                        });
                        const writable = await fileHandle.createWritable();
                        await writable.write(pdfBlob);
                        await writable.close();
                    } catch (err) {
                        // Ignore AbortError if user closes the save dialog without saving
                        if (err.name !== 'AbortError') {
                            console.error('Save failed:', err);
                            alert('Nie udało się zapisać pliku w wybranym miejscu.');
                        }
                    }
                } else {
                    // Fallback to standard download if API is not supported
                    const url = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = opt.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            });
        }, 100);
    });
});
