(function () {
  var pendingVerification = null;
  var nativeFetch = window.fetch.bind(window);

  function digits(value) { return String(value || '').replace(/\D/g, ''); }
  function validCPF(value) {
    var cpf = digits(value);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    function check(length) {
      var sum = 0;
      for (var i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i);
      var mod = (sum * 10) % 11;
      if (mod === 10) mod = 0;
      return mod === Number(cpf[length]);
    }
    return check(9) && check(10);
  }
  function formatCPF(value) {
    var v = digits(value).slice(0, 11);
    return v.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  function validCRFa(value) {
    var v = String(value || '').trim();
    return /^(?:CRFa\s*)?\d{1,2}[-ªº\s]*\d{3,8}(?:[-/]?\d)?$/i.test(v) || /^\d{3,8}(?:[-/]?\d)?$/.test(v);
  }
  function routeIsProfessional() {
    var route = (location.pathname + location.search + location.hash).toLowerCase();
    return route.indexOf('cadastro/profissional') !== -1 || route.indexOf('cadastro/fono') !== -1;
  }
  function message(form, text) {
    var old = form.querySelector('[data-nivenar-verification-error]');
    if (old) old.remove();
    var box = document.createElement('div');
    box.setAttribute('data-nivenar-verification-error', 'true');
    box.style.cssText = 'border-radius:12px;background:#fff1f2;color:#be123c;padding:12px 14px;font-size:14px;line-height:1.45;margin-bottom:4px';
    box.textContent = text;
    form.insertBefore(box, form.firstChild);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  window.fetch = async function (input, init) {
    try {
      var url = typeof input === 'string' ? input : input && input.url;
      if (pendingVerification && url && /\/auth\/v1\/signup/.test(url) && init && typeof init.body === 'string') {
        var payload = JSON.parse(init.body);
        payload.data = Object.assign({}, payload.data || {}, pendingVerification);
        init = Object.assign({}, init, { body: JSON.stringify(payload) });
        pendingVerification = null;
      }
    } catch (_) {}
    return nativeFetch(input, init);
  };

  function enhance() {
    if (!routeIsProfessional()) return false;
    var root = document.getElementById('root');
    if (!root || root.querySelector('[data-nivenar-professional-verification]')) return false;
    var forms = root.querySelectorAll('form');
    var form = forms.length ? forms[0] : null;
    if (!form || (root.textContent || '').indexOf('Cadastre-se como fonoaudiólogo') === -1) return false;

    var licenseInput = null;
    Array.prototype.forEach.call(form.querySelectorAll('label'), function (label) {
      if ((label.textContent || '').toLowerCase().indexOf('registro profissional') !== -1) licenseInput = label.querySelector('input');
    });
    if (!licenseInput) return false;
    licenseInput.placeholder = 'Ex: 2-12345';

    var section = document.createElement('section');
    section.setAttribute('data-nivenar-professional-verification', 'true');
    section.style.cssText = 'border:1px solid #e8e8ef;border-radius:16px;padding:18px;background:#fafaff';
    section.innerHTML = '<div style="margin-bottom:14px"><div style="font-size:15px;font-weight:700;color:#24243b">Verificação profissional</div><div style="font-size:12px;color:#717184;margin-top:3px;line-height:1.45">Esses dados são usados pela NIVENAR para validar a identidade e o registro profissional antes da liberação do perfil.</div></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px">' +
      '<label style="display:block"><span style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;color:#45455b">CPF</span><input data-nivenar-cpf required inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" style="width:100%;box-sizing:border-box;border:1px solid #dedee7;border-radius:12px;padding:10px 14px;font-size:14px;background:#fff;outline:none" /></label>' +
      '<label style="display:block"><span style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;color:#45455b">Região do CRFa</span><select data-nivenar-region required style="width:100%;box-sizing:border-box;border:1px solid #dedee7;border-radius:12px;padding:10px 14px;font-size:14px;background:#fff;outline:none"><option value="">Selecione</option><option value="1">1ª Região</option><option value="2">2ª Região</option><option value="3">3ª Região</option><option value="4">4ª Região</option><option value="5">5ª Região</option><option value="6">6ª Região</option><option value="7">7ª Região</option><option value="8">8ª Região</option><option value="9">9ª Região</option></select></label>' +
      '</div>' +
      '<label style="display:block;margin-top:14px"><span style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;color:#45455b">Carteira de Identidade Profissional (CFFa / CRFa)</span><input data-nivenar-document required type="file" accept=".pdf,image/jpeg,image/png" style="display:block;width:100%;box-sizing:border-box;border:1px dashed #c9c9d7;border-radius:12px;padding:12px;background:#fff;font-size:13px" /><small style="display:block;margin-top:5px;color:#858597">PDF, JPG ou PNG. O documento será conferido antes da aprovação.</small></label>' +
      '<div style="margin-top:15px;display:grid;gap:10px">' +
      '<label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;line-height:1.45;color:#555568"><input data-nivenar-infra required type="checkbox" style="margin-top:3px" /> <span>Declaro possuir internet estável, câmera e microfone adequados para atendimento fonoaudiológico remoto.</span></label>' +
      '<label style="display:flex;gap:9px;align-items:flex-start;font-size:13px;line-height:1.45;color:#555568"><input data-nivenar-privacy required type="checkbox" style="margin-top:3px" /> <span>Declaro realizar os atendimentos em ambiente privado e adequado à preservação do sigilo do paciente.</span></label>' +
      '</div>' +
      '<div style="margin-top:14px;border-radius:11px;background:#eefbf4;color:#18794e;padding:10px 12px;font-size:12px;line-height:1.45"><strong>Verificação NIVENAR:</strong> CPF é validado estruturalmente no cadastro. O CRFa e o documento profissional ficam em análise até a confirmação do registro.</div>';

    var focusBlock = null;
    Array.prototype.forEach.call(form.children, function (child) {
      if ((child.textContent || '').indexOf('Áreas de foco') !== -1 && !focusBlock) focusBlock = child;
    });
    if (focusBlock) form.insertBefore(section, focusBlock); else form.insertBefore(section, form.lastElementChild);

    var cpfInput = section.querySelector('[data-nivenar-cpf]');
    cpfInput.addEventListener('input', function () { cpfInput.value = formatCPF(cpfInput.value); });

    form.addEventListener('submit', function (event) {
      var cpf = cpfInput.value;
      var region = section.querySelector('[data-nivenar-region]').value;
      var doc = section.querySelector('[data-nivenar-document]').files[0];
      var infra = section.querySelector('[data-nivenar-infra]').checked;
      var privacy = section.querySelector('[data-nivenar-privacy]').checked;
      if (!validCPF(cpf)) {
        event.preventDefault(); event.stopImmediatePropagation();
        message(form, 'Informe um CPF válido para continuar.'); return;
      }
      if (!region) {
        event.preventDefault(); event.stopImmediatePropagation();
        message(form, 'Selecione a região do seu CRFa.'); return;
      }
      if (!validCRFa(licenseInput.value)) {
        event.preventDefault(); event.stopImmediatePropagation();
        message(form, 'Informe um número de CRFa válido.'); return;
      }
      if (!doc) {
        event.preventDefault(); event.stopImmediatePropagation();
        message(form, 'Envie sua Carteira de Identidade Profissional em PDF, JPG ou PNG.'); return;
      }
      if (!/^(application\/pdf|image\/jpeg|image\/png)$/.test(doc.type)) {
        event.preventDefault(); event.stopImmediatePropagation();
        message(form, 'O documento profissional deve estar em PDF, JPG ou PNG.'); return;
      }
      if (!infra || !privacy) {
        event.preventDefault(); event.stopImmediatePropagation();
        message(form, 'Confirme as duas declarações obrigatórias para continuar.'); return;
      }
      pendingVerification = {
        cpf: digits(cpf),
        professional_region: region,
        professional_document_name: doc.name,
        cpf_verification_status: 'format_validated',
        professional_license_verification_status: 'pending_manual_review',
        infrastructure_confirmed: true,
        privacy_environment_confirmed: true,
        professional_onboarding_status: 'documents_under_review'
      };
    }, true);
    return true;
  }

  var attempts = 0;
  var timer = setInterval(function () {
    attempts += 1;
    enhance();
    if (attempts > 160) clearInterval(timer);
  }, 250);
  window.addEventListener('hashchange', function () { setTimeout(enhance, 50); });
  window.addEventListener('popstate', function () { setTimeout(enhance, 50); });
})();
