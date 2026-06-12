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
    updatePassword,
    verifyBeforeUpdateEmail
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
// DADOS COMPLETOS DOS PRODUTOS (CATÁLOGO)
// ==========================================
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
let usuarioEFuncionario = false; // FLAG DE DIFERENCIAÇÃO ADMINISTRATIVA
let carrinho = [];
let checkoutMetodoPagamento = "pix";
let paginaAtual = "";

// ==========================================
// MONITOR DE SESSÃO DO FIREBASE SEGURO E COM IDENTIFICAÇÃO DE CARGO
// ==========================================
onAuthStateChanged(auth, async(user) => {
    if (user) {
        usuarioEstaLogado = true;
        usuarioEFuncionario = false;
        let nomeExibicao = (user.email && typeof user.email === "string") ? user.email.split('@')[0].toUpperCase() : "CONTA";
        let preferencesData = { email: false, whatsapp: false };

        try {
            // 1. Tenta identificar se o usuário está cadastrado na coleção de Funcionários
            const funcDoc = await getDoc(doc(db, "funcionarios", user.uid));
            if (funcDoc.exists()) {
                usuarioEFuncionario = true;
                const d = funcDoc.data();
                if (d && d.nome) nomeExibicao = d.nome;
            } else {
                // 2. Se não for funcionário, puxa os dados de Cliente normal
                const userDoc = await getDoc(doc(db, "usuarios", user.uid));
                if (userDoc.exists()) {
                    const dadosFstore = userDoc.data();
                    if (dadosFstore && dadosFstore.nome) nomeExibicao = dadosFstore.nome;
                    if (dadosFstore && dadosFstore.preferencias) preferencesData = dadosFstore.preferencias;

                    // Backup de segurança: se na tabela usuários ele tiver cargo de funcionário
                    if (dadosFstore && dadosFstore.cargo === "funcionario") {
                        usuarioEFuncionario = true;
                    }
                }
            }
        } catch (e) {
            console.error("Erro ao carregar dados do Firestore:", e);
        }

        const labelAccount = document.getElementById("account-label");
        if (labelAccount) {
            if (usuarioEFuncionario) {
                labelAccount.innerText = "ADMIN";
            } else if (nomeExibicao && typeof nomeExibicao === "string" && nomeExibicao.trim() !== "") {
                labelAccount.innerText = nomeExibicao.split(" ")[0].toUpperCase();
            } else {
                labelAccount.innerText = "CONTA";
            }
        }

        const inputPerfilNome = document.getElementById("perfil-nome");
        const inputPerfilEmail = document.getElementById("perfil-email");
        const chkPrefEmail = document.getElementById("pref-email");
        const chkPrefWhats = document.getElementById("pref-whatsapp");

        if (inputPerfilNome) inputPerfilNome.value = nomeExibicao;
        if (inputPerfilEmail) inputPerfilEmail.value = user.email || "";
        if (chkPrefEmail) chkPrefEmail.checked = !!preferencesData.email;
        if (chkPrefWhats) chkPrefWhats.checked = !!preferencesData.whatsapp;

        carregarEnderecosUsuario();
        carregarPedidosUsuario();
    } else {
        usuarioEstaLogado = false;
        usuarioEFuncionario = false;
        const labelAcc = document.getElementById("account-label");
        if (labelAcc) labelAcc.innerText = "CONTA";

        const inputPerfilNome = document.getElementById("perfil-nome");
        const inputPerfilEmail = document.getElementById("perfil-email");
        if (inputPerfilNome) inputPerfilNome.value = "";
        if (inputPerfilEmail) inputPerfilEmail.value = "";

        carregarEnderecosUsuario();
        carregarPedidosUsuario();
    }
});

// ==========================================
// NAVEGAÇÃO DINÂMICA SPA (ROTEAMENTO INTELIGENTE)
// ==========================================
async function carregarPagina(nomePagina, subviewOpcional = null, contextData = null) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    paginaAtual = nomePagina;

    let pastaDestino = "paginas";

    // Configuração para aceitar as páginas da pasta paginasadmin
    const paginasAdmin = [
        'home-admin',
        'pedidos-admin',
        'quadro-funcionario',
        'pedidos-entregues',
        'cancelar-pedido',
        'faturamento-dia'
    ];

    if (paginasAdmin.includes(nomePagina)) {
        pastaDestino = "paginasadmin";
    }

    try {
        const resposta = await fetch(`${pastaDestino}/${nomePagina}.html`);
        if (!resposta.ok) throw new Error(`Erro ao carregar fragmento: ${nomePagina}`);

        const html = await resposta.text();
        mainContent.innerHTML = html;

        initEventosEProdutosDaPagina(nomePagina, subviewOpcional, contextData);
        window.scrollTo(0, 0);

    } catch (erro) {
        console.error("Falha no carregamento SPA:", erro);
        mainContent.innerHTML = `<p style="text-align:center; padding:40px; color:#727e5f;">Não foi possível processar a navegação da página. Verifique seus arquivos locais. 🥀</p>`;
    }
}

