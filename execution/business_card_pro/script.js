// Globals
const { jsPDF } = window.jspdf;
const CARD_W = 90; // Standard mm
const CARD_H = 50; // Standard mm
const SCALE = 8; // Multiplier for canvas rendering quality

// State
let state = {
    name: 'Jan Kowalski',
    title: 'Specjalista ds. IT',
    phone: '+48 123 456 789',
    email: 'j.kowalski@mptech.eu',
    addr1: 'ul. Nowogrodzka 31',
    addr2: '00-511 Warszawa',
    nip: '123-456-78-90',
    bleed: 3,
    uvName: true,
    uvLogo: true,
    viewMode: 'front' // 'front', 'uv', 'back'
};

// DOM Elements
const inputs = {
    name: document.getElementById('input-name'),
    title: document.getElementById('input-title'),
    phone: document.getElementById('input-phone'),
    email: document.getElementById('input-email'),
    addr1: document.getElementById('input-address1'),
    addr2: document.getElementById('input-address2'),
    nip: document.getElementById('input-nip'),
    bleed: document.getElementById('input-bleed'),
    uvName: document.getElementById('uv-name'),
    uvLogo: document.getElementById('uv-logo')
};

const ui = {
    btnFront: document.getElementById('btn-view-front'),
    btnUv: document.getElementById('btn-view-uv'),
    btnBack: document.getElementById('btn-view-back'),
    dimInfo: document.getElementById('dimensions-info'),
    svgContainer: document.getElementById('svg-container'),
    downloadBtn: document.getElementById('btn-download')
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    // Attach listeners
    Object.keys(inputs).forEach(key => {
        inputs[key].addEventListener('input', (e) => {
            if (e.target.type === 'checkbox') state[key] = e.target.checked;
            else if (e.target.type === 'number') state[key] = parseFloat(e.target.value) || 0;
            else state[key] = e.target.value;
            renderPreview();
        });
    });

    ui.btnFront.addEventListener('click', () => setViewMode('front'));
    ui.btnUv.addEventListener('click', () => setViewMode('uv'));
    ui.btnBack.addEventListener('click', () => setViewMode('back'));

    ui.downloadBtn.addEventListener('click', generatePRO_PDF);

    renderPreview();
});

function setViewMode(mode) {
    state.viewMode = mode;
    [ui.btnFront, ui.btnUv, ui.btnBack].forEach(b => b.classList.remove('active'));
    if (mode === 'front') ui.btnFront.classList.add('active');
    if (mode === 'uv') ui.btnUv.classList.add('active');
    if (mode === 'back') ui.btnBack.classList.add('active');
    renderPreview();
}

