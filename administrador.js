// Variáveis globais
let comidas = [];
let editandoId = null;

// URL base da API
const API_BASE = 'http://localhost:3000/api';

// Elementos DOM
const form = document.getElementById('comida-form');
const messageDiv = document.getElementById('message');
const loadingDiv = document.getElementById('loading');
const comidasContainer = document.getElementById('comidas-container');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    carregarComidas();
    configurarFormulario();
});

/**
 * Configura os event listeners do formulário
 */
function configurarFormulario() {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        salvarComida();
    });
}

/**
 * Carrega todas as comidas da API
 */
async function carregarComidas() {
    try {
        mostrarLoading(true);
        esconderMensagem();
        
        const response = await fetch(`${API_BASE}/comidas`);
        const data = await response.json();
        
        if (data.success) {
            comidas = data.data;
            renderizarComidas();
            mostrarMensagem('Lista de comidas carregada com sucesso!', 'success');
        } else {
            throw new Error(data.message || 'Erro ao carregar comidas');
        }
    } catch (error) {
        console.error('Erro ao carregar comidas:', error);
        mostrarMensagem('Erro ao carregar comidas: ' + error.message, 'error');
        mostrarEstadoVazio();
    } finally {
        mostrarLoading(false);
    }
}

/**
 * Renderiza a lista de comidas no DOM
 */
function renderizarComidas() {
    if (!comidas || comidas.length === 0) {
        mostrarEstadoVazio();
        return;
    }

    comidasContainer.innerHTML = '';
    comidasContainer.classList.remove('hidden');

    comidas.forEach(comida => {
        const comidaElement = criarElementoComida(comida);
        comidasContainer.appendChild(comidaElement);
    });
}

/**
 * Cria um elemento DOM para uma comida
 */
function criarElementoComida(comida) {
    const div = document.createElement('div');
    div.className = 'comida-item';
    div.innerHTML = `
        <img src="${comida.imagem}" alt="${comida.alt}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23f0f0f0%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2212%22 fill=%22%23999%22>Sem imagem</text></svg>'">
        <div class="comida-info">
            <h3>${comida.nomeUcraniano}</h3>
            <p><strong>Tradução:</strong> ${comida.traducao}</p>
            <p><strong>Imagem:</strong> ${comida.imagem}</p>
            <p class="id-info">ID: ${comida.id}</p>
        </div>
        <div class="comida-actions">
            <button class="btn btn-warning" onclick="editarComida(${comida.id})">
                ✏️ Editar
            </button>
            <button class="btn btn-danger" onclick="confirmarExclusao(${comida.id}, '${comida.nomeUcraniano}')">
                🗑️ Excluir
            </button>
        </div>
    `;
    return div;
}

/**
 * Mostra estado vazio quando não há comidas
 */
function mostrarEstadoVazio() {
    comidasContainer.innerHTML = `
        <div class="empty-state">
            <h3>📭 Nenhuma comida encontrada</h3>
            <p>Adicione a primeira comida ucraniana ao cardápio!</p>
        </div>
    `;
    comidasContainer.classList.remove('hidden');
}

/**
 * Salva uma comida (adicionar ou editar)
 */
async function salvarComida() {
    const formData = obterDadosFormulario();
    
    if (!validarFormulario(formData)) {
        return;
    }

    const isEdicao = editandoId !== null;
    const url = isEdicao ? `${API_BASE}/comidas/${editandoId}` : `${API_BASE}/comidas`;
    const method = isEdicao ? 'PUT' : 'POST';
    
    try {
        desabilitarFormulario(true);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            const mensagem = isEdicao ? 'Comida atualizada com sucesso!' : 'Comida adicionada com sucesso!';
            mostrarMensagem(mensagem, 'success');
            limparFormulario();
            cancelarEdicao();
            await carregarComidas();
        } else {
            throw new Error(data.message || 'Erro ao salvar comida');
        }
    } catch (error) {
        console.error('Erro ao salvar comida:', error);
        mostrarMensagem('Erro ao salvar comida: ' + error.message, 'error');
    } finally {
        desabilitarFormulario(false);
    }
}

/**
 * Obtém os dados do formulário
 */
function obterDadosFormulario() {
    return {
        nomeUcraniano: document.getElementById('nome-ucraniano').value.trim(),
        traducao: document.getElementById('traducao').value.trim(),
        imagem: document.getElementById('imagem').value.trim(),
        alt: document.getElementById('alt').value.trim()
    };
}

/**
 * Valida os dados do formulário
 */
function validarFormulario(data) {
    if (!data.nomeUcraniano || !data.traducao || !data.imagem || !data.alt) {
        mostrarMensagem('Todos os campos são obrigatórios!', 'error');
        return false;
    }
    
    // Validação básica de URL de imagem
    if (!data.imagem.match(/\.(jpeg|jpg|gif|png|webp)$/i) && !data.imagem.startsWith('data:image/')) {
        mostrarMensagem('URL da imagem deve terminar com uma extensão de imagem válida (.jpg, .jpeg, .png, .gif, .webp)', 'error');
        return false;
    }
    
    return true;
}

