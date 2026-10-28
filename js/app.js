import * as api from './api.js';
import { mark } from './watermark.js';

const $ = (s, r = document) => r.querySelector(s), brl = n => n.toLocaleString('pt-BR', { 
    style: 'currency', currency: 'BRL' 
});

const cache = new Map();

const shown = async p => {
     const ok = api.canAccess(p), k = p.id + ok; if (!cache.has(k)) cache.set(k, ok ? p.src : await mark(p.src, 'LUMIÈRE · PRÉVIA')); return cache.get(k) 
};

const toast = t => { 
    const e = $('#toast'); e.textContent = t; e.classList.add('on'); setTimeout(() => e.classList.remove('on'), 2800) 
};

const words = t => t.split(' ').map((w, i) => `
    <span class="w"><span style="--i:${i}">${w}</span></span>
    `).join(' ');

const card = p => `
    <figure class="card reveal" data-a="open" data-id="${p.id}" style="aspect-ratio:${p.ratio}">
    <img data-id="${p.id}" alt="${p.title}" draggable="false"><figcaption><span>${p.title}</span>${api.canAccess(p) ? '<em class="chip ok">Desbloqueada</em>' : `<em class="chip">${brl(p.price)}</em>`}</figcaption></figure>`;
const gallery = (label, title, list, emptyMsg) => `<section class="page"><div class="head"><div><span>${label}</span><h2>${title}</h2></div></div>${list.length ? `<div class="masonry">${list.map(card).join('')}</div>` : `<p class="empty">${emptyMsg}</p>`}</section>`;
const home = () => `
    <div class="hero"><i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i><div><small>Fotografia autoral · Edições limitadas</small><h1>${words('A luz que')} <em>${words('vale guardar.')}</em></h1><p>Explore a coleção em prévia e desbloqueie em alta resolução, sem marca d'água, apenas as imagens que tocarem você.</p><a class="btn" href="#/gallery">Explorar galeria</a></div><div class="scroll"></div></div>
    <div class="marquee"><div>${'<span>Luz</span><b>✦</b><span>Silêncio</span><b>✦</b><span>Horizonte</span><b>✦</b><span>Memória</span><b>✦</b>'.repeat(8)}</div></div>
    <section><div class="head reveal"><div><span>Como funciona</span><h2>Três gestos, uma imagem sua</h2></div></div><div class="steps reveal"><div class="step"><i>01</i><h3>Contemple</h3><p>Navegue pela galeria com prévias protegidas por marca d'água.</p></div><div class="step"><i>02</i><h3>Escolha</h3><p>Cada fotografia tem seu valor. Crie sua conta e selecione a favorita.</p></div><div class="step"><i>03</i><h3>Desbloqueie</h3><p>Pagou, liberou: a versão original aparece na hora em "Minhas fotos".</p></div></div></section>
    <section><div class="head reveal"><div><span>Destaques</span><h2>Da coleção</h2></div><a class="btn" href="#/gallery">Ver tudo</a></div><div class="masonry">${api.photos().slice(0, 6).map(card).join('')}</div></section>
    <footer><span>© 2026 LUMIÈRE</span><span>Todas as imagens protegidas</span></footer>
    `;
