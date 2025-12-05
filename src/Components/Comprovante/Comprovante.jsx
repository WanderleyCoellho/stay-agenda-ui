import React from "react";
import "./Comprovante.css";

export const Comprovante = React.forwardRef((props, ref) => {
  const { dados, style } = props;

  if (!dados) {
    return <div ref={ref}></div>;
  }

  return (
    <div ref={ref} className="comprovante-container" style={style}>

      {/* CABEÇALHO */}
      <div className="header">
        <div className="logo-area">
          {dados.empresaLogo ? (
            <img src={dados.empresaLogo} alt="Logo" className="logo-img" />
          ) : (
            <span className="logo-icon">📅</span>
          )}
        </div>
        <h2>{dados.empresaNome}</h2>
        <p>Comprovante de Agendamento</p>
      </div>

      <hr className="divider-solid" />

      <div className="body-row">

        {/* ESQUERDA: DADOS (Agora alinhados à esquerda junto com o rótulo) */}
        <div className="info-col">

          <div className="info-group">
            <div className="info-line">
              <span className="label">Cliente:</span>
              <span className="value">{dados.clienteNome}</span>
            </div>
            <div className="info-line">
              <span className="label">Data:</span>
              <span className="value">{dados.dataFormatada}</span>
            </div>
            <div className="info-line">
              <span className="label">Horário:</span>
              <span className="value">{dados.horaInicial} às {dados.horaFinal || "?"}</span>
            </div>
          </div>

          <hr className="dashed-line" />

          <div className="info-group">
            <div className="info-line">
              <span className="label">Procedimento:</span>
              <span className="value fw-bold">{dados.procedimentoNome}</span>
            </div>

            {dados.observacoes && (
              <div className="info-line obs-block">
                <span className="label">Observação:</span> {/* MUDOU AQUI */}
                <span className="value fst-italic">{dados.observacoes}</span>
              </div>
            )}
          </div>
        </div>

        {/* DIREITA: FINANCEIRO (Continua alinhado à direita) */}
        <div className="finance-col">
          <div className="finance-group">

            <div className="finance-item">
              <span className="f-label">Valor Total</span>
              <span className="f-value">{dados.valorTotal}</span>
            </div>

            {dados.valorDescontoFormatado && !dados.valorDescontoFormatado.includes("0,00") && (
              <div className="finance-item discount">
                <span className="f-label">Desconto</span>
                <span className="f-value">- {dados.valorDescontoFormatado}</span>
              </div>
            )}

            <div className="finance-item">
              <span className="f-label">Valor Pago (Sinal)</span>
              <span className="f-value">{dados.valorPago}</span>
            </div>

            <div className="finance-item total-block">
              <span className="f-label">Restante a Pagar</span>
              <span className="f-value big-total">{dados.valorRestante}</span>
            </div>

          </div>
        </div>

      </div>

      <div className="footer">
        <p>Obrigado pela preferência!</p>
        <small>Gerado em: {new Date().toLocaleString()}</small>
      </div>

    </div>
  );
});