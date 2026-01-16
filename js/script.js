// CONFIG
const API_URL = 'http://localhost:3001/camisas';
const STORAGE_KEY = 'camisas_data_v1';
let camisasData = [];
let isAdmin = false;
let pendingAction = null;

// --- DATA & LOGIC ---
const INITIAL_DATA_CSV = [
    { n: "REBEKA", s: "G", c: "VERDE", p: false }, { n: "GAEL", s: "PP", c: "VERDE", p: false }, { n: "ADRYAN", s: "P", c: "VERDE", p: false },
    { n: "GLAUBER", s: "G", c: "VERDE", p: false }, { n: "JUNIOR ELMER", s: "XG", c: "VERDE", p: false }, { n: "LILIA", s: "M", c: "VERDE", p: false },
    { n: "PAPAI", s: "G", c: "VERDE", p: false }, { n: "ROSA", s: "G", c: "VERDE", p: false }, { n: "CLEIDE", s: "G", c: "VERDE", p: false },
    { n: "JACK", s: "M", c: "VERDE", p: false }, { n: "VINY", s: "M", c: "AZUL", p: false }, { n: "FAILA", s: "G", c: "AZUL", p: true },
    { n: "LUCINEIDE", s: "G", c: "VERDE", p: false }, { n: "MARIA JOSÉ", s: "G", c: "AZUL", p: false }, { n: "LETÍCIA", s: "M", c: "AZUL", p: false },
    { n: "ALDO", s: "G", c: "VERDE", p: false }, { n: "VINÍCIUS", s: "G", c: "VERDE", p: false }, { n: "ROBERTA", s: "M", c: "VERDE", p: false },
    { n: "EVERALDO", s: "XG", c: "VERDE", p: false }, { n: "TONHO", s: "G", c: "NÃO INFORMADO", p: false }, { n: "BIANCA", s: "GG", c: "NÃO INFORMADO", p: true },
    { n: "ANTÔNIO", s: "P", c: "VERDE", p: false }, { n: "SANDRA", s: "G", c: "VERDE", p: false }, { n: "MARCONE", s: "G", c: "VERDE", p: false },
    { n: "TAYNA", s: "GG", c: "VERDE", p: false }, { n: "RENATA", s: "G", c: "VERDE", p: false }, { n: "GRILO", s: "XGG", c: "AZUL", p: false },
    { n: "BRENO", s: "XG", c: "AZUL", p: false }, { n: "IRANIR", s: "GG", c: "VERDE", p: false }, { n: "SOMBRA", s: "G", c: "VERDE", p: false },
    { n: "JUNIOR PANCA", s: "EG", c: "AZUL", p: true }, { n: "ELIANE", s: "G", c: "AZUL", p: true }, { n: "NINHA", s: "M", c: "AZUL", p: false },
    { n: "STEFANY", s: "M", c: "AZUL", p: false }, { n: "CABEÇA", s: "G", c: "AZUL", p: false }, { n: "NATÁLIA", s: "M", c: "VERDE", p: false },
    { n: "DAVİD", s: "M", c: "VERDE", p: false }, { n: "SANDRO AMEIXA", s: "M", c: "AZUL", p: false }, { n: "CLAUDIA", s: "G", c: "AZUL", p: false }
];

// --- LOCAL STORAGE FUNCTIONS ---
function loadData() {
    // API IMPLEMENTATION
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Falha ao carregar dados');
            return response.json();
        })
        .then(data => {
            camisasData = data;
            refreshUI();
        })
        .catch(error => {
            console.error(error);
            showToast("Erro ao conectar com o servidor. Verifique se o json-server está rodando.");
            // Fallback for UI if needed, or just show empty state
            camisasData = [];
            refreshUI();
        });
}

// saveData is mostly replaced by individual API calls but we keep refreshUI wrappers if needed
function saveData() {
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(camisasData));
    refreshUI();
}

function refreshUI() {
    // Sort A-Z
    const sortedList = [...camisasData].sort((a, b) => a.name.localeCompare(b.name));
    renderTable(sortedList);
    updateStats(sortedList);
}

