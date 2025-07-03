// Script de teste para verificar arquivos CSV
const fs = require('fs');
const path = require('path');

const USUARIOS_FILE = path.join(__dirname, 'usuarios.csv');
const COMIDAS_FILE = path.join(__dirname, 'comida.csv');

console.log('🔍 Verificando arquivos...');
console.log('📁 Diretório atual:', __dirname);
console.log('');

// Verificar arquivo de usuários
console.log('👥 ARQUIVO DE USUÁRIOS:');
console.log('📄 Caminho:', USUARIOS_FILE);
console.log('✅ Existe:', fs.existsSync(USUARIOS_FILE));

if (fs.existsSync(USUARIOS_FILE)) {
    const conteudo = fs.readFileSync(USUARIOS_FILE, 'utf-8');
    console.log('📝 Conteúdo:');
    console.log(conteudo);
} else {
    console.log('❌ Arquivo não existe!');
}

console.log('');
console.log('🍽️ ARQUIVO DE COMIDAS:');
console.log('📄 Caminho:', COMIDAS_FILE);
console.log('✅ Existe:', fs.existsSync(COMIDAS_FILE));

if (fs.existsSync(COMIDAS_FILE)) {
    const conteudo = fs.readFileSync(COMIDAS_FILE, 'utf-8');
    console.log('📝 Conteúdo:');
    console.log(conteudo);
} else {
    console.log('❌ Arquivo não existe!');
}

console.log('');
console.log('✅ Verificação completa!');
console.log('💡 Para criar os arquivos, execute: node server.js');
