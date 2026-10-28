/* 화면과 저장소에 의존하지 않는 메뉴 규칙과 룰렛 계산. */
(function (root) {
  'use strict';
  const categories = ['한식', '중식', '양식', '기타'];
  const defaultMenus = [
    { name: '김치찌개', category: '한식' }, { name: '돈가스', category: '양식' },
    { name: '칼국수', category: '한식' }, { name: '짜장면', category: '중식' },
    { name: '삼겹살', category: '한식' }, { name: '초밥', category: '기타' },
    { name: '파스타', category: '양식' }, { name: '떡볶이', category: '한식' },
    { name: '마라탕', category: '중식' }, { name: '치킨', category: '기타' }
  ];
  function validateMenu(name, category, menus) {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 10) return '메뉴 이름은 1~10자로 입력해 주세요.';
    if (!categories.includes(category)) return '메뉴 종류를 선택해 주세요.';
    if (menus.some(menu => menu.name === trimmed && menu.category === category)) return '이미 등록한 메뉴입니다.';
    return '';
  }
  function validStoredMenus(value) {
    return Array.isArray(value) && value.every(menu => menu && typeof menu.name === 'string'
      && menu.name.trim().length > 0 && menu.name.length <= 10 && categories.includes(menu.category));
  }
  function filterMenus(menus, category) {
    return menus.filter(menu => category === 'all' || menu.category === category);
  }
  function targetRotation(index, count, current) {
    const circle = Math.PI * 2;
    const target = ((-Math.PI / 2 - (index + .5) * circle / count) % circle + circle) % circle;
    const normalized = ((current % circle) + circle) % circle;
    return current + circle * 5 + ((target - normalized + circle) % circle);
  }
  const historyWindow = 30 * 24 * 60 * 60 * 1000;
  function createSampleHistory(now = Date.now()) {
    // 30일 동안 하루 한 번 사용한 예시. 방문할 때마다 다시 생성하지 않는다.
    const schedule = [0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 9, 9, 9, 1, 1, 1, 1, 1, 5, 5, 5, 5, 6, 6, 6, 2, 3, 4, 7, 8];
    return schedule.map((_, day) => ({
      ...defaultMenus[schedule[(day * 7) % schedule.length]],
      selectedAt: new Date(now - day * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true
    }));
  }
  function validHistory(value) {
    return Array.isArray(value) && value.every(entry => entry && validStoredMenus([entry])
      && typeof entry.selectedAt === 'string' && Number.isFinite(Date.parse(entry.selectedAt))
      && typeof entry.isSample === 'boolean');
  }
  function recentHistory(history, now = Date.now()) {
    return history.filter(entry => {
      const time = Date.parse(entry.selectedAt);
      return time > now - historyWindow && time <= now;
    });
  }
  function topMenus(history, now = Date.now()) {
    const counts = new Map();
    recentHistory(history, now).forEach(entry => {
      const key = JSON.stringify([entry.name, entry.category]);
      if (!counts.has(key)) counts.set(key, { name: entry.name, category: entry.category, count: 0 });
      counts.get(key).count++;
    });
    return [...counts.values()].sort((a, b) => b.count - a.count
      || a.name.localeCompare(b.name, 'ko') || a.category.localeCompare(b.category, 'ko')).slice(0, 5);
  }
  root.MenuLogic = { defaultMenus, validateMenu, validStoredMenus, filterMenus, targetRotation,
    createSampleHistory, validHistory, recentHistory, topMenus };
})(globalThis);
