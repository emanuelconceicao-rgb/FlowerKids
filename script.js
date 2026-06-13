// ==========================================
// 1. IMPORTAÇÕES DOS MÓDULOS LOCAIS E FIREBASE
// ==========================================
import { auth, db } from "./firebase-config.js";
import { CATALOGO } from "./catalogo.js";
import {
    carregarDashboardPedidosAdmin,
    carregarQuadroDeFuncionarios,
    carregarFiltroPedidosAdmin,
    executarProcessoCancellation,
    calcularEExibirFaturamentoDoDia,
    cadastrarNovoFuncionarioNoBanco
} from "./admin.js";

import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    updatePassword,
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================================
// 2. VARIÁVEIS DE ESTADO GLOBAL DO SISTEMA
// ==========================================
let usuarioEstaLogado = false;
let usuarioEFuncionario = false;
let paginaAtual = 'home';
let carrinho = [];
let checkoutMetodoPagamento = 'pix'; // Padrão inicial

// ==========================================
// 3. MONITOR DE SESSÃO DO FIREBASE SEGURO
// ==========================================
onAuthStateChanged(auth, function(user) {
    if (user) {
        usuarioEstaLogado = true;
        usuarioEFuncionario = false;
        var nomeExibicao = (user.email && typeof user.email === "string") ? user.email.split('@')[0].toUpperCase() : "CONTA";
        var preferencesData = { email: false, whatsapp: false };

        // 1. Tenta identificar se o usuário está na coleção dedicada de Funcionários
        getDoc(doc(db, "funcionarios", user.uid))
            .then(function(funcDoc) {
                if (funcDoc.exists()) {
                    usuarioEFuncionario = true;
                    localStorage.setItem("isFunc", "true");
                    var d = funcDoc.data();
                    if (d && d.nome) nomeExibicao = d.nome;

                    if (paginaAtual === 'home' || paginaAtual === 'login') {
                        carregarPagina('home-admin');
                    }
                    atualizarComponentesInterface(nomeExibicao, preferencesData, user.email);
                } else {
                    // 2. Se não estiver lá, puxa da coleção de usuários comuns
                    getDoc(doc(db, "usuarios", user.uid))
                        .then(function(userDoc) {
                            if (userDoc.exists()) {
                                var dadosFstore = userDoc.data();
                                if (dadosFstore && dadosFstore.nome) nomeExibicao = dadosFstore.nome;
                                if (dadosFstore && dadosFstore.preferencias) preferencesData = dadosFstore.preferencias;

                                // CORREÇÃO OPERACIONAL: Aceita "funcionario" ou "administrador" vindo do Firestore
                                if (dadosFstore && (dadosFstore.cargo === "funcionario" || dadosFstore.cargo === "administrador")) {
                                    usuarioEFuncionario = true;
                                    localStorage.setItem("isFunc", "true");
                                    if (paginaAtual === 'home' || paginaAtual === 'login') {
                                        carregarPagina('home-admin');
                                    }
                                }
                            }
                            atualizarComponentesInterface(nomeExibicao, preferencesData, user.email);
                        })
                        .catch(function(err) {
                            console.error("Erro ao ler dados da coleção usuarios:", err);
                            atualizarComponentesInterface(nomeExibicao, preferencesData, user.email);
                        });
                }
            })
            .catch(function(e) {
                console.error("Erro ao carregar dados do Firestore:", e);
                atualizarComponentesInterface(nomeExibicao, preferencesData, user.email);
            });

    } else {
        usuarioEstaLogado = false;
        usuarioEFuncionario = false;
        localStorage.removeItem("isFunc");

        var labelAcc = document.getElementById("account-label");
        if (labelAcc) labelAcc.innerText = "CONTA";

        var inputPerfilNome = document.getElementById("perfil-nome");
        var inputPerfilEmail = document.getElementById("perfil-email");
        if (inputPerfilNome) inputPerfilNome.value = "";
        if (inputPerfilEmail) inputPerfilEmail.value = "";

        carregarEnderecosUsuario();
        carregarPedidosUsuario();
    }
});

