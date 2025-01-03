from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Função para formatar o valor como moeda
@app.template_filter('currency')
def format_currency(value):
    return f"R$ {value:,.2f}"

# Lista para armazenar os produtos (em um banco de dados seria melhor em um ambiente real)
produtos = []

@app.route('/')
def index():
    # Ordenando os produtos por valor do menor para o maior
    produtos_ordenados = sorted(produtos, key=lambda x: x['valor'])
    return render_template('index.html', produtos=produtos_ordenados)

@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    nome = request.form.get('nome')
    descricao = request.form.get('descricao')
    valor = float(request.form.get('valor'))
    disponivel = request.form.get('disponivel') == 'sim'
    
    produto = {
        'nome': nome,
        'descricao': descricao,
        'valor': valor,
        'disponivel': disponivel
    }
    
    produtos.append(produto)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