const mineV = () => gallery('Sua coleção', 'Minhas fotos', api.mine(), 'Você ainda não desbloqueou nenhuma fotografia.');
const admin = () => {
    const s = api.stats(); return `<section class="page"><div class="head"><div><span>Painel do administrador</span><h2>Estúdio</h2></div></div>
<div class="stats"><div><b>${brl(s.revenue)}</b><span>Faturamento</span></div><div><b>${s.sales}</b><span>Vendas</span></div><div><b>${s.photos}</b><span>Fotos</span></div><div><b>${s.users}</b><span>Clientes</span></div></div>
<div class="admin"><form class="upl" data-f="upload"><h3 class="serif" style="font-size:30px;margin-bottom:14px">Nova fotografia</h3><input type="file" name="file" accept="image/*" required><input name="title" placeholder="Título" required><input name="price" type="number" min="1" step="0.01" placeholder="Preço (R$)" required><button class="btn solid">Publicar</button></form>
<div class="rows">${api.photos().map(p => `<div class="row"><img data-id="${p.id}"><div><b class="serif" style="font-size:22px">${p.title}</b><br><small style="color:var(--mut)">Original · sem marca d'água</small></div><input type="number" value="${p.price}" data-a="price" data-id="${p.id}"><button data-a="del" data-id="${p.id}" title="Excluir">✕</button></div>`).join('')}</div></div></section>`
};
function nav() {
    const u = api.me(), h = location.hash || '#/', a = x => h === x ? 'on' : '';
    $('#nav').innerHTML = `<a class="brand" href="#/">Lumi<b>è</b>re</a><nav><a class="${a('#/gallery')}" href="#/gallery">Galeria</a>${u ? `<a class="${a('#/mine')}" href="#/mine">Minhas fotos</a>` : ''}${u?.role === 'admin' ? `<a class="${a('#/admin')}" href="#/admin">Painel</a>` : ''}${u ? `<a href="#" data-a="logout">Sair</a>` : `<a href="#" data-a="auth">Entrar</a>`}</nav>`
}
function render() {
    const h = location.hash.slice(2), u = api.me();
    if (h === 'admin' && u?.role !== 'admin' || h === 'mine' && !u) { location.hash = '#/'; return }
    nav(); $('#view').innerHTML = ({ gallery: () => gallery('Coleção completa', 'Galeria', api.photos(), ''), mine: mineV, admin }[h] || home)(); scrollTo(0, 0); hydrate()
}
function hydrate() {
    const ps = Object.fromEntries(api.photos().map(p => [p.id, p]));
    document.querySelectorAll('img[data-id]').forEach(async i => { i.src = await shown(ps[i.dataset.id]) });
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.style.transitionDelay = (Math.random() * .25) + 's', e.target.classList.add('in'), io.unobserve(e.target))), { threshold: .1 });
    document.querySelectorAll('.reveal').forEach(e => io.observe(e))
}
const modal = h => { $('#modal').innerHTML = h ? `<div class="ov" data-a="close">${h}</div>` : '' };
async function lightbox(id) {
    const p = api.photos().find(p => p.id === id), ok = api.canAccess(p), adm = api.me()?.role === 'admin', src = await shown(p);
    modal(`<div class="box lb"><button class="x" data-a="close">×</button><img src="${src}" oncontextmenu="return false"><div class="info"><small style="color:var(--gold);letter-spacing:.3em;text-transform:uppercase;font-size:11px">${adm ? 'Visão admin · original' : ok ? 'Desbloqueada' : 'Prévia protegida'}</small><h3>${p.title}</h3><p style="color:var(--mut)">Fotografia autoral em alta resolução. Após o pagamento, a versão original sem marca d'água fica disponível na sua conta.</p>${ok ? `<a class="btn solid" download="${p.title}.jpg" href="${p.src}">Baixar original</a>` : `<div class="price">${brl(p.price)}</div><button class="btn solid" data-a="buy" data-id="${p.id}">Desbloquear</button>`}</div></div>`)
}
function authModal(tab = 'login') { modal(`<div class="box"><button class="x" data-a="close">×</button><h3>${tab === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}</h3><div class="tabs"><button class="${tab === 'login' ? 'on' : ''}" data-a="tab" data-t="login">Entrar</button><button class="${tab !== 'login' ? 'on' : ''}" data-a="tab" data-t="reg">Cadastrar</button></div><form data-f="${tab}">${tab === 'login' ? '' : '<input name="name" placeholder="Nome" required>'}<input name="email" type="email" placeholder="E-mail" required><input name="pass" type="password" placeholder="Senha" required><p id="err" style="color:#e07a6a;font-size:13px;min-height:20px"></p><button class="btn solid" style="width:100%">${tab === 'login' ? 'Entrar' : 'Criar conta'}</button></form>${tab === 'login' ? '<p style="color:var(--mut);font-size:12px;margin-top:16px">Demo admin: admin@lumiere.com / admin123</p>' : ''}</div>`) }
let pending = null;
const checkout = p => modal(`<div class="box"><button class="x" data-a="close">×</button><h3>${p.title}</h3><div class="price">${brl(p.price)}</div><div class="pay"><button class="on" data-a="method">Pix</button><button data-a="method">Cartão</button></div><button class="btn solid" style="width:100%" data-a="pay" data-id="${p.id}">Confirmar pagamento</button></div>`);
document.addEventListener('click', async e => {
    const t = e.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a, id = t.dataset.id;
    if (a === 'close') { if (e.target === t || t.classList.contains('x') || t.tagName === 'A') modal(); return }
    if (a === 'open') lightbox(id);
    if (a === 'auth') { e.preventDefault(); authModal() }
    if (a === 'tab') authModal(t.dataset.t);
    if (a === 'logout') { e.preventDefault(); api.logout(); toast('Até logo!'); location.hash = '#/'; render() }
    if (a === 'buy') { const p = api.photos().find(p => p.id === id); if (!api.me()) { pending = p; authModal(); toast('Entre para continuar'); return } checkout(p) }
    if (a === 'method') { t.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('on')); t.classList.add('on') }
    if (a === 'pay') {
        const p = api.photos().find(p => p.id === id), m = $('.pay .on').textContent; t.disabled = true; t.innerHTML = '<i class="spin"></i>Processando'; await api.buy(p, m);
        $('.box').innerHTML = `<svg class="ok-svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34"/><path d="M24 41l12 12 21-24"/></svg><h3 style="text-align:center">Foto desbloqueada</h3><p style="text-align:center;color:var(--mut);margin:10px 0 24px">Seu original sem marca d'água já está disponível.</p><a class="btn solid" style="display:block;text-align:center" href="#/mine" data-a="close">Ver minhas fotos</a>`; render()
    }
    if (a === 'del' && confirm('Excluir esta foto?')) { api.remove(id); render() }
});
document.addEventListener('change', e => { const t = e.target; if (t.dataset.a === 'price') { api.setPrice(t.dataset.id, +t.value); toast('Preço atualizado') } });
document.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, k = f.dataset.f, d = Object.fromEntries(new FormData(f)), b = f.querySelector('button'); b.disabled = true;
    try {
        if (k === 'login') await api.login(d.email, d.pass); if (k === 'reg') await api.register(d.name, d.email, d.pass);
        if (k === 'upload') { await api.addPhoto(d.file, d.title, +d.price); toast('Fotografia publicada'); render(); return }
        modal(); toast('Olá, ' + api.me().name); render(); if (pending) { const p = pending; pending = null; lightbox(p.id) }
    }
    catch (err) { const er = $('#err'); if (er) er.textContent = err.message; b.disabled = false }
});
addEventListener('hashchange', render);
addEventListener('mousemove', e => { const g = $('#glow'); g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px' });
addEventListener('keydown', e => e.key === 'Escape' && modal());
render();
