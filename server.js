const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'comida.csv');
const USUARIOS_FILE = path.join(__dirname, 'usuarios.csv');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Para servir arquivos estáticos (imagens, CSS, JS)

// ===== FUNÇÕES PARA GERENCIAR USUÁRIOS =====

// Criar arquivo de usuários se não existir
function criarArquivoUsuarios() {
    if (!fs.existsSync(USUARIOS_FILE)) {
        console.log('📁 Criando arquivo de usuários...');
        
        const csvWriter = createCsvWriter({
            path: USUARIOS_FILE,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'nome', title: 'Nome' },
                { id: 'email', title: 'Email' },
                { id: 'senha', title: 'Senha' },
                { id: 'tipo', title: 'Tipo' },
                { id: 'dataCadastro', title: 'Data Cadastro' }
            ]
        });

        // Criar usuários padrão do sistema
        const usuariosIniciais = [
            {
                id: 1,
                nome: 'Administrador Sistema',
                email: 'admin@sistema.com',
                senha: 'admin123',
                tipo: 'admin',
                dataCadastro: new Date().toISOString().split('T')[0]
            },
            {
                id: 2,
                nome: 'Gerente Restaurante',
                email: 'gerente@restaurante.com',
                senha: 'admin123',
                tipo: 'gerente',
                dataCadastro: new Date().toISOString().split('T')[0]
            },
            {
                id: 3,
                nome: 'Cliente Exemplo',
                email: 'cliente@exemplo.com',
                senha: 'cliente123',
                tipo: 'cliente',
                dataCadastro: new Date().toISOString().split('T')[0]
            }
        ];

        csvWriter.writeRecords(usuariosIniciais)
            .then(() => {
                console.log('✅ Arquivo de usuários criado com sucesso!');
                console.log('👤 Usuários iniciais:');
                console.log('   🔧 Admin: admin@sistema.com / admin123');
                console.log('   👨‍💼 Gerente: gerente@restaurante.com / admin123');
                console.log('   👤 Cliente: cliente@exemplo.com / cliente123');
            })
            .catch(err => {
                console.error('❌ Erro ao criar arquivo de usuários:', err);
            });
    } else {
        console.log('📁 Arquivo de usuários já existe.');
    }
}

// Função para ler usuários do CSV
function lerUsuarios() {
    return new Promise((resolve, reject) => {
        const usuarios = [];
        if (!fs.existsSync(USUARIOS_FILE)) {
            criarArquivoUsuarios();
            return resolve([]);
        }

        fs.createReadStream(USUARIOS_FILE)
            .pipe(csv())
            .on('data', (data) => {
                usuarios.push({
                    id: parseInt(data.ID),
                    nome: data.Nome,
                    email: data.Email,
                    senha: data.Senha,
                    tipo: data.Tipo,
                    dataCadastro: data['Data Cadastro']
                });
            })
            .on('end', () => resolve(usuarios))
            .on('error', reject);
    });
}

// Função para escrever usuários no CSV
function escreverUsuarios(usuarios) {
    const csvWriter = createCsvWriter({
        path: USUARIOS_FILE,
        header: [
            { id: 'id', title: 'ID' },
            { id: 'nome', title: 'Nome' },
            { id: 'email', title: 'Email' },
            { id: 'senha', title: 'Senha' },
            { id: 'tipo', title: 'Tipo' },
            { id: 'dataCadastro', title: 'Data Cadastro' }
        ]
    });

    return csvWriter.writeRecords(usuarios);
}

// ===== FUNÇÕES PARA GERENCIAR COMIDAS (existentes) =====

// Função para ler o CSV
function lerCSV() {
    return new Promise((resolve, reject) => {
        const comidas = [];
        if (!fs.existsSync(CSV_FILE)) {
            // Criar arquivo padrão se não existir
            criarArquivoComidas();
            return resolve([]);
        }
        
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (data) => {
                comidas.push({
                    id: parseInt(data.ID),
                    nomeUcraniano: data['Nome Ucraniano'],
                    traducao: data['Tradução'],
                    preco: parseFloat(data.Preco || 15.00),
                    imagem: data.Imagem,
                    alt: data.Alt,
                    descricao: data.Descricao || ''
                });
            })
            .on('end', () => resolve(comidas))
            .on('error', reject);
    });
}

