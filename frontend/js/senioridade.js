// endereço da nossa API backend
const API = 'http://127.0.0.1:8000'
protegerPagina() 

// elementos do formulário e do botão de enviar
const formSenioridade = document.getElementById('form-senioridade')
const botaoSubmit = document.getElementById('btn-submit-senioridade')
let senioridades = []

// limpa o formulário e devolve o botão para o modo de cadastro
function limparFormulario() {
  formSenioridade.reset()
  delete formSenioridade.dataset.idSenioridade
  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
}

// ─── Carrega a lista de senioridades ao abrir a página ───
async function listarSenioridades() {
  const resposta = await fetchAutenticado(`${API}/senioridade`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar as senioridades.')
  }
  senioridades = await resposta.json()

  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  senioridades.forEach(s => {
    corpo.innerHTML += `
      <tr>
        <td>${s.idsenioridade}</td>
        <td>${s.nome}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="preencherFormularioEdicao(${s.idsenioridade})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarSenioridade(${s.idsenioridade})">Excluir</button>
        </td>
      </tr>`
  })
}

listarSenioridades().catch(erro => alert(`Erro ao carregar senioridades: ${erro.message}`))

// ─── Cadastrar e atualizar senioridades ───
formSenioridade.addEventListener('submit', async (e) => {
  e.preventDefault()

  const senioridade = { nome: document.getElementById('nome').value }
  const idSenioridade = formSenioridade.dataset.idSenioridade

  try {
    const resposta = await fetchAutenticado(
      idSenioridade ? `${API}/senioridade/${idSenioridade}` : `${API}/senioridade`,
      {
        method: idSenioridade ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(senioridade)
      }
    )
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível salvar a senioridade.')
    }

    limparFormulario()
    await listarSenioridades()
  } catch (erro) {
    alert(`Erro ao salvar senioridade: ${erro.message}`)
  }
})

// ─── Abre os dados da senioridade no formulário para edição ───
function preencherFormularioEdicao(idSenioridade) {
  const senioridade = senioridades.find(item => item.idsenioridade === Number(idSenioridade))
  if (!senioridade) return

  document.getElementById('nome').value = senioridade.nome
  formSenioridade.dataset.idSenioridade = senioridade.idsenioridade

  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

// ─── Exclui uma senioridade ───
async function deletarSenioridade(id) {
  if (!confirm('Tem certeza que deseja excluir esta senioridade?')) return

  try {
    const resposta = await fetchAutenticado(`${API}/senioridade/${id}`, { method: 'DELETE' })
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível excluir a senioridade.')
    }
    await listarSenioridades()
  } catch (erro) {
    alert(`Erro ao excluir senioridade: ${erro.message}`)
  }
}