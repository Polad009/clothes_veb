/**
 * Atelier Store Checkout & Order Tracking Module
 * Supports Apple Pay, Google Pay, Bank Card, Cash on Delivery
 * Full state reset allowing continuous shopping
 */

const Checkout = {
  paymentMethod: 'card', // 'card', 'apple_pay', 'google_pay', 'cash'

  init() {
    this.resetForm();
    this.renderSummary();
  },

  resetForm() {
    const formSection = document.getElementById('checkoutFormSection');
    const successSection = document.getElementById('checkoutSuccessSection');

    if (formSection) formSection.style.display = 'block';
    if (successSection) successSection.style.display = 'none';

    this.setPaymentMethod(this.paymentMethod || 'card');
  },

  renderSummary() {
    const listContainer = document.getElementById('checkoutSummaryItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const discountRow = document.getElementById('checkoutDiscountRow');
    const totalEl = document.getElementById('checkoutTotal');

    if (!listContainer) return;

    const items = Cart.items;
    if (items.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 20px 0; color: var(--text-muted);">
          <p style="font-size: 0.95rem; font-weight: 600; color: #111; margin-bottom: 6px;">Səbətiniz boşdur</p>
          <p style="font-size: 0.85rem; margin-bottom: 14px;">Zəhmət olmasa kolleksiyadan məhsul seçin.</p>
          <button class="btn-pill-black" style="padding: 8px 20px; font-size: 0.8rem;" onclick="App.navigate('shop')">Kolleksiyaya Bax</button>
        </div>
      `;
      if (subtotalEl) subtotalEl.textContent = '0 ₼';
      if (totalEl) totalEl.textContent = '0 ₼';
      if (discountRow) discountRow.style.display = 'none';
      return;
    }

    listContainer.innerHTML = items.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
        <div>
          <div style="font-weight: 600;">${item.name}</div>
          <div style="font-size: 0.78rem; color: #888;">${item.size} • ${item.color} (x${item.quantity})</div>
        </div>
        <strong>${item.price * item.quantity} ₼</strong>
      </div>
    `).join('');

    const subtotal = Cart.getSubtotal();
    const discount = Cart.getDiscount();
    const grandTotal = Math.max(0, subtotal - discount);

    if (subtotalEl) subtotalEl.textContent = `${subtotal} ₼`;
    if (totalEl) totalEl.textContent = `${grandTotal} ₼`;

    if (discountRow) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-${discount} ₼`;
      } else {
        discountRow.style.display = 'none';
      }
    }
  },

  async applyPromoCode(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('checkoutPromoInput');
    if (!input || !input.value.trim()) return;

    const code = input.value.trim();
    const subtotal = Cart.getSubtotal();

    const res = await API.validatePromo(code, subtotal);
    if (res.success) {
      Cart.promo = res.data;
      Cart.save();
      this.renderSummary();
      App.showToast(res.data.message);
      input.value = '';
    } else {
      App.showToast(res.message || 'Promo-kod keçərsizdir', 'error');
    }
  },

  setPaymentMethod(method) {
    this.paymentMethod = method;

    // Toggle active state in buttons
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === method);
    });

    const cardFields = document.getElementById('creditCardFields');
    const applePayFields = document.getElementById('applePayFields');
    const googlePayFields = document.getElementById('googlePayFields');
    const cashFields = document.getElementById('cashPaymentNotice');
    const submitBtn = document.getElementById('btnSubmitOrder');

    if (cardFields) cardFields.style.display = method === 'card' ? 'block' : 'none';
    if (applePayFields) applePayFields.style.display = method === 'apple_pay' ? 'block' : 'none';
    if (googlePayFields) googlePayFields.style.display = method === 'google_pay' ? 'block' : 'none';
    if (cashFields) cashFields.style.display = method === 'cash' ? 'block' : 'none';

    if (submitBtn) {
      if (method === 'apple_pay' || method === 'google_pay') {
        submitBtn.style.display = 'none';
      } else {
        submitBtn.style.display = 'block';
        submitBtn.textContent = method === 'cash' ? 'Sifarişi Təsdiq Et (Qapıda Ödəniş)' : 'Sifarişi Təsdiq Et və Kartla Ödə';
      }
    }
  },

  async submitOrder(e, explicitMethod = null) {
    if (e) e.preventDefault();

    if (Cart.items.length === 0) {
      App.showToast('Səbətiniz boşdur! Zəhmət olmasa əvvəlcə məhsul seçin.', 'error');
      return;
    }

    const fullName = document.getElementById('orderFullName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const email = document.getElementById('orderEmail').value.trim();
    const city = document.getElementById('orderCity').value;
    const address = document.getElementById('orderAddress').value.trim();

    if (!fullName || !phone || !address) {
      App.showToast('Zəhmət olmasa Ad, Telefon və Çatdırılma ünvanını doldurun.', 'error');
      return;
    }

    const payMethod = explicitMethod || this.paymentMethod;
    const submitBtn = document.getElementById('btnSubmitOrder');
    if (submitBtn && submitBtn.style.display !== 'none') {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Ödəniş təsdiqlənir...';
    }

    setTimeout(async () => {
      const orderPayload = {
        customer: { fullName, phone, email, city, address },
        items: [...Cart.items],
        subtotal: Cart.getSubtotal(),
        discount: Cart.getDiscount(),
        promoCode: Cart.promo ? Cart.promo.code : null,
        total: Cart.getTotal(),
        paymentMethod: payMethod
      };

      const res = await API.createOrder(orderPayload);
      if (res.success) {
        Cart.clear();
        this.showReceipt(res.data);
      } else {
        App.showToast(res.error || 'Sifariş qeyd edilmədi', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sifarişi Təsdiq Et';
        }
      }
    }, 600);
  },

  showReceipt(order) {
    const formSection = document.getElementById('checkoutFormSection');
    const successSection = document.getElementById('checkoutSuccessSection');

    if (formSection) formSection.style.display = 'none';
    if (!successSection) return;

    let payMethodName = 'Bank Kartı';
    if (order.paymentMethod === 'apple_pay') payMethodName = 'Apple Pay';
    if (order.paymentMethod === 'google_pay') payMethodName = 'Google Pay';
    if (order.paymentMethod === 'cash') payMethodName = 'Qapıda Nağd';

    successSection.style.display = 'block';
    successSection.innerHTML = `
      <div style="max-width: 620px; margin: 20px auto 40px auto; text-align: center;" class="view-section">
        <div style="width: 54px; height: 54px; background: #111; color: #fff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 1.4rem;">✓</div>
        <h2 style="font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px;">Sifarişiniz Qəbul Olundu</h2>
        <p style="color: #666; font-size: 0.95rem; margin-bottom: 24px;">
          Sifariş Nömrəniz: <strong>${order.id}</strong> (İzləmə Kodu: <strong>${order.trackingCode}</strong>)
        </p>

        <div style="background: #FAFAFA; border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; text-align: left; margin-bottom: 28px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.85rem;">
            <span><strong>Müştəri:</strong> ${order.customer.fullName}</span>
            <span><strong>Telefon:</strong> ${order.customer.phone}</span>
          </div>
          <div style="margin-bottom: 16px; font-size: 0.85rem;">
            <strong>Çatdırılma:</strong> ${order.customer.address}, ${order.customer.city}<br>
            <strong>Ödəniş Üsulu:</strong> ${payMethodName} (${order.paymentStatus})
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 12px;">
            ${order.items.map(it => `
              <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
                <span>${it.name} (${it.size}, ${it.color}) x${it.quantity}</span>
                <strong>${it.price * it.quantity} ₼</strong>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; margin-top: 14px; border-top: 1px solid #111; padding-top: 10px;">
              <span>Ödənilən Məbləğ:</span>
              <span>${order.total} ₼</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <button class="btn-pill-black" onclick="Checkout.startNewShopping()">
            Yeni Məhsul Al / Kolleksiya
          </button>
          <button class="btn-pill-outline" onclick="App.navigate('tracking'); document.getElementById('trackingCodeInput').value='${order.trackingCode}'; OrderTracking.searchOrder();">
            Sifarişi İzlə
          </button>
        </div>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  startNewShopping() {
    this.resetForm();
    App.navigate('shop');
  }
};

const OrderTracking = {
  async searchOrder() {
    const input = document.getElementById('trackingCodeInput');
    const resultBox = document.getElementById('trackingResultContainer');
    if (!input || !input.value.trim() || !resultBox) return;

    const query = input.value.trim();
    resultBox.innerHTML = `<p style="text-align:center; padding: 20px;">Axtarılır...</p>`;

    try {
      const res = await API.getOrder(query);
      if (res.success && res.data) {
        const o = res.data;
        resultBox.innerHTML = `
          <div style="background: #FAFAFA; border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
              <h3 style="font-size: 1.2rem; font-weight: 800;">${o.id}</h3>
              <span style="background: #111; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">${o.status}</span>
            </div>
            <p style="font-size:0.9rem; margin-bottom:4px;"><strong>Müştəri:</strong> ${o.customer.fullName}</p>
            <p style="font-size:0.9rem; margin-bottom:4px;"><strong>Ünvan:</strong> ${o.customer.address}, ${o.customer.city}</p>
            <p style="font-size:0.9rem; margin-bottom:4px;"><strong>Məbləğ:</strong> ${o.total} ₼ (${o.paymentStatus})</p>
          </div>
        `;
      } else {
        resultBox.innerHTML = `<p style="text-align:center; color: #999; padding:20px;">Sifariş tapılmadı. Sifariş nömrənizi yoxlayın.</p>`;
      }
    } catch (e) {
      resultBox.innerHTML = `<p style="text-align:center; color: red;">Xəta baş verdi.</p>`;
    }
  }
};
