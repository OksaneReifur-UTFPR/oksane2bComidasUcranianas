// Variáveis globais
let comidas = [];
let quantidades = [];
let contadorCarrinho = 0;
let precos = []; // Preenchido dinamicamente

document.addEventListener('DOMContentLoaded', async function() {
    await carregarComidas();
    criarItensCardapio();
    configurarEventos();
});

// === SISTEMA DE AUTENTICAÇÃO SIMPLIFICADO ===

// Verificar se usuário está logado
function verificarAutenticacao() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    return usuarioLogado !== null;
}

// Obter dados do usuário logado
function obterUsuarioLogado() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    return usuarioLogado ? JSON.parse(usuarioLogado) : null;
}

// Função para logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('voltarPara');
    window.location.href = 'login.html';
}

// Função para proteger páginas que precisam de login
function protegerPagina() {
    if (!verificarAutenticacao()) {
        // Salvar página atual para voltar depois do login
        localStorage.setItem('voltarPara', window.location.pathname.split('/').pop());
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// === FUNÇÕES DO CARDÁPIO (mantidas como estavam) ===

async function carregarComidas() {
    try {
        const response = await fetch('http://localhost:3000/api/comidas');
        const data = await response.json();

        if (data.success) {
            comidas = data.data;
            // Adicionar preços padrão se não existirem no servidor
            comidas = comidas.map(comida => ({
                ...comida,
                preco: comida.preco || 15.00 // Preço padrão se não definido
            }));
            precos = comidas.map(c => c.preco);
            quantidades = new Array(comidas.length).fill(0);
        } else {
            // Fallback para dados locais caso servidor não responda
            console.warn('Servidor não disponível, usando dados locais');
            usarDadosLocais();
        }
    } catch (error) {
        console.error('Erro ao conectar com servidor:', error);
        // Fallback para dados locais
        usarDadosLocais();
    }
}

function usarDadosLocais() {
    // Tentar carregar comidas salvas pelo admin
    const comidasAdmin = localStorage.getItem('comidasAdmin');
    if (comidasAdmin) {
        comidas = JSON.parse(comidasAdmin);
    } else {
        // Dados padrão se não há comidas salvas
        comidas = [
            { id: 1, nomeUcraniano: 'Борщ', traducao: 'Borsch (Sopa de Beterraba)', preco: 18.50, imagem: 'imagens/borcht.jpeg', alt: 'Borsch' },
            { id: 2, nomeUcraniano: 'Вареники', traducao: 'Varenyky (Pêrorrê)', preco: 22.00, imagem: 'imagens/pirrorre.jpeg', alt: 'Varenyky' },
            { id: 3, nomeUcraniano: 'Деруни', traducao: 'Deruny (Panquecas de Batata)', preco: 16.50, imagem: 'imagens/deruny.jpg', alt: 'Deruny' },
            { id: 4, nomeUcraniano: 'Голубці', traducao: 'Holubtsi (Charutinhos de Couve)', preco: 24.00, imagem: 'imagens/rolobtsi.webp', alt: 'Holubtsi' },
            { id: 5, nomeUcraniano: 'Медовик', traducao: 'Medovik (Bolo de Mel)', preco: 12.50, imagem: 'imagens/medovik.webp', alt: 'Medovik' },
            { id: 6, nomeUcraniano: 'Пампушки', traducao: 'Pampushky (Pãezinhos)', preco: 8.50, imagem: 'imagens/pampushka.jpg', alt: 'Pampushky' },
            { id: 7, nomeUcraniano: 'Кубаця', traducao: 'Kubatsa (Linguiça Defumada)', preco: 28.00, imagem: 'imagens/kubaça.jpeg', alt: 'Kubatsa' },
            { id: 8, nomeUcraniano: 'Баноша', traducao: 'Banosh (Polenta com Queijo)', preco: 20.50, imagem: 'imagens/banosh.jpeg', alt: 'Banosh' }
        ];
    }
    
    precos = comidas.map(c => c.preco);
    quantidades = new Array(comidas.length).fill(0);
}


function criarItensCardapio() {
    const container = document.querySelector('.itens');
    container.innerHTML = '';

    comidas.forEach((comida, index) => {
        const item = document.createElement('div');
        item.className = 'item';
        item.setAttribute('data-id', comida.id);
        item.innerHTML = `
            <img src="${comida.imagem}" alt="${comida.alt}" />
            <p class="nome-comida">
                <strong>${comida.nomeUcraniano}</strong><br />
                <span class="traducao">${comida.traducao}</span>
            </p>
            <div class="quantidade">
                <button class="menos">-</button>
                <span>0</span>
                <button class="mais">+</button>
            </div>
            <button class="ver-carrinho" onclick="proximaTela('resumo')">Ver Carrinho</button>
        `;
        container.appendChild(item);
    });
}

function configurarEventos() {
    document.querySelectorAll(".item").forEach((item, index) => {
        const menos = item.querySelector(".menos");
        const mais = item.querySelector(".mais");
        const span = item.querySelector(".quantidade span");

        menos.addEventListener("click", () => {
            if (quantidades[index] > 0) {
                quantidades[index]--;
                contadorCarrinho--;
                atualizarContador();
                span.textContent = quantidades[index];
                salvarCarrinhoNoLocalStorage();
            }
        });

        mais.addEventListener("click", () => {
            quantidades[index]++;
            contadorCarrinho++;
            atualizarContador();
            span.textContent = quantidades[index];
            salvarCarrinhoNoLocalStorage();
        });
    });
}

function atualizarContador() {
    document.getElementById("contadorCarrinho").textContent = contadorCarrinho;
}

function atualizarResumo() {
    const container = document.getElementById("resumoItens");
    container.innerHTML = "";
    let total = 0;

    // Criar header do resumo
    const header = document.createElement('div');
    header.className = 'resumo-header';
    header.innerHTML = `
        <h2>🛒 Seu Pedido</h2>
        <p>Смачний - Comida autêntica ucraniana</p>
    `;
    container.appendChild(header);

    let temItens = false;

    comidas.forEach((comida, index) => {
        const qtd = quantidades[index];
        if (qtd > 0) {
            temItens = true;
            const preco = precos[index] * qtd;
            total += preco;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-resumo';
            itemDiv.innerHTML = `
                <div class="item-info">
                    <div class="item-nome">${comida.nomeUcraniano}</div>
                    <div class="item-traducao">${comida.traducao}</div>
                    <div class="item-quantidade">Quantidade: ${qtd}</div>
                </div>
                <div class="item-preco">R$ ${preco.toFixed(2)}</div>
            `;
            container.appendChild(itemDiv);
        }
    });

    if (temItens) {
        const totalDiv = document.createElement('div');
        totalDiv.className = 'total';
        totalDiv.innerHTML = `<h3>💰 Total: R$ ${total.toFixed(2)}</h3>`;
        container.appendChild(totalDiv);
    } else {
        const vazioDiv = document.createElement('div');
        vazioDiv.className = 'carrinho-vazio';
        vazioDiv.innerHTML = `
            <i>🛒</i>
            <h3>Carrinho Vazio</h3>
            <p>Adicione alguns pratos deliciosos ao seu pedido!</p>
        `;
        container.appendChild(vazioDiv);
    }
}

function proximaTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    
    if (id === "resumo") {
        atualizarResumo();
    }
    
    if (id === "pagamento") {
        // PROTEÇÃO: Verificar login antes de ir para pagamento
        if (!verificarAutenticacao()) {
            alert('Você precisa fazer login para finalizar o pedido!');
            localStorage.setItem('voltarPara', 'index.html');
            window.location.href = 'login.html';
            return;
        }
        
        // Verificar se há itens no carrinho
        const temItens = quantidades.some(qtd => qtd > 0);
        if (!temItens) {
            alert('Adicione itens ao carrinho antes de finalizar o pedido!');
            voltarTela('cardapio');
            return;
        }
        
        mostrarChavePix();
    }
    
    document.getElementById(id).classList.add("ativa");
}

function voltarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
}