// --- BACKUP FUNCTIONS ---
window.downloadBackup = () => {
    const dataStr = JSON.stringify(camisasData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_camisas_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Backup baixado com sucesso!");
};


// --- IMAGE PREVIEW LOGIC ---
const URL_VERDE = "https://placehold.co/600x400/16a34a/ffffff?text=Camisa+VERDE";
const URL_AZUL = "https://placehold.co/600x400/2563eb/ffffff?text=FOTO+REAL+CAMISA+AZUL";

window.viewImage = (color) => {
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('previewImage');
    const caption = document.getElementById('previewCaption');

    let url = "";
    let text = "";

    if (color === 'VERDE') {
        url = URL_VERDE;
        text = "Camisa VERDE";
    } else if (color === 'AZUL') {
        url = URL_AZUL;
        text = "Camisa AZUL";
    } else {
        return;
    }

    img.src = url;
    caption.innerText = text;
    modal.classList.remove('hidden');
};

window.closeImageModal = () => {
    document.getElementById('imageModal').classList.add('hidden');
};

// --- DELETE MODAL ---
window.closeDeleteModal = () => {
    document.getElementById('deleteModal').classList.add('hidden');
};

window.confirmDelete = async () => {
    const id = document.getElementById('deleteTargetId').value;
    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast("Item removido.");
            closeDeleteModal();
            loadData(); // Refresh list
        } else {
            showToast("Erro ao excluir item.");
        }
    } catch (e) {
        console.error(e);
        showToast("Erro de conexão.");
    }
};

// --- ADMIN & SECURITY LOGIC ---
window.requestAction = (actionCallback) => {
    if (isAdmin) {
        actionCallback();
    } else {
        pendingAction = actionCallback;
        document.getElementById('adminError').classList.add('hidden');
        document.getElementById('adminPasswordInput').value = '';
        document.getElementById('adminAuthModal').classList.remove('hidden');
        document.getElementById('adminPasswordInput').focus();
    }
};

window.verifyAdminPassword = () => {
    const input = document.getElementById('adminPasswordInput').value;
    if (input === 'adminadmin') {
        isAdmin = true;
        document.getElementById('adminAuthModal').classList.add('hidden');
        document.getElementById('adminStatusIndicator').classList.remove('hidden');
        document.getElementById('adminTools').classList.remove('hidden');

        const btn = document.getElementById('btnMainAction');
        btn.innerHTML = '<i class="fas fa-plus"></i> <span class="hidden md:inline">Adicionar</span>';
        btn.classList.remove('bg-slate-700', 'hover:bg-slate-800');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');

        showToast("Modo Administrador: Ativado");
        if (pendingAction) {
            pendingAction();
            pendingAction = null;
        }
    } else {
        document.getElementById('adminError').classList.remove('hidden');
    }
};

window.exitAdminMode = () => {
    isAdmin = false;
    document.getElementById('adminStatusIndicator').classList.add('hidden');
    document.getElementById('adminTools').classList.add('hidden');

    const btn = document.getElementById('btnMainAction');
    btn.innerHTML = '<i class="fas fa-user-cog"></i> <span class="hidden md:inline">Gerenciar</span>';
    btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btn.classList.add('bg-slate-700', 'hover:bg-slate-800');

    showToast("Modo Administrador: Desativado");
};

window.closeAdminModal = () => {
    document.getElementById('adminAuthModal').classList.add('hidden');
    pendingAction = null;
};

document.getElementById('adminPasswordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') window.verifyAdminPassword();
});


// --- GENERAL LOGIN ---
window.attemptLogin = () => {
    const pass = document.getElementById('passwordInput').value;
    if (pass === '1234') {
        document.getElementById('loginOverlay').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        loadData(); // Load data on login
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
};

document.getElementById('passwordInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') window.attemptLogin();
});

