// global.js — Ultra-Kitchen unified script with correct zero-removal
document.addEventListener('DOMContentLoaded', () => {

  /* -------------------- MOBILE NAV -------------------- */
  const menuBtn = document.getElementById('menuBtn');
  const navMenu = document.getElementById('navMenu');
  if (menuBtn && navMenu) {
    const setIcon = open => menuBtn.textContent = open ? '✕' : '☰';
    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      navMenu.classList.toggle('show');
      setIcon(navMenu.classList.contains('show'));
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.header')) {
        navMenu.classList.remove('show');
        setIcon(false);
      }
    });
  }

  /* -------------------- AUTO YEAR -------------------- */
  document.querySelectorAll('.year').forEach(span => {
    span.textContent = new Date().getFullYear();
  });

  /* -------------------- ORDER UTILITIES -------------------- */
  const formatNum = n => Number(n).toLocaleString();

  function loadStoredOrder() {
    try {
      const data = JSON.parse(sessionStorage.getItem('ultrakitchen_last_order'));
      return data && data.items ? data : { items: [], total: 0 };
    } catch (e) {
      return { items: [], total: 0 };
    }
  }

  // FIXED — merge but remove zero items properly
  function mergeOrders(existingItems, newItems) {
    let merged = [...existingItems];

    newItems.forEach(newItem => {
      const found = merged.find(i => i.name === newItem.name);

      if (newItem.qty === 0) {
        // REMOVE ITEM COMPLETELY
        merged = merged.filter(i => i.name !== newItem.name);
        return;
      }

      if (found) {
        found.qty = newItem.qty;
        found.subtotal = newItem.subtotal;
      } else {
        merged.push(newItem);
      }
    });

    // Remove anything that somehow has qty 0
    merged = merged.filter(i => i.qty > 0);

    const total = merged.reduce((s, i) => s + i.subtotal, 0);
    return { items: merged, total };
  }

  function collectItemsFromPage() {
    const items = [];
    document.querySelectorAll('.menu-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent?.trim();
      const priceEl = card.querySelector('.price');
      const price = Number(priceEl?.dataset?.price || priceEl?.textContent.replace(/[^\d]/g, '') || 0);
      const qty = Number(card.querySelector('.qty')?.value || 0);
      items.push({
        name,
        price,
        qty,
        subtotal: price * qty
      });
    });
    return items;
  }

  function saveMergedOrder() {
    const pageItems = collectItemsFromPage();
    const stored = loadStoredOrder();
    const merged = mergeOrders(stored.items, pageItems);
    sessionStorage.setItem('ultrakitchen_last_order', JSON.stringify(merged));
    return merged;
  }

  /* -------------------- MENU PAGE (LIVE UPDATE) -------------------- */
  const qtyInputs = document.querySelectorAll('.qty');
  const orderList = document.querySelector('.order-list');
  const totalElem = document.getElementById('totalAmount');

  function renderMenuOrder() {
    const { items, total } = saveMergedOrder();

    if (orderList) {
      orderList.innerHTML = '';
      if (items.length === 0) {
        orderList.innerHTML = '<p class="muted">No items selected yet.</p>';
      } else {
        items.forEach(it => {
          const div = document.createElement('div');
          div.className = 'order-item';
          div.innerHTML = `<div>${it.qty} × ${it.name}</div><div>₦${formatNum(it.subtotal)}</div>`;
          orderList.appendChild(div);
        });
      }
    }

    if (totalElem) totalElem.textContent = formatNum(total);
  }

  qtyInputs.forEach(i => i.addEventListener('input', renderMenuOrder));
  renderMenuOrder();

  /* -------------------- CHECKOUT PAGE -------------------- */
  const checkoutOrderListEl = document.getElementById('checkoutOrderList');
  const checkoutTotalEl = document.getElementById('checkoutTotal');
  const checkoutForm = document.getElementById('orderForm');

  if (checkoutOrderListEl) {
    function renderCheckout() {
      const order = loadStoredOrder();

      if (!order.items.length) {
        checkoutOrderListEl.innerHTML = '<p class="muted">No items found. Go back to menu.</p>';
        if (checkoutTotalEl) checkoutTotalEl.textContent = '0';
        return;
      }

      checkoutOrderListEl.innerHTML = '';
      order.items.forEach(it => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `<div>${it.qty} × ${it.name}</div><div>₦${formatNum(it.subtotal)}</div>`;
        checkoutOrderListEl.appendChild(div);
      });

      checkoutTotalEl.textContent = formatNum(order.total);
    }

    renderCheckout();

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', e => {
        e.preventDefault();
        const order = loadStoredOrder();
        if (!order.items.length) {
          alert("Your order is empty.");
          return;
        }

        alert("Order submitted successfully!");
        sessionStorage.removeItem('ultrakitchen_last_order');
      });
    }
  }

});




// image animations
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".menu-photo img");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.3
    });

    items.forEach(img => observer.observe(img));
});


// Observe all menu cards for scroll animation
const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            cardObserver.unobserve(entry.target); // animate only once
        }
    });
}, { threshold: 0.25 });

document.querySelectorAll('.menu-card').forEach(card => {
    cardObserver.observe(card);
});




