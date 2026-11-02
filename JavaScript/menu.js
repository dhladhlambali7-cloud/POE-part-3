const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    menu.classList.toggle('menu-open', !open);
    document.body.classList.toggle('menu-is-open', !open);
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      menu.classList.remove('menu-open');
      document.body.classList.remove('menu-is-open');
    });
  });
}