// ==========================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO DO FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// SUAS CHAVES DO FIREBASE ATUALIZADAS:
const firebaseConfig = {
    apiKey: "AIzaSyBBV0sVrQYOtSquWJUYMMfB0ySEdhbSsw0",
    authDomain: "flower-kids.firebaseapp.com",
    projectId: "flower-kids",
    storageBucket: "flower-kids.firebasestorage.app",
    messagingSenderId: "697591788058",
    appId: "1:697591788058:web:05102c66ac3019369ad7a3"
};

// Inicializando os serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// SEU CÓDIGO NORMAL COMEÇA AQUI PARA BAIXO
// ==========================================

// DADOS COMPLETOS DOS PRODUTOS
const CATALOGO = {
    "mais-vendidos": [
        { nome: "Buquê com 6 rosas", desc: "", preco: "R$180,00", icone: "💐" },
        { nome: "Kit rosas + ursinho + Ferrero Rocher", desc: "", preco: "R$230,00", icone: "🎁" },
        { nome: "Buquê 24 rosas vermelhas", desc: "", preco: "R$420,00", icone: "🌹" },
        { nome: "Buquê rosas e girassóis", desc: "", preco: "R$350,00", icone: "🌻" },
        { nome: "Kit girassóis + Ferrero Rocher", desc: "", preco: "R$200,00", icone: "🌻" }
    ],
    "home-mega": [
        { nome: "Mega buquê 500 rosas vermelhas", desc: "", preco: "R$5.700", icone: "💐" },
        { nome: "Mega buquê 100 girassóis", desc: "", preco: "R$2.000", icone: "🌻" },
        { nome: "Super coração 550 rosas vermelhas", desc: "", preco: "R$6.980", icone: "❤️" },
        { nome: "Mega buquê 500 rosas rosas", desc: "", preco: "R$5.400", icone: "🌸" },
        { nome: "Mega buquê 500 rosas mescladas + lavanda", desc: "", preco: "R$5.950", icone: "🪻" }
    ],
    "flores-avulsas": [
        { nome: "Lírio amarelo", desc: "-Unidade", preco: "R$30,00", icone: "💛" },
        { nome: "Lírio branco", desc: "-Unidade", preco: "R$30,00", icone: "🤍" },
        { nome: "Eucalipto", desc: "- maço", preco: "R$50,00", icone: "🌿" },
        { nome: "Rosa rosa", desc: "-Unidade", preco: "R$15,00", icone: "🌸" },
        { nome: "Rosa Azul", desc: "-Unidade", preco: "R$15,00", icone: "💙" },
        { nome: "Rosa vermelha", desc: "-Unidade", preco: "R$15,00", icone: "🌹" },
        { nome: "Rosa Branca", desc: "-Unidade", preco: "R$15,00", icone: "🤍" },
        { nome: "Girassol", desc: "-Unidade", preco: "R$12,00", icone: "🌻" },
        { nome: "Tulipa Rosa", desc: "-Unidade", preco: "R$20,00", icone: "🌷" },
        { nome: "Tulipa Branca", desc: "-Unidade", preco: "R$20,00", icone: "🌷" },
        { nome: "Mosquitinhos", desc: "-- maço", preco: "R$8,00", icone: "🌾" },
        { nome: "Cravo vermelho", desc: "-Unidade", preco: "R$12,00", icone: "🎈" },
        { nome: "Cravo branco", desc: "-Unidade", preco: "R$12,00", icone: "🏳️" },
        { nome: "Alstroemelia Amarela", desc: "- Galho", preco: "R$8,00", icone: "💛" },
        { nome: "Alstroemelia Branco", desc: "- Galho", preco: "R$8,00", icone: "🤍" }
    ],
    "arranjos": [
        { nome: "Arranjo de rosas vermelhas e rosas no vidro", desc: "R$265,00", preco: "R$265,00", icone: "🏺" },
        { nome: "Arranjo de Alstroemelias Brancas no Vidro", desc: "R$109,90", preco: "R$109,90", icone: "🏺" },
        { nome: "Arranjo de rosas multicoloridas no vidro", desc: "R$250,00", preco: "R$250,00", icone: "🏺" },
        { nome: "Arranjo de Margaridas no Vidro", desc: "R$98,00", preco: "R$98,00", icone: "🏺" },
        { nome: "Arranjo de flores nobres no vaso de vidro grande", desc: "R$220,00", preco: "R$220,00", icone: "🏺" },
        { nome: "Arranjo de rosas coloridas no vidro + Ferrero Rocher", desc: "R$309,00", preco: "R$309,00", icone: "🍫" },
        { nome: "Arranjo de Margaridas plantada", desc: "R$74,00", preco: "R$74,00", icone: "🪴" },
        { nome: "Arranjo de Margaridas Folhagem", desc: "R$89,90", preco: "R$89,90", icone: "🪴" },
        { nome: "Arranjo com 24 rosas vermelhas", desc: "R$490,90", preco: "R$490,90", icone: "🌹" },
        { nome: "Arranjo com 12 rosas azuis", desc: "R$290,00", preco: "R$290,00", icone: "💙" },
        { nome: "Lírio rosa plantado", desc: "R$120,00", preco: "R$120,00", icone: "🪴" },
        { nome: "Arranjo de Alstroemelias Coloridas no Vidro", desc: "R$110,00", preco: "R$110,00", icone: "🏺" },
        { nome: "Arranjo de girassóis no vidro", desc: "R$128,00", preco: "R$128,00", icone: "🌻" },
        { nome: "Arranjo de flores nobres com Ferrero Rocher no vidro", desc: "R$230,00", preco: "R$230,00", icone: "🍫" },
        { nome: "Arranjo de rosas vermelhas no vidro", desc: "R$149,00", preco: "R$149,00", icone: "🏺" }
    ],
    "buques": [
        { nome: "Buquê com 6 rosas", desc: "", preco: "R$180,00", icone: "💐" },
        { nome: "Buquê de margaridas", desc: "", preco: "R$190,00", icone: "🌼" },
        { nome: "Buquê 24 rosas vermelhas", desc: "", preco: "R$420,00", icone: "🌹" },
        { nome: "Buquê rosas e girassóis", desc: "", preco: "R$350,00", icone: "🌻" },
        { nome: "Buquê de Rosas com Alstroemélias", desc: "", preco: "R$148,80", icone: "💐" },
        { nome: "Buquê de rosas + ursinho + Ferrero", desc: "", preco: "R$299,90", icone: "🧸" },
        { nome: "Buquê 12 Rosas Rosa", desc: "", preco: "R$174,90", icone: "🌸" },
        { nome: "Buquê com 24 rosas vermelhas e brancas", desc: "", preco: "R$309,90", icone: "🌹" },
        { nome: "Buquê de Alstroemélias", desc: "", preco: "R$149,90", icone: "💐" },
        { nome: "Buquê de flores silvestres", desc: "", preco: "R$219,90", icone: "🌱" },
        { nome: "Buquê de flores diversas", desc: "", preco: "R$250,00", icone: "💐" },
        { nome: "Buquê Gerberas", desc: "", preco: "R$224,91", icone: "🌸" },
        { nome: "Buquê Rosas coloridas", desc: "", preco: "R$124,90", icone: "💐" },
        { nome: "Buquê de Flores Mistas", desc: "", preco: "R$250,00", icone: "✨" },
        { nome: "Buquê de Gérberas e Astromélias", desc: "", preco: "R$99,90", icone: "🌼" }
    ],
    "cestas": [
        { nome: "Cesta de Café com Urso Flores e Caneca", desc: "", preco: "R$279,88", icone: "🧺" },
        { nome: "Cesta de café da manhã clássica", desc: "", preco: "R$210,00", icone: "🧺" },
        { nome: "Cesta Um Montão de Guloseimas", desc: "", preco: "R$198,00", icone: "🍪" },
        { nome: "Cesta de café da manhã vinho e frutas", desc: "", preco: "R$233,00", icone: "🍷" },
        { nome: "Cesta com 15 Rosas Vermelhas Chocolate e Vinho Tinto", desc: "", preco: "R$298,00", icone: "🍷" },
        { nome: "Cesta de Cervejas - Budweiser", desc: "", preco: "R$171,90", icone: "🍺" },
        { nome: "Cesta de Cervejas - Corona", desc: "", preco: "R$199,90", icone: "🍺" }
    ],
    "kit-presente": [
        { nome: "Kit Orquídea", desc: "", preco: "R$319,90", icone: "🪴" },
        { nome: "Kit rosas + ursinho + Ferrero Rocher", desc: "", preco: "R$230,00", icone: "🧸" },
        { nome: "Amor Intenso Amor", desc: "", preco: "R$239,90", icone: "❤️" },
        { nome: "Kit Chocolates e Rosas", desc: "", preco: "R$179,90", icone: "🍫" },
        { nome: "Kit girassóis + Ferrero Rocher", desc: "", preco: "R$200,00", icone: "🌻" },
        { nome: "Cesta Explosão de Amor", desc: "", preco: "R$274,00", icone: "🧺" },
        { nome: "Kit Romântico com Ursinho", desc: "", preco: "R$409,90", icone: "🧸" },
        { nome: "Caixa Rosas, Vinho e Chocolate", desc: "", preco: "R$209,00", icone: "🍷" },
        { nome: "Cesta do Amor", desc: "", preco: "R$298,90", icone: "🧺" },
        { nome: "Cesta de Frutas e Vinho", desc: "", preco: "R$233,90", icone: "🍷" }
    ],
    "mega-buques": [
        { nome: "Mega Buquê Lilás", desc: "", preco: "R$650,00", icone: "🪻" },
        { nome: "Mega Buquê Azul", desc: "", preco: "R$780,00", icone: "💙" },
        { nome: "Super coração 550 rosas vermelhas", desc: "", preco: "R$6.980", icone: "❤️" },
        { nome: "Mega buquê 500 rosas rosas", desc: "", preco: "R$5.400", icone: "🌸" },
        { nome: "Mega buquê 500 rosas mescladas + lavanda", desc: "", preco: "R$5.950", icone: "💐" },
        { nome: "Mega buquê 500 rosas vermelhas", desc: "", preco: "R$5.700", icone: "🌹" },
        { nome: "Mega buquê 100 girassóis", desc: "", preco: "R$2.000", icone: "🌻" }
    ]
};

