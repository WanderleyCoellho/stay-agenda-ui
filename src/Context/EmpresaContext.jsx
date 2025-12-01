import { createContext, useState, useEffect } from 'react';
import api from '../Services/api';

export const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
    const [nomeEmpresa, setNomeEmpresa] = useState("Stay Agenda"); // Padrão
    const [logo, setLogo] = useState(null); // URL da imagem (base64)
    
    // Função para recarregar dados (usada após salvar)
    const carregarDadosEmpresa = () => {
        api.get("/empresa")
           .then(res => {
               if (res.data) {
                   setNomeEmpresa(res.data.nomeEmpresa || "Minha Empresa");
                   if (res.data.logo) {
                       // Monta a string base64 para exibir direto
                       setLogo(`data:${res.data.tipoArquivoLogo};base64,${res.data.logo}`);
                   }
               }
           })
           .catch(err => console.log("Sem configuração de empresa ainda."));
    };

    useEffect(() => {
        carregarDadosEmpresa();
    }, []);

    return (
        <EmpresaContext.Provider value={{ nomeEmpresa, logo, carregarDadosEmpresa }}>
            {children}
        </EmpresaContext.Provider>
    );
};