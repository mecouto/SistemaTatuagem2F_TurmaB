const API = 'http://127.0.0.1:8000'
protegerPagina() 

// elementos do formulário e do botão de enviar
const formAgendamento = document.getElementById('form-agendamento')
const botaoSubmit = document.getElementById('btn-submit-agendamento')
const blocoStatus = document.getElementById('bloco-status')
let agendamentos = []

// limpa o formulário e devolve para o modo de cadastro
function limparFormulario() {
  formAgendamento.reset()
  delete formAgendamento.dataset.idAgendamento
  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
  blocoStatus.style.display = 'none'   // esconde o status de novo — cadastro não usa esse campo
}

// ─── Busca os clientes na API e preenche o <select> ───
async function carregarClientes() {
  const resposta = await fetchAutenticado(`${API}/clientes`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os clientes.')
  }
  const clientes = await resposta.json()

  const select = document.getElementById('idcliente')
  select.innerHTML = '<option value="">Cliente...</option>'

  clientes.forEach(c => {
    select.innerHTML += `<option value="${c.idcliente}">${c.nome}</option>`
  })
}

// ─── Busca os tatuadores na API e preenche o <select> ───
async function carregarTatuadores() {
  const resposta = await fetchAutenticado(`${API}/tatuadores`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os tatuadores.')
  }
  const tatuadores = await resposta.json()

  const select = document.getElementById('idtatuador')
  select.innerHTML = '<option value="">Tatuador...</option>'

  tatuadores.forEach(t => {
    select.innerHTML += `<option value="${t.idtatuador}">${t.nometatuador}</option>`
  })
}

// ─── Carrega a lista de agendamentos ao abrir a página ───
async function listarAgendamentos() {
  const resposta = await fetchAutenticado(`${API}/agendamentos`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os agendamentos.')
  }
  agendamentos = await resposta.json()

  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  agendamentos.forEach(a => {
    // se existir um desenho salvo, monta uma miniatura; senão, mostra "-"
    const imagemHtml = a.desenhoaprovado
      ? `<img src="${API}/uploads/${a.desenhoaprovado}" style="max-width: 60px; max-height: 60px;">`
      : '-'

    corpo.innerHTML += `
      <tr>
        <td>${a.idagendamento}</td>
        <td>${a.cliente}</td>
        <td>${a.tatuador}</td>
        <td>${a.dataagendamento}</td>
        <td>${a.horaagendamento}</td>
        <td>${a.valortatuagem ?? '-'}</td>
        <td>${a.status}</td>
        <td>${imagemHtml}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="preencherFormularioEdicao(${a.idagendamento})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarAgendamento(${a.idagendamento})">Excluir</button>
        </td>
      </tr>`
  })
}

Promise.all([carregarClientes(), carregarTatuadores()])
  .then(listarAgendamentos)
  .catch(erro => alert(`Erro ao carregar agendamentos: ${erro.message}`))

// ─── Cadastrar e atualizar agendamentos ───
formAgendamento.addEventListener('submit', async (e) => {
  e.preventDefault()

  const agendamento = {
    idcliente: Number(document.getElementById('idcliente').value),
    idtatuador: Number(document.getElementById('idtatuador').value),
    dataagendamento: document.getElementById('dataagendamento').value,
    horaagendamento: document.getElementById('horaagendamento').value,
    descricaotatuagem: document.getElementById('descricaotatuagem').value || null,
    valortatuagem: document.getElementById('valortatuagem').value
      ? Number(document.getElementById('valortatuagem').value)
      : null,
    status: document.getElementById('status').value
  }

  const idAgendamento = formAgendamento.dataset.idAgendamento

  try {
    const resposta = await fetchAutenticado(
      idAgendamento ? `${API}/agendamentos/${idAgendamento}` : `${API}/agendamentos`,
      {
        method: idAgendamento ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamento)
      }
    )
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível salvar o agendamento.')
    }

    const dados = await resposta.json()
    const idParaUpload = idAgendamento || dados.idagendamento
    const arquivo = document.getElementById('desenho').files[0]
    if (arquivo) {
      const formData = new FormData()
      formData.append('arquivo', arquivo)

      const respostaUpload = await fetchAutenticado(`${API}/agendamentos/${idParaUpload}/desenho`, {
        method: 'POST',
        body: formData
      })
      if (!respostaUpload.ok) {
        const erro = await respostaUpload.json()
        throw new Error(erro.detail || erro.erro || 'Não foi possível enviar o desenho.')
      }
    }

    limparFormulario()
    await listarAgendamentos()
  } catch (erro) {
    alert(`Erro ao salvar agendamento: ${erro.message}`)
  }
})

// ─── Abre os dados do agendamento no formulário para edição ───
function preencherFormularioEdicao(idAgendamento) {
  const agendamento = agendamentos.find(item => item.idagendamento === Number(idAgendamento))
  if (!agendamento) return

  document.getElementById('idcliente').value = agendamento.idcliente
  document.getElementById('idtatuador').value = agendamento.idtatuador
  document.getElementById('dataagendamento').value = agendamento.dataagendamento
  document.getElementById('horaagendamento').value = agendamento.horaagendamento
  document.getElementById('descricaotatuagem').value = agendamento.descricaotatuagem || ''
  document.getElementById('valortatuagem').value = agendamento.valortatuagem ?? ''

  document.getElementById('status').value = agendamento.status
  blocoStatus.style.display = 'block'   // só na edição o campo de status aparece

  formAgendamento.dataset.idAgendamento = agendamento.idagendamento

  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

// ─── Exclui um agendamento ───
async function deletarAgendamento(id) {
  if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

  try {
    const resposta = await fetchAutenticado(`${API}/agendamentos/${id}`, { method: 'DELETE' })
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível excluir o agendamento.')
    }
    await listarAgendamentos()
  } catch (erro) {
    alert(`Erro ao excluir agendamento: ${erro.message}`)
  }
}