// Função auxiliar interna para não duplicar código de renderização de tela
function atualizarComponentesInterface(nomeExibicao, preferencesData, emailUsuario) {
    var labelAccount = document.getElementById("account-label");
    if (labelAccount) {
        if (usuarioEFuncionario) {
            labelAccount.innerText = "ADMIN";
        } else if (nomeExibicao && typeof nomeExibicao === "string" && nomeExibicao.trim() !== "") {
            labelAccount.innerText = nomeExibicao.split(" ")[0].toUpperCase();
        } else {
            labelAccount.innerText = "CONTA";
        }
    }

    var inputPerfilNome = document.getElementById("perfil-nome");
    var inputPerfilEmail = document.getElementById("perfil-email");
    var chkPrefEmail = document.getElementById("pref-email");
    var chkPrefWhats = document.getElementById("pref-whatsapp");

    if (inputPerfilNome) inputPerfilNome.value = nomeExibicao;
    if (inputPerfilEmail) inputPerfilEmail.value = emailUsuario || "";
    if (chkPrefEmail) chkPrefEmail.checked = !!preferencesData.email;
    if (chkPrefWhats) chkPrefWhats.checked = !!preferencesData.whatsapp;

    carregarEnderecosUsuario();
    carregarPedidosUsuario();
}
// ==========================================
// 4. NAVEGAÇÃO DINÂMICA SPA (ROTEAMENTO INTELIGENTE)
// ==========================================
export async function carregarPagina(nomePagina, subviewOpcional = null, contextData = null) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    // Determina a pasta correta baseada no nome da página
    let pastaDestino = "paginas";
    const paginasAdmin = [
        'home-admin',
        'pedidos-admin',
        'quadro-funcionario',
        'cadastro-funcionario',
        'pedidos-entregues',
        'cancelar-pedido',
        'faturamento-dia'
    ];

    if (paginasAdmin.includes(nomePagina)) {
        pastaDestino = "paginasadmin";
    }

    // CORREÇÃO AQUI: Verifica a variável global OU se o status está salvo no localStorage
    const estaSalvoComoAdmin = localStorage.getItem("isFunc") === "true";

    if (paginasAdmin.includes(nomePagina) && !usuarioEFuncionario && !estaSalvoComoAdmin) {
        console.warn("Bloqueio de segurança: Usuário não identificado como Admin.");
        carregarPagina('home');
        return;
    }

    paginaAtual = nomePagina;

    try {
        const resposta = await fetch(`./${pastaDestino}/${nomePagina}.html`);
        if (!resposta.ok) throw new Error(`Erro ao carregar o arquivo: ${nomePagina}.html`);

        const html = await resposta.text();

        // Se for uma sub-página do painel admin, injeta dentro da área de conteúdo do admin
        if (pastaDestino === "paginasadmin" && nomePagina !== 'home-admin') {
            const subConteudo = document.getElementById('sub-conteudo-admin');
            if (subConteudo) {
                subConteudo.innerHTML = html;
            } else {
                // Se tentou carregar uma sub-página mas a casca do admin não está na tela, carrega a casca primeiro
                mainContent.innerHTML = html;
            }
        } else {
            // Páginas normais da loja ou a própria 'home-admin' (casca principal)
            mainContent.innerHTML = html;
        }

        // Executa as funções de inicialização dos componentes
        initEventosEProdutosDaPagina(nomePagina, subviewOpcional, contextData);

        // Se acabamos de entrar na casca do admin, força o carregamento do dashboard interno padrão
        if (nomePagina === 'home-admin') {
            carregarPagina('pedidos-admin');
        }

    } catch (erro) {
        console.error("Erro no roteamento SPA:", erro);
        mainContent.innerHTML = `<p style="text-align:center; padding:50px; color:#a83232;">Página temporariamente indisponível: ${nomePagina}</p>`;
    }
}
// Torna a navegação global para ser acessada pelo admin.js e elementos HTML inline
window.carregarPagina = carregarPagina;
// ==========================================
// 5. INICIALIZADOR DOS COMPONENTES E TELAS
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
        renderizarResumoCheckout();

        const btnIrEntrega = document.getElementById("btn-ir-entrega");
        if (btnIrEntrega) {
            btnIrEntrega.addEventListener("click", () => {
                const nome = document.getElementById("chk-nome") ? document.getElementById("chk-nome").value.trim() : "";
                const cpf = document.getElementById("chk-cpf") ? document.getElementById("chk-cpf").value.trim() : "";
                if (!nome || !cpf) return alert("Nome e CPF são obrigatórios!");
                switchCheckoutStep(2);
            });
        }

        const btnChkVolt2 = document.getElementById("btn-chk-voltar-2");
        if (btnChkVolt2) btnChkVolt2.addEventListener("click", () => switchCheckoutStep(1));

        const btnIrPagamento = document.getElementById("btn-ir-pagamento");
        if (btnIrPagamento) {
            btnIrPagamento.addEventListener("click", () => {
                const rua = document.getElementById("chk-rua") ? document.getElementById("chk-rua").value.trim() : "";
                const num = document.getElementById("chk-num") ? document.getElementById("chk-num").value.trim() : "";
                if (!rua || !num) return alert("Por favor, preencha todos os dados de entrega obrigatórios!");
                switchCheckoutStep(3);
            });
        }

        const btnChkVolt3 = document.getElementById("btn-chk-voltar-3");
        if (btnChkVolt3) btnChkVolt3.addEventListener("click", () => switchCheckoutStep(2));

        document.querySelectorAll(".pay-tab-btn").forEach(tab => {
            tab.addEventListener("click", (e) => {
                document.querySelectorAll(".pay-tab-btn").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".payment-method-panel").forEach(p => p.classList.remove("active"));
                e.currentTarget.classList.add("active");
                checkoutMetodoPagamento = e.currentTarget.getAttribute("data-method");
                const panel = document.getElementById(`pay-panel-${checkoutMetodoPagamento}`);
                if (panel) panel.classList.add("active");
                renderizarResumoCheckout();
            });
        });

        const btnChkFinalizar = document.getElementById("btn-chk-finalizar");
        if (btnChkFinalizar) btnChkFinalizar.addEventListener("click", executarFinalizarCompraReal);
    }

    // ---- TELAS ADMINISTRATIVAS ----
    if (nomePagina === 'quadro-funcionario') {
        carregarQuadroDeFuncionarios(document);
        const navIrNovoFunc = document.getElementById("nav-ir-novo-func");
        if (navIrNovoFunc) navIrNovoFunc.addEventListener("click", () => carregarPagina('cadastro-funcionario'));
    }

    if (nomePagina === 'pedidos-admin') {
        carregarDashboardPedidosAdmin(document);
    }

    if (nomePagina === 'pedidos-entregues') {
        // CORREÇÃO: Chama a nova função global passando o status "Entregue" e o elemento alvo correto
        carregarFiltroPedidosAdmin(document, 'Entregue');

        const navPedidosAtivosVoltar = document.getElementById("nav-pedidos-ativos-voltar");
        if (navPedidosAtivosVoltar) {
            navPedidosAtivosVoltar.addEventListener("click", () => carregarPagina('pedidos-admin'));
        }
    }

    if (nomePagina === 'cancelar-pedido') {
        // BÔNUS: Adicionei esta linha para listar os pedidos que podem ser cancelados caso precise na tela
        carregarFiltroPedidosAdmin(document, 'Em preparação');

        const btnAbortarCancelamento = document.getElementById("btn-abortar-cancelamento");
        if (btnAbortarCancelamento) {
            btnAbortarCancelamento.addEventListener("click", () => carregarPagina('pedidos-admin'));
        }

        const btnConfirmarCancelamento = document.getElementById("btn-confirmar-cancelamento-banco");
        if (btnConfirmarCancelamento) {
            btnConfirmarCancelamento.addEventListener("click", () => executarProcessoCancellation(document));
        }
    }

    if (nomePagina === 'faturamento-dia') {
        calcularEExibirFaturamentoDoDia(document);
    }
}