// ==========================================
// INICIALIZADOR DOS COMPONENTES E TELAS
// ==========================================
function initEventosEProdutosDaPagina(nomePagina, subviewOpcional, contextData) {
    // ---- TELAS DE CLIENTES ----
    if (nomePagina === 'home') {
        renderGrid("grid-mais-vendidos", CATALOGO["mais-vendidos"]);
        renderGrid("grid-home-mega", CATALOGO["home-mega"]);
    } else if (nomePagina === 'produtos') {
        const categoriaSolicitada = contextData || "flores-avulsas";
        const gridGenerica = document.querySelector('.products-grid');
        if (gridGenerica) {
            gridGenerica.id = `grid-${categoriaSolicitada}`;
            renderGrid(gridGenerica.id, CATALOGO[categoriaSolicitada]);
        }
    } else if (nomePagina === 'pesquisa') {
        if (contextData) renderGrid("grid-pesquisa", contextData);
    }

    if (nomePagina === 'minha-conta') {
        carregarEnderecosUsuario();
        carregarPedidosUsuario();

        document.querySelectorAll(".sidebar-item").forEach(sbItem => {
            if (sbItem.id === "btn-sair") {
                sbItem.addEventListener("click", () => { signOut(auth).then(() => carregarPagina('home')); });
                return;
            }
            sbItem.addEventListener("click", (e) => {
                document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
                e.currentTarget.classList.add("active");
                if (typeof switchSubView === "function") switchSubView("subview-" + e.currentTarget.getAttribute("data-subtarget"));
            });
        });

        const btnSalvarPerfil = document.getElementById("btn-salvar-perfil");
        if (btnSalvarPerfil) btnSalvarPerfil.addEventListener("click", executarSalvarPerfilCadastral);

        const btnAddEnd = document.getElementById("btn-add-endereco-tela");
        if (btnAddEnd) btnAddEnd.addEventListener("click", () => typeof switchSubView === "function" && switchSubView("subview-novo-endereco"));

        const btnCancelEnd = document.getElementById("btn-cancelar-endereco");
        if (btnCancelEnd) btnCancelEnd.addEventListener("click", () => typeof switchSubView === "function" && switchSubView("subview-enderecos"));

        const btnSalvarEnd = document.getElementById("btn-salvar-endereco");
        if (btnSalvarEnd) btnSalvarEnd.addEventListener("click", executarSalvarEnderecoBanco);

        const btnAltSenha = document.getElementById("btn-confirmar-alterar-senha");
        if (btnAltSenha) btnAltSenha.addEventListener("click", executarAlterarSenhaBanco);

        const btnVoltarPed = document.getElementById("btn-voltar-pedidos");
        if (btnVoltarPed) btnVoltarPed.addEventListener("click", () => typeof switchSubView === "function" && switchSubView("subview-pedidos"));

        if (subviewOpcional && typeof switchSubView === "function") {
            switchSubView(subviewOpcional);
            const itemSidebarAtivo = document.querySelector(`[data-subtarget="${subviewOpcional.replace('subview-', '')}"]`);
            if (itemSidebarAtivo) {
                document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
                itemSidebarAtivo.classList.add("active");
            }
        }
    }

    if (nomePagina === 'login') {
        const btnEntrar = document.getElementById("btn-entrar");
        if (btnEntrar) btnEntrar.addEventListener("click", executarLoginInteligente);

        const linkEsqueci = document.getElementById("link-esqueci");
        if (linkEsqueci) linkEsqueci.addEventListener("click", (e) => {
            e.preventDefault();
            carregarPagina('login', 'subview-redefinir-senha');
        });

        const btnIrCad = document.getElementById("btn-ir-cadastro");
        if (btnIrCad) btnIrCad.addEventListener("click", () => carregarPagina('cadastro'));

        const btnSalvarSenha = document.getElementById("btn-salvar-senha");
        if (btnSalvarSenha) btnSalvarSenha.addEventListener("click", executarRecuperarSenhaBanco);

        if (subviewOpcional && typeof switchSubView === "function") {
            switchSubView(subviewOpcional);
        }
    }

    if (nomePagina === 'cadastro') {
        const btnFinCad = document.getElementById("btn-finalizar-cadastro");
        if (btnFinCad) btnFinCad.addEventListener("click", HooksCadastroReal);
    }

    if (nomePagina === 'checkout') {
        if (typeof renderizarResumoCheckout === "function") renderizarResumoCheckout();

        const btnIrEntrega = document.getElementById("btn-ir-entrega");
        if (btnIrEntrega) {
            btnIrEntrega.addEventListener("click", () => {
                const nome = document.getElementById("chk-nome") ? document.getElementById("chk-nome").value.trim() : "";
                const cpf = document.getElementById("chk-cpf") ? document.getElementById("chk-cpf").value.trim() : "";
                if (!nome || !cpf) return alert("Nome e CPF são obrigatórios!");
                if (typeof switchCheckoutStep === "function") switchCheckoutStep(2);
            });
        }

        const btnChkVolt2 = document.getElementById("btn-chk-voltar-2");
        if (btnChkVolt2) btnChkVolt2.addEventListener("click", () => typeof switchCheckoutStep === "function" && switchCheckoutStep(1));

        const btnIrPagamento = document.getElementById("btn-ir-pagamento");
        if (btnIrPagamento) {
            btnIrPagamento.addEventListener("click", () => {
                const rua = document.getElementById("chk-rua") ? document.getElementById("chk-rua").value.trim() : "";
                const num = document.getElementById("chk-num") ? document.getElementById("chk-num").value.trim() : "";
                if (!rua || !num) return alert("Por favor, preencha todos os dados de entrega obrigatórios!");
                if (typeof switchCheckoutStep === "function") switchCheckoutStep(3);
            });
        }

        const btnChkVolt3 = document.getElementById("btn-chk-voltar-3");
        if (btnChkVolt3) btnChkVolt3.addEventListener("click", () => typeof switchCheckoutStep === "function" && switchCheckoutStep(2));

        document.querySelectorAll(".pay-tab-btn").forEach(tab => {
            tab.addEventListener("click", (e) => {
                document.querySelectorAll(".pay-tab-btn").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".payment-method-panel").forEach(p => p.classList.remove("active"));
                e.currentTarget.classList.add("active");
                checkoutMetodoPagamento = e.currentTarget.getAttribute("data-method");
                const panel = document.getElementById(`pay-panel-${checkoutMetodoPagamento}`);
                if (panel) panel.classList.add("active");
                if (typeof renderizarResumoCheckout === "function") renderizarResumoCheckout();
            });
        });

        const btnChkFinalizar = document.getElementById("btn-chk-finalizar");
        if (btnChkFinalizar) btnChkFinalizar.addEventListener("click", executarFinalizarCompraReal);
    }

    // ---- TELAS ADMINISTRATIVAS ----
    if (nomePagina === 'quadro-funcionario') {
        if (typeof carregarQuadroDeFuncionarios === "function") carregarQuadroDeFuncionarios();
        const navIrNovoFunc = document.getElementById("nav-ir-novo-func");
        if (navIrNovoFunc) navIrNovoFunc.addEventListener("click", () => carregarPagina('cadastro-funcionario'));
    }

    if (nomePagina === 'pedidos-admin') {
        // Carrega os dados do Firebase direto para os novos cards do Dashboard
        carregarDashboardPedidosAdmin();
    }

    if (nomePagina === 'pedidos-entregues') {
        if (typeof carregarFiltroPedidosAdmin === "function") carregarFiltroPedidosAdmin("Entregue", "container-pedidos-entregues-admin");
        const navPedidosAtivosVoltar = document.getElementById("nav-pedidos-ativos-voltar");
        if (navPedidosAtivosVoltar) navPedidosAtivosVoltar.addEventListener("click", () => carregarPagina('pedidos-admin'));
    }

    if (nomePagina === 'cancelar-pedido') {
        const btnAbortarCancelamento = document.getElementById("btn-abortar-cancelamento");
        if (btnAbortarCancelamento) btnAbortarCancelamento.addEventListener("click", () => carregarPagina('pedidos-admin'));

        const btnConfirmarCancelamento = document.getElementById("btn-confirmar-cancelamento-banco");
        if (btnConfirmarCancelamento && typeof executarProcessoCancellation === "function") btnConfirmarCancelamento.addEventListener("click", executarProcessoCancellation);
    }

    if (nomePagina === 'faturamento-dia') {
        if (typeof calcularEExibirFaturamentoDoDia === "function") calcularEExibirFaturamentoDoDia();
    }
}

