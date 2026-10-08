var state = criarEstadoPadrao();

function criarEstadoPadrao() {
  return {
    umidade: 48,
    temperatura: 24,
    modoManual: false,
    irrigacaoLigada: false,
    leiturasUmidade: [30, 42, 48, 55, 52, 48],
    historico: [
      {
        id: "estado-inicial",
        horario: new Date().toISOString(),
        umidade: 48,
        temperatura: 24,
        irrigacaoLigada: false,
        origem: "Inicial"
      }
    ],
    tema: "claro",
    textoGrande: false
  };
}

function calcularIrrigacaoAutomatica() {
  return state.umidade < 35;
}

function registrarEvento(origem, descricao) {
  var registro = {
    id: Date.now() + Math.random(),
    horario: new Date().toISOString(),
    umidade: state.umidade,
    temperatura: state.temperatura,
    irrigacaoLigada: state.irrigacaoLigada,
    origem: origem,
    descricao: descricao
  };

  state.historico.push(registro);
  if (state.historico.length > 30) {
    state.historico.shift();
  }
}

function atualizarPainel() {
  if (!state.modoManual) {
    state.irrigacaoLigada = calcularIrrigacaoAutomatica();
  }

  var umidadeElement = document.getElementById("humidity-value");
  var temperaturaElement = document.getElementById("temperature-value");
  var umidadeMeter = document.getElementById("humidity-meter");
  var umidadeBarra = document.getElementById("humidity-bar");
  var notaUmidade = document.getElementById("humidity-note");
  var valorIrrigacao = document.getElementById("irrigation-value");
  var notaIrrigacao = document.getElementById("irrigation-note");
  var pontoIrrigacao = document.getElementById("irrigation-dot");
  var botaoIrrigacao = document.getElementById("irrigation-button");
  var descricaoControle = document.getElementById("control-description");
  var avisoManual = document.getElementById("manual-hint");
  var botaoAutomatico = document.getElementById("auto-button");

  if (umidadeElement) umidadeElement.textContent = state.umidade;
  if (temperaturaElement) temperaturaElement.textContent = Math.round(state.temperatura);
  if (umidadeMeter) umidadeMeter.setAttribute("aria-valuenow", String(state.umidade));
  if (umidadeBarra) umidadeBarra.style.width = state.umidade + "%";

  if (notaUmidade) {
    notaUmidade.textContent = state.umidade < 35
      ? "Solo seco: precisa de água"
      : "Solo com boa umidade";
  }

  if (valorIrrigacao) {
    valorIrrigacao.textContent = state.irrigacaoLigada ? "Ligada" : "Desligada";
  }
  if (notaIrrigacao) {
    notaIrrigacao.textContent = state.irrigacaoLigada
      ? "A água está passando."
      : "A água não está passando.";
  }
  if (pontoIrrigacao) {
    pontoIrrigacao.classList.toggle("is-on", state.irrigacaoLigada);
  }
  if (botaoIrrigacao) {
    botaoIrrigacao.textContent = state.irrigacaoLigada ? "Desligar irrigação" : "Ligar irrigação";
  }

  if (descricaoControle) {
    descricaoControle.textContent = state.modoManual
      ? "Você está controlando a irrigação manualmente."
      : "O sistema automático liga a água quando a umidade fica abaixo de 35%.";
  }
  if (avisoManual) {
    avisoManual.textContent = state.modoManual
      ? "A leitura dos sensores continua sendo atualizada."
      : "A irrigação está sendo controlada pelos sensores.";
  }
  if (botaoAutomatico) {
    botaoAutomatico.hidden = !state.modoManual;
  }

  atualizarGrafico();
  atualizarHistorico();
}

function atualizarGrafico() {
  var grafico = document.getElementById("readings-chart");
  if (!grafico) return;

  var barras = "";
  var limite = state.leiturasUmidade.length;

  for (var i = 0; i < limite; i += 1) {
    barras += '<div class="chart-column"><div class="chart-bar" style="height: ' + state.leiturasUmidade[i] + '%" aria-hidden="true"></div></div>';
  }

  grafico.innerHTML = barras;
}

function atualizarHistorico() {
  var corpoTabela = document.getElementById("history-table-body");
  var mediaUmidade = document.getElementById("average-humidity");
  var mediaTemperatura = document.getElementById("average-temperature");
  var totalLeituras = document.getElementById("readings-count");

  if (!corpoTabela) return;

  var total = state.historico.length;
  var umidadeMedia = 0;
  var temperaturaMedia = 0;

  state.historico.forEach(function(registro) {
    umidadeMedia += registro.umidade;
    temperaturaMedia += registro.temperatura;
  });

  if (total > 0) {
    umidadeMedia = (umidadeMedia / total).toFixed(1);
    temperaturaMedia = (temperaturaMedia / total).toFixed(1);
  }

  if (mediaUmidade) mediaUmidade.textContent = total ? umidadeMedia + "%" : "--";
  if (mediaTemperatura) mediaTemperatura.textContent = total ? temperaturaMedia + "°C" : "--";
  if (totalLeituras) totalLeituras.textContent = String(total);

  var linhas = state.historico.slice().reverse().map(function(registro) {
    var horario = new Date(registro.horario).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    var origem = registro.descricao ? registro.descricao : registro.origem;
    return "<tr><td>" + horario + "</td><td>" + registro.umidade + "%</td><td>" + Math.round(registro.temperatura) + "°C</td><td>" + (registro.irrigacaoLigada ? "Ligada" : "Desligada") + "</td><td>" + origem + "</td></tr>";
  }).join("");

  corpoTabela.innerHTML = linhas || '<tr><td colspan="5" class="empty-state">Nenhum registro disponível.</td></tr>';
}

