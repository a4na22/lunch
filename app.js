'use strict';
const { defaultMenus, validateMenu, validStoredMenus, filterMenus, targetRotation } = MenuLogic;
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const result = document.getElementById('resultDisplay');
const notice = document.getElementById('notice');
const form = document.getElementById('menuForm');
const list = document.getElementById('menuListDisplay');
const colors = ['#ff9f43', '#ee5253', '#10ac84', '#2e86de', '#341f97', '#b33799', '#c44569', '#008891', '#3867d6', '#8854d0'];
let menus = defaultMenus.map(menu => ({ ...menu }));
let category = 'all';
let rotation = 0;
let spinning = false;
try {
  const saved = localStorage.getItem('myMenus');
  if (saved !== null) {
    const parsed = JSON.parse(saved);
    if (!validStoredMenus(parsed)) throw new Error('Invalid saved menus');
    menus = parsed;
  }
} catch {
  notice.textContent = '저장된 메뉴를 불러올 수 없어 기본 메뉴를 사용합니다.';
}
function save() {
  try { localStorage.setItem('myMenus', JSON.stringify(menus)); }
  catch { notice.textContent = '브라우저 저장을 사용할 수 없습니다. 현재 창에서는 계속 이용할 수 있습니다.'; }
}
function draw() {
  const items = filterMenus(menus, category);
  const size = canvas.width;
  const radius = size / 2;
  ctx.clearRect(0, 0, size, size);
  if (!items.length) {
    ctx.fillStyle = '#f1f3f5';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#657079'; ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('메뉴를 추가해 주세요', radius, radius);
    return;
  }
  const slice = Math.PI * 2 / items.length;
  items.forEach((menu, index) => {
    const angle = rotation + index * slice;
    ctx.beginPath(); ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 2, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = colors[index % colors.length]; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(radius, radius); ctx.rotate(angle + slice / 2);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 25px sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(menu.name, radius - 24, 0, radius - 55); ctx.restore();
  });
}
function render() {
  list.replaceChildren();
  menus.forEach((menu, index) => {
    const item = document.createElement('li'); item.className = 'menu-item';
    const label = document.createElement('span'); label.textContent = menu.name;
    const tag = document.createElement('span'); tag.className = 'menu-tag'; tag.textContent = menu.category;
    label.append(tag);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'delete-btn';
    button.textContent = '삭제'; button.setAttribute('aria-label', `${menu.name} 삭제`); button.disabled = spinning;
    button.addEventListener('click', () => {
      if (spinning) return;
      menus.splice(index, 1); result.textContent = ''; save(); render();
    });
    item.append(label, button); list.append(item);
  });
  if (!menus.length) {
    const empty = document.createElement('li'); empty.className = 'menu-item'; empty.textContent = '등록된 메뉴가 없습니다.'; list.append(empty);
  }
  spinButton.disabled = spinning || filterMenus(menus, category).length === 0;
  draw();
}
document.getElementById('categoryFilters').addEventListener('click', event => {
  const button = event.target.closest('button[data-category]');
  if (!button || spinning) return;
  category = button.dataset.category; rotation = 0; result.textContent = '';
  document.querySelectorAll('.category-btn').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));
  });
  render();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (spinning) return;
  const name = document.getElementById('newMenuName');
  const selected = document.getElementById('newMenuCategory').value;
  const error = validateMenu(name.value, selected, menus);
  notice.textContent = error;
  if (error) return;
  menus.push({ name: name.value.trim(), category: selected });
  name.value = ''; result.textContent = ''; save(); render(); name.focus();
});
spinButton.addEventListener('click', () => {
  const items = filterMenus(menus, category);
  if (spinning || !items.length) return;
  const winner = Math.floor(Math.random() * items.length);
  const from = rotation;
  const to = targetRotation(winner, items.length, from);
  spinning = true; result.textContent = '메뉴를 고르고 있어요…';
  document.querySelectorAll('.category-btn, .input-group input, .input-group select, .add-btn').forEach(control => { control.disabled = true; });
  render();
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3500;
  let started;
  function animate(now) {
    if (started === undefined) started = now;
    const progress = duration === 0 ? 1 : Math.min((now - started) / duration, 1);
    rotation = from + (to - from) * (1 - Math.pow(1 - progress, 3)); draw();
    if (progress < 1) { requestAnimationFrame(animate); return; }
    rotation %= Math.PI * 2;
    spinning = false;
    document.querySelectorAll('.category-btn, .input-group input, .input-group select, .add-btn').forEach(control => { control.disabled = false; });
    result.textContent = `오늘은 ${items[winner].name}!`; render();
  }
  requestAnimationFrame(animate);
});
render();