// --- APP FUNCTIONS ---
window.handleMainAction = () => {
    if (isAdmin) {
        openModal();
    } else {
        requestAction(() => {
            openModal();
        });
    }
};

window.openModal = (id = null, data = null) => {
    const modal = document.getElementById('entryModal');
    const title = document.getElementById('modalTitle');
    const editId = document.getElementById('editDocId');

    document.getElementById('inputName').value = '';
    document.getElementById('inputSize').value = 'G';
    document.getElementById('inputColor').value = 'VERDE';
    document.getElementById('inputValue').value = '16.00';
    document.getElementById('inputPaid').checked = false;

    if (id && data) {
        title.innerText = "Editar Pedido";
        editId.value = id;
        document.getElementById('inputName').value = data.name;
        document.getElementById('inputSize').value = data.size;
        document.getElementById('inputColor').value = data.color;
        document.getElementById('inputValue').value = data.value;
        document.getElementById('inputPaid').checked = data.paid;
    } else {
        title.innerText = "Adicionar Pessoa";
        editId.value = '';
    }
    modal.classList.remove('hidden');
};

window.closeModal = () => {
    document.getElementById('entryModal').classList.add('hidden');
};

window.saveEntry = async () => {
    const name = document.getElementById('inputName').value.trim();
    const size = document.getElementById('inputSize').value;
    const color = document.getElementById('inputColor').value;
    const value = parseFloat(document.getElementById('inputValue').value) || 0;
    const paid = document.getElementById('inputPaid').checked;
    const docId = document.getElementById('editDocId').value;

    if (!name) {
        showToast("Digite o nome da pessoa!");
        return;
    }

    const payload = { name, size, color, value, paid };

    try {
        let response;
        if (docId) {
            // Update existing
            response = await fetch(`${API_URL}/${docId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Add new
            payload.createdAt = new Date().toISOString();
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            showToast(docId ? "Pedido atualizado!" : "Pessoa adicionada!");
            closeModal();
            loadData(); // Refresh list to get new IDs/data
        } else {
            showToast("Erro ao salvar dados.");
        }
    } catch (e) {
        console.error(e);
        showToast("Erro de conexão ao salvar.");
    }
};

// Protected Actions Wrappers
window.triggerTogglePaid = async (id, currentStatus) => {
    requestAction(async () => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paid: !currentStatus })
            });
            if (response.ok) {
                loadData();
            } else {
                showToast("Erro ao atualizar status.");
            }
        } catch (e) {
            showToast("Erro de conexão.");
        }
    });
};

window.triggerDelete = (id) => {
    requestAction(() => {
        document.getElementById('deleteTargetId').value = id;
        document.getElementById('deleteModal').classList.remove('hidden');
    });
};

window.triggerEdit = (id, dataStr) => {
    // Note: dataStr is object passed from HTML
    requestAction(() => {
        openModal(id, dataStr);
    });
};

// --- PIX MODAL FUNCTIONS ---
window.openPixModal = () => {
    document.getElementById('pixModal').classList.remove('hidden');
};

window.closePixModal = () => {
    document.getElementById('pixModal').classList.add('hidden');
};

window.copyPix = () => {
    // REPLACE WITH YOUR ACTUAL PIX KEY HERE
    const pixKey = "00020126580014br.gov.bcb.pix0114+55119999999995204000053039865802BR5913NOME RECEBEDOR6008SAO PAULO62070503***63041234";

    navigator.clipboard.writeText(pixKey).then(() => {
        showToast("Chave Pix copiada!");

        // Visual feedback on button
        const btn = document.getElementById('btnCopyPix');
        const originalContent = btn.innerHTML;
        const originalClass = btn.className;

        btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        btn.className = "w-full bg-green-500 text-white font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-lg";

        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.className = originalClass;
        }, 2000);

    }).catch(err => {
        console.error('Erro ao copiar: ', err);
        showToast("Erro ao copiar. Tente selecionar manualmente.");
    });
};


// --- UI RENDERING ---
function renderTable(list) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>`;
        return;
    }

    list.forEach(item => {
        let colorClass = "bg-gray-100 text-gray-600";
        if (item.color === 'VERDE') colorClass = "bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200 hover:ring-2 hover:ring-emerald-300 transition";
        if (item.color === 'AZUL') colorClass = "bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200 hover:ring-2 hover:ring-blue-300 transition";

        const rowClass = item.paid ? "bg-green-50/50" : "";
        const statusBadge = item.paid
            ? `<span onclick="triggerTogglePaid('${item.id}', true)" class="cursor-pointer px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200">PAGO</span>`
            : `<span onclick="triggerTogglePaid('${item.id}', false)" class="cursor-pointer px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 hover:bg-yellow-200">PENDENTE</span>`;

        // Escape special characters for HTML attribute
        const safeData = JSON.stringify(item).replace(/"/g, '&quot;');

        const colorSpan = `<span onclick="viewImage('${item.color}')" class="${colorClass} px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">${item.color}</span>`;

        const tr = document.createElement('tr');
        tr.className = `border-b border-gray-100 hover:bg-gray-50 transition ${rowClass}`;
        tr.innerHTML = `
            <td class="p-4 font-medium text-gray-800">${item.name}</td>
            <td class="p-4 text-center"><span class="bg-gray-100 px-2 py-1 rounded text-xs font-bold">${item.size}</span></td>
            <td class="p-4 text-center">${colorSpan}</td>
            <td class="p-4 text-center">${statusBadge}</td>
            <td class="p-4 text-right font-mono text-gray-600">R$ ${item.value.toFixed(2).replace('.', ',')}</td>
            <td class="p-4 text-center">
                <div class="flex justify-center gap-2">
                    <button onclick="triggerEdit('${item.id}', ${safeData})" class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition">
                        <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button onclick="triggerDelete('${item.id}')" class="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats(list) {
    const totalPaidVal = list.reduce((acc, curr) => curr.paid ? acc + curr.value : acc, 0);
    const totalForecastVal = list.reduce((acc, curr) => acc + curr.value, 0);

    const totalPaid = list.filter(i => i.paid).length;
    const totalPending = list.length - totalPaid;
    const greenCount = list.filter(i => i.color === 'VERDE').length;
    const blueCount = list.filter(i => i.color === 'AZUL').length;

    document.getElementById('totalValueDisplay').innerText = `R$ ${totalPaidVal.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalForecastDisplay').innerText = `R$ ${totalForecastVal.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalItemsDisplay').innerText = list.length;
    document.getElementById('countPaid').innerText = totalPaid;
    document.getElementById('countPending').innerText = totalPending;
    document.getElementById('countGreen').innerText = greenCount;
    document.getElementById('countBlue').innerText = blueCount;

    const sizeCounts = { 'PP': 0, 'P': 0, 'M': 0, 'G': 0, 'GG': 0, 'XG': 0, 'XGG': 0, 'EG': 0 };
    list.forEach(item => {
        const s = item.size || '?';
        sizeCounts[s] = (sizeCounts[s] || 0) + 1;
    });

    const sizeContainer = document.getElementById('sizeStatsContainer');
    if (sizeContainer) {
        sizeContainer.innerHTML = '';
        const order = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'EG'];
        Object.keys(sizeCounts).forEach(k => { if (!order.includes(k)) order.push(k); });

        order.forEach(key => {
            const count = sizeCounts[key] || 0;
            const activeClass = count > 0
                ? "bg-white border-blue-200 text-blue-700 shadow-sm ring-1 ring-blue-50"
                : "bg-slate-50 border-transparent text-slate-300";

            const el = document.createElement('div');
            el.className = `border rounded-lg py-2 px-1 text-center flex flex-col items-center justify-center transition-all ${activeClass}`;
            el.innerHTML = `
                <span class="text-[10px] font-bold uppercase mb-1">${key}</span>
                <span class="text-lg font-black leading-none">${count}</span>
            `;
            sizeContainer.appendChild(el);
        });
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}
