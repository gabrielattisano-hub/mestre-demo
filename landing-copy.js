(function () {
  var replacements = [
    ['Pratique quando quiser, evolua no seu ritmo e conte com inteligência artificial para manter sua jornada em movimento.', 'Profissionais, pacientes, atividades e evolução conectados em um só lugar. Aqui, seu profissional conduz sua jornada, você pratica além das sessões e a NIVENAR auxilia no acompanhamento da sua evolução. Uma plataforma de acompanhamento fonoaudiológico contínuo, onde tecnologia e profissional trabalham juntos para manter seu cuidado em movimento.'],
    ['Praticar por conta própria', 'Ainda não tenho fonoaudiólogo'],
    ['Sem esperar por ninguém: a IA conduz o treino e adapta as atividades ao seu ritmo.', 'A NIVENAR ajuda você a encontrar um profissional. O tratamento começa com avaliação e condução profissional, enquanto a tecnologia auxilia na continuidade do cuidado entre as sessões.'],
    ['Com acompanhamento profissional', 'Já tenho acompanhamento profissional'],
    ['Seu profissional acompanha sua evolução, ajusta sua jornada e indica atividades para você praticar entre as sessões.', 'Seu profissional conduz sua jornada e usa a NIVENAR para organizar atividades, acompanhar sua prática e ajustar seu cuidado ao longo do processo.'],
    ['A IA que acompanha sua evolução', 'Tecnologia que auxilia seu cuidado'],
    ['NIV e NIVA acompanham sua rotina, entendem seu progresso e ajudam você a manter o ritmo.', 'NIV e NIVA auxiliam sua jornada com atividades, lembretes e apoio entre as sessões, sempre dentro do plano definido pelo seu profissional. Eles não diagnosticam, não definem tratamento e não substituem o fonoaudiólogo.'],
    ['Pratique no seu ritmo', 'Continue seu cuidado entre as sessões'],
    ['Comece agora e descubra uma nova forma de evoluir.', 'O profissional conduz. Você pratica entre as sessões. A tecnologia auxilia e conecta cada etapa do cuidado.']
  ];

  function replaceText(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var value = node.nodeValue || '';
      for (var i = 0; i < replacements.length; i++) {
        var from = replacements[i][0];
        if (value.indexOf(from) !== -1) {
          value = value.split(from).join(replacements[i][1]);
          node.nodeValue = value;
        }
      }
    }
  }

  function addManifesto(root) {
    if (document.getElementById('nivenar-professional-manifesto')) return;
    var text = root.textContent || '';
    if (text.indexOf('Ainda não tenho fonoaudiólogo') === -1) return;
    var box = document.createElement('div');
    box.id = 'nivenar-professional-manifesto';
    box.setAttribute('role', 'note');
    box.style.cssText = 'max-width:1040px;margin:20px auto;padding:16px 22px;border-radius:18px;background:rgba(65,57,145,.08);text-align:center;font-weight:700;line-height:1.5;box-sizing:border-box';
    box.textContent = 'O profissional conduz. O paciente pratica. A tecnologia auxilia. A NIVENAR conecta tudo.';
    var target = root.querySelector('main') || root;
    if (target.firstElementChild) target.insertBefore(box, target.firstElementChild.nextSibling);
    else target.appendChild(box);
  }

  function apply() {
    var root = document.getElementById('root');
    if (!root) return;
    replaceText(root);
    addManifesto(root);
  }

  apply();
  var attempts = 0;
  var timer = setInterval(function () {
    attempts++;
    apply();
    var root = document.getElementById('root');
    var text = root ? (root.textContent || '') : '';
    if ((text.indexOf('Ainda não tenho fonoaudiólogo') !== -1 && text.indexOf('Praticar por conta própria') === -1) || attempts >= 80) {
      clearInterval(timer);
    }
  }, 250);

  window.addEventListener('hashchange', function () { setTimeout(apply, 50); setTimeout(apply, 300); });
  window.addEventListener('popstate', function () { setTimeout(apply, 50); setTimeout(apply, 300); });
})();