// PREPARAÇÃO PARA A PESQUISA E AUTO-COMPLETE
let todosProdutos = [];

Object.values(CATALOGO).forEach(lista => {
    lista.forEach(prod => {
        if (!todosProdutos.some(p => p.nome === prod.nome)) {
            todosProdutos.push(prod);
        }
    });
});

let buscasRecentes = JSON.parse(localStorage.getItem("fk_recentes")) || [];
let usuarioEstaLogado = false;
let carrinho = [];
let checkoutMetodoPagamento = "pix";

// MONITOR DE SESSÃO DO FIREBASE (Atualizado com Endereços e Pedidos)
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioEstaLogado = true;

        // Pega a parte antes do @ do email para usar como nome provisório
        const nomeUsuario = user.email.split('@')[0].toUpperCase();

        // 1. Atualiza a barra de navegação
        document.getElementById("account-label").innerText = nomeUsuario;

        // 2. Preenche os campos da tela de Perfil dinamicamente
        const inputPerfilNome = document.getElementById("perfil-nome");
        const inputPerfilEmail = document.getElementById("perfil-email");

        if (inputPerfilNome) inputPerfilNome.value = nomeUsuario;
        if (inputPerfilEmail) inputPerfilEmail.value = user.email;

        // 🚀 LINHAS NOVAS: Busca e exibe os dados reais do banco de dados na tela
        carregarEnderecosUsuario();
        carregarPedidosUsuario();

    } else {
        usuarioEstaLogado = false;
        document.getElementById("account-label").innerText = "CONTA";

        // Limpa os campos caso o usuário deslogue
        const inputPerfilNome = document.getElementById("perfil-nome");
        const inputPerfilEmail = document.getElementById("perfil-email");
        if (inputPerfilNome) inputPerfilNome.value = "";
        if (inputPerfilEmail) inputPerfilEmail.value = "";

        // 🚀 LINHAS NOVAS: Reseta as abas para o estado "Zerado/Vazio"
        carregarEnderecosUsuario();
        carregarPedidosUsuario();
    }
});