// Função para escrever no CSV
function escreverCSV(comidas) {
    const csvWriter = createCsvWriter({
        path: CSV_FILE,
        header: [
            { id: 'id', title: 'ID' },
            { id: 'nomeUcraniano', title: 'Nome Ucraniano' },
            { id: 'traducao', title: 'Tradução' },
            { id: 'preco', title: 'Preco' },
            { id: 'imagem', title: 'Imagem' },
            { id: 'alt', title: 'Alt' },
            { id: 'descricao', title: 'Descricao' }
        ]
    });

    return csvWriter.writeRecords(comidas);
}

// Criar arquivo de comidas padrão
function criarArquivoComidas() {
    const comidasIniciais = [
        { id: 1, nomeUcraniano: 'Борщ', traducao: 'Borsch (Sopa de Beterraba)', preco: 18.50, imagem: 'imagens/borcht.jpeg', alt: 'Borsch', descricao: 'Sopa tradicional ucraniana' },
        { id: 2, nomeUcraniano: 'Вареники', traducao: 'Varenyky (Pêrorrê)', preco: 22.00, imagem: 'imagens/pirrorre.jpeg', alt: 'Varenyky', descricao: 'Bolinhos recheados tradicionais' },
        { id: 3, nomeUcraniano: 'Деруни', traducao: 'Deruny (Panquecas de Batata)', preco: 16.50, imagem: 'imagens/deruny.jpg', alt: 'Deruny', descricao: 'Panquecas crocantes de batata' },
        { id: 4, nomeUcraniano: 'Голубці', traducao: 'Holubtsi (Charutinhos de Couve)', preco: 24.00, imagem: 'imagens/rolobtsi.webp', alt: 'Holubtsi', descricao: 'Folhas de couve recheadas' },
        { id: 5, nomeUcraniano: 'Медовик', traducao: 'Medovik (Bolo de Mel)', preco: 12.50, imagem: 'imagens/medovik.webp', alt: 'Medovik', descricao: 'Bolo em camadas com mel' },
        { id: 6, nomeUcraniano: 'Пампушки', traducao: 'Pampushky (Pãezinhos)', preco: 8.50, imagem: 'imagens/pampushka.jpg', alt: 'Pampushky', descricao: 'Pãezinhos macios com alho' },
        { id: 7, nomeUcraniano: 'Кубаця', traducao: 'Kubatsa (Linguiça Defumada)', preco: 28.00, imagem: 'imagens/kubaça.jpeg', alt: 'Kubatsa', descricao: 'Linguiça defumada tradicional' },
        { id: 8, nomeUcraniano: 'Баноша', traducao: 'Banosh (Polenta com Queijo)', preco: 20.50, imagem: 'imagens/banosh.jpeg', alt: 'Banosh', descricao: 'Polenta cremosa com queijo' }
    ];
    
    escreverCSV(comidasIniciais)
        .then(() => console.log('✅ Arquivo de comidas criado com dados iniciais'))
        .catch(err => console.error('❌ Erro ao criar arquivo de comidas:', err));
}

// ===== ROTAS DE AUTENTICAÇÃO =====

// POST - Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log(`🔐 Tentativa de login: ${email}`);

        if (!email || !senha) {
            console.log('❌ Email ou senha em branco');
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        const usuarios = await lerUsuarios();
        console.log(`📁 ${usuarios.length} usuários carregados do CSV`);
        console.log('👥 Usuários disponíveis:', usuarios.map(u => ({ email: u.email, tipo: u.tipo })));
        
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);

        if (usuario) {
            console.log(`✅ Login bem-sucedido para: ${email} (${usuario.tipo})`);
            res.json({
                success: true,
                message: 'Login realizado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo
                }
            });
        } else {
            console.log(`❌ Login falhado para: ${email}`);
            // Debug: verificar se email existe
            const usuarioEmail = usuarios.find(u => u.email === email);
            if (usuarioEmail) {
                console.log(`📧 Email encontrado, mas senha incorreta para: ${email}`);
            } else {
                console.log(`📧 Email não encontrado: ${email}`);
            }
            
            res.status(401).json({
                success: false,
                message: 'Email ou senha incorretos'
            });
        }
    } catch (error) {
        console.error('💥 Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// POST - Cadastro
app.post('/api/auth/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }

        // Validação de email simples
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        // Validação de senha (mínimo 6 caracteres)
        if (senha.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'A senha deve ter pelo menos 8 caracteres'
            });
        }

        const usuarios = await lerUsuarios();
        
        // Verificar se email já existe
        if (usuarios.find(u => u.email === email)) {
            return res.status(409).json({
                success: false,
                message: 'Este email já está cadastrado'
            });
        }

        // Gerar novo ID
        const novoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;

        const novoUsuario = {
            id: novoId,
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            senha: senha, // Em produção, use hash da senha!
            tipo: 'cliente',
            dataCadastro: new Date().toISOString()
        };

        usuarios.push(novoUsuario);
        await escreverUsuarios(usuarios);

        console.log(`Novo usuário cadastrado: ${email}`);
        res.status(201).json({
            success: true,
            message: 'Cadastro realizado com sucesso!',
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                tipo: novoUsuario.tipo
            }
        });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET - Listar usuários (apenas para admin)
