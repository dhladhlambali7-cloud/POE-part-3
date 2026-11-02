// main.js - Part 3 interactivity: scroll animations, dynamic content,
// shop search/sort, accordion and gallery lightbox.
document.addEventListener('DOMContentLoaded', function () {

  // 1. Dynamic content: render "Fresh drops" on the home page from a data array
  var drops = [
    { name: 'Red Rider Tracksuit', price: 'R600', img: 'tracksuit-redrider.jpeg', alt: 'Red Rider No Crusty Vibes tracksuit' },
    { name: 'Summer Vibe Tee', price: 'R300', img: 'tee-summervibe-front.jpeg', alt: 'Summer Vibe white t-shirt with citrus graphic' },
    { name: 'Vibe Tote Bag', price: 'R100', img: 'totebag.jpeg', alt: 'No Crusty Vibes tote bag' }
  ];
  var dropsList = document.getElementById('drops-list');
  if (dropsList) {
    dropsList.innerHTML = '';
    drops.forEach(function (d) {
      var card = document.createElement('article');
      card.className = 'product-card';
      var img = document.createElement('img');
      img.src = 'Images/' + d.img; img.alt = d.alt; img.loading = 'lazy';
      var body = document.createElement('div');
      body.className = 'product-card-body';
      var h3 = document.createElement('h3'); h3.textContent = d.name;
      var p = document.createElement('p'); p.className = 'price'; p.textContent = d.price;
      body.append(h3, p); card.append(img, body); dropsList.appendChild(card);
    });
  }

  // 2. Scroll-in animation (CSS transition + IntersectionObserver)
  var targets = document.querySelectorAll('.product-card, .contact-card, .editorial-product, section h2');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });
  }

  // 3. Shop search, filter and sort
  var search = document.getElementById('product-search');
  if (search) {
    var sortSel = document.getElementById('product-sort');
    var grids = Array.from(document.querySelectorAll('.product-grid'));
    var cards = Array.from(document.querySelectorAll('.product-card'));
    var count = document.getElementById('product-count');
    var none = document.getElementById('no-results');
    cards.forEach(function (c, i) { c.dataset.order = i; });
    var price = function (c) { return parseInt(c.querySelector('.price').textContent.replace(/\D/g, ''), 10) || 0; };
    var name = function (c) { return c.querySelector('h3').textContent; };
    var update = function () {
      var q = search.value.trim().toLowerCase(), shown = 0;
      cards.forEach(function (c) { c.hidden = name(c).toLowerCase().indexOf(q) === -1; if (!c.hidden) shown++; });
      grids.forEach(function (g) {
        var items = Array.from(g.children), mode = sortSel.value;
        items.sort(function (a, b) {
          if (mode === 'low') return price(a) - price(b);
          if (mode === 'high') return price(b) - price(a);
          if (mode === 'az') return name(a).localeCompare(name(b));
          return a.dataset.order - b.dataset.order;
        }).forEach(function (c) { g.appendChild(c); });
        var section = g.closest('section');
        if (section) section.hidden = !items.some(function (c) { return !c.hidden; });
      });
      count.textContent = shown + ' piece' + (shown === 1 ? '' : 's') + ' shown';
      none.hidden = shown !== 0;
    };
    search.addEventListener('input', update);
    sortSel.addEventListener('change', update);
    update();

    // fill the product enquiry dropdown from the same cards
    var pe = document.getElementById('pe-product');
    if (pe) cards.forEach(function (c) {
      var o = document.createElement('option');
      o.value = name(c); o.textContent = name(c) + ' (' + c.querySelector('.price').textContent + ')';
      o.dataset.price = price(c); pe.appendChild(o);
    });
  }

  // 4. Accordion
  document.querySelectorAll('.accordion-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
    });
  });

  // 5. Gallery lightbox
  var gallery = document.querySelectorAll('.gallery-page .product-card img, body[data-page="gallery"] .product-card img');
  if (gallery.length) {
    var imgs = Array.from(gallery), current = 0;
    var box = document.createElement('div');
    box.className = 'lightbox'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous image">&#8249;</button><img alt=""><p class="lightbox-caption"></p><button class="lb-next" aria-label="Next image">&#8250;</button>';
    document.body.appendChild(box);
    var big = box.querySelector('img'), cap = box.querySelector('.lightbox-caption');
    var show = function (i) { current = (i + imgs.length) % imgs.length; big.src = imgs[current].src; big.alt = imgs[current].alt; cap.textContent = imgs[current].alt; };
    var close = function () { box.hidden = true; imgs[current].focus(); };
    imgs.forEach(function (im, i) {
      im.classList.add('gallery-zoom'); im.tabIndex = 0; im.setAttribute('role', 'button');
      im.addEventListener('click', function () { show(i); box.hidden = false; box.querySelector('.lb-close').focus(); });
      im.addEventListener('keydown', function (e) { if (e.key === 'Enter') im.click(); });
    });
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }
});
