// ==========================================
// IMPORTAÇÕES OBRIGATÓRIAS PARA O MÓDULO
// ==========================================
import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    doc,
    setDoc,
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ==========================================
// FUNÇÕES DO PAINEL DE ADMINISTRAÇÃO
// ==========================================

export async function carregarDashboardPedidosAdmin(targetDoc = document) {
    const containerPedidos = targetDoc.getElementById('container-pedidos-admin');
    const countPendentesEl = targetDoc.getElementById('admin-count-pendentes');
    const countEntreguesEl = targetDoc.getElementById('admin-count-entregues');

    // Se não estivermos na página certa, interrompe para não dar erro
    if (!containerPedidos) return;

    try {
        // Busca os dados na coleção "pedidos" do Firestore
        const querySnapshot = await getDocs(collection(db, "pedidos"));

        let htmlPedidos = '';
        let countPendentes = 0;
        let countEntregues = 0;

        querySnapshot.forEach((docSnap) => {
            const pedido = docSnap.data();
            const pedidoId = docSnap.id;

            // Verifica o status
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

import { updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.atualizarStatusPedido = async function(pedidoId, novoStatus) {
    try {
        // 1. Atualiza na coleção global do admin
        const pedidoRef = doc(db, "pedidos", pedidoId);
        await updateDoc(pedidoRef, {
            status: novoStatus
        });

        // 2. Tenta descobrir quem foi o dono do pedido para atualizar a subcoleção dele também
        const pedidoSnap = await getDoc(pedidoRef);
        if (pedidoSnap.exists()) {
            const uidCliente = pedidoSnap.data().clienteId;
            if (uidCliente) {
                await updateDoc(doc(db, "usuarios", uidCliente, "pedidos", pedidoId), {
                    status: novoStatus
                });
            }
        }

        alert("Status do pedido atualizado com sucesso! 📦");

        // Recarrega o painel dinamicamente para sumir com o pedido entregue
        if (typeof carregarDashboardPedidosAdmin === "function") {
            carregarDashboardPedidosAdmin();
        }
    } catch (error) {
        console.error("Erro ao atualizar status do pedido:", error);
        alert("Não foi possível alterar o status do pedido.");
    }
};

export async function carregarQuadroDeFuncionarios(targetDoc = document) {
    const c = targetDoc.getElementById("container-quadro-funcionarios");
    if (!c) return;
    const snap = await getDocs(collection(db, "funcionarios"));
    if (snap.empty) { c.innerHTML = "<p style='text-align:center;'>Nenhum funcionário ativo listado.</p>"; return; }
    c.innerHTML = "";

    snap.forEach(d => {
        const f = d.data();
        const funcionarioId = d.id; // Obtém o ID único do documento no Firebase

        c.innerHTML += `
            <div class="order-item-card" style="padding:15px; border-bottom:1px solid #ccc; margin-bottom:10px; display: flex; justify-content: space-between; align-items: center; background: white; border-radius: 6px;">
                <div>
                    <strong style="color: #4a5d23;">${(f.nome || 'Nome não preenchido').toUpperCase()}</strong> - ${f.cargo || 'Operacional'} <br>
                    <small style="color: #6b6b6b;">Matrícula: ${f.matricula || 'N/I'}</small>
                </div>
                <div>
                    <button onclick="window.eliminarFuncionario('${funcionarioId}')" style="background: #a83232; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold; transition: 0.3s;">
                        🗑️ Excluir
                    </button>
                </div>
            </div>`;
    });
}

// Cria uma função global mapeada no objeto window para processar a exclusão pelo clique do botão
window.eliminarFuncionario = async function(funcionarioId) {
    if (!confirm("Tens a certeza que desejas remover este funcionário do sistema?")) return;

    try {
        // Aponta diretamente para o documento do funcionário na coleção do Firestore
        const funcRef = doc(db, "funcionarios", funcionarioId);
        await deleteDoc(funcRef);

        alert("Funcionário removido com sucesso!");

        // Recarrega a página atual para atualizar a lista na tela imediatamente
        if (window.carregarPagina) {
            window.carregarPagina('quadro-funcionario');
        }
    } catch (error) {
        console.error("Erro ao eliminar funcionário:", error);
        alert("Não foi possível excluir o funcionário do banco de dados.");
    }
};

export async function carregarFiltroPedidosAdmin(targetDoc = document, statusFiltro = 'Entregue') {
    // Tenta encontrar o contêiner genérico ou o específico da página de entregues
    const container = targetDoc.getElementById('container-pedidos-filtrados') || targetDoc.getElementById('container-pedidos-entregues-admin');
    if (!container) return;

    try {
        const querySnapshot = await getDocs(collection(db, "pedidos"));
        let htmlPedidos = '';
        let qtd = 0;

        querySnapshot.forEach((docSnap) => {
                    const pedido = docSnap.data();
                    const pedidoId = docSnap.id;
                    const statusAtual = pedido.status || 'pendente';

                    // Validação inteligente (aceita tanto 'Entregue' quanto 'entregue')
                    if (statusAtual.toLowerCase() === statusFiltro.toLowerCase()) {
                        qtd++;
                        const nomeCliente = pedido.clienteNome || pedido.nome || 'Cliente';
                        const valorTotal = pedido.total ? parseFloat(pedido.total).toFixed(2).replace('.', ',') : '0,00';

                        let dataExibicao = "";
                        if (pedido.dataPedido) {
                            const dt = pedido.dataPedido.toDate ? pedido.dataPedido.toDate() : new Date(pedido.dataPedido);
                            dataExibicao = dt.toLocaleDateString('pt-BR') + " " + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        }

                        htmlPedidos += `
                    <div style="border: 1px solid #e0d6d6; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; background: white; margin-bottom: 10px;">
                        <div>
                            <strong style="color: #4a5d23; font-size: 16px;">Pedido #${pedidoId.substring(0,8).toUpperCase()}</strong>
                            <div style="color: #6b6b6b; font-size: 13px; margin-top: 5px;">
                                👤 Cliente: ${nomeCliente} <br>
                                💰 Total: R$ ${valorTotal} <br>
                                ${dataExibicao ? `📅 Data: ${dataExibicao}` : ''}
                            </div>
                        </div>
                        <div>
                            <span style="background: ${statusFiltro.toLowerCase() === 'entregue' ? '#d4edda' : '#f8d7da'}; color: ${statusFiltro.toLowerCase() === 'entregue' ? '#155724' : '#721c24'}; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                ${statusFiltro.toLowerCase() === 'entregue' ? '✅ Entregue' : '❌ Cancelado'}
                            </span>
                        </div>
                    </div>
                `;
            }
        });

        if (qtd === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #6b6b6b; padding: 40px;">
                    Nenhum pedido com o status "${statusFiltro}" encontrado.
                </div>`;
        } else {
            container.innerHTML = htmlPedidos;
        }

    } catch (error) {
        console.error("Erro ao carregar pedidos filtrados:", error);
        container.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Erro ao carregar a listagem.</p>';
    }
}

export async function executarProcessoCancellation(targetDoc = document) {
    const inputId = targetDoc.getElementById("cancel-pedido-id");
    const inputMotivo = targetDoc.getElementById("cancel-pedido-motivo");

    const id = inputId ? inputId.value.trim() : "";
    const motivo = inputMotivo ? inputMotivo.value.trim() : "";
    if (!id || !motivo) return alert("Forneça o ID do documento e a justificativa comercial.");

    const usr = await getDocs(collection(db, "usuarios"));
    for (const u of usr.docs) {
        const ref = doc(db, "usuarios", u.id, "pedidos", id);
        const check = await getDoc(ref);
        if (check.exists()) {
            await setDoc(ref, { status: "Cancelado", justificativa: motivo }, { merge: true });
            alert("O pedido em questão foi abortado e marcado como Cancelado.");

            // Redireciona usando a função SPA global mapeada no window
            if (window.carregarPagina) {
                window.carregarPagina('pedidos-admin');
            }
            return;
        }
    }
    alert("Código identificador do pedido inválido ou inexistente.");
}

export async function cadastrarNovoFuncionarioNoBanco(targetDoc = document) {
    const inputNome = targetDoc.getElementById("func-nome");
    const inputCargo = targetDoc.getElementById("func-cargo");
    const inputMatricula = targetDoc.getElementById("func-matricula");

    if (!inputNome || !inputCargo || !inputMatricula) return;

    const nome = inputNome.value.trim();
    const cargo = inputCargo.value.trim();
    const matricula = inputMatricula.value.trim();

    // Validação simples de campos vazios
    if (!nome || !cargo || !matricula) {
        return alert("Por favor, preencha todos os campos antes de salvar.");
    }

    try {
        // Gera uma referência com ID automático na coleção "funcionarios"
        const novoFuncRef = doc(collection(db, "funcionarios"));

        await setDoc(novoFuncRef, {
            nome: nome,
            cargo: cargo,
            matricula: matricula,
            telefone: "-" // Campo padrão para não quebrar a listagem
        });

        alert("Funcionário cadastrado com sucesso! 🎉");

        // Redireciona de volta para o Quadro de Funcionários atualizado
        if (window.carregarPagina) {
            window.carregarPagina('quadro-funcionario');
        }

    } catch (error) {
        console.error("Erro ao salvar funcionário no Firestore:", error);
        alert("Erro operacional ao tentar salvar no banco de dados.");
    }
}

export async function calcularEExibirFaturamentoDoDia(targetDoc = document) {
    const lista = targetDoc.getElementById("lista-transacoes-hoje");
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
                const valorPedido = Number(p.total) || 0;
                soma += valorPedido;
                qtd++;
                lista.innerHTML += `
                    <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                        <span>Protocolo #${pDoc.id.substring(0,6).toUpperCase()}</span>
                        <strong>R$ ${valorPedido.toFixed(2)}</strong>
                    </div>`;
            }
        });
    }
    const cajaValor = targetDoc.getElementById("caixa-valor-hoje");
    if (cajaValor) cajaValor.innerText = "R$ " + soma.toFixed(2);
    const caixaVendas = targetDoc.getElementById("caixa-vendas-hoje");
    if (caixaVendas) caixaVendas.innerText = qtd;
    if (qtd === 0) lista.innerHTML = "<p style='text-align:center;'>Nenhum fluxo comercial registrado na data de hoje.</p>";
}