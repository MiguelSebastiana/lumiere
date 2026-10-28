// Camada de dados SIMULADA (localStorage). Troque cada função por fetch() ao seu back-end.
import { makeArt } from './art.js';

const K = 'lm_', ls = (k, d) => { 
    try { 
        return JSON.parse(localStorage.getItem(K + k)) ?? d 
    } catch { 
        return d 
    } 
}, save = (k, v) => {
     try { 
        localStorage.setItem(K + k, JSON.stringify(v)) 
    } catch { 

    } };

const wait = ms => new Promise(r => setTimeout(r, ms));

    let users = ls('users', [{
     id: 1, 
     name: 'Admin', 
     email: 'admin@lumiere.com', 
     pass: 'admin123', 
     role: 'admin' 
}]), sales = ls('sales', []), uploads = ls('uploads', []), meta = ls('meta', {}), sess = ls('sess', null);

const seeds = [['Aurora do Vale', 48, 3, 980], ['Ouro sobre a Serra', 65, 11, 760], ['Névoa Silenciosa', 39, 25, 1100], ['Horizonte Âmbar', 72, 42, 820], 
            ['Último Raio', 55, 57, 1000], ['Crepúsculo Lento', 44, 68, 900], ['Maré de Cobre', 80, 79, 780], ['Cume Violeta', 60, 91, 1040]]
    .map((s, i) => ({ id: 's' + i, title: s[0], price: s[1], ratio: 760 / s[3], src: makeArt(s[2] * 37 + i, 760, s[3]) }));

export const photos = () => [...seeds, ...uploads].filter(p => !meta[p.id]?.del).map(p => (
    { ...p, price: meta[p.id]?.price ?? p.price }
));

export const me = () => users.find(u => u.id === sess) || null;

export const owned = p => !!me() && sales.some(s => s.userId === me().id && s.photoId === p.id);

export const canAccess = p => me()?.role === 'admin' || owned(p);

export const mine = () => photos().filter(owned);

export async function login(email, pass) {
     await wait(500); 

     const u = users.find(u => u.email === email.trim().toLowerCase() && u.pass === pass); 
     if (!u) throw Error('E-mail ou senha incorretos.'); 
     sess = u.id; 

     save('sess', sess) 
}

export async function register(name, email, pass) {
    await wait(600); 

    email = email.trim().toLowerCase(); 
    if (users.some(u => u.email === email)) throw Error('Este e-mail já está cadastrado.'); 

    if (pass.length < 6) throw Error('Senha com ao menos 6 caracteres.');
    const u = { 
        id: Date.now(), 
        name, 
        email, 
        pass, 
        role: 'user' 
    }; 
    
    users.push(u); 
    
    save('users', users); 
    sess = u.id; 
    save('sess', sess)
}

export const logout = () => {
     sess = null; save('sess', null) 
};

export async function buy(p, method) {
     await wait(1600); if (!me()) throw Error('Faça login.'); sales.push({ userId: me().id, 
        photoId: p.id, 
        price: p.price, 
        method, 
        date: Date.now() }); 
        save('sales', sales) 
}

export const stats = () => ({
     revenue: sales.reduce((a, s) => a + s.price, 0), sales: sales.length, photos: photos().length, users: users.filter(u => u.role !== 'admin').length 
});

export const setPrice = (id, price) => {
     meta[id] = { ...meta[id], price }; save('meta', meta) 
};

export const remove = id => { 
    meta[id] = { ...meta[id], del: true }; save('meta', meta) 
};

export const addPhoto = (file, title, price) => new Promise(res => {
    const i = new Image(); i.onload = () => {
        const s = Math.min(1, 1400 / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = i.width * s; c.height = i.height * s; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
        const p = { id: 'u' + Date.now(), title, price, ratio: c.width / c.height, src: c.toDataURL('image/jpeg', .85) }; uploads.push(p); save('uploads', uploads); res(p)
    }; i.src = URL.createObjectURL(file)
});
