const API = 'http://127.0.0.1:8000'
protegerPagina()

const formEstilo = document.getElementById('form-estilo')
const botaoSubmit = document.getElementById('btn-submit-estilo')
let estilos = []

function limparFormulario() {
  formEstilo.reset()
  delete formEstilo.dataset.idEstilo
  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
}

async function listarEstilos() {
  const resposta = await fetchAutenticado(`${API}/estilos`)
  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os estilos.')
  }

  estilos = await resposta.json()
  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  estilos.forEach(estilo => {
    corpo.innerHTML += `
      <tr>
        <td>${estilo.idestilo}</td>
        <td>${estilo.descricao}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="preencherFormularioEdicao(${estilo.idestilo})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarEstilo(${estilo.idestilo})">Excluir</button>
        </td>
      </tr>`
  })
}

formEstilo.addEventListener('submit', async (e) => {
  e.preventDefault()

  const estilo = { descricao: document.getElementById('descricao').value }
  const idEstilo = formEstilo.dataset.idEstilo

  try {
    const resposta = await fetchAutenticado(
      idEstilo ? `${API}/estilos/${idEstilo}` : `${API}/estilos`,
      {
        method: idEstilo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estilo)
      }
    )
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível salvar o estilo.')
    }

    limparFormulario()
    await listarEstilos()
  } catch (erro) {
    alert(`Erro ao salvar estilo: ${erro.message}`)
  }
})

function preencherFormularioEdicao(idEstilo) {
  const estilo = estilos.find(item => item.idestilo === Number(idEstilo))
  if (!estilo) return

  document.getElementById('descricao').value = estilo.descricao
  formEstilo.dataset.idEstilo = estilo.idestilo
  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

async function deletarEstilo(id) {
  if (!confirm('Tem certeza que deseja excluir este estilo?')) return

  try {
    const resposta = await fetchAutenticado(`${API}/estilos/${id}`, { method: 'DELETE' })
    if (!resposta.ok) {
      const erro = await resposta.json()
      throw new Error(erro.detail || erro.erro || 'Não foi possível excluir o estilo.')
    }
    await listarEstilos()
  } catch (erro) {
    alert(`Erro ao excluir estilo: ${erro.message}`)
  }
}

listarEstilos().catch(erro => alert(`Erro ao carregar estilos: ${erro.message}`))