app.get('/api/auth/usuarios', async (req, res) => {
    try {
        const usuarios = await lerUsuarios();
        const usuariosPublicos = usuarios.map(u => ({
            id: u.id,
            nome: u.nome,
            email: u.email,
            tipo: u.tipo,
            dataCadastro: u.dataCadastro
        }));
        
        res.json({
            success: true,
            data: usuariosPublicos
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuários'
        });
    }
});

// ===== ROTAS CRUD DE COMIDAS (existentes) =====

// 1. GET - Buscar todas as comidas
app.get('/api/comidas', async (req, res) => {
    try {
        const comidas = await lerCSV();
        res.json({ success: true, data: comidas });
    } catch (error) {
        console.error('Erro ao ler CSV:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar comidas' });
    }
});

// 2. GET - Buscar uma comida específica por ID
app.get('/api/comidas/:id', async (req, res) => {
    try {
        const comidas = await lerCSV();
        const comida = comidas.find(c => c.id === parseInt(req.params.id));
        
        if (!comida) {
            return res.status(404).json({ success: false, message: 'Comida não encontrada' });
        }
        
        res.json({ success: true, data: comida });
    } catch (error) {
        console.error('Erro ao buscar comida:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar comida' });
    }
});

// 3. POST - Adicionar nova comida
app.post('/api/comidas', async (req, res) => {
    try {
        const { nomeUcraniano, traducao, preco, imagem, alt, descricao } = req.body;
        
        if (!nomeUcraniano || !traducao || !imagem || !alt) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nome ucraniano, tradução, imagem e alt são obrigatórios' 
            });
        }

        const comidas = await lerCSV();
        
        // Gerar novo ID
        const novoId = comidas.length > 0 ? Math.max(...comidas.map(c => c.id)) + 1 : 1;
        
        const novaComida = {
            id: novoId,
            nomeUcraniano,
            traducao,
            preco: preco || 15.00,
            imagem,
            alt,
            descricao: descricao || ''
        };

        comidas.push(novaComida);
        await escreverCSV(comidas);

        res.status(201).json({ 
            success: true, 
            message: 'Comida adicionada com sucesso!', 
            data: novaComida 
        });
    } catch (error) {
        console.error('Erro ao adicionar comida:', error);
        res.status(500).json({ success: false, message: 'Erro ao adicionar comida' });
    }
});

// 4. PUT - Atualizar comida existente
app.put('/api/comidas/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nomeUcraniano, traducao, preco, imagem, alt, descricao } = req.body;
        
        if (!nomeUcraniano || !traducao || !imagem || !alt) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nome ucraniano, tradução, imagem e alt são obrigatórios' 
            });
        }

        const comidas = await lerCSV();
        const index = comidas.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Comida não encontrada' 
            });
        }

        // Atualizar os dados
        comidas[index] = {
            id,
            nomeUcraniano,
            traducao,
            preco: preco || 15.00,
            imagem,
            alt,
            descricao: descricao || ''
        };

        await escreverCSV(comidas);

        res.json({ 
            success: true, 
            message: 'Comida atualizada com sucesso!', 
            data: comidas[index] 
        });
    } catch (error) {
        console.error('Erro ao atualizar comida:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar comida' });
    }
});

// 5. DELETE - Excluir comida
app.delete('/api/comidas/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const comidas = await lerCSV();
        const index = comidas.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'Comida não encontrada' 
            });
        }

        const comidaRemovida = comidas.splice(index, 1)[0];
        await escreverCSV(comidas);

        res.json({ 
            success: true, 
            message: 'Comida excluída com sucesso!', 
            data: comidaRemovida 
        });
    } catch (error) {
        console.error('Erro ao excluir comida:', error);
        res.status(500).json({ success: false, message: 'Erro ao excluir comida' });
    }
});