function mostrarChavePix() {
    document.getElementById("pix").textContent = "124.047.019-32";
}

function copiarPix() {
    const chavePix = "124.047.019-32";
    navigator.clipboard.writeText(chavePix).then(() => {
        alert("Chave PIX copiada para a área de transferência!");
    });
}

async function finalizarCompra() {
    // PROTEÇÃO: Verificar login antes de finalizar
    if (!verificarAutenticacao()) {
        alert('Você precisa fazer login para finalizar a compra!');
        localStorage.setItem('voltarPara', 'index.html');
        window.location.href = 'login.html';
        return;
    }

    const nome = document.getElementById("nome").value.trim();
    const nascimento = document.getElementById("nascimento").value.trim();
    const cpf = document.getElementById("cpf").value.trim();

    if (!nome || !nascimento || !cpf) {
        alert("Preencha todos os campos!");
        return;
    }

    const itensPedido = [];
    let totalPedido = 0;

    comidas.forEach((comida, index) => {
        const qtd = quantidades[index];
        if (qtd > 0) {
            const preco = precos[index] * qtd;
            totalPedido += preco;
            itensPedido.push({
                id: comida.id,
                nomeUcraniano: comida.nomeUcraniano,
                traducao: comida.traducao,
                quantidade: qtd,
                precoUnitario: precos[index],
                precoTotal: preco
            });
        }
    });

    if (itensPedido.length === 0) {
        alert("Selecione pelo menos um item!");
        return;
    }

    // Obter dados do usuário logado
    const usuarioLogado = obterUsuarioLogado();

    const pedido = {
        itens: itensPedido,
        cliente: { nome, nascimento, cpf },
        usuario: usuarioLogado,
        total: totalPedido,
        data: new Date().toISOString()
    };

    try {
        // Salvar pedido no localStorage (simulação)
        const pedidosSalvos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        pedido.id = Date.now(); // ID simples baseado em timestamp
        pedidosSalvos.push(pedido);
        localStorage.setItem('pedidos', JSON.stringify(pedidosSalvos));

        // Sucesso
        proximaTela('sucesso');
        iniciarConfete();
        
        // Limpar formulário e carrinho
        document.getElementById("nome").value = "";
        document.getElementById("nascimento").value = "";
        document.getElementById("cpf").value = "";
        quantidades.fill(0);
        contadorCarrinho = 0;
        atualizarContador();
        document.querySelectorAll(".quantidade span").forEach(span => span.textContent = "0");
        limparCarrinhoLocalStorage();
        
    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        alert('Erro ao processar pedido. Tente novamente.');
    }
}