// ==========================================
// FUNÇÕES PARA PROCURAR E EXIBIR PEDIDOS REAIS
// ==========================================

async function carregarPedidosUsuario() {
    const container = document.getElementById("lista-pedidos-container");
    if (!container) return;

    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) {
        container.innerHTML = '<p style="text-align: center; color: #727e5f; padding: 20px;">Faça login para ver seus pedidos.</p>';
        return;
    }

    try {
        // Busca a subcoleção "pedidos" dentro do documento do usuário
        const pedidosRef = collection(db, "usuarios", usuarioAtual.uid, "pedidos");
        const querySnapshot = await getDocs(pedidosRef);

        if (querySnapshot.empty) {
            container.innerHTML = '<p style="text-align: center; color: #727e5f; padding: 20px;">Você ainda não realizou nenhum pedido. 🥀</p>';
            return;
        }

        container.innerHTML = ""; // Limpa o aviso de vazio

        // Passa por cada pedido encontrado no banco
        querySnapshot.forEach((pedidoDoc) => {
            const pedido = pedidoDoc.data();
            const idPedido = pedidoDoc.id; // O ID gerado ou número do pedido

            // Calcula o total de itens comprados
            const totalItens = pedido.itens.reduce((acc, item) => acc + item.quantidade, 0);

            // Cria o card visual do pedido
            const card = document.createElement("div");
            card.className = "order-item-card";
            card.style.cursor = "pointer";
            card.innerHTML = `
                <div class="order-thumb">${pedido.itens[0]?.icone || '💐'}</div>
                <div class="order-info-main">
                    <strong>Pedido #${idPedido.substring(0, 6).toUpperCase()}</strong>
                    <span class="status-badge active-status">● ${pedido.status || 'Em preparação'}</span>
                </div>
                <div class="order-qty-price">
                    <div>${totalItens} ${totalItens > 1 ? 'itens' : 'item'}</div>
                    <strong>${formatarMoeda(pedido.total)}</strong>
                </div>
                <div class="order-arrow">❯</div>
            `;

            // Quando clicar no card, abre a tela de detalhes desse pedido específico
            card.addEventListener("click", () => mostrarDetalhesDoPedido(idPedido, pedido));
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        container.innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Erro ao carregar histórico.</p>';
    }
}

function mostrarDetalhesDoPedido(idPedido, dadosPedido) {
    // Altera o título da tela
    document.getElementById("detalhe-titulo-pedido").innerText = `Detalhes do Pedido #${idPedido.substring(0, 6).toUpperCase()}`;

    const corpo = document.getElementById("corpo-detalhe-pedido");
    if (!corpo) return;

    // Formata a data salva no Firebase
    let dataFormatada = "Recentemente";
    if (dadosPedido.dataPedido && dadosPedido.dataPedido.toDate) {
        dataFormatada = dadosPedido.dataPedido.toDate().toLocaleDateString('pt-BR');
    }

    // Monta a estrutura base
    let htmlItens = "";
    dadosPedido.itens.forEach(item => {
        const valorNumerico = converterPrecoParaNumero(item.preco);
        htmlItens += `
            <div class="detail-product-row">
                <span class="row-thumb">${item.icone || '💐'}</span>
                <span class="row-name">${item.nome} (${item.quantidade}x)</span>
                <span class="price-text">${formatarMoeda(valorNumerico * item.quantidade)}</span>
            </div>
        `;
    });

    // Injeta as informações reais no container de detalhes
    corpo.innerHTML = `
        <div class="detail-top-blocks">
            <div class="detail-block">
                <strong>Status:</strong>
                <div class="status-amber" style="color: #d97706; font-weight: bold;">${dadosPedido.status || 'Aguardando Envio'}</div>
            </div>
            <div class="detail-block">
                <strong>Data:</strong>
                <div>${dataFormatada}</div>
            </div>
            <div class="detail-block">
                <strong>Total:</strong>
                <div class="price-text" style="font-weight: bold; color: #727e5f;">${formatarMoeda(dadosPedido.total)}</div>
            </div>
        </div>
        <div class="detail-products-box" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;">
            <h4>Itens do Pedido</h4>
            ${htmlItens}
        </div>
    `;

    // Redireciona a visualização para a aba de detalhes
    switchSubView("subview-detalhes-pedido");
}

// FUNÇÕES AUXILIARES PARA PREÇO
function converterPrecoParaNumero(strPreco) {
    let cleanStr = strPreco.replace('R$', '').trim();
    if (cleanStr.includes(',')) {
        cleanStr = cleanStr.replace(/\./g, '');
        cleanStr = cleanStr.replace(',', '.');
    } else {
        cleanStr = cleanStr.replace(/\./g, '');
    }
    return parseFloat(cleanStr);
}

// FUNÇÃO DE VALIDAÇÃO DE E-MAIL (REGEX)
function validarEmailFormatado(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// RENDERIZAÇÃO DAS VITRINES
function renderGrid(containerId, productList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (productList.length === 0) {
        container.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: #727e5f;'>Nenhum produto encontrado.</p>";
        return;
    }

    productList.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-img-placeholder">${prod.icone}</div>
            <h4 class="product-title">${prod.nome}</h4>
            <p class="product-subtext">${prod.desc || '&nbsp;'}</p>
            <p class="product-price">${prod.preco}</p>
            <button class="btn-buy">Comprar</button>
        `;
        card.querySelector(".btn-buy").addEventListener("click", () => adicionarAoCarrinho(prod));
        container.appendChild(card);
    });
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// INTERFACE DO SPA
function switchView(targetViewId) {
    document.querySelectorAll(".page-view").forEach(view => {
        view.classList.remove("active");
    });
    const activeView = document.getElementById(targetViewId);
    if (activeView) {
        activeView.classList.add("active");
    }
    window.scrollTo(0, 0);
}

// LÓGICA DO CARRINHO DE COMPRAS
function adicionarAoCarrinho(produto) {
    const itemExistente = carrinho.find(item => item.nome === produto.nome);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({...produto, quantidade: 1 });
    }
    atualizarInterfaceCarrinho();
    abrirCarrinho();
}

// ... (Restante das funções internas do carrinho permanecem iguaizinhas)
function alterarQuantidade(nomeProduto, delta) {
    const index = carrinho.findIndex(item => item.nome === nomeProduto);
    if (index > -1) {
        carrinho[index].quantidade += delta;
        if (carrinho[index].quantidade <= 0) {
            carrinho.splice(index, 1);
        }
    }
    atualizarInterfaceCarrinho();
    if (document.getElementById("view-checkout").classList.contains("active")) {
        renderizarResumoCheckout();
    }
}

function removerDoCarrinho(nomeProduto) {
    carrinho = carrinho.filter(item => item.nome !== nomeProduto);
    atualizarInterfaceCarrinho();
    if (document.getElementById("view-checkout").classList.contains("active")) {
        renderizarResumoCheckout();
    }
}

function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById("cart-items");
    const labelTotal = document.getElementById("cart-total-price");
    const badge = document.getElementById("cart-badge");

    containerItens.innerHTML = "";
    let totalPreco = 0;
    let totalItens = 0;

    if (carrinho.length === 0) {
        containerItens.innerHTML = '<p class="cart-empty">Seu carrinho está vazio 🥀</p>';
        badge.style.display = "none";
    } else {
        carrinho.forEach(item => {
            const valorNumerico = converterPrecoParaNumero(item.preco);
            totalPreco += (valorNumerico * item.quantidade);
            totalItens += item.quantidade;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div class="cart-item-icon">${item.icone}</div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-price">${item.preco}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn btn-menos">-</button>
                    <span>${item.quantidade}</span>
                    <button class="qty-btn btn-mais">+</button>
                    <button class="remove-btn">🗑️</button>
                </div>
            `;
            div.querySelector(".btn-menos").addEventListener("click", () => alterarQuantidade(item.nome, -1));
            div.querySelector(".btn-mais").addEventListener("click", () => alterarQuantidade(item.nome, 1));
            div.querySelector(".remove-btn").addEventListener("click", () => removerDoCarrinho(item.nome));
            containerItens.appendChild(div);
        });
        badge.innerText = totalItens;
        badge.style.display = "block";
    }
    labelTotal.innerText = formatarMoeda(totalPreco);
}

