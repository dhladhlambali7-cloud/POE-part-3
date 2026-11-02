// enquiry-form.js - client-side validation + AJAX submission for the
// Contact form (#enquiry-form) and the Shop product enquiry (#product-enquiry).
// SETUP: replace YOUR_EMAIL in the form action in the HTML with the email
// address that should receive messages (FormSubmit.co, no account needed;
// the first submission sends a one-time activation email to that address). Until then the form falls back to opening
// the user's email app (mailto) so nothing is lost.
document.addEventListener('DOMContentLoaded', function () {
  var RECIPIENT = 'Lindokuhleskosana@gmail.com';

  var rules = {
    name: function (v) { return /^[A-Za-z][A-Za-z '\-]{1,49}$/.test(v) ? '' : 'Enter your name (letters only, 2–50 characters).'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address.'; },
    phone: function (v) { return v === '' || /^(\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid SA number, e.g. 079 346 4074.'; },
    message: function (v) { return v.length >= 10 && v.length <= 500 ? '' : 'Message must be 10–500 characters.'; },
    message_type: function (v) { return v ? '' : 'Please choose an option.'; },
    product: function (v) { return v ? '' : 'Please choose a product.'; },
    size: function (v) { return v ? '' : 'Please choose a size.'; },
    quantity: function (v) { var n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 10 ? '' : 'Quantity must be a whole number from 1 to 10.'; }
  };

  function check(field) {
    var rule = rules[field.name]; if (!rule) return true;
    var msg = rule(field.value.trim());
    var err = field.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span'); err.className = 'field-error';
      err.id = field.id + '-error'; field.setAttribute('aria-describedby', err.id);
      field.parentElement.appendChild(err);
    }
    err.textContent = msg; field.classList.toggle('invalid', msg !== '');
    field.setAttribute('aria-invalid', String(msg !== ''));
    return msg === '';
  }

  function setup(form, feedbackId, successText) {
    if (!form) return;
    var feedback = document.getElementById(feedbackId);
    var fields = Array.from(form.elements).filter(function (f) { return f.name; });
    fields.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      fields.forEach(function (f) { if (!check(f)) ok = false; });
      if (!ok) { feedback.style.color = '#b3261e'; feedback.textContent = 'Please fix the highlighted fields and try again.'; return; }

      var data = {};
      fields.forEach(function (f) { data[f.name] = f.value.trim(); });
      data._subject = form.dataset.subject; data._template = 'table';
      var btn = form.querySelector('button[type="submit"]'); btn.disabled = true;
      feedback.style.color = 'inherit'; feedback.textContent = 'Sending…';

      var done = function () { feedback.style.color = '#2e7d32'; feedback.textContent = successText(data); form.reset(); btn.disabled = false; };
      if (form.action.indexOf('YOUR_EMAIL') !== -1) {          // not configured yet: mailto fallback
        var body = Object.keys(data).filter(function (k) { return k[0] !== '_'; }).map(function (k) { return k + ': ' + data[k]; }).join('\n');
        window.location.href = 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(body);
        done(); return;
      }
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error('bad response'); done(); })
        .catch(function () { feedback.style.color = '#b3261e'; feedback.textContent = 'Sorry, something went wrong. Please try again or call 079 346 4074.'; btn.disabled = false; });
    });
  }

  setup(document.getElementById('enquiry-form'), 'form-feedback',
    function (d) { return 'Thank you, ' + d.name + '! Your message has been sent. We will reply to ' + d.email + ' soon.'; });

  var pe = document.getElementById('product-enquiry');
  setup(pe, 'pe-feedback', function (d) {
    var opt = pe.querySelector('option[value="' + d.product.replace(/"/g, '') + '"]');
    var unit = opt ? Number(opt.dataset.price) : 0;
    return 'Thanks, ' + d.name + '! Estimated total for ' + d.quantity + ' × ' + d.product + ' (' + d.size + '): R' + (unit * Number(d.quantity)) + '. We will email you to confirm stock and delivery.';
  });
});
