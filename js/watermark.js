// Marca d'água diagonal repetida (prévia). No back-end real, aplique isso no servidor.
export const mark = (src, text) => new Promise(res => {
    const i = new Image(); i.onload = () => {
        const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0);
        const fs = Math.max(16, c.width / 22); x.font = `500 ${fs}px Manrope,sans-serif`; x.fillStyle = 'rgba(255,255,255,.34)'; x.strokeStyle = 'rgba(0,0,0,.2)'; x.textAlign = 'center';
        x.save(); x.translate(c.width / 2, c.height / 2); x.rotate(-Math.PI / 7); const step = fs * 4, tw = x.measureText(text).width + fs * 2, R = Math.hypot(c.width, c.height) / 2; let k = 0;
        for (let y = -R; y < R; y += step, k++)for (let X = -R + (k % 2 ? tw / 2 : 0); X < R; X += tw) { x.strokeText(text, X, y); x.fillText(text, X, y) }
        x.restore(); res(c.toDataURL('image/jpeg', .7))
    }; i.src = src
});
