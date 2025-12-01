import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

// FullCalendar e Plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

import ptBrLocale from '@fullcalendar/core/locales/pt-br';

function CalendarioPage() {
    const [eventos, setEventos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        carregarAgenda();
    }, []);

    const carregarAgenda = () => {
        api.get("/agendamentos")
            .then((res) => {
                const dadosFormatados = res.data.map(ag => {
                    let corFundo = '#3788d8';
                    let corBorda = '#3788d8';

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
                            dataOriginal: ag.data // Data pura YYYY-MM-DD para contagem
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

    // --- RENDERIZADOR MÊS (Resumo com Bolinhas) ---
    const renderMonthCell = (arg) => {
        const cellDateStr = arg.date.toISOString().split('T')[0];

        const eventosDoDia = eventos.filter(ev => ev.extendedProps.dataOriginal === cellDateStr);

        if (eventosDoDia.length === 0) {
            return <div className="fc-daygrid-day-top"><a className="fc-daygrid-day-number" style={{ textDecoration: 'none', color: 'inherit' }}>{arg.dayNumberText}</a></div>;
        }

        let countAzul = 0; // Confirmado
        let countVerde = 0; // Concluido
        let countAmarelo = 0; // Pendente
        let countVermelho = 0; // Cancelado

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

    // --- RENDERIZADOR DIA/SEMANA (Detalhado) ---
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
                <div className="card-header bg-white border-bottom py-3">
                    <h4 className="mb-0 fw-bold text-primary">📅 Agenda</h4>
                </div>

                <div className="card-body p-0">
                    <div className="p-3">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            locale={ptBrLocale}

                            initialView="dayGridMonth"

                            // --- CONFIGURAÇÃO DA BARRA (Sem o botão 'today') ---
                            headerToolbar={{
                                left: 'prev,next', // Apenas setas de navegação
                                center: 'title',
                                right: 'dayGridMonth,timeGridDay,listWeek' // Botões de visualização
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
                                    // Padrão lista
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