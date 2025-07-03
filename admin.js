// Configuração da API
const API_BASE = 'http://localhost:3000/api';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    verificarAutorizacao();
    atualizarDashboard();
    carregarComidas();
    carregarUsuarios();
    configurarFormularios();
});

function verificarAutorizacao() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    if (!usuarioLogado || usuarioLogado.tipo !== 'gerente') {
        alert('Acesso negado! Apenas gerentes podem acessar esta área.');
        window.location.href = 'login.html';
        return;
    }
}

async function atualizarDashboard() {
    try {
        // Carregar estatísticas do servidor
        const [comidasRes, usuariosRes] = await Promise.all([
            fetch(`${API_BASE}/comidas`),
            fetch(`${API_BASE}/auth/usuarios`)
        ]);
        
        const comidasData = await comidasRes.json();
        const usuariosData = await usuariosRes.json();
        
        document.getElementById('totalComidas').textContent = comidasData.success ? comidasData.data.length : 0;
        document.getElementById('totalUsuarios').textContent = usuariosData.success ? usuariosData.data.length : 0;
        document.getElementById('totalPedidos').textContent = 0; // Implementar depois
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        mostrarMensagem('dashboard', 'Erro ao conectar com o servidor!', 'error');
    }
}

function showSection(sectionName) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    document.getElementById(sectionName).classList.add('active');
    
    // Atualizar dados se necessário
    if (sectionName === 'dashboard') {
        atualizarDashboard();
    } else if (sectionName === 'comidas') {
        carregarComidas();
    } else if (sectionName === 'usuarios') {
        carregarUsuarios();
    }
}

// === GERENCIAMENTO DE COMIDAS COM SERVIDOR ===