function abrirCarrinho() {
    document.getElementById("cart-sidebar").classList.add("active");
    document.getElementById("cart-overlay").classList.add("active");
}

function fecharCarrinho() {
    document.getElementById("cart-sidebar").classList.remove("active");
    document.getElementById("cart-overlay").classList.remove("active");
}

function initCatalogo() {
    renderGrid("grid-mais-vendidos", CATALOGO["mais-vendidos"]);
    renderGrid("grid-home-mega", CATALOGO["home-mega"]);
    renderGrid("grid-flores-avulsas", CATALOGO["flores-avulsas"]);
    renderGrid("grid-arranjos", CATALOGO["arranjos"]);
    renderGrid("grid-buques", CATALOGO["buques"]);
    renderGrid("grid-cestas", CATALOGO["cestas"]);
    renderGrid("grid-kit-presente", CATALOGO["kit-presente"]);
    renderGrid("grid-mega-buques", CATALOGO["mega-buques"]);
}

function switchSubView(targetSubViewId) {
    document.querySelectorAll(".sub-view").forEach(sv => {
        sv.classList.remove("active");
    });
    const activeSub = document.getElementById(targetSubViewId);
    if (activeSub) {
        activeSub.classList.add("active");
    }
}

// ==========================================
// MÓDULO LOGICO DO CHECKOUT E SUB-DETALHES
// ==========================================
function switchCheckoutStep(stepNumber) {
    document.querySelectorAll(".checkout-step-panel").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".checkout-progress-bar .step").forEach(st => st.classList.remove("active"));

    document.getElementById(`checkout-step-${stepNumber}`).classList.add("active");

    for (let i = 1; i <= stepNumber; i++) {
        const stepIndicator = document.getElementById(`step-indicator-${i}`);
        if (stepIndicator) stepIndicator.classList.add("active");
    }
    window.scrollTo(0, 0);
}