// ==========================================
// FUNÇÕES DE CARRINHO E INTERFACE
// ==========================================

function renderGrid(containerId, productList) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    if (!productList || productList.length === 0) {
        container.innerHTML = "<p style='grid-column: 1 / -1; text-align: center; color: #727e5f;'>Nenhum produto encontrado.</p>";
        return;
    }

    productList.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-img-placeholder">${prod.icone}</div>
            <h4 class="product-title">${prod.nome}</h4>
            <p class="product-price">${prod.preco}</p>
            <button class="btn-buy">Comprar</button>
        `;
        // Lógica FALTANTE que foi adicionada para o botão Comprar
        card.querySelector(".btn-buy").addEventListener("click", () => {
            alert(prod.nome + " adicionado ao carrinho!");

            const precoFormatado = parseFloat(prod.preco.replace("R$", "").replace(".", "").replace(",", "."));

            // Verifica se o item já está no carrinho
            const itemExistente = carrinho.find(item => item.nome === prod.nome);
            if (itemExistente) {
                itemExistente.quantidade++;
            } else {
                carrinho.push({ nome: prod.nome, preco: precoFormatado, icone: prod.icone, quantidade: 1 });
            }

            atualizarInterfaceCarrinho();
        });
        container.appendChild(card);
    });
}

function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById("cart-items");
    const labelTotal = document.getElementById("cart-total-price");

    if (!containerItens) return;
    containerItens.innerHTML = "";

    let totalPreco = 0;

    if (carrinho.length === 0) {
        containerItens.innerHTML = '<p class="cart-empty">Seu carrinho está vazio 🥀</p>';
    } else {
        carrinho.forEach((item, index) => {
            totalPreco += (item.preco * item.quantidade);

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div class="cart-item-icon">${item.icone}</div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-price">R$ ${item.preco.toFixed(2)} (x${item.quantidade})</div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-btn" data-index="${index}">🗑️</button>
                </div>
            `;

            // Lógica para remover item do carrinho
            div.querySelector(".remove-btn").addEventListener("click", (e) => {
                const i = e.currentTarget.getAttribute("data-index");
                carrinho.splice(i, 1);
                atualizarInterfaceCarrinho();
            });

            containerItens.appendChild(div);
        });
    }

    if (labelTotal) labelTotal.innerText = "R$ " + totalPreco.toFixed(2);
}

