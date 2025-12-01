import { createContext, useState, useEffect } from 'react';

// Cria o contexto (o canal de comunicação)
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Tenta pegar a cor salva no navegador, ou usa o Roxo padrão
    const savedColor = localStorage.getItem('themeColor') || '#6f42c1';
    const [primaryColor, setPrimaryColor] = useState(savedColor);

    // Função mágica que atualiza o CSS do site inteiro
    const changeThemeColor = (newColor) => {
        setPrimaryColor(newColor);
        localStorage.setItem('themeColor', newColor); // Salva para a próxima visita

        // Atualiza as variáveis CSS no :root
        document.documentElement.style.setProperty('--primary-color', newColor);
        // Cria uma versão mais escura para o hover (gambiarra inteligente para escurecer a cor)
        document.documentElement.style.setProperty('--primary-hover', adjustColorBrightness(newColor, -20));
    };

    // Roda uma vez quando o site abre para aplicar a cor salva
    useEffect(() => {
        changeThemeColor(primaryColor);
    }, []);

    // Função auxiliar para escurecer a cor pro hover (não se preocupe com a matemática dela)
    function adjustColorBrightness(col, amt) {
        var usePound = false;
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
        var num = parseInt(col, 16);
        var r = (num >> 16) + amt;
        if (r > 255) r = 255;
        else if (r < 0) r = 0;
        var b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255;
        else if (b < 0) b = 0;
        var g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    }

    return (
        <ThemeContext.Provider value={{ primaryColor, changeThemeColor }}>
            {children}
        </ThemeContext.Provider>
    );
};