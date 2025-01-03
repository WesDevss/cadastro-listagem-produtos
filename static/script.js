document.addEventListener('DOMContentLoaded', function() {
    // Constantes para elementos do DOM
    const SELECTORS = {
        form: '#produto-form',
        modal: '#formulario',
        closeModal: '.close-btn',
        submitBtn: '#submit-produto',
        deleteButtons: '.btn-delete',
        editButtons: '.btn-edit',
        viewButtons: '.btn-view',
        tableBody: '.table tbody'
    };

    // Configurações
    const CONFIG = {
        animationDuration: 300,
        toastDuration: 3000
    };

    // Classe para gerenciar o formulário
    class FormManager {
        constructor() {
            this.form = document.querySelector(SELECTORS.form);
            this.modal = document.querySelector(SELECTORS.modal);
            this.setupEventListeners();
        }

        setupEventListeners() {
            // Listener para submissão do formulário
            this.form?.addEventListener('submit', (e) => this.handleSubmit(e));

            // Listener para fechar modal
            document.querySelectorAll(SELECTORS.closeModal).forEach(btn => {
                btn.addEventListener('click', () => this.closeModal());
            });

            // Fechar modal ao clicar fora
            window.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            // Fechar modal com tecla ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
        }

        async handleSubmit(e) {
            e.preventDefault();

            try {
                const formData = new FormData(this.form);
                const response = await this.submitForm(formData);

                if (response.ok) {
                    this.showToast('Produto cadastrado com sucesso!', 'success');
                    this.resetForm();
                    this.closeModal();
                    this.reloadTable();
                } else {
                    throw new Error('Erro ao cadastrar produto');
                }
            } catch (error) {
                this.showToast('Erro ao cadastrar produto', 'error');
                console.error('Erro:', error);
            }
        }

        async submitForm(formData) {
            return await fetch('/cadastrar', {
                method: 'POST',
                body: formData
            });
        }

        resetForm() {
            this.form.reset();
        }

        closeModal() {
            this.modal.style.display = 'none';
        }

        showModal() {
            this.modal.style.display = 'block';
        }

        async reloadTable() {
            const response = await fetch('/get-produtos');
            const data = await response.json();
            this.updateTable(data);
        }

        updateTable(produtos) {
            const tableBody = document.querySelector(SELECTORS.tableBody);
            tableBody.innerHTML = produtos.map(produto => this.createTableRow(produto)).join('');
        }

        createTableRow(produto) {
            return `
                <tr>
                    <td>\${produto.nome}</td>
                    <td>\${this.formatCurrency(produto.valor)}</td>
                    <td class="acoes">
                        <button class="btn btn-info btn-sm btn-view" data-id="\${produto.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm btn-edit" data-id="\${produto.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-delete" data-id="\${produto.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }

        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        }

        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast toast-\${type}`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, CONFIG.toastDuration);
        }
    }

    // Classe para gerenciar a tabela
    class TableManager {
        constructor() {
            this.setupTableListeners();
        }

        setupTableListeners() {
            document.querySelector(SELECTORS.tableBody)?.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                const id = target.dataset.id;
                
                if (target.classList.contains('btn-delete')) {
                    this.handleDelete(id);
                } else if (target.classList.contains('btn-edit')) {
                    this.handleEdit(id);
                } else if (target.classList.contains('btn-view')) {
                    this.handleView(id);
                }
            });
        }

        async handleDelete(id) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                try {
                    const response = await fetch(`/deletar/\${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        formManager.showToast('Produto excluído com sucesso!', 'success');
                        formManager.reloadTable();
                    }
                } catch (error) {
                    formManager.showToast('Erro ao excluir produto', 'error');
                    console.error('Erro:', error);
                }
            }
        }

        async handleEdit(id) {
            try {
                const response = await fetch(`/produto/\${id}`);
                const produto = await response.json();
                // Implementar lógica de edição
                formManager.showModal();
                // Preencher formulário com dados do produto
            } catch (error) {
                formManager.showToast('Erro ao carregar produto', 'error');
                console.error('Erro:', error);
            }
        }

        async handleView(id) {
            try {
                const response = await fetch(`/produto/\${id}`);
                const produto = await response.json();
                // Implementar modal de visualização
                this.showViewModal(produto);
            } catch (error) {
                formManager.showToast('Erro ao carregar produto', 'error');
                console.error('Erro:', error);
            }
        }

        showViewModal(produto) {
            // Implementar modal de visualização
        }
    }

    // Inicialização
    const formManager = new FormManager();
    const tableManager = new TableManager();

    // Validações de formulário
    function setupFormValidation() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearError);
        });
    }

    function validateField(e) {
        const field = e.target;
        if (!field.value.trim()) {
            showError(field, 'Este campo é obrigatório');
        }
    }

    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.classList.add('error');
        
        // Remove mensagem de erro anterior se existir
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        field.parentNode.appendChild(errorDiv);
    }

    function clearError(e) {
        const field = e.target;
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Máscaras e formatação
    class InputMasks {
        static money(input) {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = (parseInt(value) / 100).toFixed(2);
                e.target.value = value;
            });
        }

        static applyMasks() {
            document.querySelectorAll('[data-mask="money"]').forEach(input => {
                this.money(input);
            });
        }
    }

    // Animações
    class Animations {
        static fadeIn(element, duration = 300) {
            element.style.opacity = 0;
            element.style.display = 'block';
            
            let start = null;
            
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                
                element.style.opacity = Math.min(progress / duration, 1);
                
                if (progress < duration) {
                    window.requestAnimationFrame(animate);
                }
            };
            
            window.requestAnimationFrame(animate);
        }

        static fadeOut(element, duration = 300) {
            let start = null;
            
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                
                element.style.opacity = 1 - Math.min(progress / duration, 1);
                
                if (progress < duration) {
                    window.requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };
            
            window.requestAnimationFrame(animate);
        }
    }

    // Utilitários
    class Utils {
        static debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        static formatDate(date) {
            return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
        }

        static validateForm(form) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    showError(field, 'Este campo é obrigatório');
                    isValid = false;
                }
            });
            
            return isValid;
        }
    }

    // Local Storage Manager
    class StorageManager {
        static setItem(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Erro ao salvar no localStorage:', e);
            }
        }

        static getItem(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Erro ao ler do localStorage:', e);
                return null;
            }
        }
    }

    // Inicialização de recursos adicionais
    function initializeExtras() {
        setupFormValidation();
        InputMasks.applyMasks();

        // Salvar estado do formulário
        const form = document.querySelector(SELECTORS.form);
        if (form) {
            form.addEventListener('input', Utils.debounce(() => {
                const formData = new FormData(form);
                const formState = Object.fromEntries(formData.entries());
                StorageManager.setItem('formState', formState);
            }, 1000));

            // Restaurar estado do formulário
            const savedState = StorageManager.getItem('formState');
            if (savedState) {
                Object.entries(savedState).forEach(([key, value]) => {
                    const field = form.elements[key];
                    if (field) {
                        field.value = value;
                    }
                });
            }
        }
    }

    // Inicialização geral
    initializeExtras();
});

// Adicionar estilos para as mensagens de erro e toast
const styles = `
    .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }

    .error {
        border-color: #dc3545 !important;
    }

    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        color: white;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    }

    .toast.show {
        opacity: 1;
    }

    .toast-success {
        background-color: #28a745;
    }

    .toast-error {
        background-color: #dc3545;
    }

    .toast-info {
        background-color: #17a2b8;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

