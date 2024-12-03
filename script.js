// Seleção de elementos
const form = document.getElementById('expense-form');
const monthSelect = document.getElementById('month');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const installmentsInput = document.getElementById('installments');
const expenseLists = document.getElementById('expense-lists');
const ctx = document.getElementById('expenseChart').getContext('2d');

// Dados
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let monthlyTotals = Array(12).fill(0);

// Formatador de valores em R$ (ponto para milhares, vírgula para decimais)
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Função para salvar no localStorage
function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Função para atualizar o gráfico
let chart;
function updateChart() {
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", 
        "Junho", "Julho", "Agosto", "Setembro", "Outubro", 
        "Novembro", "Dezembro"
    ];

    if (chart) chart.destroy(); // Evita duplicar o gráfico

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Despesas Mensais (R$)',
                data: monthlyTotals,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Função para renderizar despesas
function renderExpenses() {
    expenseLists.innerHTML = '';

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", 
        "Junho", "Julho", "Agosto", "Setembro", "Outubro", 
        "Novembro", "Dezembro"
    ];

    months.forEach((month, index) => {
        const expensesForMonth = expenses.filter(exp => exp.month === index);
        if (expensesForMonth.length > 0) {
            const monthCard = document.createElement('div');
            monthCard.classList.add('card');
            monthCard.innerHTML = `<h3>${month}</h3>`;

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;

            const tbody = table.querySelector('tbody');
            expensesForMonth.forEach(exp => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="${exp.paid ? 'paid' : ''}">${exp.description}</td>
                    <td>${currencyFormatter.format(exp.amount)}</td>
                    <td>
                        <button class="btn btn-success" data-id="${exp.id}">Pago</button>
                        <button class="btn btn-danger" data-id="${exp.id}">Excluir</button>
                    </td>
                `;

                // Botão de marcar como pago
                row.querySelector('.btn-success').addEventListener('click', () => {
                    markAsPaid(exp.id);
                });

                // Botão de excluir
                row.querySelector('.btn-danger').addEventListener('click', () => {
                    deleteExpense(exp.id);
                });

                tbody.appendChild(row);
            });

            monthCard.appendChild(table);
            expenseLists.appendChild(monthCard);
        }
    });
}

// Função para adicionar despesa
function addExpense(event) {
    event.preventDefault();

    const monthIndex = monthSelect.selectedIndex;
    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value.replace('.', '').replace(',', '.')); // Converter formato brasileiro para número
    const installments = parseInt(installmentsInput.value);

    if (!description || !amount || !installments) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Adicionar a mesma parcela integral em cada mês
    for (let i = 0; i < installments; i++) {
        const month = (monthIndex + i) % 12;
        const expenseId = Date.now() + i; // Gera IDs únicos

        const expense = {
            id: expenseId,
            description: `${description} (Parcela ${i + 1}/${installments})`,
            amount, // Valor integral para cada mês
            month,
            paid: false
        };

        expenses.push(expense);
        monthlyTotals[month] += amount; // Soma o valor integral
    }

    saveToLocalStorage();
    renderExpenses();
    updateChart();

    form.reset();
}

// Função para marcar despesa como paga
function markAsPaid(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
        expense.paid = true;
        saveToLocalStorage();
        renderExpenses();
    }
}

// Função para excluir despesa
function deleteExpense(id) {
    const expense = expenses.find(exp => exp.id === id);

    if (expense) {
        monthlyTotals[expense.month] -= expense.amount;
        expenses = expenses.filter(exp => exp.id !== id);

        saveToLocalStorage();
        renderExpenses();
        updateChart();
    }
}

// Event Listener
form.addEventListener('submit', addExpense);

// Inicializar gráfico e interface
updateChart();
renderExpenses();