async function carregarComidas() {
    try {
        const response = await fetch(`${API_BASE}/comidas`);
        const data = await response.json();
        
        if (data.success) {
            renderizarTabelaComidas(data.data);
        } else {
            mostrarMensagem('comidas', 'Erro ao carregar comidas!', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar comidas:', error);
        mostrarMensagem('comidas', 'Erro ao conectar com o servidor!', 'error');
    }
}

function renderizarTabelaComidas(comidas) {
    const tbody = document.getElementById('tabelaComidas');
    tbody.innerHTML = '';
    
    comidas.forEach(comida => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${comida.id}</td>
            <td>${comida.nomeUcraniano}</td>
            <td>${comida.traducao}</td>
            <td>R$ ${(comida.preco || 0).toFixed(2)}</td>
            <td><img src="${comida.imagem}" alt="${comida.alt}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
            <td class="action-buttons">
                <button class="btn btn-warning" onclick="editarComida(${comida.id})">✏️ Editar</button>
                <button class="btn btn-danger" onclick="excluirComida(${comida.id})">🗑️ Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function configurarFormularios() {
    document.getElementById('formComida').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarComida();
    });
    
    document.getElementById('formUsuario').addEventListener('submit', function(e) {
        e.preventDefault();
        salvarUsuario();
    });
}

async function salvarComida() {
    const editId = document.getElementById('editIdComida').value;
    const nomeUcraniano = document.getElementById('nomeUcraniano').value;
    const traducao = document.getElementById('traducao').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const imagem = document.getElementById('imagem').value;
    const alt = document.getElementById('alt').value;
    const descricao = document.getElementById('descricao').value;
    
    const comidaData = {
        nomeUcraniano,
        traducao,
        preco,
        imagem,
        alt,
        descricao
    };
    
    try {
        let response;
        if (editId) {
            // Editar comida existente
            response = await fetch(`${API_BASE}/comidas/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comidaData)
            });
        } else {
            // Adicionar nova comida
            response = await fetch(`${API_BASE}/comidas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comidaData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensagem('comidas', result.message || 'Comida salva com sucesso!', 'success');
            limparFormComida();
            carregarComidas();
            atualizarDashboard();
        } else {
            mostrarMensagem('comidas', result.message || 'Erro ao salvar comida!', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar comida:', error);
        mostrarMensagem('comidas', 'Erro ao conectar com o servidor!', 'error');
    }
}

async function editarComida(id) {
    try {
        const response = await fetch(`${API_BASE}/comidas/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const comida = result.data;
            document.getElementById('editIdComida').value = comida.id;
            document.getElementById('nomeUcraniano').value = comida.nomeUcraniano;
            document.getElementById('traducao').value = comida.traducao;
            document.getElementById('preco').value = comida.preco || 0;
            document.getElementById('imagem').value = comida.imagem;
            document.getElementById('alt').value = comida.alt;
            document.getElementById('descricao').value = comida.descricao || '';
            
            document.getElementById('formTitleComida').textContent = '✏️ Editar Comida';
            document.querySelector('#formComida button[type="submit"]').textContent = '💾 Atualizar';
        } else {
            mostrarMensagem('comidas', 'Erro ao carregar dados da comida!', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar comida:', error);
        mostrarMensagem('comidas', 'Erro ao conectar com o servidor!', 'error');
    }
}

async function excluirComida(id) {
    if (confirm('Tem certeza que deseja excluir esta comida?')) {
        try {
            const response = await fetch(`${API_BASE}/comidas/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                mostrarMensagem('comidas', 'Comida excluída com sucesso!', 'success');
                carregarComidas();
                atualizarDashboard();
            } else {
                mostrarMensagem('comidas', result.message || 'Erro ao excluir comida!', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir comida:', error);
            mostrarMensagem('comidas', 'Erro ao conectar com o servidor!', 'error');
        }
    }
}

function limparFormComida() {
    document.getElementById('formComida').reset();
    document.getElementById('editIdComida').value = '';
    document.getElementById('formTitleComida').textContent = '➕ Adicionar Nova Comida';
    document.querySelector('#formComida button[type="submit"]').textContent = '💾 Salvar';
}

// === GERENCIAMENTO DE USUÁRIOS COM SERVIDOR ===

async function carregarUsuarios() {
    try {
        const response = await fetch(`${API_BASE}/auth/usuarios`);
        const data = await response.json();
        
        if (data.success) {
            renderizarTabelaUsuarios(data.data);
        } else {
            mostrarMensagem('usuarios', 'Erro ao carregar usuários!', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        mostrarMensagem('usuarios', 'Erro ao conectar com o servidor!', 'error');
    }
}

function renderizarTabelaUsuarios(usuarios) {
    const tbody = document.getElementById('tabelaUsuarios');
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td><span class="badge badge-${usuario.tipo}">${usuario.tipo.toUpperCase()}</span></td>
            <td>${new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}</td>
            <td class="action-buttons">
                <button class="btn btn-warning" onclick="editarUsuario(${usuario.id})">✏️ Editar</button>
                <button class="btn btn-danger" onclick="excluirUsuario(${usuario.id})">🗑️ Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function salvarUsuario() {
    const editId = document.getElementById('editIdUsuario').value;
    const nome = document.getElementById('nomeUsuario').value;
    const email = document.getElementById('emailUsuario').value;
    const senha = document.getElementById('senhaUsuario').value;
    const tipo = document.getElementById('tipoUsuario').value;
    
    if (!nome || !email || !tipo) {
        mostrarMensagem('usuarios', 'Nome, email e tipo são obrigatórios!', 'error');
        return;
    }
    
    // Para edição, senha é opcional
    if (!editId && !senha) {
        mostrarMensagem('usuarios', 'Senha é obrigatória para novos usuários!', 'error');
        return;
    }
    
    const userData = { nome, email, tipo };
    if (senha) userData.senha = senha;
    
    try {
        let response;
        if (editId) {
            // Editar usuário existente usando a rota PUT
            response = await fetch(`${API_BASE}/auth/usuarios/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } else {
            // Adicionar novo usuário
            response = await fetch(`${API_BASE}/auth/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensagem('usuarios', result.message || 'Usuário salvo com sucesso!', 'success');
            limparFormUsuario();
            carregarUsuarios();
            atualizarDashboard();
        } else {
            mostrarMensagem('usuarios', result.message || 'Erro ao salvar usuário!', 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        mostrarMensagem('usuarios', 'Erro ao conectar com o servidor!', 'error');
    }
}

async function editarUsuario(id) {
    try {
        const response = await fetch(`${API_BASE}/auth/usuarios/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const usuario = result.data;
            document.getElementById('editIdUsuario').value = usuario.id;
            document.getElementById('nomeUsuario').value = usuario.nome;
            document.getElementById('emailUsuario').value = usuario.email;
            document.getElementById('tipoUsuario').value = usuario.tipo;
            
            // Limpar campo de senha para edição
            document.getElementById('senhaUsuario').value = '';
            document.getElementById('senhaUsuario').placeholder = 'Deixe em branco para manter a senha atual';
            
            document.getElementById('formTitleUsuario').textContent = '✏️ Editar Usuário';
            document.querySelector('#formUsuario button[type="submit"]').textContent = '💾 Atualizar';
            
            mostrarMensagem('usuarios', `Editando usuário: ${usuario.nome}`, 'info');
        } else {
            mostrarMensagem('usuarios', 'Erro ao carregar dados do usuário!', 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        mostrarMensagem('usuarios', 'Erro ao conectar com o servidor!', 'error');
    }
}

async function excluirUsuario(id) {
    // Primeiro buscar dados do usuário para confirmar exclusão
    try {
        const response = await fetch(`${API_BASE}/auth/usuarios/${id}`);
        const result = await response.json();
        
        if (!result.success) {
            mostrarMensagem('usuarios', 'Erro ao buscar dados do usuário!', 'error');
            return;
        }
        
        const usuario = result.data;
        
        // Verificar se não está tentando excluir um gerente se for o único
        if (usuario.tipo === 'gerente') {
            const usuariosResponse = await fetch(`${API_BASE}/auth/usuarios`);
            const usuariosData = await usuariosResponse.json();
            
            if (usuariosData.success) {
                const gerentes = usuariosData.data.filter(u => u.tipo === 'gerente');
                if (gerentes.length <= 1) {
                    mostrarMensagem('usuarios', 'Não é possível excluir o último gerente do sistema!', 'error');
                    return;
                }
            }
        }
        
        const confirmacao = confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}" (${usuario.email})?\n\nEsta ação não pode ser desfeita.`);
        
        if (!confirmacao) {
            return;
        }
        
        // Proceder com a exclusão
        const deleteResponse = await fetch(`${API_BASE}/auth/usuarios/${id}`, {
            method: 'DELETE'
        });
        
        const deleteResult = await deleteResponse.json();
        
        if (deleteResult.success) {
            mostrarMensagem('usuarios', 'Usuário excluído com sucesso!', 'success');
            carregarUsuarios();
            atualizarDashboard();
            
            // Se estava editando o usuário excluído, limpar formulário
            const editId = document.getElementById('editIdUsuario').value;
            if (editId == id) {
                limparFormUsuario();
            }
        } else {
            mostrarMensagem('usuarios', deleteResult.message || 'Erro ao excluir usuário!', 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        mostrarMensagem('usuarios', 'Erro ao conectar com o servidor!', 'error');
    }
}

function limparFormUsuario() {
    document.getElementById('formUsuario').reset();
    document.getElementById('editIdUsuario').value = '';
    document.getElementById('senhaUsuario').placeholder = 'Senha (obrigatória)';
    document.getElementById('formTitleUsuario').textContent = '➕ Adicionar Novo Usuário';
    document.querySelector('#formUsuario button[type="submit"]').textContent = '💾 Salvar';
}

// === UTILITÁRIOS ===

function mostrarMensagem(secao, texto, tipo) {
    const messageElement = document.getElementById(`message${secao.charAt(0).toUpperCase() + secao.slice(1)}`);
    messageElement.textContent = texto;
    messageElement.className = `message ${tipo}`;
    messageElement.classList.remove('hidden');
    
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}

// Exportar dados (função extra)
function exportarDados() {
    // Esta função pode ser implementada para exportar dados do servidor
    mostrarMensagem('dashboard', 'Funcionalidade de exportação será implementada', 'error');
}
