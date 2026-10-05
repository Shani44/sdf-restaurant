/* SDF Restaurant - cart + order popup (like a food-delivery app)
   Customer taps "Order Now" -> item goes into the cart popup -> can add more items
   -> fills details once -> taps OK -> ONE complete message opens in WhatsApp.
   Works for menu items and deals. */
(function () {
  /* ====== EDIT HERE ====== */
  var WA_NUMBER = '923262946545'; // WhatsApp number (country code + number, no + or spaces)
  /* ====== END EDIT ====== */

  var STORE = 'sdf_customer';
  var CART_STORE = 'sdf_cart';
  var fmt = function (n) { return 'Rs. ' + n.toLocaleString('en-US'); };
  var esc = function (t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var css = '\
.ord-overlay{position:fixed;inset:0;z-index:120;background:#000000cc;backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:4vh 4%;overflow-y:auto;opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease}\
.ord-overlay.open{opacity:1;visibility:visible}\
.ord-box{position:relative;width:min(560px,100%);margin:auto;background:#0b0b0b;border:1px solid #49351d;border-radius:25px;padding:30px;transform:translateY(40px) scale(.96);transition:transform .45s cubic-bezier(.2,.9,.3,1.15);box-shadow:0 30px 90px #000a}\
.ord-overlay.open .ord-box{transform:none}\
.ord-close{position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;border:1px solid #333;background:#151515;color:#fff;font-size:18px;cursor:pointer;transition:.25s}\
.ord-close:hover{background:var(--gold);color:#111;border-color:var(--gold);transform:rotate(90deg)}\
.ord-head small{color:var(--gold);font-weight:700;letter-spacing:3px}\
.ord-head h2{font:700 30px/1.1 "Playfair Display",serif;margin:6px 0 18px;padding-right:44px}\
.ord-list{display:grid;gap:10px}\
.ord-row{display:flex;align-items:center;gap:12px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:10px}\
.ord-row img{width:60px;height:60px;border-radius:12px;object-fit:cover;flex:none}\
.ord-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}\
.ord-info b{font-size:15px}\
.ord-desc{color:#888;font-size:12px;line-height:1.4}\
.ord-unit{color:var(--gold);font-weight:700;font-size:13px}\
.ord-qty{display:flex;align-items:center;gap:8px;flex:none}\
.ord-qty button{width:30px;height:30px;border-radius:50%;border:0;background:var(--gold);color:#111;font-size:17px;font-weight:700;cursor:pointer;line-height:1;transition:.2s}\
.ord-qty button:hover{background:#ffc66d;transform:scale(1.1)}\
.ord-q{min-width:18px;text-align:center;font-weight:700}\
.ord-del{flex:none;width:30px;height:30px;border-radius:50%;border:1px solid #333;background:#1b1b1b;color:#aaa;font-size:13px;cursor:pointer;transition:.2s}\
.ord-del:hover{background:#ef4444;border-color:#ef4444;color:#fff}\
.ord-empty{text-align:center;color:#888;padding:26px 10px}\
.ord-more{width:100%;margin-top:12px;padding:12px;border-radius:30px;border:1px dashed #49351d;background:transparent;color:var(--gold);font-weight:700;font-size:14px;cursor:pointer;transition:.2s}\
.ord-more:hover{background:#17120c;border-style:solid}\
.ord-box.empty .ord-checkout{display:none}\
.ord-total{display:flex;justify-content:space-between;align-items:center;margin:16px 2px 18px;color:#bbb}\
.ord-sum{color:var(--gold);font-size:22px}\
.ord-type{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}\
.ord-type label{cursor:pointer}\
.ord-type input{position:absolute;opacity:0;pointer-events:none}\
.ord-type span{display:block;text-align:center;padding:11px;border:1px solid #2b2b2b;background:#151515;color:#aaa;border-radius:12px;font-weight:700;font-size:14px;transition:.2s}\
.ord-type input:checked+span{background:var(--gold);color:#111;border-color:var(--gold)}\
.ord-field{margin-bottom:14px}\
.ord-field label{display:block;font-size:12px;color:#999;margin-bottom:6px;letter-spacing:.5px}\
.ord-field input,.ord-field textarea{width:100%;background:#151515;border:1px solid #2b2b2b;border-radius:12px;color:var(--text);font:inherit;font-size:15px;padding:12px 14px;outline:none;transition:border-color .2s,box-shadow .2s;resize:none}\
.ord-field input:focus,.ord-field textarea:focus{border-color:var(--gold);box-shadow:0 0 0 3px #f2a83b22}\
.ord-field.err input,.ord-field.err textarea{border-color:#ef4444}\
.ord-field em{display:none;color:#f87171;font-size:12px;font-style:normal;margin-top:5px}\
.ord-field.err em{display:block}\
.ord-submit{width:100%;margin-top:6px;padding:15px;border:0;border-radius:30px;background:var(--gold);color:#111;font-weight:700;font-size:16px;cursor:pointer;transition:.2s}\
.ord-submit:hover{background:#ffc66d;transform:translateY(-2px)}\
.ord-foot{text-align:center;color:#777;font-size:12px;margin-top:12px}\
.cart-fab{position:fixed;right:20px;bottom:20px;z-index:90;display:none;align-items:center;gap:10px;padding:13px 20px;border:0;border-radius:30px;background:var(--gold);color:#111;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 10px 30px #000a,0 0 0 0 #f2a83b88;transition:transform .2s}\
.cart-fab.show{display:flex;animation:fabIn .5s cubic-bezier(.2,1.4,.4,1)}\
.cart-fab.bump{animation:fabBump .5s ease}\
.cart-fab:hover{transform:translateY(-3px)}\
@keyframes fabIn{from{opacity:0;transform:translateY(30px) scale(.8)}to{opacity:1;transform:none}}\
@keyframes fabBump{0%{transform:scale(1)}40%{transform:scale(1.15)}100%{transform:scale(1)}}\
.ord-toast{position:fixed;left:50%;bottom:28px;z-index:130;transform:translate(-50%,30px);background:#17120c;border:1px solid var(--gold);color:var(--text);padding:13px 22px;border-radius:30px;font-size:14px;opacity:0;pointer-events:none;transition:.4s;max-width:90%;text-align:center}\
.ord-toast.show{opacity:1;transform:translate(-50%,0)}\
body.ord-lock{overflow:hidden}\
@media(max-width:480px){.ord-box{padding:24px 16px}.ord-row{flex-wrap:wrap}.cart-fab{right:12px;bottom:12px;left:12px;justify-content:center}}\
@media(prefers-reduced-motion:reduce){.ord-overlay,.ord-box,.ord-toast,.cart-fab{transition:none;animation:none!important}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'ord-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Your cart');
  overlay.innerHTML =
    '<div class="ord-box">' +
    '<button type="button" class="ord-close" aria-label="Close">✕</button>' +
    '<div class="ord-head"><small>YOUR ORDER</small><h2>Your cart</h2></div>' +
    '<div class="ord-list"></div>' +
    '<button type="button" class="ord-more">＋ Add more items</button>' +
    '<div class="ord-checkout">' +
    '<div class="ord-total"><span>Total</span><b class="ord-sum"></b></div>' +
    '<div class="ord-type">' +
    '<label><input type="radio" name="ordtype" value="Delivery" checked><span>🚚 Delivery</span></label>' +
    '<label><input type="radio" name="ordtype" value="Pickup"><span>🏪 Pickup</span></label>' +
    '</div>' +
    '<div class="ord-field f-name-w"><label>FULL NAME</label><input class="f-name" type="text" autocomplete="name" placeholder="e.g. Ali Khan"><em>Please enter your name</em></div>' +
    '<div class="ord-field f-phone-w"><label>PHONE NUMBER</label><input class="f-phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 0300 1234567"><em>Please enter a valid phone number</em></div>' +
    '<div class="ord-field f-addr-w"><label>DELIVERY ADDRESS</label><textarea class="f-addr" rows="2" autocomplete="street-address" placeholder="House no, street, area"></textarea><em>Please enter your delivery address</em></div>' +
    '<div class="ord-field"><label>NOTES (OPTIONAL)</label><input class="f-note" type="text" placeholder="e.g. less spicy, extra sauce"></div>' +
    '<button type="button" class="ord-submit">✓ OK – Send Order on WhatsApp</button>' +
    '<p class="ord-foot">Your full order opens in WhatsApp as one ready message. Just tap Send.</p>' +
    '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'cart-fab';
  fab.setAttribute('aria-label', 'View cart');
  document.body.appendChild(fab);

  var toast = document.createElement('div');
  toast.className = 'ord-toast';
  document.body.appendChild(toast);

  var $ = function (s) { return overlay.querySelector(s); };

  /* ---------- cart state ---------- */
  var cart = [];
  try { cart = JSON.parse(sessionStorage.getItem(CART_STORE)) || []; } catch (e) { cart = []; }

  function saveCart() {
    try { sessionStorage.setItem(CART_STORE, JSON.stringify(cart)); } catch (e) {}
  }
  function count() { return cart.reduce(function (n, it) { return n + it.qty; }, 0); }
  function total() { return cart.reduce(function (n, it) { return n + it.qty * it.price; }, 0); }
  function orderType() { return $('input[name="ordtype"]:checked').value; }
  function isOpen() { return overlay.classList.contains('open'); }

  function updateFab(bump) {
    var n = count();
    if (n > 0 && !isOpen()) {
      fab.innerHTML = '🛒 View Cart · ' + n + (n === 1 ? ' item' : ' items') + ' · ' + fmt(total());
      fab.classList.add('show');
      if (bump) {
        fab.classList.remove('bump');
        void fab.offsetWidth;
        fab.classList.add('bump');
      }
    } else {
      fab.classList.remove('show');
    }
  }

  function render() {
    var box = $('.ord-box');
    var list = $('.ord-list');
    if (!cart.length) {
      box.classList.add('empty');
      list.innerHTML = '<div class="ord-empty">Your cart is empty 🍽️</div>';
      $('.ord-more').textContent = 'Browse menu';
    } else {
      box.classList.remove('empty');
      $('.ord-more').textContent = '＋ Add more items';
      list.innerHTML = cart.map(function (it, i) {
        return '<div class="ord-row">' +
          (it.img ? '<img src="' + esc(it.img) + '" alt="">' : '') +
          '<div class="ord-info"><b>' + esc(it.name) + '</b>' +
          (it.isDeal && it.desc ? '<span class="ord-desc">' + esc(it.desc) + '</span>' : '') +
          '<span class="ord-unit">' + fmt(it.price) + (it.qty > 1 ? ' each' : '') + '</span></div>' +
          '<div class="ord-qty"><button type="button" data-a="dec" data-i="' + i + '" aria-label="Less">−</button>' +
          '<span class="ord-q">' + it.qty + '</span>' +
          '<button type="button" data-a="inc" data-i="' + i + '" aria-label="More">+</button></div>' +
          '<button type="button" class="ord-del" data-a="del" data-i="' + i + '" aria-label="Remove ' + esc(it.name) + '">✕</button>' +
          '</div>';
      }).join('');
    }
    $('.ord-sum').textContent = fmt(total());
    $('.f-addr-w').style.display = orderType() === 'Delivery' ? '' : 'none';
  }

  function saved() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }

  function openCart() {
    var s = saved();
    if (!$('.f-name').value) $('.f-name').value = s.name || '';
    if (!$('.f-phone').value) $('.f-phone').value = s.phone || '';
    if (!$('.f-addr').value) $('.f-addr').value = s.addr || '';
    overlay.querySelectorAll('.ord-field.err').forEach(function (f) { f.classList.remove('err'); });
    render();
    overlay.classList.add('open');
    document.body.classList.add('ord-lock');
    overlay.scrollTop = 0;
    updateFab();
  }

  var bumpNext = false;
  function closeCart() {
    overlay.classList.remove('open');
    if (!document.querySelector('.deals-overlay.open')) document.body.classList.remove('ord-lock');
    updateFab(bumpNext);
    bumpNext = false;
  }

  function addToCart(btn) {
    var isDeal = btn.classList.contains('deal-order');
    var card = btn.closest(isDeal ? '.dealcard' : '.food');
    var p = card && card.querySelector('p');
    var im = card && card.querySelector('img');
    var name = isDeal ? btn.dataset.name : btn.dataset.item;
    var price = Number(btn.dataset.price);

    var found = null;
    cart.forEach(function (it) { if (it.name === name && it.price === price) found = it; });
    if (found) {
      found.qty = Math.min(20, found.qty + 1);
    } else {
      cart.push({
        name: name,
        price: price,
        desc: p ? p.textContent : '',
        img: im ? im.src : '',
        isDeal: isDeal,
        qty: 1
      });
    }
    saveCart();
  }

  function showToast(t) {
    toast.textContent = t;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 4500);
  }

  function setErr(wrapSel, bad) {
    $(wrapSel).classList.toggle('err', bad);
    return bad;
  }

  function send() {
    if (!cart.length) return;
    var name = $('.f-name').value.trim();
    var phone = $('.f-phone').value.trim();
    var addr = $('.f-addr').value.trim();
    var note = $('.f-note').value.trim();
    var type = orderType();
    var digits = phone.replace(/\D/g, '');

    var badName = setErr('.f-name-w', name.length < 2);
    var badPhone = setErr('.f-phone-w', digits.length < 10 || digits.length > 13);
    var badAddr = setErr('.f-addr-w', type === 'Delivery' && addr.length < 6);
    if (badName || badPhone || badAddr) {
      var first = badName ? '.f-name' : badPhone ? '.f-phone' : '.f-addr';
      $(first).focus();
      return;
    }

    try { localStorage.setItem(STORE, JSON.stringify({ name: name, phone: phone, addr: addr })); } catch (e) {}

    var lines = ['Hi SDF Restaurant! 👋', '', 'I want to place an order:', '', '🍽️ Order details:'];
    cart.forEach(function (it, i) {
      lines.push((i + 1) + '. ' + it.name + (it.isDeal && it.desc ? ' (' + it.desc + ')' : '') +
        ' x' + it.qty + (it.qty > 1 ? ' (' + fmt(it.price) + ' each)' : '') + ' = ' + fmt(it.price * it.qty));
    });
    lines.push('', '🧾 Total: ' + fmt(total()), '');
    lines.push(type === 'Delivery' ? '🚚 Order type: Delivery' : '🏪 Order type: Pickup');
    lines.push('👤 Name: ' + name);
    lines.push('📞 Phone: ' + phone);
    if (type === 'Delivery') lines.push('📍 Address: ' + addr);
    if (note) lines.push('📝 Notes: ' + note);
    lines.push('', 'Please confirm my order. Thank you!');

    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank');

    cart = [];
    saveCart();
    $('.f-note').value = '';
    var dealsClose = document.querySelector('.deals-overlay.open .deals-close');
    if (dealsClose) dealsClose.click();
    closeCart();
    showToast('✅ Your order is ready. Tap Send in WhatsApp to confirm.');
  }

  /* Catch clicks on menu "Order Now" and deal buttons BEFORE they open WhatsApp directly */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.order, .deal-order');
    if (!btn) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    addToCart(btn);
    bumpNext = true;
    openCart();
  }, true);

  fab.addEventListener('click', openCart);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.closest('.ord-close') || e.target.closest('.ord-more')) {
      closeCart();
      return;
    }
    var b = e.target.closest('[data-a]');
    if (b) {
      var i = Number(b.dataset.i);
      var it = cart[i];
      if (!it) return;
      if (b.dataset.a === 'inc') it.qty = Math.min(20, it.qty + 1);
      if (b.dataset.a === 'dec') it.qty = Math.max(1, it.qty - 1);
      if (b.dataset.a === 'del') cart.splice(i, 1);
      saveCart();
      render();
      return;
    }
    if (e.target.closest('.ord-submit')) send();
  });

  overlay.addEventListener('change', function (e) {
    if (e.target.name === 'ordtype') render();
  });

  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio') {
      e.preventDefault();
      send();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closeCart();
  });

  updateFab();
})();