function abrirCarrinho() {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("cart-overlay");
    if (sidebar) sidebar.classList.add("active");
    if (overlay) overlay.classList.add("active");
}

function fecharCarrinho() {
    const sidebar = document.getElementById("cart-sidebar");
    const overlay = document.getElementById("cart-overlay");
    if (sidebar) sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
}

function switchSubView(targetSubViewId) {
    document.querySelectorAll(".sub-view").forEach(sv => {
        sv.classList.remove("active");
    });
    const activeSub = document.getElementById(targetSubViewId);
    if (activeSub) activeSub.classList.add("active");
}

function switchCheckoutStep(stepNumber) {
    document.querySelectorAll(".checkout-step-panel").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".checkout-progress-bar .step").forEach(st => st.classList.remove("active"));

    const targetPanel = document.getElementById(`checkout-step-${stepNumber}`);
    if (targetPanel) targetPanel.classList.add("active");

    for (let i = 1; i <= stepNumber; i++) {
        const stepIndicator = document.getElementById(`step-indicator-${i}`);
        if (stepIndicator) stepIndicator.classList.add("active");
    }
    window.scrollTo(0, 0);
}

function renderizarResumoCheckout() {
    const subtotalLabel = document.getElementById("chk-subtotal");
    const totalLabel = document.getElementById("chk-total");
    let subtotal = 0;
    carrinho.forEach(item => { subtotal += (item.preco * item.quantidade); });
    if (subtotalLabel) subtotalLabel.innerText = "R$ " + subtotal.toFixed(2);
    if (totalLabel) totalLabel.innerText = "R$ " + subtotal.toFixed(2);
}

async function executarFinalizarCompraReal() {
    if (!auth.currentUser || carrinho.length === 0) return alert("Seu carrinho está vazio ou você não está logado!");

    let subtotal = 0;
    carrinho.forEach(item => { subtotal += (item.preco * item.quantidade); });

    try {
        await addDoc(collection(db, "usuarios", auth.currentUser.uid, "pedidos"), {
            itens: carrinho,
            total: subtotal,
            metodoPagamento: checkoutMetodoPagamento,
            status: "Em preparação",
            dataPedido: new Date()
        });
        carrinho = [];
        atualizarInterfaceCarrinho();
        alert("Compra finalizada com sucesso!");
        carregarPagina("home");
    } catch (error) {
        console.error("Erro interno ao salvar pedido no Firebase:", error);
    }
}