// ==========================================
// 6. FUNÇÕES DE CARRINHO E INTERFACE (CLIENTE)
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
        // AJUSTADO: Agora usa uma tag img com o caminho da imagem real
        card.innerHTML = `
            <div class="product-img-placeholder" style="padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img src="${prod.imagem}" alt="${prod.nome}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h4 class="product-title">${prod.nome}</h4>
            <p class="product-price">${prod.preco}</p>
            <button class="btn-buy">Comprar</button>
        `;

        card.querySelector(".btn-buy").addEventListener("click", () => {
            const precoFormatado = parseFloat(prod.preco.replace("R$", "").replace(".", "").replace(",", "."));

            const itemExistente = carrinho.find(item => item.nome === prod.nome);
            if (itemExistente) {
                itemExistente.quantidade++;
            } else {
                // SALVA A IMAGEM TAMBÉM: Passa a imagem real para dentro da estrutura do carrinho
                carrinho.push({ nome: prod.nome, preco: precoFormatado, imagem: prod.imagem, quantidade: 1 });
            }

            atualizarInterfaceCarrinho();
            abrirCarrinho();
        });
        container.appendChild(card);
    });
}

function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById("cart-items");
    const labelTotal = document.getElementById("cart-total-price");
    const cartCountBadge = document.getElementById("cart-count");

    if (!containerItens) return;
    containerItens.innerHTML = "";

    let totalPreco = 0;
    let totalItens = 0;

    if (carrinho.length === 0) {
        containerItens.innerHTML = '<p class="cart-empty">Seu carrinho está vazio 🥀</p>';
    } else {
        carrinho.forEach((item, index) => {
            totalPreco += (item.preco * item.quantidade);
            totalItens += item.quantidade;

            const div = document.createElement("div");
            div.className = "cart-item";
            // AJUSTADO: Adicionada tag img para renderizar a miniatura da flor no menu do carrinho lateral
            div.innerHTML = `
                <div class="cart-item-icon" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="${item.imagem}" alt="${item.nome}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.nome}</div>
                    <div class="cart-item-price">R$ ${item.preco.toFixed(2)} (x${item.quantidade})</div>
                </div>
                <div class="cart-item-actions">
                    <button class="remove-btn" data-index="${index}">🗑️</button>
                </div>
            `;

            div.querySelector(".remove-btn").addEventListener("click", (e) => {
                const i = e.currentTarget.getAttribute("data-index");
                carrinho.splice(i, 1);
                atualizarInterfaceCarrinho();
            });

            containerItens.appendChild(div);
        });
    }

    if (labelTotal) labelTotal.innerText = "R$ " + totalPreco.toFixed(2);

    if (cartCountBadge) {
        if (totalItens > 0) {
            cartCountBadge.innerText = totalItens;
            cartCountBadge.style.display = "block";
        } else {
            cartCountBadge.style.display = "none";
        }
    }
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
// ==========================================
// 7. OPERAÇÕES REQUISITADAS AO BANCO (CLIENTE)
// ==========================================
async function executarFinalizarCompraReal() {
    if (!auth.currentUser || carrinho.length === 0) return alert("Seu carrinho está vazio ou você não está logado!");

    let subtotal = 0;
    carrinho.forEach(item => { subtotal += (item.preco * item.quantidade); });

    // 1. Tenta buscar o nome do cliente salvo no Firestore para o Admin conseguir ver no painel
    let nomeClienteParaAdmin = "Cliente Consumidor";
    try {
        const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().nome) {
            nomeClienteParaAdmin = userDoc.data().nome;
        }
    } catch (e) {
        console.warn("Não foi possível obter o nome do cliente, usando padrão.", e);
    }

    // 2. Monta o objeto com todos os dados do pedido
    const dadosDoPedido = {
        itens: carrinho,
        total: subtotal,
        metodoPagamento: checkoutMetodoPagamento,
        status: "Em preparação",
        dataPedido: new Date(),
        clienteId: auth.currentUser.uid,
        nome: nomeClienteParaAdmin, // Usado pelo seu admin.js (pedido.nome)
        clienteNome: nomeClienteParaAdmin // Usado pelo seu admin.js (pedido.clienteNome)
    };

    try {
        // GRAVAÇÃO 1: Salva na coleção GLOBAL raiz (onde o seu carregarDashboardPedidosAdmin lê)
        const referenciaPedidoGlobal = await addDoc(collection(db, "pedidos"), dadosDoPedido);
        const novoPedidoId = referenciaPedidoGlobal.id;

        // GRAVAÇÃO 2: Salva na subcoleção interna do usuário mantendo o exato MESMO ID de documento
        await setDoc(doc(db, "usuarios", auth.currentUser.uid, "pedidos", novoPedidoId), dadosDoPedido);

        // Limpa o carrinho e atualiza a interface
        carrinho = [];
        atualizarInterfaceCarrinho();

        alert("Compra finalizada com sucesso! Seu pedido já está no painel administrativo. 🎉");
        carregarPagina("home");
    } catch (error) {
        console.error("Erro interno ao salvar pedido no Firebase:", error);
        alert("Erro operacional ao registrar o pedido. Tente novamente.");
    }
}

