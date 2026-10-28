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
  root.MenuLogic = { defaultMenus, validateMenu, validStoredMenus, filterMenus, targetRotation };
})(globalThis);