// ==========================================
// FUNÇÕES INTEGRADAS DE LÓGICA E BANCO DE DADOS
// ==========================================

async function executarLoginInteligente() {
    const emailInput = document.getElementById("login-email") || document.getElementById("admin-login-email");
    const senhaInput = document.getElementById("login-senha") || document.getElementById("admin-login-senha");

    if (!emailInput || !senhaInput) return;

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();

    if (!email || !senha) return alert("Por favor, preencha as credenciais!");

    try {
        const cred = await signInWithEmailAndPassword(auth, email, senha);
        const uid = cred.user.uid;

        // Verifica se é administrador
        const funcSnap = await getDoc(doc(db, "funcionarios", uid));
        let isFunc = false;

        if (funcSnap.exists()) {
            isFunc = true;
        } else {
            const userSnap = await getDoc(doc(db, "usuarios", uid));
            if (userSnap.exists() && userSnap.data().cargo === "funcionario") {
                isFunc = true;
            }
        }

        if (isFunc) {
            alert("Acesso Administrativo Confirmado!");
            carregarPagina('home-admin'); // <--- ALTERADO AQUI
        } else {
            carregarPagina('minha-conta', 'subview-perfil');
        }
    } catch (error) {
        alert("Falha ao entrar: E-mail ou senha incorretos.");
    }
}

async function executarSalvarPerfilCadastral() {
    const user = auth.currentUser;
    if (!user) return alert("Nenhum usuário autenticado!");

    const novoNome = document.getElementById("perfil-nome") ? document.getElementById("perfil-nome").value.trim() : "";
    const novoEmail = document.getElementById("perfil-email") ? document.getElementById("perfil-email").value.trim() : "";
    const prefEmail = document.getElementById("pref-email") ? document.getElementById("pref-email").checked : false;
    const prefWhats = document.getElementById("pref-whatsapp") ? document.getElementById("pref-whatsapp").checked : false;

    if (!novoNome) return alert("O campo Nome não pode ficar vazio.");
    if (!novoEmail) return alert("Insira um e-mail válido.");

    try {
        await setDoc(doc(db, "usuarios", user.uid), {
            nome: novoNome,
            preferencias: { email: prefEmail, whatsapp: prefWhats }
        }, { merge: true });
        alert("Perfil atualizado com sucesso!");
    } catch (e) {
        console.error("Erro ao salvar perfil:", e);
    }
}

async function executarSalvarEnderecoBanco() {
    const rua = document.getElementById("logradouro") ? document.getElementById("logradouro").value.trim() : "";
    const numero = document.getElementById("numero") ? document.getElementById("numero").value.trim() : "";
    const cep = document.getElementById("cep") ? document.getElementById("cep").value.trim() : "";
    const cidade = document.getElementById("cidade") ? document.getElementById("cidade").value.trim() : "";

    if (!rua || !numero || !cep || !cidade) return alert("Preencha todos os campos obrigatórios.");
    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) return alert("Faça login para salvar.");

    try {
        await setDoc(doc(db, "usuarios", usuarioAtual.uid), {
            endereco: { rua, numero, cep, cidade }
        }, { merge: true });
        alert("Endereço salvo com sucesso!");
        if (typeof carregarEnderecosUsuario === "function") carregarEnderecosUsuario();
        if (typeof switchSubView === "function") switchSubView("subview-enderecos");
    } catch (error) {
        alert("Erro ao salvar endereço: " + error.message);
    }
}

async function executarAlterarSenhaBanco() {
    const inputs = document.querySelectorAll("#subview-seguranca input[type='password']");
    if (inputs.length < 2) return;

    const novaSenha = inputs[1].value.trim();
    if (!novaSenha || novaSenha.length < 6) return alert("A nova senha precisa conter no mínimo 6 dígitos.");

    try {
        await updatePassword(auth.currentUser, novaSenha);
        alert("Sua senha foi redefinida!");
        inputs[0].value = "";
        inputs[1].value = "";
    } catch (e) {
        alert("Erro de segurança. Efetue login novamente antes de atualizar as suas credenciais.");
    }
}