function executarLoginInteligente(e) {
    if (e) e.preventDefault();

    var emailInput = document.getElementById("login-email");
    var senhaInput = document.getElementById("login-senha");

    var email = emailInput ? emailInput.value.trim() : "";
    var senha = senhaInput ? senhaInput.value.trim() : "";

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    signInWithEmailAndPassword(auth, email, senha)
        .then(function(userCredential) {
            var user = userCredential.user;
            usuarioEstaLogado = true;
            localStorage.setItem("usuarioLogado", user.uid);

            // 1ª Etapa: Procura na coleção dedicada de funcionários
            getDoc(doc(db, "funcionarios", user.uid))
                .then(function(funcDoc) {
                    if (funcDoc.exists()) {
                        usuarioEFuncionario = true;
                        localStorage.setItem("isFunc", "true");
                        alert("Acesso administrativo concedido. Bem-vindo! 👑");
                        carregarPagina('home-admin');
                    } else {
                        // 2ª Etapa: Procura em usuários comuns e aceita tanto "funcionario" quanto "administrador"
                        getDoc(doc(db, "usuarios", user.uid))
                            .then(function(userDoc) {
                                if (userDoc.exists()) {
                                    var dadosCargo = userDoc.data().cargo;

                                    // AJUSTE OPERACIONAL: Valida os dois cargos administrativos legítimos
                                    if (dadosCargo === "funcionario" || dadosCargo === "administrador") {
                                        usuarioEFuncionario = true;
                                        localStorage.setItem("isFunc", "true");
                                        alert("Acesso administrativo concedido. Bem-vindo! 👑");
                                        carregarPagina('home-admin');
                                    } else {
                                        usuarioEFuncionario = false;
                                        localStorage.removeItem("isFunc");
                                        alert("Login efetuado com sucesso!");
                                        carregarPagina('home');
                                    }
                                } else {
                                    usuarioEFuncionario = false;
                                    localStorage.removeItem("isFunc");
                                    alert("Login efetuado com sucesso!");
                                    carregarPagina('home');
                                }
                            })
                            .catch(function(err) {
                                console.error("Erro ao ler dados do usuário:", err);
                                carregarPagina('home');
                            });
                    }
                })
                .catch(function(err) {
                    console.error("Erro na verificação de privilégios:", err);
                });
        })
        .catch(function(error) {
            console.error("Erro ao autenticar usuário:", error);
            alert("Falha na autenticação: E-mail ou senha incorretos.");
        });
}

