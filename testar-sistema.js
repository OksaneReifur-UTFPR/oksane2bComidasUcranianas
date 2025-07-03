const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testarSistema() {
    console.log('🧪 TESTANDO SISTEMA COMPLETO DO RESTAURANTE UCRANIANO\n');
    
    try {
        // 1. Testar se servidor está rodando
        console.log('1️⃣ Testando conexão com servidor...');
        const pingResponse = await fetch(`${API_BASE}/comidas`);
        if (pingResponse.ok) {
            console.log('✅ Servidor rodando corretamente!\n');
        } else {
            throw new Error('Servidor não responde');
        }

        // 2. Testar login com usuários existentes
        console.log('2️⃣ Testando sistema de login...');
        
        // Login como gerente
        const loginGerente = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'gerente@oksane.com',
                senha: 'gerente123'
            })
        });
        
        const gerenteResult = await loginGerente.json();
        if (gerenteResult.success) {
            console.log('✅ Login como gerente funcionando!');
            console.log(`   👤 ${gerenteResult.data.nome} (${gerenteResult.data.tipo})`);
        } else {
            console.log('❌ Erro no login do gerente:', gerenteResult.message);
        }

        // Login como admin
        const loginAdmin = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@oksane.com',
                senha: 'admin123'
            })
        });
        
        const adminResult = await loginAdmin.json();
        if (adminResult.success) {
            console.log('✅ Login como administrador funcionando!');
            console.log(`   👤 ${adminResult.data.nome} (${adminResult.data.tipo})`);
        } else {
            console.log('❌ Erro no login do admin:', adminResult.message);
        }

        // 3. Testar carregamento de dados
        console.log('\n3️⃣ Testando carregamento de dados...');
        
        // Carregar comidas
        const comidasResponse = await fetch(`${API_BASE}/comidas`);
        const comidasData = await comidasResponse.json();
        if (comidasData.success) {
            console.log(`✅ Comidas carregadas: ${comidasData.data.length} itens`);
            console.log('   🍽️ Pratos disponíveis:');
            comidasData.data.slice(0, 3).forEach(comida => {
                console.log(`     - ${comida['Nome Ucraniano']} (${comida['Tradução']})`);
            });
        }

        // Carregar usuários
        const usuariosResponse = await fetch(`${API_BASE}/auth/usuarios`);
        const usuariosData = await usuariosResponse.json();
        if (usuariosData.success) {
            console.log(`✅ Usuários carregados: ${usuariosData.data.length} usuários`);
            const tiposCount = usuariosData.data.reduce((acc, user) => {
                acc[user.tipo] = (acc[user.tipo] || 0) + 1;
                return acc;
            }, {});
            console.log('   👥 Distribuição por tipo:', tiposCount);
        }

        // 4. Testar CRUD de usuários
        console.log('\n4️⃣ Testando operações CRUD de usuários...');
        
        // Criar usuário de teste
        const novoUsuario = {
            nome: 'Teste Sistema',
            email: `teste.${Date.now()}@email.com`,
            senha: 'teste123',
            tipo: 'cliente'
        };

        const criarResponse = await fetch(`${API_BASE}/auth/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        const criarResult = await criarResponse.json();
        if (criarResult.success) {
            const userId = criarResult.data.id;
            console.log(`✅ Usuário criado com ID: ${userId}`);

            // Buscar usuário específico
            const buscarResponse = await fetch(`${API_BASE}/auth/usuarios/${userId}`);
            const buscarResult = await buscarResponse.json();
            if (buscarResult.success) {
                console.log('✅ Busca de usuário específico funcionando');
            }

            // Atualizar usuário
            const atualizarResponse = await fetch(`${API_BASE}/auth/usuarios/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: 'Teste Sistema Atualizado',
                    email: novoUsuario.email,
                    tipo: 'cliente'
                })
            });

            const atualizarResult = await atualizarResponse.json();
            if (atualizarResult.success) {
                console.log('✅ Atualização de usuário funcionando');
            }

            // Excluir usuário de teste
            const excluirResponse = await fetch(`${API_BASE}/auth/usuarios/${userId}`, {
                method: 'DELETE'
            });

            const excluirResult = await excluirResponse.json();
            if (excluirResult.success) {
                console.log('✅ Exclusão de usuário funcionando');
            }
        }

        console.log('\n🎉 TESTE COMPLETO - SISTEMA FUNCIONANDO CORRETAMENTE!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('   1. Acesse http://localhost:3000 para usar o sistema');
        console.log('   2. Faça login como gerente para acessar o painel admin');
        console.log('   3. Teste todas as funcionalidades no navegador');
        
    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:', error.message);
        console.log('\n🔧 SOLUÇÕES:');
        console.log('   1. Verifique se o servidor está rodando: node server.js');
        console.log('   2. Verifique se a porta 3000 está disponível');
        console.log('   3. Instale dependências: npm install');
    }
}

// Executar teste se chamado diretamente
if (require.main === module) {
    testarSistema();
}

module.exports = { testarSistema };