async function HooksCadastroReal() {
    const cadNome = document.getElementById("cadastro-nome");
    const cadEmail = document.getElementById("cadastro-email");
    const cadSenha = document.getElementById("cadastro-senha");

    const nome = cadNome ? cadNome.value.trim() : "Cliente";
    const email = cadEmail ? cadEmail.value.trim() : "";
    const senha = cadSenha ? cadSenha.value.trim() : "";

    if (!email || senha.length < 6) return alert("Insira um e-mail válido e senha maior que 6 caracteres!");

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
            nome: nome,
            preferencias: { email: true, whatsapp: false }
        });
        alert("Conta criada com sucesso!");
        carregarPagina('login');
    } catch (error) {
        alert("Erro ao registrar: " + error.message);
    }
}

async function executarRecuperarSenhaBanco() {
    const emailRecuperar = document.getElementById("redefinir-email");
    const email = emailRecuperar ? emailRecuperar.value.trim() : "";
    if (!email) return alert("Informe um e-mail válido!");

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Instruções enviadas para o seu e-mail!");
        carregarPagina('login');
    } catch (error) {
        alert("Erro ao solicitar redefinição: " + error.message);
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
                    <p>${dados.cidade} - CEP: ${dados.cep}</p>
                </div>
            `;
        } else {
            container.innerHTML = '<p style="text-align: center; color: #727e5f; padding: 20px;">Nenhum endereço cadastrado. 🏡</p>';
        }
    } catch (error) {
        console.warn("Aguardando sincronização com o Firebase...");
    }
}

async function carregarPedidosUsuario() {
    const container = document.getElementById("lista-pedidos-container");
    if (!container) return;

    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) return;

    try {
        const pedidosRef = collection(db, "usuarios", usuarioAtual.uid, "pedidos");
        const querySnapshot = await getDocs(pedidosRef);

        if (querySnapshot.empty) {
            container.innerHTML = '<p style="text-align: center; color: #727e5f; padding: 20px;">Você ainda não realizou nenhum pedido. 🥀</p>';
            return;
        }

        container.innerHTML = "";
        querySnapshot.forEach((pedidoDoc) => {
            const pedido = pedidoDoc.data();
            const idPedido = pedidoDoc.id;

            const card = document.createElement("div");
            card.className = "order-item-card";
            card.style.cursor = "pointer";
            card.innerHTML = `
                <div class="order-thumb">💐</div>
                <div class="order-info-main">
                    <strong>Pedido #${idPedido.substring(0, 6).toUpperCase()}</strong>
                    <span class="status-badge active-status">● ${pedido.status || 'Em preparação'}</span>
                </div>
                <div class="order-qty-price">
                    <strong>R$ ${pedido.total.toFixed(2)}</strong>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
    }
}

// ==========================================
// FUNÇÕES DO PAINEL DE ADMINISTRAÇÃO
// ==========================================

// ==========================================================
// FUNÇÃO DO PAINEL DE ADMINISTRAÇÃO (ESCOPO GLOBAL DO MODULE)
// ==========================================================
export async function carregarDashboardPedidosAdmin() {
    const containerPedidos = document.getElementById('container-pedidos-admin');
    const countPendentesEl = document.getElementById('admin-count-pendentes');
    const countEntreguesEl = document.getElementById('admin-count-entregues');

    // Se não estivermos na página certa, interrompe para não dar erro
    if (!containerPedidos) return;

    try {
        // Busca os dados na coleção "pedidos" do Firestore
        // ATENÇÃO: Se no topo do seu script sua variável for "firestore" em vez de "db", mude aqui!
        const querySnapshot = await getDocs(collection(db, "pedidos"));

        let htmlPedidos = '';
        let countPendentes = 0;
        let countEntregues = 0;

        querySnapshot.forEach((docSnap) => {
            const pedido = docSnap.data();
            const pedidoId = docSnap.id;

            // Verifica o status (adapte se no seu banco usar outro nome de campo)
            const status = pedido.status || 'pendente';

            if (status === 'pendente' || status === 'processando' || status === 'Em preparação') {
                countPendentes++;

                const nomeCliente = pedido.clienteNome || pedido.nome || 'Cliente';
                const valorTotal = pedido.total ? parseFloat(pedido.total).toFixed(2).replace('.', ',') : '0,00';

                htmlPedidos += `
                    <div style="border: 1px solid #e0d6d6; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: white; margin-bottom: 10px;">
                        <div>
                            <strong style="color: #4a5d23; font-size: 16px;">Pedido #${pedidoId.substring(0,8).toUpperCase()}</strong>
                            <div style="color: #6b6b6b; font-size: 13px; margin-top: 5px;">
                                👤 ${nomeCliente} <br>
                                💰 Valor: R$ ${valorTotal}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
                            <span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">Aguardando Envio</span>
                            <button onclick="atualizarStatusPedido('${pedidoId}', 'entregue')" style="padding: 6px 12px; background: #5f7a3f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                Marcar como Entregue
                            </button>
                        </div>
                    </div>
                `;
            } else if (status === 'entregue') {
                countEntregues++;
            }
        });

        // Atualiza as contagens nos cards superiores
        if (countPendentesEl) countPendentesEl.textContent = countPendentes;
        if (countEntreguesEl) countEntreguesEl.textContent = countEntregues;

        // Injeta a lista gerada ou a mensagem de vazio
        if (countPendentes === 0) {
            containerPedidos.innerHTML = `
                <div style="text-align: center; color: var(--admin-text-muted); padding: 40px;">
                    <span style="font-size: 24px; display: block; margin-bottom: 10px;">🎉</span> Nenhum pedido pendente no momento!
                </div>`;
        } else {
            containerPedidos.innerHTML = htmlPedidos;
        }

    } catch (error) {
        console.error("Erro ao buscar dados no Firebase:", error);
        containerPedidos.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Erro ao carregar os pedidos do banco de dados.</p>';
    }
}