async function executarSalvarPerfilCadastral() {
    const user = auth.currentUser;
    if (!user) return alert("Nenhum usuário autenticado!");

    const novoNome = document.getElementById("perfil-nome") ? document.getElementById("perfil-nome").value.trim() : "";
    const prefEmail = document.getElementById("pref-email") ? document.getElementById("pref-email").checked : false;
    const prefWhats = document.getElementById("pref-whatsapp") ? document.getElementById("pref-whatsapp").checked : false;

    if (!novoNome) return alert("O campo Nome não pode ficar vazio.");

    try {
        await setDoc(doc(db, "usuarios", user.uid), {
            nome: novoNome,
            preferencias: { email: prefEmail, whatsapp: prefWhats }
        }, { merge: true });
        alert("Perfil updated com sucesso!");
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
        carregarEnderecosUsuario();
        switchSubView("subview-enderecos");
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
// 8. INICIALIZAÇÃO GERAL E ESCUTAS DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    carregarPagina('home');

    const btnCart = document.getElementById("btn-cart");
    if (btnCart) btnCart.addEventListener("click", abrirCarrinho);

    const btnCloseCart = document.getElementById("btn-close-cart");
    if (btnCloseCart) btnCloseCart.addEventListener("click", fecharCarrinho);

    const cartOverlay = document.getElementById("cart-overlay");
    if (cartOverlay) cartOverlay.addEventListener("click", fecharCarrinho);

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
                    carregarPagina('home-admin');
                } else {
                    carregarPagina('minha-conta', 'subview-perfil');
                }
            } else {
                carregarPagina('login');
            }
        });
    }

    // Sistema de Logout Admin adaptado
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "btn-sair-admin") {
            e.preventDefault();

            const firebaseAuth = getAuth();
            signOut(firebaseAuth).then(() => {
                localStorage.removeItem("usuarioLogado");
                localStorage.removeItem("isFunc");
                window.location.reload();
            }).catch((error) => {
                console.error("Erro ao fazer logout no Firebase:", error);
                localStorage.removeItem("usuarioLogado");
                localStorage.removeItem("isFunc");
                window.location.reload();
            });
        }
    });
});