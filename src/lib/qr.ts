import QRCode from "qrcode";

const LOGO_SRC = "/logo-ailo.png";
// The logo file has the AILO wordmark under the emblem, which would be
// unreadable at QR size. Crop to the emblem (fractions of the image).
const CROP = { x: 0.222, y: 0.153, size: 0.556 };
// Logo takes ~22% of the QR width, well within level-H error correction.
const LOGO_RATIO = 0.22;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/** Renders a QR code as a PNG data URL with the AILO emblem in the center. */
export async function makeQrWithLogo(text: string, size = 512): Promise<string> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  try {
    const logo = await loadImage(LOGO_SRC);
    const box = Math.round(canvas.width * LOGO_RATIO);
    const pad = Math.round(box * 0.12);
    const x = Math.round((canvas.width - box) / 2);
    const y = Math.round((canvas.height - box) / 2);

    // White rounded backing so the modules around the logo stay scannable.
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(x - pad, y - pad, box + pad * 2, box + pad * 2, pad * 1.5);
    ctx.fill();

    const s = logo.naturalWidth;
    ctx.drawImage(logo, CROP.x * s, CROP.y * s, CROP.size * s, CROP.size * s, x, y, box, box);
  } catch {
    // Logo failed to load: still return a valid plain QR code.
  }
  return canvas.toDataURL("image/png");
}
