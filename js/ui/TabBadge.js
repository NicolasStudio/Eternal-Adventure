/* ==========================================================
   AVISO NA ABA DO NAVEGADOR (estilo WhatsApp)
   Aba normal: "(3) Eternal Adventure - Idle". Aba fixada só mostra o
   ícone, então o número também é desenhado em cima do favicon
   (bolinha vermelha no canto). Com 0, volta tudo ao original.
========================================================== */

const ICON_SIZE = 64;

const baseTitle = document.title;
const faviconLink = document.querySelector('link[rel="icon"]');
const baseFaviconHref = faviconLink?.getAttribute("href") ?? null;

let baseImage = null;
let currentCount = 0;

// Carrega o favicon original uma vez só — cada atualização só redesenha
// a bolinha em cima dele.
function loadBaseImage() {

    if (baseImage || !baseFaviconHref) return Promise.resolve(baseImage);

    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => { baseImage = img; resolve(img); };
        img.onerror = () => resolve(null);
        img.src = baseFaviconHref;
    });

}

async function drawFavicon(count) {

    if (!faviconLink) return;

    if (count === 0) {
        faviconLink.setAttribute("href", baseFaviconHref);
        return;
    }

    const img = await loadBaseImage();

    // Outra atualização chegou enquanto a imagem carregava — ela que manda.
    if (count !== currentCount) return;

    const canvas = document.createElement("canvas");
    canvas.width = ICON_SIZE;
    canvas.height = ICON_SIZE;
    const ctx = canvas.getContext("2d");

    if (img) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, ICON_SIZE, ICON_SIZE);
    }

    const text = count > 9 ? "9+" : String(count);
    const radius = ICON_SIZE * 0.3;
    const cx = ICON_SIZE - radius;
    const cy = radius;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#e53935";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${text.length > 1 ? 24 : 32}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, cy + 2);

    faviconLink.setAttribute("href", canvas.toDataURL("image/png"));

}

export default class TabBadge {

    static set(count) {

        count = Math.max(0, count | 0);

        if (count === currentCount) return;

        currentCount = count;

        document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;

        drawFavicon(count);

    }

}