// 6. POST - Rota original para pedidos
app.post('/api/pedidos', async (req, res) => {
    try {
        const pedido = req.body;
        console.log('Pedido recebido:', pedido);
        
        // Aqui você pode salvar no banco de dados ou arquivo
        // Por enquanto, apenas log e resposta de sucesso
        
        res.status(200).json({ 
            success: true, 
            message: 'Pedido recebido com sucesso!',
            pedido: pedido
        });
    } catch (error) {
        console.error('Erro ao processar pedido:', error);
        res.status(500).json({ success: false, message: 'Erro ao processar pedido' });
    }
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicializar arquivos ao iniciar o servidor
criarArquivoUsuarios();

// Verificar e criar arquivo de comidas se necessário
if (!fs.existsSync(CSV_FILE)) {
    criarArquivoComidas();
}

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`🇺🇦 Servidor Comida Ucraniana rodando em http://localhost:${PORT}`);
    console.log(`📋 API Endpoints disponíveis:`);
    console.log(`\n  🔐 AUTENTICAÇÃO:`);
    console.log(`    POST   /api/auth/login          - Fazer login`);
    console.log(`    POST   /api/auth/cadastro       - Cadastrar usuário`);
    console.log(`    GET    /api/auth/usuarios       - Listar usuários`);
    console.log(`\n  🍽️  COMIDAS:`);
    console.log(`    GET    /api/comidas             - Listar todas as comidas`);
    console.log(`    GET    /api/comidas/:id         - Buscar comida por ID`);
    console.log(`    POST   /api/comidas             - Adicionar nova comida`);
    console.log(`    PUT    /api/comidas/:id         - Atualizar comida`);
    console.log(`    DELETE /api/comidas/:id         - Excluir comida`);
    console.log(`\n  🛒 PEDIDOS:`);
    console.log(`    POST   /api/pedidos             - Processar pedido`);
    console.log(`\n🌐 Acesse: http://localhost:${PORT}`);
    console.log(`═══════════════════════════════════════════════════`);
});

// PUT - Atualizar usuário existente
app.put('/api/auth/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, senha, tipo } = req.body;
        
        console.log(`✏️ Tentativa de edição do usuário ID: ${id}`);

        if (!nome || !email || !tipo) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e tipo são obrigatórios'
            });
        }

        // Validação de email simples
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        const usuarios = await lerUsuarios();
        const index = usuarios.findIndex(u => u.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verificar se email já existe (exceto para o próprio usuário)
        const emailExiste = usuarios.find(u => u.email === email.toLowerCase().trim() && u.id !== id);
        if (emailExiste) {
            return res.status(409).json({
                success: false,
                message: 'Este email já está sendo usado por outro usuário'
            });
        }

        // Atualizar os dados
        usuarios[index] = {
            ...usuarios[index],
            nome: nome.trim(),
            email: email.toLowerCase().trim(),
            tipo: tipo
        };

        // Só atualiza senha se foi fornecida
        if (senha && senha.trim()) {
            usuarios[index].senha = senha.trim();
        }

        await escreverUsuarios(usuarios);

        console.log(`✅ Usuário ${id} atualizado com sucesso`);
        res.json({
            success: true,
            message: 'Usuário atualizado com sucesso!',
            usuario: {
                id: usuarios[index].id,
                nome: usuarios[index].nome,
                email: usuarios[index].email,
                tipo: usuarios[index].tipo
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// DELETE - Excluir usuário
app.delete('/api/auth/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        console.log(`🗑️ Tentativa de exclusão do usuário ID: ${id}`);

        const usuarios = await lerUsuarios();
        const index = usuarios.findIndex(u => u.id === id);
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const usuario = usuarios[index];

        // Verificar se é o último administrador
        if (usuario.tipo === 'admin') {
            const admins = usuarios.filter(u => u.tipo === 'admin');
            if (admins.length === 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível excluir o último administrador do sistema'
                });
            }
        }

        // Remover usuário
        const usuarioRemovido = usuarios.splice(index, 1)[0];
        await escreverUsuarios(usuarios);

        console.log(`✅ Usuário ${id} (${usuarioRemovido.email}) excluído com sucesso`);
        res.json({
            success: true,
            message: 'Usuário excluído com sucesso!',
            usuario: {
                id: usuarioRemovido.id,
                nome: usuarioRemovido.nome,
                email: usuarioRemovido.email,
                tipo: usuarioRemovido.tipo
            }
        });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// GET - Buscar usuário específico por ID
app.get('/api/auth/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const usuarios = await lerUsuarios();
        const usuario = usuarios.find(u => u.id === id);
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                dataCadastro: usuario.dataCadastro
            }
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuário'
        });
    }
});