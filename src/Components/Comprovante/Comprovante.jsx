import React from "react";
import "./Comprovante.css";

// Importante: O forwardRef é necessário para a biblioteca achar o componente
export const Comprovante = React.forwardRef((props, ref) => {
  const { dados } = props;

  // --- CORREÇÃO: ---
  // Mesmo sem dados, renderizamos a div vazia para não quebrar a referência da impressão.
  if (!dados) {
      return <div ref={ref}></div>;
  }

  return (
    <div ref={ref} className="comprovante-container">
      
      {/* CABEÇALHO DO PDF */}
      <div className="header">
        <div className="logo-area">
            {/* Se tiver logo, mostra imagem. Se não, ícone */}
            {dados.empresaLogo ? (
                <img src={dados.empresaLogo} alt="Logo" style={{height: "50px"}} />
            ) : (
                <span>📅</span>
            )}
        </div>
        {/* Nome da Empresa Dinâmico */}
        <h2>{dados.empresaNome}</h2>
        <p>Comprovante de Agendamento</p>
      </div>

      <hr className="divider" />

      {/* DADOS DO CLIENTE */}
      <div className="section">
        <label>Cliente:</label>
        <span>{dados.clienteNome}</span>
      </div>
      <div className="section">
        <label>Data:</label>
        <span>{dados.dataFormatada}</span>
      </div>
      <div className="section">
        <label>Horário:</label>
        <span>{dados.horaInicial} às {dados.horaFinal || "?"}</span>
      </div>

      <hr className="divider" />

      {/* SERVIÇO */}
      <div className="section">
        <label>Procedimento:</label>
        <span className="fw-bold">{dados.procedimentoNome}</span>
      </div>
      
      {dados.observacoes && (
        <div className="section obs">
            <small>Obs: {dados.observacoes}</small>
        </div>
      )}

      <hr className="divider" />

      {/* FINANCEIRO */}
      <div className="financial-box">
        <div className="row">
            <span>Valor Total:</span>
            <span>{dados.valorTotal}</span>
        </div>
        
        {/* Só mostra desconto se houver */}
        {/* Nota: verificamos se a string de desconto é diferente de "R$ 0,00" */}
        {dados.valorDescontoFormatado && !dados.valorDescontoFormatado.includes("0,00") && (
            <div className="row discount">
                <span>Desconto:</span>
                <span>- {dados.valorDescontoFormatado}</span>
            </div>
        )}

        <div className="row paid">
            <span>Valor Pago (Sinal):</span>
            <span>{dados.valorPago}</span>
        </div>

        <div className="row total">
            <span>Restante a Pagar:</span>
            <span>{dados.valorRestante}</span>
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="footer">
        <p>Obrigado pela preferência!</p>
        <small>Gerado em: {new Date().toLocaleString()}</small>
      </div>

    </div>
  );
});