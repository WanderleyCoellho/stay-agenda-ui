import { useEffect, useState, useContext } from "react"; // 1. Adicione useContext
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import { ThemeContext } from "../Context/ThemeContext"; // 2. Importe o Contexto

// FullCalendar e Plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

function CalendarioPage() {
    const { primaryColor } = useContext(ThemeContext); // 3. Pegue a cor do tema

    const [eventos, setEventos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        carregarAgenda();
    }, []);

    const carregarAgenda = () => {
        api.get("/agendamentos")
            .then((res) => {
                const dadosFormatados = res.data.map(ag => {
                    let corFundo = primaryColor; // Usa a cor do tema como padrão
                    let corBorda = primaryColor;

                    // Cores específicas por status (pode manter fixas ou derivar)
                    switch (ag.status) {
                        case 'PENDENTE': corFundo = '#ffc107'; corBorda = '#e0a800'; break;
                        case 'CONFIRMADO': corFundo = '#0d6efd'; corBorda = '#0a58ca'; break;
                        case 'CONCLUIDO': corFundo = '#198754'; corBorda = '#146c43'; break;
                        case 'CANCELADO': corFundo = '#dc3545'; corBorda = '#b02a37'; break;
                        default: break;
                    }

                    const corTexto = ag.status === 'PENDENTE' ? '#000000' : '#ffffff';

                    return {
                        id: ag.id,
                        title: ag.clientes?.nome,
                        start: `${ag.data}T${ag.horaInicial}:00`,
                        end: ag.horaFinal ? `${ag.data}T${ag.horaFinal}:00` : null,
                        backgroundColor: corFundo,
                        borderColor: corBorda,
                        textColor: corTexto,
                        extendedProps: {
                            procedimento: ag.procedimento?.procedimento || ag.procedimentos?.procedimento,
                            cliente: ag.clientes?.nome,
                            status: ag.status,
                            dataOriginal: ag.data
                        }
                    };
                });
                setEventos(dadosFormatados);
            })
            .catch(err => console.error("Erro ao carregar calendário", err));
    };

    const handleEventClick = (info) => {
        navigate(`/agendamentos/editar/${info.event.id}`);
    };

    const handleDateClick = (info) => {
        navigate("/agendamentos/novo");
    };

    // --- RENDERIZADOR MÊS ---
    const renderMonthCell = (arg) => {
        const cellDateStr = arg.date.toISOString().split('T')[0];
        const eventosDoDia = eventos.filter(ev => ev.extendedProps.dataOriginal === cellDateStr);

        if (eventosDoDia.length === 0) {
            return <div className="fc-daygrid-day-top"><a className="fc-daygrid-day-number" style={{ textDecoration: 'none', color: 'inherit' }}>{arg.dayNumberText}</a></div>;
        }

        let countAzul = 0;
        let countVerde = 0;
        let countAmarelo = 0;
        let countVermelho = 0;

        eventosDoDia.forEach(ev => {
            const s = ev.extendedProps.status;
            if (s === 'CONFIRMADO') countAzul++;
            else if (s === 'CONCLUIDO') countVerde++;
            else if (s === 'PENDENTE') countAmarelo++;
            else if (s === 'CANCELADO') countVermelho++;
        });

        return (
            <div style={{ textAlign: 'left', height: '100%', position: 'relative', padding: '2px' }}>
                <div className="fc-daygrid-day-top">
                    <a className="fc-daygrid-day-number" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                        {arg.dayNumberText}
                    </a>
                </div>

                <div className="dashboard-dots-container mt-1">
                    {countAmarelo > 0 && <div className="dot-row text-dark"><span className="status-dot dot-yellow"></span> +{countAmarelo}</div>}
                    {countAzul > 0 && <div className="dot-row text-primary"><span className="status-dot dot-blue"></span> +{countAzul}</div>}
                    {countVerde > 0 && <div className="dot-row text-success"><span className="status-dot dot-green"></span> +{countVerde}</div>}
                    {countVermelho > 0 && <div className="dot-row text-danger"><span className="status-dot dot-red"></span> +{countVermelho}</div>}
                </div>
            </div>
        );
    };

    // --- RENDERIZADOR DIA/SEMANA ---
    const renderGeneralContent = (eventInfo) => {
        return (
            <div style={{ overflow: 'hidden', fontSize: '0.85em', padding: '2px', lineHeight: '1.2' }}>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    {eventInfo.timeText && <span style={{ marginRight: '5px' }}>{eventInfo.timeText}</span>}
                    <span>{eventInfo.event.extendedProps.cliente}</span>
                </div>
                <div style={{ fontSize: '0.85em', fontStyle: 'italic', opacity: 0.9 }}>
                    {eventInfo.event.extendedProps.procedimento}
                </div>
            </div>
        );
    };

    return (
        <div className="container mt-4 mb-5">
            <div className="card shadow border-0">

                {/* --- CABEÇALHO DINÂMICO --- */}
                <div
                    className="card-header text-white border-bottom py-3"
                    style={{ backgroundColor: primaryColor }} // Aplica a cor aqui
                >
                    <h4 className="mb-0 fw-bold">📅 Agenda</h4>
                </div>

                <div className="card-body p-0">
                    <div className="p-3">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            locale={ptBrLocale}

                            initialView="dayGridMonth"

                            headerToolbar={{
                                left: 'prev,next',
                                center: 'title',
                                right: 'dayGridMonth,timeGridDay,listWeek'
                            }}

                            views={{
                                dayGridMonth: {
                                    eventDisplay: 'none',
                                    dayCellContent: renderMonthCell
                                },
                                timeGridDay: {
                                    eventContent: renderGeneralContent
                                },
                                listWeek: {
                                }
                            }}

                            slotMinTime="07:00:00"
                            slotMaxTime="22:00:00"
                            allDaySlot={false}
                            slotDuration="00:30:00"

                            height="auto"
                            contentHeight={750}

                            events={eventos}
                            eventClick={handleEventClick}
                            dateClick={handleDateClick}

                            buttonText={{
                                month: 'Mês',
                                day: 'Dia',
                                list: 'Lista'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CalendarioPage;