// Garante que a função de atualizar status fique disponível para o clique do botão
window.atualizarStatusPedido = async function(pedidoId, novoStatus) {
    try {
        if (!confirm("Deseja alterar o status do pedido para entregue?")) return;
        const pedidoRef = doc(db, "pedidos", pedidoId);
        await setDoc(pedidoRef, { status: novoStatus }, { merge: true });
        alert("Pedido atualizado!");
        carregarDashboardPedidosAdmin(); // Recarrega a lista
    } catch (e) {
        console.error(e);
    }
};

async function carregarQuadroDeFuncionarios() {
    const c = document.getElementById("container-quadro-funcionarios");
    if (!c) return;
    const snap = await getDocs(collection(db, "funcionarios"));
    if (snap.empty) { c.innerHTML = "<p style='text-align:center;'>Nenhum funcionário ativo listado.</p>"; return; }
    c.innerHTML = "";
    snap.forEach(d => {
        const f = d.data();
        c.innerHTML += `
            <div class="order-item-card" style="padding:15px; border-bottom:1px solid #ccc; margin-bottom:10px;">
                <strong>${(f.nome || 'Nome não preenchido').toUpperCase()}</strong> - ${f.cargo || 'Operacional'} <br>
                <small>Matrícula: ${f.matricula || 'N/I'} | Contato: ${f.telefone || '-'}</small>
            </div>`;
    });
}

async function carregarFiltroPedidosAdmin(statusFiltro, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const usuarios = await getDocs(collection(db, "usuarios"));
    container.innerHTML = "";
    let totalExibido = 0;

    for (const uDoc of usuarios.docs) {
        const pSnap = await getDocs(collection(db, "usuarios", uDoc.id, "pedidos"));
        pSnap.forEach(pDoc => {
            const p = pDoc.data();
            if (p.status === statusFiltro) {
                totalExibido++;
                container.innerHTML += `
                    <div class="order-item-card" style="padding:15px; border-bottom:1px solid #ccc; margin-bottom:10px;">
                        <div class="order-info-main">
                            <strong>Pedido #${pDoc.id.substring(0,6).toUpperCase()}</strong>
                            <span>Faturamento: R$ ${p.total.toFixed(2)}</span>
                        </div>
                        <div style="text-align:right; margin-top:10px;">
                            <button onclick="alert('Status operacional do pedido modificado!')" style="background:#727e5f; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Avançar Etapa</button>
                        </div>
                    </div>`;
            }
        });
    }
    if (totalExibido === 0) container.innerHTML = `<p style="text-align:center;">Nenhum pedido encontrado sob o status ${statusFiltro}.</p>`;
}

async function executarProcessoCancellation() {
    const id = document.getElementById("cancel-pedido-id") ? document.getElementById("cancel-pedido-id").value.trim() : "";
    const motivo = document.getElementById("cancel-pedido-motivo") ? document.getElementById("cancel-pedido-motivo").value.trim() : "";
    if (!id || !motivo) return alert("Forneça o ID do documento e a justificativa comercial.");

    const usr = await getDocs(collection(db, "usuarios"));
    for (const u of usr.docs) {
        const ref = doc(db, "usuarios", u.id, "pedidos", id);
        const check = await getDoc(ref);
        if (check.exists()) {
            await setDoc(ref, { status: "Cancelado", justificativa: motivo }, { merge: true });
            alert("O pedido em questão foi abortado e marcado como Cancelado.");
            carregarPagina('pedidos-admin');
            return;
        }
    }
    alert("Código identificador do pedido inválido ou inexistente.");
}

