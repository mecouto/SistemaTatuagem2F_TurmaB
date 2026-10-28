const API = 'http://127.0.0.1:8000'
protegerPagina() 

// elementos do formulário e do botão de enviar
const formTatuador = document.getElementById('form-tatuador')
const botaoSubmit = document.getElementById('btn-submit-tatuador')
let tatuadores = []

// limpa o formulário e devolve o botão para o modo de cadastro
function limparFormulario() {
  formTatuador.reset()
  delete formTatuador.dataset.idTatuador
  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
}

// ─── Busca as senioridades na API e preenche o <select> ───
async function carregarSenioridades() {
  const resposta = await fetchAutenticado(`${API}/senioridade`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar as senioridades.')
  }
  const senioridades = await resposta.json()

  const select = document.getElementById('idsenioridade')
  select.innerHTML = '<option value="">Senioridade...</option>'

  senioridades.forEach(s => {
    select.innerHTML += `<option value="${s.idsenioridade}">${s.nome}</option>`
  })
}

// ─── Carrega a lista de tatuadores ao abrir a página ───
async function listarTatuadores() {
  const resposta = await fetchAutenticado(`${API}/tatuadores`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os tatuadores.')
  }
  tatuadores = await resposta.json()

  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  tatuadores.forEach(t => {
    corpo.innerHTML += `
      <tr>
        <td>${t.idtatuador}</td>
        <td>${t.nometatuador}</td>
        <td>${t.cpf}</td>
        <td>${t.email ?? '-'}</td>
        <td>${t.telefone ?? '-'}</td>
        <td>${t.senioridade}</td>
        <td>${t.estilos ?? '-'}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="preencherFormularioEdicao(${t.idtatuador})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarTatuador(${t.idtatuador})">Excluir</button>
        </td>
      </tr>`
  })
}

// ─── Cadastrar e atualizar tatuadores ───
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

  try {
    const resposta = await fetchAutenticado(
      idTatuador ? `${API}/tatuadores/${idTatuador}` : `${API}/tatuadores`,
      {
        method: idTatuador ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tatuador)
      }
    )
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível salvar o tatuador.')
    }

    const dados = await resposta.json()
    const idParaEstilos = idTatuador || dados.idtatuador
    const idsMarcados = Array.from(document.querySelectorAll('#lista-estilos input:checked'))
      .map(checkbox => Number(checkbox.value))
    const respostaEstilos = await fetchAutenticado(`${API}/tatuadores/${idParaEstilos}/estilos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idestilos: idsMarcados })
    })
    if (!respostaEstilos.ok) {
      const erro = await respostaEstilos.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível salvar os estilos do tatuador.')
    }

    limparFormulario()
    await listarTatuadores()
  } catch (erro) {
    alert(`Erro ao salvar tatuador: ${erro.message}`)
  }
})

// ─── Abre os dados do tatuador no formulário para edição ───
async function preencherFormularioEdicao(idTatuador) {
  const tatuador = tatuadores.find(item => item.idtatuador === Number(idTatuador))
  if (!tatuador) return

  try {
    const resposta = await fetchAutenticado(`${API}/tatuadores/${tatuador.idtatuador}/estilos`)
    if (!resposta.ok) {
      throw new Error('Não foi possível carregar os estilos do tatuador.')
    }
    const estilosDoTatuador = await resposta.json()

    document.getElementById('nometatuador').value = tatuador.nometatuador
    document.getElementById('cpf').value = tatuador.cpf
    document.getElementById('email').value = tatuador.email || ''
    document.getElementById('telefone').value = tatuador.telefone || ''
    document.getElementById('idsenioridade').value = tatuador.idsenioridade
    document.querySelectorAll('#lista-estilos input').forEach(cb => cb.checked = false)
    estilosDoTatuador.forEach(e => {
      const checkbox = document.getElementById(`estilo-${e.idestilo}`)
      if (checkbox) checkbox.checked = true
    })

    formTatuador.dataset.idTatuador = tatuador.idtatuador
    botaoSubmit.textContent = 'Salvar alteração'
    botaoSubmit.classList.remove('btn-primary')
    botaoSubmit.classList.add('btn-success')
  } catch (erro) {
    alert(`Erro ao editar tatuador: ${erro.message}`)
  }
}


// ─── Busca os estilos na API e monta os checkboxes ───
async function carregarEstilos() {
  const resposta = await fetchAutenticado(`${API}/estilos`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os estilos.')
  }
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

Promise.all([carregarSenioridades(), carregarEstilos()])
  .then(listarTatuadores)
  .catch(erro => alert(`Erro ao carregar dados do formulário: ${erro.message}`))