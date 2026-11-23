(function () {
  var forms = document.querySelectorAll('form[data-lead-form]');
  forms.forEach(function (form) {
    var status = form.querySelector('[data-form-status]');
    var product = form.getAttribute('data-product') || 'Product';
    var recipient = form.getAttribute('data-recipient') || 'kfairley9999@gmail.com';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = String(fd.get('name') || '').trim();
      var company = String(fd.get('company') || '').trim();
      var email = String(fd.get('email') || '').trim();
      var phone = String(fd.get('phone') || '').trim();
      var need = String(fd.get('need') || '').trim();
      var lines = [
        'Product: ' + product,
        'Name: ' + (name || '(not provided)'),
        'Company: ' + (company || '(not provided)'),
        'Email: ' + (email || '(not provided)'),
        'Phone: ' + (phone || '(not provided)'),
        'What they need:',
        need || '(not provided)'
      ];
      var body = lines.join('\n');
      var subject = product + ' pilot / inquiry' + (company ? ' — ' + company : (name ? ' — ' + name : ''));
      var mailto = 'mailto:' + encodeURIComponent(recipient) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (status) {
        status.innerHTML = '';
        var p = document.createElement('p');
        p.innerHTML = '<strong>Ready to send to ' + recipient + '.</strong> Your email app should open with these details. If it did not open, click Copy details or open the link below.';
        var pre = document.createElement('pre');
        pre.textContent = 'Subject: ' + subject + '\n\n' + body;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;';
        var a = document.createElement('a');
        a.className = 'btn sm primary';
        a.href = mailto;
        a.textContent = 'Open in email app';
        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn sm secondary';
        copyBtn.textContent = 'Copy details';
        copyBtn.addEventListener('click', function () {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('To: ' + recipient + '\nSubject: ' + subject + '\n\n' + body).then(function () {
              copyBtn.textContent = 'Copied';
            });
          }
        });
        row.appendChild(a);
        row.appendChild(copyBtn);
        status.appendChild(p);
        status.appendChild(pre);
        status.appendChild(row);
        status.classList.add('show');
      }
      window.location.href = mailto;
    });
  });
})();