function renderizarResumoCheckout() {
    const container = document.getElementById("checkout-summary-items");
    const subtotalLabel = document.getElementById("chk-subtotal");
    const discountRow = document.getElementById("chk-row-desconto");
    const discountLabel = document.getElementById("chk-desconto");
    const totalLabel = document.getElementById("chk-total");
    const parcelasDropdown = document.getElementById("chk-parcelas");

    if (carrinho.length === 0) {
        switchView("view-home");
        return;
    }

    container.innerHTML = "";
    let subtotal = 0;

    carrinho.forEach(item => {
        const valorItem = converterPrecoParaNumero(item.preco);
        subtotal += (valorItem * item.quantidade);

        const row = document.createElement("div");
        row.className = "checkout-summary-row-item";
        row.innerHTML = `<span>${item.quantidade}x ${item.nome}</span> <span>${formatarMoeda(valorItem * item.quantidade)}</span>`;
        container.appendChild(row);
    });

    subtotalLabel.innerText = formatarMoeda(subtotal);

    let totalFinal = subtotal;
    if (checkoutMetodoPagamento === "pix") {
        let desconto = subtotal * 0.05;
        totalFinal = subtotal - desconto;
        discountRow.style.display = "flex";
        discountLabel.innerText = "-" + formatarMoeda(desconto);
    } else {
        discountRow.style.display = "none";
    }

    totalLabel.innerText = formatarMoeda(totalFinal);

    if (parcelasDropdown) {
        parcelasDropdown.innerHTML = "";
        for (let v = 1; v <= 6; v++) {
            let valorParcela = totalFinal / v;
            let opt = document.createElement("option");
            opt.value = v;
            opt.innerText = `${v}x de ${formatarMoeda(valorParcela)} sem juros`;
            parcelasDropdown.appendChild(opt);
        }
    }
}

async function carregarEnderecosUsuario() {
    const container = document.getElementById("lista-enderecos-container");
    if (!container) return;

    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) {
        container.innerHTML = '<p style="text-align: center; color: #727e5f; padding: 20px;">Faça login para ver seus endereços.</p>';
        return;
    }

    try {
        const docRef = doc(db, "usuarios", usuarioAtual.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().endereco) {
            const dados = docSnap.data().endereco;
            container.innerHTML = `
                <div class="address-card">
                    <div class="address-header">
                        <strong>Principal</strong>
                        <span class="badge-pattern">Entrega</span>
                    </div>
                    <p>${dados.rua}, Nº ${dados.numero}</p>
                    <div class="address-actions">
                        <span class="action-link danger" id="btn-excluir-endereco">Excluir</span>
                    </div>
                </div>
            `;
            document.getElementById("btn-excluir-endereco").addEventListener("click", deletarEnderecoBanco);
        } else {
            container.innerHTML = '<p style="text-align: center; color: #727e5f; padding: 20px;">Nenhum endereço cadastrado. 🏡</p>';
        }
    } catch (error) {
        // Em vez de travar a tela com uma mensagem de erro, ele apenas registra no console
        console.warn("Nota: Aguardando sincronização com o Firebase...", error.message);

        // Se o erro for apenas de conexão, mantém a interface amigável dizendo para tentar novamente
        container.innerHTML = '<p style="text-align: center; color: #727e5f; padding: 20px;">Carregando endereços... (Verifique sua conexão) ⏳</p>';
    }
}

// Função auxiliar para limpar o endereço se o usuário clicar em Excluir
async function deletarEnderecoBanco() {
    if (confirm("Deseja realmente excluir este endereço?")) {
        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) return;
        try {
            // Remove o nó de endereço do banco usando o setDoc com merge
            await setDoc(doc(db, "usuarios", usuarioAtual.uid), { endereco: null }, { merge: true });
            alert("Endereço excluído!");
            carregarEnderecosUsuario(); // Atualiza a tela
        } catch (error) {
            alert("Erro ao excluir: " + error.message);
        }
    }
}