async function calcularEExibirFaturamentoDoDia() {
    const lista = document.getElementById("lista-transacoes-hoje");
    if (!lista) return;
    const usr = await getDocs(collection(db, "usuarios"));
    let soma = 0,
        qtd = 0;
    lista.innerHTML = "";

    const hojeStr = new Date().toLocaleDateString('pt-BR');

    for (const u of usr.docs) {
        const pSnap = await getDocs(collection(db, "usuarios", u.id, "pedidos"));
        pSnap.forEach(pDoc => {
            const p = pDoc.data();
            let pDataStr = hojeStr;
            if (p.dataPedido && p.dataPedido.toDate) pDataStr = p.dataPedido.toDate().toLocaleDateString('pt-BR');

            if (pDataStr === hojeStr && p.status !== "Cancelado") {
                soma += p.total;
                qtd++;
                lista.innerHTML += `
                    <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                        <span>Protocolo #${pDoc.id.substring(0,6).toUpperCase()}</span>
                        <strong>R$ ${p.total.toFixed(2)}</strong>
                    </div>`;
            }
        });
    }
    const caixaValor = document.getElementById("caixa-valor-hoje");
    if (caixaValor) caixaValor.innerText = "R$ " + soma.toFixed(2);
    const caixaVendas = document.getElementById("caixa-vendas-hoje");
    if (caixaVendas) caixaVendas.innerText = qtd;
    if (qtd === 0) lista.innerHTML = "<p style='text-align:center;'>Nenhum fluxo comercial registrado na data de hoje.</p>";
}

// ==========================================
// INICIALIZAÇÃO GERAL DA PÁGINA FIXA E CARRINHO (DOM)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    carregarPagina('home');

    // BOTÕES DE ABRIR E FECHAR CARRINHO
    const btnCart = document.getElementById("btn-cart");
    if (btnCart) btnCart.addEventListener("click", abrirCarrinho);

    const btnCloseCart = document.getElementById("btn-close-cart");
    if (btnCloseCart) btnCloseCart.addEventListener("click", fecharCarrinho);

    const cartOverlay = document.getElementById("cart-overlay");
    if (cartOverlay) cartOverlay.addEventListener("click", fecharCarrinho);

    // BOTÃO DE FINALIZAR COMPRA DENTRO DO CARRINHO
    const btnCheckout = document.querySelector(".btn-checkout");
    if (btnCheckout) {
        btnCheckout.addEventListener("click", () => {
            if (carrinho.length === 0) return alert("Seu carrinho de compras está vazio!");
            fecharCarrinho();
            carregarPagina('checkout');
        });
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", (e) => {
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            e.currentTarget.classList.add("active");

            const target = e.currentTarget.getAttribute("data-target");
            if (target === 'home') {
                carregarPagina('home');
            } else {
                carregarPagina('produtos', null, target);
            }
        });
    });

    const logoHome = document.getElementById("logo-home");
    if (logoHome) {
        logoHome.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            const homeNav = document.querySelector('[data-target="home"]');
            if (homeNav) homeNav.classList.add("active");
            carregarPagina('home');
        });
    }

    const btnAccount = document.getElementById("btn-account");
    if (btnAccount) {
        btnAccount.addEventListener("click", () => {
            if (usuarioEstaLogado) {
                if (usuarioEFuncionario) {
                    carregarPagina('home-admin'); // <--- ALTERADO AQUI
                } else {
                    carregarPagina('minha-conta', 'subview-perfil');
                }
            } else {
                carregarPagina('login');
            }
        });
    }
    // === SISTEMA DE LOGOUT DO ADMIN ===
    document.addEventListener("click", (e) => {
        // Verifica se o elemento clicado foi o botão de sair do admin
        if (e.target && e.target.id === "btn-sair-admin") {
            e.preventDefault();

            // 1. Chama o Firebase para deslogar a sessão no servidor
            const auth = getAuth(); // Puxa a autenticação do Firebase
            signOut(auth).then(() => {

                // 2. Limpa o navegador
                localStorage.removeItem("usuarioLogado");
                localStorage.removeItem("isFunc");

                // 3. Recarrega a página (agora sim, 100% deslogado)
                window.location.reload();

            }).catch((error) => {
                console.error("Erro ao fazer logout no Firebase:", error);
                // Por segurança, se der erro, força a limpeza local
                localStorage.removeItem("usuarioLogado");
                localStorage.removeItem("isFunc");
                window.location.reload();
            });
        }
    });
});