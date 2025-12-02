### 📘 Stay Agenda UI (Frontend)

Salve este conteúdo no `README.md` da pasta do React.

````markdown
# 📱 Stay Agenda (Frontend)

Interface Web e Mobile (PWA) desenvolvida em React para gestão de clínicas de estética e barbearias. Focada em experiência de uso "Mobile-First", funcionando como um aplicativo nativo quando instalada no celular.

---

## 🛠️ Tecnologias & Ferramentas

* **Framework:** React 18 (Vite)
* **Linguagem:** JavaScript (ES6+)
* **Estilização:** Bootstrap 5 + CSS Customizado (Responsivo)
* **Mobile:** PWA (Progressive Web App) com `vite-plugin-pwa`
* **Comunicação API:** Axios
* **Roteamento:** React Router Dom 6
* **Calendário:** FullCalendar (Visões de Mês, Semana, Dia e Lista)
* **Relatórios:** `react-to-print` + `html2pdf.js`

---

## 📱 Funcionalidades Principais

### 1. PWA (Instalável)
O sistema possui um `manifest.json` configurado. Ao acessar pelo navegador do celular (Chrome/Safari), o usuário é convidado a **"Instalar o App"**.
* Funciona offline (cache básico).
* Ícone na tela inicial.
* Abre em tela cheia (sem barra de endereços).

### 2. Agendamento Inteligente
* **Cálculo Automático:** Ao selecionar um procedimento e data, o sistema consulta o backend para aplicar promoções vigentes.
* **Múltiplos Pagamentos:** Permite lançar Sinal + Restante, calculando o saldo devedor em tempo real.
* **Taxas:** Exibe visualmente o desconto de taxas de maquininha (se configurado).

### 3. Dashboard Financeiro
* **Previsão vs Realizado:** Painéis separados para dinheiro em caixa (Concluído/Sinal) e dinheiro a receber (Agendado).
* **Snapshot:** O sistema respeita os valores históricos salvos no agendamento, não alterando relatórios passados se o preço do serviço mudar hoje.

### 4. Multimídia (Histórico Visual)
* Upload de fotos e vídeos de "Antes e Depois" diretamente da câmera do celular.
* Galeria organizada por cliente.

### 5. Comprovantes
* Geração de comprovante em PDF direto no navegador.
* Layout responsivo (A4 ou Cupom Térmico).
* Botão de compartilhamento nativo (Mobile).

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
* Node.js (v18 ou superior) instalado.
* Backend Java rodando (localmente ou na nuvem).

### 1. Instalar Dependências
No terminal, na raiz do projeto:

```bash
npm install
````

### 2\. Configurar Ambiente

Crie um arquivo `.env` na raiz se precisar apontar para um backend específico (Padrão: localhost:8080).

```env
VITE_API_URL=http://localhost:8080/api
```

### 3\. Rodar a Aplicação

```bash
npm run dev
```

O sistema abrirá em: `http://localhost:5173`

-----

## ☁️ Deploy (Vercel)

O projeto está otimizado para deploy na **Vercel**.

1.  Importe o repositório na Vercel.
2.  Configure a variável de ambiente `VITE_API_URL` apontando para o seu backend Java (ex: Render).
3.  O `vercel.json` já está configurado para tratar as rotas de SPA (Single Page Application).

-----

## 🎨 Personalização (White Label)

O sistema possui um **Contexto de Tema** (`ThemeContext`) e **Empresa** (`EmpresaContext`).

  * **Cores:** O usuário pode alterar a cor principal do sistema na engrenagem de configurações.
  * **Identidade:** Logo e Nome da empresa são carregados dinamicamente do backend e aplicados na Navbar, Login e PDF.