/**
 * Edita uma comida
 */
async function editarComida(id) {
    try {
        const response = await fetch(`${API_BASE}/comidas/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const comida = data.data;
            preencherFormulario(comida);
            editandoId = id;
            
            // Atualizar UI para modo de edição
            formTitle.textContent = '✏️ Editar Comida';
            submitBtn.textContent = '💾 Salvar Alterações';
            
            // Scroll para o formulário
            document.querySelector('.form-section').scrollIntoView({ 
                behavior: 'smooth' 
            });
            
            mostrarMensagem(`Editando: ${comida.nomeUcraniano}`, 'info');
        } else {
            throw new Error(data.message || 'Erro ao buscar comida');
        }
    } catch (error) {
        console.error('Erro ao editar comida:', error);
        mostrarMensagem('Erro ao carregar dados para edição: ' + error.message, 'error');
    }
}

/**
 * Preenche o formulário com dados de uma comida
 */
function preencherFormulario(comida) {
    document.getElementById('nome-ucraniano').value = comida.nomeUcraniano;
    document.getElementById('traducao').value = comida.traducao;
    document.getElementById('imagem').value = comida.imagem;
    document.getElementById('alt').value = comida.alt;
}

/**
 * Cancela a edição
 */
function cancelarEdicao() {
    editandoId = null;
    formTitle.textContent = '➕ Adicionar Nova Comida';
    submitBtn.textContent = '➕ Adicionar Comida';
    limparFormulario();
    esconderMensagem();
}

/**
 * Confirma a exclusão de uma comida
 */
function confirmarExclusao(id, nome) {
    const confirmacao = confirm(`Tem certeza que deseja excluir "${nome}"?\n\nEsta ação não pode ser desfeita.`);
    
    if (confirmacao) {
        excluirComida(id);
    }
}

/**
 * Exclui uma comida
 */
async function excluirComida(id) {
    try {
        const response = await fetch(`${API_BASE}/comidas/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            mostrarMensagem('Comida excluída com sucesso!', 'success');
            await carregarComidas();
            
            // Se estava editando a comida excluída, cancelar edição
            if (editandoId === id) {
                cancelarEdicao();
            }
        } else {
            throw new Error(data.message || 'Erro ao excluir comida');
        }
    } catch (error) {
        console.error('Erro ao excluir comida:', error);
        mostrarMensagem('Erro ao excluir comida: ' + error.message, 'error');
    }
}

/**
 * Limpa o formulário
 */
function limparFormulario() {
    form.reset();
}

/**
 * Desabilita/habilita o formulário
 */
function desabilitarFormulario(desabilitar) {
    const elementos = form.querySelectorAll('input, button');
    elementos.forEach(elemento => {
        elemento.disabled = desabilitar;
    });
    
    if (desabilitar) {
        submitBtn.classList.add('loading');
    } else {
        submitBtn.classList.remove('loading');
    }
}

/**
 * Mostra/esconde o indicador de carregamento
 */
function mostrarLoading(mostrar) {
    if (mostrar) {
        loadingDiv.classList.remove('hidden');
        comidasContainer.classList.add('hidden');
    } else {
        loadingDiv.classList.add('hidden');
    }
}

/**
 * Mostra uma mensagem para o usuário
 */
function mostrarMensagem(texto, tipo = 'info') {
    messageDiv.textContent = texto;
    messageDiv.className = `message ${tipo}`;
    messageDiv.classList.remove('hidden');
    
    // Auto-esconder mensagens de sucesso após 5 segundos
    if (tipo === 'success') {
        setTimeout(() => {
            esconderMensagem();
        }, 5000);
    }
    
    // Scroll para a mensagem
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Esconde a mensagem
 */
function esconderMensagem() {
    messageDiv.classList.add('hidden');
}

/**
 * Volta para a página do cardápio
 */
function voltarParaCardapio() {
    if (editandoId !== null) {
        const confirmacao = confirm('Você tem alterações não salvas. Deseja realmente sair?');
        if (!confirmacao) {
            return;
        }
    }
    
    window.location.href = 'index.html';
}

// Funções utilitárias para debugging (podem ser chamadas no console)
window.debugAdmin = {
    comidas: () => comidas,
    recarregar: carregarComidas,
    limpar: limparFormulario,
    cancelar: cancelarEdicao
};

// Confirmação antes de sair da página se estiver editando
window.addEventListener('beforeunload', function(e) {
    if (editandoId !== null) {
        e.preventDefault();
        e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
        return e.returnValue;
    }
});

// Atalhos de teclado
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter para salvar
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        salvarComida();
    }
    
    // Escape para cancelar edição
    if (e.key === 'Escape' && editandoId !== null) {
        cancelarEdicao();
    }
});