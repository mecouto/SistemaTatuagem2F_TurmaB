const API = 'http://127.0.0.1:8000'
const formEstilo = document.getElementById('form-estilo')
const botaoSubmit = document.getElementById('btn-submit-estilo')

function limparFormulario() {
  formEstilo.reset()
  delete formEstilo.dataset.idEstilo
  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
}

async function listarEstilos() {
  const resposta = await fetch(`${API}/estilos`)
  const estilos = await resposta.json()

  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  estilos.forEach(e => {
    corpo.innerHTML += `
      <tr>
        <td>${e.idestilo}</td>
        <td>${e.descricao}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick='preencherFormularioEdicao(${JSON.stringify(e)})'>Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarEstilo(${e.idestilo})">Excluir</button>
        </td>
      </tr>`
  })
}

listarEstilos()

formTatuador.addEventListener('submit', async (e) => {
  e.preventDefault()

  const tatuador = {
    nometatuador: document.getElementById('nometatuador').value,
    cpf: document.getElementById('cpf').value,
    email: document.getElementById('email').value || null,
    telefone: document.getElementById('telefone').value || null,
    datacontratacao: new Date().toISOString().split('T')[0],
    idsenioridade: Number(document.getElementById('idsenioridade').value)
  }

  const idTatuador = formTatuador.dataset.idTatuador
  let idParaEstilos = idTatuador   // qual id vamos usar pra salvar os estilos

  if (idTatuador) {
    await fetch(`${API}/tatuadores/${idTatuador}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tatuador)
    })
  } else {
    const resposta = await fetch(`${API}/tatuadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tatuador)
    })
    const dados = await resposta.json()
    idParaEstilos = dados.idtatuador   // pega o id que acabou de ser criado
  }

  // ─── Salva os estilos marcados, numa segunda chamada ───
  const idsMarcados = Array.from(document.querySelectorAll('#lista-estilos input:checked'))
    .map(checkbox => Number(checkbox.value))

  await fetch(`${API}/tatuadores/${idParaEstilos}/estilos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idestilos: idsMarcados })
  })

  limparFormulario()
  listarTatuadores()
})

function preencherFormularioEdicao(estilo) {
  document.getElementById('descricao').value = estilo.descricao
  formEstilo.dataset.idEstilo = estilo.idestilo
  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

async function deletarEstilo(id) {
  if (!confirm('Tem certeza que deseja excluir este estilo?')) return
  await fetch(`${API}/estilos/${id}`, { method: 'DELETE' })
  listarEstilos()
}

// ─── Busca os estilos na API e monta os checkboxes ───
async function carregarEstilos() {
  const resposta = await fetch(`${API}/estilos`)
  const estilos = await resposta.json()

  const lista = document.getElementById('lista-estilos')
  lista.innerHTML = ''

  estilos.forEach(e => {
    lista.innerHTML += `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${e.idestilo}" id="estilo-${e.idestilo}">
        <label class="form-check-label" for="estilo-${e.idestilo}">${e.descricao}</label>
      </div>`
  })
}

carregarEstilos()