function novaLeitura() {
  state.umidade += Math.floor(Math.random() * 15) - 7;
  state.temperatura += Math.random() * 1.4 - 0.7;

  if (state.umidade < 15) state.umidade = 15;
  if (state.umidade > 80) state.umidade = 80;
  if (state.temperatura < 18) state.temperatura = 18;
  if (state.temperatura > 34) state.temperatura = 34;

  state.leiturasUmidade.push(state.umidade);
  if (state.leiturasUmidade.length > 8) {
    state.leiturasUmidade.shift();
  }

  if (!state.modoManual) {
    state.irrigacaoLigada = calcularIrrigacaoAutomatica();
  }

  registrarEvento("Leitura simulada", "Nova leitura registrada");
  atualizarPainel();
}

function alternarConfiguracoes() {
  var menu = document.getElementById("settings-menu");
  var botao = document.getElementById("settings-button");

  menu.hidden = !menu.hidden;
  botao.setAttribute("aria-expanded", String(!menu.hidden));
}

function aplicarConfiguracao() {
  document.body.classList.toggle("large-text", state.textoGrande);
  document.documentElement.style.setProperty("--background", {
    claro: "#fffefa",
    verde: "#edf5ea",
    azul: "#eaf3fa"
  }[state.tema]);

  var seletor = document.getElementById("theme-select");
  if (seletor) seletor.value = state.tema;
}

function aumentarTexto() {
  state.textoGrande = !state.textoGrande;
  aplicarConfiguracao();
}

function mudarTema() {
  state.tema = document.getElementById("theme-select").value;
  aplicarConfiguracao();
}

function mostrarSair() {
  var botao = document.getElementById("logout-button");
  botao.hidden = !botao.hidden;
}

function sairDaSimulacao() {
  document.querySelector("main").hidden = true;
  document.getElementById("logout-button").hidden = true;
  document.getElementById("settings-button").hidden = true;
  document.body.insertAdjacentHTML("beforeend", "<div class=\"logout-message\">Simulação encerrada.</div>");
}

function alternarIrrigacao() {
  state.modoManual = true;
  state.irrigacaoLigada = !state.irrigacaoLigada;
  registrarEvento("Manual", state.irrigacaoLigada ? "Irrigação ligada manualmente" : "Irrigação desligada manualmente");
  atualizarPainel();
}

function voltarAoAutomatico() {
  state.modoManual = false;
  state.irrigacaoLigada = calcularIrrigacaoAutomatica();
  registrarEvento("Automático", "Sistema voltou ao controle automático");
  atualizarPainel();
}

function limparHistorico() {
  state.historico = [];
  atualizarHistorico();
}

function inicializarPagina() {
  aplicarConfiguracao();

  var botaoIrrigacao = document.getElementById("irrigation-button");
  var botaoAutomatico = document.getElementById("auto-button");
  var botaoAtualizar = document.getElementById("refresh-button");
  var botaoConfiguracoes = document.getElementById("settings-button");
  var botaoTexto = document.getElementById("text-size-button");
  var seletorTema = document.getElementById("theme-select");
  var botaoMostrarSair = document.getElementById("show-logout-button");
  var botaoSair = document.getElementById("logout-button");
  var botaoLimparHistorico = document.getElementById("clear-history-button");

  if (botaoIrrigacao) botaoIrrigacao.onclick = alternarIrrigacao;
  if (botaoAutomatico) botaoAutomatico.onclick = voltarAoAutomatico;
  if (botaoAtualizar) botaoAtualizar.onclick = novaLeitura;
  if (botaoConfiguracoes) botaoConfiguracoes.onclick = alternarConfiguracoes;
  if (botaoTexto) botaoTexto.onclick = aumentarTexto;
  if (seletorTema) seletorTema.onchange = mudarTema;
  if (botaoMostrarSair) botaoMostrarSair.onclick = mostrarSair;
  if (botaoSair) botaoSair.onclick = sairDaSimulacao;
  if (botaoLimparHistorico) botaoLimparHistorico.onclick = limparHistorico;

  atualizarPainel();
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", inicializarPagina);
}

window.setInterval(function() {
  if (document.getElementById("refresh-button")) {
    novaLeitura();
  }
}, 8000);