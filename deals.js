/* SDF Restaurant - "Today's Deals" popup menu
   Click on the "Check Today's Deals" button opens a discounted menu inside the website. */
(function () {
  /* ====== EDIT HERE ====== */
  var WA_NUMBER = '923262946545'; // WhatsApp number (country code + number, no + or spaces)

  var P = 'https://images.unsplash.com/photo-';
  var Q = '?auto=format&fit=crop&w=900&q=85';
  var DEALS = [
    { name: 'Burger Combo', desc: 'Chicken Burger + Cold Drink', img: P + '1568901346375-23c9450c58cd' + Q, old: 700, price: 599 },
    { name: 'Double Burger Deal', desc: 'Chicken Burger + Classic Beef Burger + 2 Cold Drinks', img: P + '1550547660-d9450f859349' + Q, old: 1500, price: 1299 },
    { name: 'Pizza Party', desc: 'Chicken Pizza + 2 Cold Drinks', img: P + '1574071318508-1cdbab80d002' + Q, old: 1500, price: 1249 },
    { name: 'Biryani Duo', desc: '2 Chicken Biryani + 2 Cold Drinks', img: P + '1589302168068-964664d93dc0' + Q, old: 1200, price: 999 },
    { name: 'BBQ Feast', desc: 'Chicken BBQ + Chicken Biryani + Cold Drink', img: P + '1544025162-d76694265947' + Q, old: 1450, price: 1199 },
    { name: 'Mega Family Deal', desc: 'Chicken Pizza + Chicken BBQ + 2 Chicken Biryani + 3 Cold Drinks', img: P + '1565299624946-b28f40a0ae38' + Q, old: 3400, price: 2799 }
  ];
  /* ====== END EDIT ====== */

  var fmt = function (n) { return 'Rs. ' + n.toLocaleString('en-US'); };

  var css = '\
.deals-overlay{position:fixed;inset:0;z-index:100;background:#000000c4;backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:4vh 4%;overflow-y:auto;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s ease}\
.deals-overlay.open{opacity:1;visibility:visible}\
.deals-box{position:relative;width:min(1100px,100%);margin:auto;background:#0b0b0b;border:1px solid #49351d;border-radius:25px;padding:38px;transform:translateY(40px) scale(.96);transition:transform .5s cubic-bezier(.2,.9,.3,1.15);box-shadow:0 30px 90px #000a}\
.deals-overlay.open .deals-box{transform:none}\
.deals-close{position:absolute;top:18px;right:18px;width:42px;height:42px;border-radius:50%;border:1px solid #333;background:#151515;color:#fff;font-size:20px;cursor:pointer;transition:.25s}\
.deals-close:hover{background:var(--gold);color:#111;border-color:var(--gold);transform:rotate(90deg)}\
.deals-head small{color:var(--gold);font-weight:700;letter-spacing:3px}\
.deals-head h2{font:700 42px/1.1 "Playfair Display",serif;margin:8px 0 10px}\
.deals-head p{color:#85817a;max-width:520px;margin-bottom:28px}\
.deals-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}\
.dealcard{position:relative;background:var(--panel);border:1px solid var(--line);border-radius:20px;overflow:hidden;display:flex;flex-direction:column;transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease}\
.dealcard:hover{transform:translateY(-6px);border-color:var(--gold);box-shadow:0 18px 40px #f2a83b22}\
.dealcard .dimg{position:relative;overflow:hidden}\
.dealcard img{width:100%;height:200px;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.2,.8,.2,1)}\
.dealcard:hover img{transform:scale(1.1)}\
.dealcard .badge{position:absolute;top:14px;left:14px;background:var(--gold);color:#111;font-weight:700;font-size:13px;padding:6px 13px;border-radius:25px;box-shadow:0 6px 18px #0007}\
.dealcard .dbody{padding:19px;display:flex;flex-direction:column;flex:1}\
.dealcard h3{font-size:18px}\
.dealcard p{color:#888;font-size:13px;margin:8px 0 14px;min-height:42px}\
.dealcard .prices{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}\
.dealcard .now{color:var(--gold);font-weight:700;font-size:22px}\
.dealcard .was{color:#777;text-decoration:line-through;font-size:14px}\
.dealcard .save{color:#4ade80;font-size:12px;margin:4px 0 16px}\
.deal-order{margin-top:auto;width:100%;padding:11px;border:0;border-radius:9px;background:var(--gold);color:#111;font-weight:700;cursor:pointer;transition:.2s}\
.deal-order:hover{background:#ffc66d;transform:translateY(-2px)}\
.deals-note{text-align:center;color:#777;font-size:12px;margin-top:24px}\
.deals-overlay.open .dealcard{animation:dealUp .6s cubic-bezier(.2,.9,.3,1) backwards}\
.deals-overlay.open .dealcard:nth-child(1){animation-delay:.10s}\
.deals-overlay.open .dealcard:nth-child(2){animation-delay:.18s}\
.deals-overlay.open .dealcard:nth-child(3){animation-delay:.26s}\
.deals-overlay.open .dealcard:nth-child(4){animation-delay:.34s}\
.deals-overlay.open .dealcard:nth-child(5){animation-delay:.42s}\
.deals-overlay.open .dealcard:nth-child(6){animation-delay:.50s}\
@keyframes dealUp{from{opacity:0;transform:translateY(30px) scale(.95)}to{opacity:1;transform:none}}\
body.deals-lock{overflow:hidden}\
@media(max-width:1000px){.deals-grid{grid-template-columns:repeat(2,1fr)}}\
@media(max-width:650px){.deals-box{padding:26px 18px}.deals-head h2{font-size:32px;padding-right:40px}.deals-grid{grid-template-columns:1fr}}\
@media(prefers-reduced-motion:reduce){.deals-overlay,.deals-box,.dealcard,.dealcard img{transition:none}.deals-overlay.open .dealcard{animation:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var cards = DEALS.map(function (d) {
    var pct = Math.round((d.old - d.price) / d.old * 100);
    return '<article class="dealcard">' +
      '<div class="dimg"><img src="' + d.img + '" alt="' + d.name + '" loading="lazy"><span class="badge">' + pct + '% OFF</span></div>' +
      '<div class="dbody"><h3>' + d.name + '</h3><p>' + d.desc + '</p>' +
      '<div class="prices"><span class="now">' + fmt(d.price) + '</span><span class="was">' + fmt(d.old) + '</span></div>' +
      '<div class="save">You save ' + fmt(d.old - d.price) + '</div>' +
      '<button class="deal-order" data-name="' + d.name + '" data-price="' + d.price + '">Order on WhatsApp</button></div>' +
      '</article>';
  }).join('');

  var overlay = document.createElement('div');
  overlay.className = 'deals-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', "Today's deals");
  overlay.innerHTML =
    '<div class="deals-box">' +
    '<button class="deals-close" aria-label="Close deals">✕</button>' +
    '<div class="deals-head"><small>TODAY\'S DEALS</small><h2>Save more on every order</h2>' +
    '<p>Pick a deal and send your order directly on WhatsApp.</p></div>' +
    '<div class="deals-grid">' + cards + '</div>' +
    '<div class="deals-note">Deals are valid for today only • Delivery &amp; pickup available</div>' +
    '</div>';
  document.body.appendChild(overlay);

  function openDeals() {
    overlay.classList.add('open');
    document.body.classList.add('deals-lock');
    overlay.scrollTop = 0;
  }
  function closeDeals() {
    overlay.classList.remove('open');
    document.body.classList.remove('deals-lock');
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#openDeals, [data-open-deals]')) {
      e.preventDefault();
      openDeals();
      return;
    }
    if (e.target.closest('.deals-close') || e.target === overlay) {
      closeDeals();
      return;
    }
    var btn = e.target.closest('.deal-order');
    if (btn) {
      var msg = 'Hi SDF Restaurant! I want to order the "' + btn.dataset.name + '" deal (' + fmt(Number(btn.dataset.price)) + ').';
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDeals();
  });
})();