function iniciarConfete() {
    if (typeof confetti !== 'undefined') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 500);
        setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 1000);
    }
}

// Função para salvar carrinho no localStorage (melhorada)
function salvarCarrinhoNoLocalStorage() {
    const carrinhoItens = [];
    
    comidas.forEach((comida, index) => {
        if (quantidades[index] > 0) {
            carrinhoItens.push({
                id: comida.id,
                nome: comida.nomeUcraniano,
                traducao: comida.traducao,
                quantidade: quantidades[index],
                preco: precos[index]
            });
        }
    });
    
    localStorage.setItem('carrinho', JSON.stringify(carrinhoItens));
}

// Função para limpar carrinho
function limparCarrinhoLocalStorage() {
    localStorage.removeItem('carrinho');
}

// Função para ir para o checkout (PROTEGIDA)
function irParaCheckout() {
    // Salvar carrinho antes de sair da página
    salvarCarrinhoNoLocalStorage();
    
    // Verificar se há itens no carrinho
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        alert('Adicione itens ao carrinho primeiro!');
        return;
    }
    
    // PROTEÇÃO: Verificar se está logado
    if (!verificarAutenticacao()) {
        alert('Você precisa fazer login para finalizar o pedido!');
        localStorage.setItem('voltarPara', 'pagamento.html');
        window.location.href = 'login.html';
        return;
    }
    
    window.location.href = 'pagamento.html';
}

function exibirModalNaoCadastrado() {
  document.getElementById('modalNaoCadastrado').classList.add('ativo');
}

function fecharModal() {
  document.getElementById('modalNaoCadastrado').classList.remove('ativo');
}

function irParaCadastro() {
  fecharModal();
  alternarTela('cadastro');
}


//<!-- ADIÇÃO AO <script> -->

  function exibirModalNaoCadastrado() {
    document.getElementById('modalNaoCadastrado').classList.add('ativo');
  }

  function fecharModal() {
    document.getElementById('modalNaoCadastrado').classList.remove('ativo');
  }

  function irParaCadastro() {
    fecharModal();
    alternarTela('cadastro');
  }

 