// INICIALIZADOR GERAL DOM
document.addEventListener("DOMContentLoaded", () => {
    initCatalogo();

    // PESQUISA E AUTOCOMPLETE
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const searchDropdown = document.getElementById("search-dropdown");
    const searchContainer = document.getElementById("search-container");

    // Botão "Ir para entrega"
    const btnIrEntrega = document.getElementById("btn-ir-entrega");
    if (btnIrEntrega) {
        btnIrEntrega.addEventListener("click", () => {
            if (carrinho.length === 0) {
                alert("Seu carrinho está vazio. Adicione produtos antes de continuar.");
                return;
            }
            // Avança para a etapa 2 (entrega)
            switchCheckoutStep(2);
        });
    }

    const btnIrPagamento = document.getElementById("btn-ir-pagamento");
    if (btnIrPagamento) {
        btnIrPagamento.addEventListener("click", () => {
            const ruaEl = document.getElementById("logradouro");
            const numeroEl = document.getElementById("numero");
            const cepEl = document.getElementById("cep");
            const cidadeEl = document.getElementById("cidade");

            const rua = ruaEl ? ruaEl.value.trim() : "";
            const numero = numeroEl ? numeroEl.value.trim() : "";
            const cep = cepEl ? cepEl.value.trim() : "";
            const cidade = cidadeEl ? cidadeEl.value.trim() : "";

            if (!rua || !numero || !cep || !cidade) {
                alert("Preencha todos os campos de endereço antes de prosseguir.");
                return;
            }

            switchCheckoutStep(3); // Avança para pagamento
        });
    }


    function renderDropdownRecentes() {
        if (buscasRecentes.length === 0) {
            searchDropdown.innerHTML = '<div class="empty-search-message">Nenhuma busca recente</div>';
            return;
        }
        let html = '<div class="dropdown-header">Buscas Recentes <span class="dropdown-clear-btn" id="clear-recent">Limpar</span></div>';
        buscasRecentes.forEach(busca => {
            html += `<div class="dropdown-item" data-termo="${busca}">🕒 ${busca}</div>`;
        });
        searchDropdown.innerHTML = html;

        const clearBtn = document.getElementById("clear-recent");
        if (clearBtn) {
            clearBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                buscasRecentes = [];
                localStorage.setItem("fk_recentes", JSON.stringify([]));
                renderDropdownRecentes();
            });
        }
        adicionarEventosDropdown();
    }

    function renderDropdownSugestoes(termo) {
        const filtrados = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo.toLowerCase())).slice(0, 5);
        if (filtrados.length === 0) {
            searchDropdown.innerHTML = '<div class="empty-search-message">Nenhum produto encontrado 🥀</div>';
            return;
        }
        let html = '<div class="dropdown-header">Sugestões</div>';
        filtrados.forEach(prod => {
            html += `<div class="dropdown-item" data-termo="${prod.nome}">${prod.icone} ${prod.nome}</div>`;
        });
        searchDropdown.innerHTML = html;
        adicionarEventosDropdown();
    }

    function adicionarEventosDropdown() {
        document.querySelectorAll('.dropdown-item').forEach(item => {
            if (item.hasAttribute('data-termo')) {
                item.addEventListener('click', () => {
                    searchInput.value = item.getAttribute('data-termo');
                    ejecutarPesquisa(searchInput.value);
                });
            }
        });
    }

    function ejecutarPesquisa(termo) {
        if (!termo.trim()) return;
        if (!buscasRecentes.includes(termo)) {
            buscasRecentes.unshift(termo);
            if (buscasRecentes.length > 5) buscasRecentes.pop();
            localStorage.setItem("fk_recentes", JSON.stringify(buscasRecentes));
        }
        searchDropdown.classList.remove("active");
        const resultados = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo.toLowerCase()));
        renderGrid("grid-pesquisa", resultados);
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        switchView("view-pesquisa");
    }
    const btnVoltarPedidos = document.getElementById("btn-voltar-pedidos");
    if (btnVoltarPedidos) {
        btnVoltarPedidos.addEventListener("click", () => {
            switchSubView("subview-pedidos");
        });
    }

    searchInput.addEventListener("focus", () => {
        searchDropdown.classList.add("active");
        if (searchInput.value.trim() === "") renderDropdownRecentes();
        else renderDropdownSugestoes(searchInput.value.trim());
    });

    searchInput.addEventListener("input", (e) => {
        const termo = e.target.value.trim();
        if (termo === "") renderDropdownRecentes();
        else renderDropdownSugestoes(termo);
    });

    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") ejecutarPesquisa(searchInput.value);
    });

    searchBtn.addEventListener("click", () => ejecutarPesquisa(searchInput.value));

    document.addEventListener("click", (e) => {
        if (!searchContainer.contains(e.target)) searchDropdown.classList.remove("active");
    });

    // EVENTOS DO CARRINHO E SEUS CONTROLES
    document.getElementById("btn-cart").addEventListener("click", abrirCarrinho);
    document.getElementById("btn-close-cart").addEventListener("click", fecharCarrinho);
    document.getElementById("cart-overlay").addEventListener("click", fecharCarrinho);

    // DISPARADOR PRINCIPAL DO NOVO FLUXO DE CHECKOUT
    document.querySelector(".btn-checkout").addEventListener("click", () => {
        if (carrinho.length === 0) return alert("Seu carrinho está vazio!");
        fecharCarrinho();
        switchView("view-checkout");
        switchCheckoutStep(1);
        document.getElementById("chk-summary-box").style.display = "block";
        renderizarResumoCheckout();
    });

    // NAVEGAÇÃO DA BARRA CATEGORIAS
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            e.currentTarget.classList.add("active");
            switchView("view-" + e.currentTarget.getAttribute("data-target"));
        });
    });

    document.getElementById("logo-home").addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
        document.querySelector('[data-target="home"]').classList.add("active");
        switchView("view-home");
    });

    // FLUXO DE LOGIN / MINHA CONTA
    document.getElementById("btn-account").addEventListener("click", () => {
        if (usuarioEstaLogado) {
            switchView("view-minha-conta");
            switchSubView("subview-perfil");
        } else {
            switchView("view-login");
        }
    });

    // INTEGRADO AO FIREBASE: Login de Usuário com Validação Rigorosa
    document.getElementById("btn-entrar").addEventListener("click", async() => {
        const emailInput = document.getElementById("login-email");
        const senhaInput = document.getElementById("login-senha");

        const email = emailInput ? emailInput.value.trim() : "";
        const senha = senhaInput ? senhaInput.value.trim() : "";

        if (!email) return alert("Por favor, insira o seu e-mail!");
        if (!validarEmailFormatado(email)) return alert("Por favor, insira um e-mail em formato válido! Ex: nome@dominio.com");
        if (!senha) return alert("Por favor, insira a sua senha!");
        if (senha.length < 6) return alert("A senha informada deve conter no mínimo 6 caracteres.");

        try {
            // Chamada Assíncrona Real ao Firebase Auth
            await signInWithEmailAndPassword(auth, email, senha);
            switchView("view-minha-conta");
            switchSubView("subview-perfil");
        } catch (error) {
            console.error("Erro ao autenticar:", error);
            if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                alert("E-mail ou senha inválidos. Verifique as credenciais.");
            } else {
                alert("Erro ao entrar: " + error.message);
            }
        }
    });

    // INTEGRADO AO FIREBASE: Logout Real
    document.getElementById("btn-sair").addEventListener("click", async() => {
        try {
            await signOut(auth);
            document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
            if (document.querySelector('[data-subtarget="perfil"]')) {
                document.querySelector('[data-subtarget="perfil"]').classList.add("active");
            }
            switchView("view-home");
        } catch (error) {
            alert("Erro ao sair da conta.");
        }
    });

    document.getElementById("link-esqueci").addEventListener("click", (e) => {
        e.preventDefault();
        switchView("view-redefinir-senha");
    });

    document.getElementById("btn-ir-cadastro").addEventListener("click", () => switchView("view-cadastro"));

    // INTEGRADO AO FIREBASE: Recuperação de Senha com link real enviado por email
    document.getElementById("btn-salvar-senha").addEventListener("click", async() => {
        const emailRecuperar = document.getElementById("redefinir-email");
        const email = emailRecuperar ? emailRecuperar.value.trim() : "";

        if (!email) return alert("Por favor, informe o e-mail cadastrado!");
        if (!validarEmailFormatado(email)) return alert("O e-mail informado não é válido. Verifique a digitação!");

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Instruções reais enviadas para o seu e-mail de redefinição!");
            switchView("view-login");
        } catch (error) {
            console.error(error);
            alert("Erro ao solicitar redefinição: " + error.message);
        }
    });

    // INTEGRADO AO FIREBASE: Tela de Cadastro de Novo Usuário Real
    document.getElementById("btn-finalizar-cadastro").addEventListener("click", async() => {
        const cadEmail = document.getElementById("cadastro-email");
        const cadSenha = document.getElementById("cadastro-senha");

        const email = cadEmail ? cadEmail.value.trim() : "";
        const senha = cadSenha ? cadSenha.value.trim() : "";

        if (!email) return alert("O campo E-mail é obrigatório para o cadastro!");
        if (!validarEmailFormatado(email)) return alert("Insira um endereço de e-mail válido!");
        if (!senha) return alert("Crie uma senha de acesso!");
        if (senha.length < 6) return alert("Para sua segurança, a senha deve possuir pelo menos 6 caracteres!");

        try {
            await createUserWithEmailAndPassword(auth, email, senha);
            alert("Cadastro criado com sucesso no Firebase!");
            switchView("view-login");
        } catch (error) {
            console.error(error);
            if (error.code === "auth/email-already-in-use") {
                alert("Este e-mail já está cadastrado em nossa plataforma.");
            } else {
                alert("Erro ao registrar: " + error.message);
            }
        }
    });

    // SIDEBAR DA CONTA
    document.querySelectorAll(".sidebar-item").forEach(sbItem => {
        if (sbItem.id === "btn-sair") return;
        sbItem.addEventListener("click", (e) => {
            document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
            e.currentTarget.classList.add("active");
            switchSubView("subview-" + e.currentTarget.getAttribute("data-subtarget"));
        });
    });

    document.getElementById("btn-add-endereco-tela").addEventListener("click", () => switchSubView("subview-novo-endereco"));
    document.getElementById("btn-cancelar-endereco").addEventListener("click", () => switchSubView("subview-enderecos"));

    document.getElementById("btn-salvar-endereco").addEventListener("click", async() => {
        const rua = document.getElementById("logradouro").value.trim();
        const numero = document.getElementById("numero").value.trim();
        const cep = document.getElementById("cep").value.trim();
        const cidade = document.getElementById("cidade").value.trim();

        if (!rua) {
            alert("Por favor, informe o logradouro.");
            return;
        }
        if (!numero || isNaN(numero)) {
            alert("Por favor, informe um número válido.");
            return;
        }
        if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) { // aceita com ou sem hífen
            alert("Por favor, informe um CEP válido (00000-000).");
            return;
        }
        if (!cidade) {
            alert("Por favor, informe a cidade.");
            return;
        }

        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) {
            alert("É necessário estar logado para salvar endereço.");
            return;
        }

        try {
            await setDoc(doc(db, "usuarios", usuarioAtual.uid), {
                endereco: { rua, numero, cep, cidade }
            }, { merge: true });

            alert("Endereço salvo com sucesso!");
            carregarEnderecosUsuario();
            switchSubView("subview-enderecos");
        } catch (error) {
            alert("Erro ao salvar endereço: " + error.message);
        }
    });



    document.getElementById("btn-ver-detalhe-pedido").addEventListener("click", () => switchSubView("subview-detalhes-pedido"));

    // INTEGRADO AO FIREBASE: Alteração de Senha Segura Interna no Perfil
    document.getElementById("btn-confirmar-alterar-senha").addEventListener("click", async() => {
        const novaSenhaInput = document.getElementById("perfil-nova-senha");
        const novaSenha = novaSenhaInput ? novaSenhaInput.value.trim() : "";

        if (!novaSenha) return alert("Por favor, insira a nova senha desejada!");
        if (novaSenha.length < 6) return alert("A nova senha deve possuir no mínimo 6 caracteres!");

        const usuarioAtual = auth.currentUser;
        if (!usuarioAtual) return alert("Usuário não identificado.");

        try {
            await updatePassword(usuarioAtual, novaSenha);
            alert("Senha modificada com sucesso no Firebase!");
            if (novaSenhaInput) novaSenhaInput.value = "";
            switchSubView("subview-perfil");
        } catch (error) {
            console.error(error);
            if (error.code === "auth/requires-recent-login") {
                alert("Por motivos de segurança, saia e faça login novamente para alterar sua senha.");
            } else {
                alert("Erro ao alterar senha: " + error.message);
            }
        }
    });

    // NAVEGAÇÃO DO CHECKOUT
    document.getElementById("btn-chk-prosseguir-1").addEventListener("click", () => {
        const nome = document.getElementById("chk-nome") ? document.getElementById("chk-nome").value.trim() : "";
        const cpf = document.getElementById("chk-cpf") ? document.getElementById("chk-cpf").value.trim() : "";

        if (!nome) return alert("O campo Nome Completo é obrigatório!");
        if (!cpf) return alert("O campo CPF é obrigatório para emissão da nota!");
        switchCheckoutStep(2);
    });

    document.getElementById("btn-chk-voltar-2").addEventListener("click", () => switchCheckoutStep(1));

    document.getElementById("btn-chk-prosseguir-2").addEventListener("click", () => {
        const rua = document.getElementById("chk-rua") ? document.getElementById("chk-rua").value.trim() : "";
        const num = document.getElementById("chk-num") ? document.getElementById("chk-num").value.trim() : "";
        const cep = document.getElementById("chk-cep") ? document.getElementById("chk-cep").value.trim() : "";

        if (!rua || !num || !cep) return alert("Por favor, preencha todos os dados de entrega obrigatórios (Rua, Número e CEP)!");
        switchCheckoutStep(3);
    });

    document.getElementById("btn-chk-voltar-3").addEventListener("click", () => switchCheckoutStep(2));

    document.querySelectorAll(".pay-tab-btn").forEach(tab => {
        tab.addEventListener("click", (e) => {
            document.querySelectorAll(".pay-tab-btn").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".payment-method-panel").forEach(p => p.classList.remove("active"));

            e.currentTarget.classList.add("active");
            checkoutMetodoPagamento = e.currentTarget.getAttribute("data-method");

            document.getElementById(`pay-panel-${checkoutMetodoPagamento}`).classList.add("active");
            renderizarResumoCheckout();
        });
    });

    // EVENTO: FINALIZAR COMPRA (VERSÃO COMPATÍVEL À PROVA DE FALHAS)
    document.getElementById("btn-chk-finalizar").addEventListener("click", async() => {
        const pixContainer = document.getElementById("pix-container-final");
        const msgFinal = document.getElementById("conf-order-msg");
        const inputNome = document.getElementById("chk-nome");
        const nomeCliente = (inputNome && inputNome.value.trim()) ? inputNome.value.trim().split(" ")[0].toUpperCase() : "CLIENTE";

        // 1. CALCULA O VALOR TOTAL DO PEDIDO
        let subtotal = 0;
        if (carrinho && carrinho.length > 0) {
            carrinho.forEach(item => {
                subtotal += (converterPrecoParaNumero(item.preco) * item.quantidade);
            });
        }

        let totalFinal = subtotal;
        if (checkoutMetodoPagamento === "pix") {
            totalFinal = subtotal * 0.95; // Desconto de 5%
        }

        // 2. SALVA NO FIREBASE FIRESTORE
        const usuarioAtual = auth.currentUser;
        if (usuarioAtual && carrinho && carrinho.length > 0) {
            try {
                const itensDoPedido = carrinho.map(item => ({
                    nome: item.nome,
                    preco: item.preco,
                    icone: item.icone,
                    quantidade: item.quantidade
                }));

                await addDoc(collection(db, "usuarios", usuarioAtual.uid, "pedidos"), {
                    itens: itensDoPedido,
                    total: totalFinal,
                    metodoPagamento: checkoutMetodoPagamento,
                    status: "Em preparação",
                    dataPedido: new Date()
                });

                if (typeof carregarPedidosUsuario === "function") {
                    await carregarPedidosUsuario();
                }
            } catch (error) {
                console.error("Erro interno ao salvar pedido no Firebase:", error);
            }
        }

        // 3. EXIBE A MENSAGEM NA INTERFACE (Com checagem para não travar o código)
        if (checkoutMetodoPagamento === "pix") {
            if (pixContainer) pixContainer.style.display = "block";
            if (msgFinal) msgFinal.innerText = `${nomeCliente}, seu pedido foi reservado! Conclua o pagamento via PIX para envio automático.`;
        } else {
            if (pixContainer) pixContainer.style.display = "none";
            if (msgFinal) msgFinal.innerText = `${nomeCliente}, seu pedido foi processado com sucesso!`;
        }

        // 4. LIMPA O CARRINHO
        carrinho = [];
        if (typeof atualizarInterfaceCarrinho === "function") {
            atualizarInterfaceCarrinho();
        }

        // 5. MUDANÇA DE PASSO (Executa independente de qualquer erro acima)
        if (typeof switchCheckoutStep === "function") {
            switchCheckoutStep(4);
        } else {
            alert("Compra finalizada com sucesso!");
        }
    });
});