// Gera "fotografias" de paisagem proceduralmente (placeholders até haver fotos reais).
export function makeArt(seed, w = 760, h = 980) {
    let a = seed; const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    const h0 = r() * 360, sp = 40 + r() * 60;
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `hsl(${h0},45%,12%)`); g.addColorStop(.55, `hsl(${h0 + sp},65%,45%)`); g.addColorStop(1, `hsl(${h0 + sp * 1.5},80%,70%)`);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const sy = h * (.35 + r() * .2), sx = w * (.25 + r() * .5), rg = x.createRadialGradient(sx, sy, 0, sx, sy, w * .5);
    rg.addColorStop(0, 'rgba(255,240,210,.95)'); rg.addColorStop(.15, 'rgba(255,220,160,.5)'); rg.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = rg; x.fillRect(0, 0, w, h);
    for (let l = 0; l < 5; l++) {
        const base = h * (.5 + l * .12), amp = h * (.12 - l * .015), f1 = r() * .008 + .004, f2 = r() * .02 + .01, p1 = r() * 9, p2 = r() * 9;
        x.beginPath(); x.moveTo(0, h); for (let i = 0; i <= w; i += 4)x.lineTo(i, base - Math.sin(i * f1 + p1) * amp - Math.sin(i * f2 + p2) * amp * .4); x.lineTo(w, h); x.closePath();
        x.fillStyle = `hsla(${h0 + sp * .5},${40 - l * 5}%,${28 - l * 5}%,${.55 + l * .1})`; x.fill()
    }
    const d = x.getImageData(0, 0, w, h), p = d.data; for (let i = 0; i < p.length; i += 4) { const n = (r() - .5) * 18; p[i] += n; p[i + 1] += n; p[i + 2] += n } x.putImageData(d, 0, 0);
    return c.toDataURL('image/jpeg', .88)
}