function buildSVG(side, isUV) {
    const w = CARD_W + (state.bleed * 2);
    const h = CARD_H + (state.bleed * 2);
    const bl = state.bleed;
    
    // Base Colors
    const primaryBlue = "#009FE3";
    const primaryDark = "#1D1D1B";
    const bgWhite = "#FFFFFF";

    let bgFill = isUV ? "#000000" : bgWhite;
    let svg = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="width: 100%; max-height: 400px;" xmlns="http://www.w3.org/2000/svg">`;
    
    if (side === 'back') {
        bgFill = isUV ? "#000000" : primaryBlue;
    }
    
    svg += `<rect width="${w}" height="${h}" fill="${bgFill}" />`;
    
    // Safe Area Container
    svg += `<g transform="translate(${bl}, ${bl})" font-family="Montserrat, sans-serif">`;

    if (side === 'front') {
        // Logo
        const logoColorMP = isUV && state.uvLogo ? "#FF00FF" : (isUV ? "none" : primaryBlue);
        const logoColorTech = isUV && state.uvLogo ? "#FF00FF" : (isUV ? "none" : primaryDark);
        
        if (!isUV || state.uvLogo) {
            svg += `
            <g transform="translate(5, 8)">
                <text font-weight="700" font-size="7" fill="${logoColorMP}">mP<tspan fill="${logoColorTech}">Tech</tspan></text>
            </g>`;
        }

        // Name & Title
        const nameColor = isUV && state.uvName ? "#FF00FF" : (isUV ? "none" : primaryDark);
        const titleColor = isUV ? "none" : primaryDark; // Title not UV mapped explicitly here

        if (!isUV || state.uvName) {
            svg += `<text x="5" y="24" font-weight="700" font-size="4" fill="${nameColor}">${state.name}</text>`;
        }
        if (!isUV) {
            svg += `<rect x="5" y="26" width="15" height="0.5" fill="${primaryBlue}" />`;
            svg += `<text x="5" y="30" font-weight="300" font-size="2.5" text-transform="uppercase" letter-spacing="0.5" fill="${titleColor}">${state.title}</text>`;
        }

        // Contact Info Layout (2 cols)
        if (!isUV) {
            svg += `<g transform="translate(5, 38)" font-weight="400" font-size="2.2" fill="${primaryDark}">
                <!-- Left Col: Address & NIP -->
                <text x="0" y="0"><tspan font-weight="600" fill="${primaryBlue}">A: </tspan>${state.addr1}</text>
                <text x="3.5" y="3.5">${state.addr2}</text>
                <text x="0" y="8"><tspan font-weight="600" fill="${primaryBlue}">NIP: </tspan>${state.nip}</text>
                
                <!-- Right Col: Phone & Email -->
                <text x="45" y="0"><tspan font-weight="600" fill="${primaryBlue}">T: </tspan>${state.phone}</text>
                <text x="45" y="3.5"><tspan font-weight="600" fill="${primaryBlue}">E: </tspan>${state.email}</text>
            </g>`;
        }

    } else if (side === 'back') {
        // Back side just has white logo, or Magenta for mask
        const logoColorMP = isUV && state.uvLogo ? "#FF00FF" : (isUV ? "none" : bgWhite);
        const logoColorTech = isUV && state.uvLogo ? "#FF00FF" : (isUV ? "none" : primaryDark);
        
        if (!isUV || state.uvLogo) {
            // centered logo
            svg += `
            <g transform="translate(45, 26)" text-anchor="middle">
                <text font-weight="700" font-size="12" fill="${logoColorMP}">mP<tspan fill="${logoColorTech}">Tech</tspan></text>
            </g>
            <g transform="translate(45, 32)" text-anchor="middle">
                 <text font-weight="400" font-size="2.5" fill="${logoColorMP}" letter-spacing="1">www.mptech.eu</text>
            </g>`;
        }
    }

    svg += `</g>`; // End safe area

    // Draw Bleed Guidelines if NOT rendering for PDF (Preview only)
    if (!isUV && window.__PREVIEW_MODE__) {
        svg += `
        <rect x="${bl}" y="${bl}" width="${CARD_W}" height="${CARD_H}" fill="none" stroke="rgba(255,0,0,0.5)" stroke-width="0.2" stroke-dasharray="1,1" />
        <text x="${w/2}" y="3" text-anchor="middle" font-size="1.5" fill="red" opacity="0.5">--- LINIA CIĘCIA (${CARD_W}x${CARD_H}mm) ---</text>
        `;
    }

    svg += `</svg>`;
    return svg;
}

function renderPreview() {
    window.__PREVIEW_MODE__ = true;
    const w = CARD_W + (state.bleed * 2);
    const h = CARD_H + (state.bleed * 2);
    ui.dimInfo.innerText = `Rozmiar ze spadem: ${w}x${h} mm | Cięcie: ${CARD_W}x${CARD_H} mm`;

    let side = state.viewMode === 'back' ? 'back' : 'front';
    let isUV = state.viewMode === 'uv';

    const svgString = buildSVG(side, isUV);
    ui.svgContainer.innerHTML = svgString;
}

// Converts SVG string to Canvas then to PNG data URL
async function svgToPng(svgStr, w, h) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = w * SCALE; 
        canvas.height = h * SCALE;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => { 
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url); 
            resolve(canvas.toDataURL('image/png', 1.0));
        };
        img.src = url;
    });
}

async function generatePRO_PDF() {
    const btn = ui.downloadBtn;
    const prevText = btn.innerText;
    btn.innerText = "Trwa Generowanie (DTP)...";
    btn.disabled = true;

    try {
        window.__PREVIEW_MODE__ = false; // Disable bleed lines
        const w = CARD_W + (state.bleed * 2);
        const h = CARD_H + (state.bleed * 2);

        // 4 pages: Front CMYK, Front UV, Back CMYK, Back UV
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [w, h] });

        const pages = [
            { side: 'front', uv: false },
            { side: 'front', uv: true },
            { side: 'back', uv: false },
            { side: 'back', uv: true }
        ];

        for (let i = 0; i < pages.length; i++) {
            const svgStr = buildSVG(pages[i].side, pages[i].uv);
            const pngData = await svgToPng(svgStr, w, h);
            
            doc.addImage(pngData, 'PNG', 0, 0, w, h);
            if (i < pages.length - 1) doc.addPage();
        }

        const pdfBlob = doc.output('blob');
        const filename = `Wizytowka_PRO_${state.name.replace(/\s+/g, '_')}.pdf`;

        // Modern Save As API
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'Wizytówka DTP (PDF)',
                        accept: { 'application/pdf': ['.pdf'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(pdfBlob);
                await writable.close();
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Save failed:', err);
            }
        } else {
            // Fallback
            doc.save(filename);
        }
    } catch (e) {
        console.error("Generator Error:", e);
        alert("Wystąpił błąd podczas generowania.");
    } finally {
        window.__PREVIEW_MODE__ = true; // turn back on
        btn.innerText = prevText;
        btn.disabled = false;
        renderPreview(); // restore view
    }
}
