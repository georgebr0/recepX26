// ─────────────────────────────────────────────────────────────────────────────
// RECEP — Agente de Receção Virtual  |  v3.0  |  Navegação corrigida
// Páginas: home → chat | home → admin (tabs: overview/functions/plugins/settings)
// Cada página é completamente isolada. Navegação via prop "goto" string.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES GLOBAIS
// ══════════════════════════════════════════════════════════════════════════════
const ACCENT  = "#2e7dc8";
const NAVY    = "#0b1c2e";
const BLUE    = "#1a4570";
const GOLD    = "#c9a84c";
const GREEN   = "#3db87a";
const RED     = "#e05050";
const WHITE   = "#eef4ff";
const MUTED   = "#6a90b0";
const MUTEDL  = "#9ab8d0";
const BORDER  = "rgba(255,255,255,0.08)";
const GLASS   = "rgba(11,28,46,0.80)";

const LANGS = ["PT","EN","ES","FR","DE","IT"];

const SYSTEM_PROMPT = (fns, pls) => `
Você é RECEP, agente de receção virtual inteligente e profissional.
Comportamento: cordial, proativo, discreto, formal-acessível.
Detete o idioma do utilizador e responda SEMPRE nesse idioma (fallback: Inglês).

FUNÇÕES ATIVAS:
${fns.filter(f=>f.enabled).map(f=>`- ${f.name}: ${f.description}`).join("\n") || "Nenhuma."}

PLUGINS ATIVOS:
${pls.filter(p=>p.enabled).map(p=>`- ${p.name}: ${p.description}`).join("\n") || "Nenhum."}

FORMATO DE RESPOSTAS:
- Encaminhamentos: [ENCAMINHAMENTO] De / Para / Assunto / Prioridade / Data-Hora
- Tickets: [TICKET #XXX] Tipo / Solicitante / Destinatário / Prazo / Estado:ABERTO
- Reuniões: [REUNIÃO] Assunto / Data-Hora / Local / Participantes / Pauta
- Eventos: [FICHA EVENTO] Nome / Tipo / Data / Local / Logística / Estado
- Use 🔴 URGENTE para situações críticas
- Termine sempre com ➡️ Próximo passo claro
- Nunca partilhe dados confidenciais sem autorização
`.trim();

const DEF_FUNCS = [
  { id:"f1", name:"Atendimento ao Cliente",     icon:"🤝", enabled:true,  category:"Core",   description:"Receber e encaminhar visitantes, chamadas e e-mails." },
  { id:"f2", name:"Gestão de Correspondência",  icon:"📬", enabled:true,  category:"Core",   description:"Classificar, registar e distribuir correspondência." },
  { id:"f3", name:"Agendamento de Reuniões",    icon:"📅", enabled:true,  category:"Core",   description:"Marcar compromissos e gerir agenda da empresa." },
  { id:"f4", name:"Organização de Eventos",     icon:"🎪", enabled:true,  category:"Core",   description:"Workshops, formações e visitas técnicas." },
  { id:"f5", name:"Apoio Administrativo",       icon:"📋", enabled:true,  category:"Core",   description:"Documentos, arquivos e registos diários." },
  { id:"f6", name:"Apoio Interdepartamental",   icon:"🏢", enabled:true,  category:"Core",   description:"RH, eventos e organização entre departamentos." },
  { id:"f7", name:"Gestão de Tickets",          icon:"🎫", enabled:true,  category:"Core",   description:"Abrir, acompanhar e fechar solicitações." },
  { id:"f8", name:"Confidencialidade de Dados", icon:"🔒", enabled:true,  category:"Core",   description:"Proteção e controlo de dados sensíveis." },
];

const DEF_PLUGINS = [
  { id:"p1", name:"Google Calendar",    category:"Agenda",       icon:"📅", enabled:true,  description:"Sincroniza reuniões com Google Calendar.",      apiKey:"", endpoint:"https://www.googleapis.com/calendar/v3" },
  { id:"p2", name:"Outlook / Teams",    category:"Agenda",       icon:"📧", enabled:false, description:"Integração Microsoft 365 e reuniões Teams.",    apiKey:"", endpoint:"https://graph.microsoft.com/v1.0" },
  { id:"p3", name:"Slack",              category:"Comunicação",  icon:"💬", enabled:false, description:"Envia alertas para canais Slack.",              apiKey:"", endpoint:"https://hooks.slack.com/services" },
  { id:"p4", name:"WhatsApp Business",  category:"Comunicação",  icon:"📱", enabled:false, description:"Atendimento via WhatsApp Business API.",        apiKey:"", endpoint:"https://graph.facebook.com/v17.0" },
  { id:"p5", name:"Jira",               category:"Gestão",       icon:"🎯", enabled:false, description:"Cria tickets no Jira automaticamente.",         apiKey:"", endpoint:"https://your-domain.atlassian.net/rest/api/3" },
  { id:"p6", name:"Google Drive",       category:"Documentos",   icon:"📁", enabled:false, description:"Arquivo e gestão de documentos.",              apiKey:"", endpoint:"https://www.googleapis.com/drive/v3" },
];

const uid  = () => Math.random().toString(36).slice(2,7).toUpperCase();
const ts   = () => new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const hour = new Date().getHours();
const GREET = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

// ══════════════════════════════════════════════════════════════════════════════
// ESTILOS GLOBAIS
// ══════════════════════════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { background: ${NAVY}; font-family: 'DM Sans', sans-serif; color: ${WHITE}; overflow: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 4px; }
    input, textarea, button { font-family: 'DM Sans', sans-serif; }
    textarea { resize: none; }
    input:focus, textarea:focus { outline: none; }
    button { cursor: pointer; }
    a { color: ${ACCENT}; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes floatHat { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-12px) rotate(2deg); } }
    @keyframes dot      { 0%,80%,100% { transform:scale(0); opacity:.3; } 40% { transform:scale(1); opacity:1; } }
    @keyframes spin     { to { transform:rotate(360deg); } }
    @keyframes blink    { 0%,100% { opacity:.4; } 50% { opacity:1; } }
    @keyframes slideRight { from { transform:translateX(30px); opacity:0; } to { transform:translateX(0); opacity:1; } }
  `}</style>
);

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES PRIMITIVOS (sem side-effects de navegação)
// ══════════════════════════════════════════════════════════════════════════════
const btn = (variant) => ({
  primary: { bg:`linear-gradient(135deg,${ACCENT},${BLUE})`, color:"#fff", border:"none", shadow:`0 4px 18px rgba(46,125,200,.35)` },
  ghost:   { bg:"rgba(255,255,255,.07)", color:MUTEDL, border:`1px solid ${BORDER}`, shadow:"none" },
  danger:  { bg:"rgba(224,80,80,.12)", color:RED, border:"1px solid rgba(224,80,80,.28)", shadow:"none" },
  success: { bg:"rgba(61,184,122,.12)", color:GREEN, border:"1px solid rgba(61,184,122,.28)", shadow:"none" },
  gold:    { bg:`linear-gradient(135deg,${GOLD},#9a7020)`, color:"#fff", border:"none", shadow:"none" },
}[variant]);

function Btn({ children, onClick, variant="primary", sm, disabled, style={} }) {
  const v = btn(variant);
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display:"inline-flex", alignItems:"center", gap:"6px",
        padding: sm ? "5px 13px" : "9px 20px",
        fontSize: sm ? "12px" : "13px",
        fontWeight: 600, borderRadius:"10px",
        background: v.bg, color: v.color,
        border: v.border || "none",
        boxShadow: v.shadow,
        opacity: disabled ? .45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .18s ease",
        ...style,
      }}
    >{children}</button>
  );
}

function Tag({ children, color=ACCENT }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:"4px",
      fontSize:"10px", fontWeight:700, letterSpacing:".07em",
      padding:"2px 8px", borderRadius:"20px",
      border:`1px solid ${color}40`, background:`${color}16`, color,
    }}>{children}</span>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{
      background: GLASS, backdropFilter:"blur(18px)",
      borderRadius:"14px", border:`1px solid ${BORDER}`,
      padding:"20px", ...style,
    }}>{children}</div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div
      role="switch" aria-checked={on} tabIndex={0}
      onClick={() => onChange(!on)}
      onKeyDown={e => e.key===" " && onChange(!on)}
      style={{
        width:"42px", height:"22px", borderRadius:"11px", flexShrink:0,
        background: on ? GREEN : "rgba(255,255,255,.13)",
        border:`1px solid ${on ? GREEN : BORDER}`,
        position:"relative", cursor:"pointer", transition:"all .22s",
      }}
    >
      <div style={{
        width:"16px", height:"16px", borderRadius:"50%", background:"#fff",
        position:"absolute", top:"2px", left: on ? "22px" : "2px",
        transition:"left .22s", boxShadow:"0 1px 5px rgba(0,0,0,.3)",
      }}/>
    </div>
  );
}

function Divider() {
  return <div style={{ height:"1px", background:BORDER, margin:"4px 0" }}/>;
}

// Modal overlay
function Modal({ title, onClose, children, maxW="480px" }) {
  useEffect(() => {
    const handler = (e) => { if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position:"fixed", inset:0, zIndex:300,
        background:"rgba(0,0,0,.65)", backdropFilter:"blur(6px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px", animation:"fadeIn .18s ease",
      }}
      onClick={(e) => e.target===e.currentTarget && onClose()}
    >
      <Card style={{ width:"100%", maxWidth:maxW, animation:"slideRight .22s ease", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", color:WHITE }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:MUTED, fontSize:"20px", lineHeight:1 }}>✕</button>
        </div>
        {children}
      </Card>
    </div>
  );
}

// Campo de formulário reutilizável
function Field({ label, value, onChange, type="text", placeholder, mono }) {
  return (
    <div style={{ marginBottom:"13px" }}>
      <div style={{ fontSize:"10px", color:MUTED, fontWeight:700, letterSpacing:".08em", marginBottom:"5px" }}>{label}</div>
      <input
        type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:"100%", background:"rgba(255,255,255,.06)",
          border:`1px solid ${BORDER}`, borderRadius:"8px",
          padding:"9px 12px", color:WHITE, fontSize:"13px",
          fontFamily: mono ? "monospace" : "inherit",
        }}
      />
    </div>
  );
}

// Header comum para Chat e Admin
function PageHeader({ left, right, borderBottom=true }) {
  return (
    <div style={{
      height:"60px", padding:"0 20px", flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: GLASS, backdropFilter:"blur(20px)",
      borderBottom: borderBottom ? `1px solid ${BORDER}` : "none",
      zIndex:10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>{left}</div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>{right}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA: HOME
// ══════════════════════════════════════════════════════════════════════════════
function PageHome({ goto }) {
  const features = [
    { icon:"🤝", label:"Atendimento",      desc:"Visitantes, clientes, fornecedores" },
    { icon:"📅", label:"Agenda",           desc:"Reuniões e compromissos em tempo real" },
    { icon:"📬", label:"Correspondência",  desc:"Registo e distribuição interna" },
    { icon:"🎪", label:"Eventos",          desc:"Workshops, conferências, visitas" },
    { icon:"🎫", label:"Tickets",          desc:"Solicitações rastreadas e auditadas" },
    { icon:"🔒", label:"Privacidade",      desc:"Dados protegidos e confidenciais" },
  ];

  return (
    <div style={{
      height:"100%", overflowY:"auto",
      background:`radial-gradient(ellipse at 22% 25%, #1a3a5c 0%, ${NAVY} 62%)`,
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"40px 24px",
      position:"relative",
    }}>
      {/* orbs decorativos */}
      <div style={{ position:"absolute", top:"-80px", right:"-60px", width:"340px", height:"340px", borderRadius:"50%", background:"rgba(46,125,200,.07)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-50px", left:"-50px", width:"220px", height:"220px", borderRadius:"50%", background:"rgba(201,168,76,.05)", pointerEvents:"none" }}/>

      {/* logo / hat */}
      <div style={{ fontSize:"72px", animation:"floatHat 5s ease-in-out infinite", userSelect:"none", marginBottom:"20px" }}>🎩</div>

      {/* título */}
      <div style={{ textAlign:"center", marginBottom:"36px", animation:"fadeUp .5s ease" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(48px,8vw,80px)", fontWeight:700, color:WHITE, letterSpacing:".06em", lineHeight:1 }}>
          RECEP
        </h1>
        <p style={{ color:GOLD, fontSize:"11px", letterSpacing:".22em", fontWeight:600, marginTop:"10px" }}>
          AGENTE DE RECEÇÃO VIRTUAL INTELIGENTE
        </p>
        <p style={{ color:MUTEDL, fontSize:"14px", marginTop:"14px", maxWidth:"400px", lineHeight:1.75 }}>
          O primeiro ponto de contacto da sua empresa — disponível 24h, em qualquer idioma.
        </p>
      </div>

      {/* CTA buttons */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"48px", flexWrap:"wrap", justifyContent:"center", animation:"fadeUp .62s ease" }}>
        <Btn onClick={() => goto("chat")} style={{ padding:"13px 36px", fontSize:"14px" }}>
          🎩 Iniciar Atendimento
        </Btn>
        <Btn onClick={() => goto("admin")} variant="ghost" style={{ padding:"13px 28px", fontSize:"14px" }}>
          ⚙️ Painel Admin
        </Btn>
      </div>

      {/* feature grid */}
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
        gap:"12px", maxWidth:"680px", width:"100%",
        animation:"fadeUp .72s ease",
      }}>
        {features.map((f,i) => (
          <Card key={i} style={{ textAlign:"center", padding:"18px 14px" }}>
            <div style={{ fontSize:"26px", marginBottom:"8px" }}>{f.icon}</div>
            <div style={{ color:WHITE, fontWeight:600, fontSize:"13px", marginBottom:"4px" }}>{f.label}</div>
            <div style={{ color:MUTED, fontSize:"11px", lineHeight:1.5 }}>{f.desc}</div>
          </Card>
        ))}
      </div>

      <p style={{ color:MUTED+"55", fontSize:"10px", marginTop:"36px", letterSpacing:".08em" }}>
        POWERED BY CLAUDE · {new Date().getFullYear()}
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA: CHAT
// ══════════════════════════════════════════════════════════════════════════════
function PageChat({ goto, apiKey, functions, plugins }) {
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState(0);
  const [lang,    setLang]    = useState("PT");
  const endRef = useRef(null);
  const taRef  = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const QUICK = [
    { icon:"📅", label:"Agendar Reunião",   text:"Quero agendar uma reunião." },
    { icon:"📦", label:"Registar Entrega",  text:"Recebi uma entrega para registar." },
    { icon:"📨", label:"Encaminhar Msg",    text:"Preciso encaminhar uma mensagem urgente." },
    { icon:"🎪", label:"Organizar Evento",  text:"Preciso organizar um evento interno." },
    { icon:"🎫", label:"Abrir Ticket",      text:"Quero abrir um ticket de solicitação." },
    { icon:"🤝", label:"Visita Técnica",    text:"Há uma visita técnica de fornecedor para registar." },
  ];

  const sendMsg = useCallback(async (text) => {
    const txt = (text || input).trim();
    if (!txt || loading) return;

    if (!apiKey) {
      // sem API key → avisa e vai para settings
      setMsgs(p => [...p,
        { role:"user",      content:txt,                                                       t:ts() },
        { role:"assistant", content:"⚠️ API Key não configurada. Vou encaminhá-lo para as Configurações.", t:ts() },
      ]);
      setInput("");
      setTimeout(() => goto("admin"), 1500);
      return;
    }

    const userMsg = { role:"user", content:txt, t:ts() };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setInput("");
    if (taRef.current) { taRef.current.style.height = "auto"; }
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: SYSTEM_PROMPT(functions, plugins),
          messages: history.map(m => ({ role:m.role, content:m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data.content?.[0]?.text || "⚠️ Resposta vazia do servidor.";
      if (reply.includes("[TICKET")) setTickets(n => n + 1);

      setMsgs(p => [...p, { role:"assistant", content:reply, t:ts() }]);
    } catch (err) {
      setMsgs(p => [...p, {
        role:"assistant",
        content:`⚠️ Erro: ${err.message}.\n\nVerifique a API Key em Configurações e tente novamente.`,
        t:ts(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, msgs, apiKey, functions, plugins, goto]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const renderText = (content) =>
    content.split("\n").map((line, i) => {
      const isMeta = /^\[.+\]/.test(line.trim());
      return (
        <p key={i} style={{
          margin: i === 0 ? 0 : "5px 0 0",
          fontFamily: isMeta ? "monospace" : "inherit",
          fontSize: isMeta ? "11.5px" : "14px",
          color: isMeta ? "#5ab8e8" : "inherit",
          background: isMeta ? "rgba(46,125,200,.12)" : undefined,
          padding: isMeta ? "2px 6px" : undefined,
          borderRadius: isMeta ? "4px" : undefined,
          lineHeight: 1.65,
        }}>{line || "\u00A0"}</p>
      );
    });

  const isEmpty = msgs.length === 0;

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:`linear-gradient(155deg,${NAVY} 0%,#10253e 100%)` }}>
      {/* ── HEADER ── */}
      <PageHeader
        left={
          <>
            <Btn sm variant="ghost" onClick={() => goto("home")}>← Início</Btn>
            <Divider />
            <span style={{ fontSize:"22px" }}>🎩</span>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px", color:WHITE, letterSpacing:".06em" }}>RECEP</div>
              <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:GREEN, animation:"blink 2s infinite" }}/>
                <span style={{ fontSize:"10px", color:MUTED, letterSpacing:".07em" }}>ONLINE</span>
              </div>
            </div>
          </>
        }
        right={
          <>
            {tickets > 0 && <Tag color={GREEN}>{tickets} ticket{tickets>1?"s":""}</Tag>}
            {/* seletor de idioma */}
            <div style={{ display:"flex", gap:"2px" }}>
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: lang===l ? "rgba(46,125,200,.35)" : "transparent",
                    border: lang===l ? `1px solid ${ACCENT}44` : "1px solid transparent",
                    borderRadius:"6px", padding:"3px 7px",
                    color: lang===l ? WHITE : MUTED,
                    fontSize:"11px", fontWeight:600, transition:"all .18s",
                  }}
                >{l}</button>
              ))}
            </div>
            <Btn sm variant="ghost" onClick={() => goto("admin")}>⚙️ Admin</Btn>
          </>
        }
      />

      {/* ── MENSAGENS ── */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
        {isEmpty ? (
          /* ecrã de boas-vindas */
          <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"24px", animation:"fadeIn .5s ease" }}>
            <div style={{ fontSize:"60px", animation:"floatHat 5s ease-in-out infinite", userSelect:"none" }}>🎩</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:WHITE, marginBottom:"8px" }}>{GREET}!</div>
              <div style={{ color:MUTEDL, fontSize:"14px", maxWidth:"340px", lineHeight:1.75 }}>
                Sou o <strong style={{ color:WHITE }}>Recep</strong>, o seu assistente de receção virtual.
                <br/>Como posso ajudá-lo/a hoje?
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px", width:"100%", maxWidth:"440px" }}>
              {QUICK.map((q,i) => (
                <button
                  key={i}
                  onClick={() => sendMsg(q.text)}
                  style={{
                    background:"rgba(255,255,255,.05)", border:`1px solid ${BORDER}`,
                    borderRadius:"12px", padding:"13px 14px",
                    color:MUTEDL, textAlign:"left", fontSize:"13px",
                    display:"flex", alignItems:"center", gap:"9px",
                    transition:"all .18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(46,125,200,.2)"; e.currentTarget.style.color=WHITE; e.currentTarget.style.borderColor=ACCENT+"44"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.05)"; e.currentTarget.style.color=MUTEDL; e.currentTarget.style.borderColor=BORDER; }}
                >
                  <span style={{ fontSize:"19px" }}>{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* lista de mensagens */
          <>
            {msgs.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  style={{
                    display:"flex", justifyContent: isUser ? "flex-end" : "flex-start",
                    marginBottom:"14px", animation:"fadeUp .3s ease",
                  }}
                >
                  {!isUser && (
                    <div style={{
                      width:"32px", height:"32px", borderRadius:"50%",
                      background:`linear-gradient(135deg,${BLUE},${NAVY})`,
                      border:`1px solid ${ACCENT}40`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"15px", flexShrink:0, marginRight:"9px", marginTop:"2px",
                    }}>🎩</div>
                  )}
                  <div style={{
                    maxWidth:"72%",
                    background: isUser ? `linear-gradient(135deg,${ACCENT},${BLUE})` : "rgba(255,255,255,.06)",
                    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    padding:"11px 15px",
                    border: isUser ? "none" : `1px solid ${BORDER}`,
                    boxShadow: isUser ? `0 4px 14px rgba(46,125,200,.28)` : "none",
                  }}>
                    <div style={{ color:WHITE }}>{renderText(m.content)}</div>
                    <div style={{ fontSize:"10px", color: isUser ? "rgba(255,255,255,.45)" : MUTED, marginTop:"6px", textAlign:"right" }}>{m.t}</div>
                  </div>
                  {isUser && (
                    <div style={{
                      width:"32px", height:"32px", borderRadius:"50%",
                      background:"rgba(255,255,255,.08)", border:`1px solid ${BORDER}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"15px", flexShrink:0, marginLeft:"9px", marginTop:"2px",
                    }}>👤</div>
                  )}
                </div>
              );
            })}

            {/* typing indicator */}
            {loading && (
              <div style={{ display:"flex", alignItems:"center", gap:"9px", marginBottom:"14px", animation:"fadeUp .3s ease" }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:`linear-gradient(135deg,${BLUE},${NAVY})`, border:`1px solid ${ACCENT}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", flexShrink:0 }}>🎩</div>
                <div style={{ background:"rgba(255,255,255,.06)", borderRadius:"16px 16px 16px 4px", padding:"12px 16px", border:`1px solid ${BORDER}`, display:"flex", gap:"4px", alignItems:"center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:"7px", height:"7px", borderRadius:"50%", background:ACCENT, animation:`dot 1.4s ease ${i*.2}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </>
        )}
      </div>

      {/* ── QUICK BAR (só aparece após primeira mensagem) ── */}
      {!isEmpty && (
        <div style={{ padding:"6px 20px 0", display:"flex", gap:"7px", overflowX:"auto", flexShrink:0 }}>
          {QUICK.map((q,i) => (
            <button
              key={i}
              onClick={() => sendMsg(q.text)}
              style={{
                background:"rgba(255,255,255,.05)", border:`1px solid ${BORDER}`,
                borderRadius:"9px", padding:"5px 13px",
                color:MUTEDL, fontSize:"12px", fontWeight:500,
                display:"flex", alignItems:"center", gap:"5px",
                whiteSpace:"nowrap", transition:"all .18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(46,125,200,.2)"; e.currentTarget.style.color=WHITE; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.05)"; e.currentTarget.style.color=MUTEDL; }}
            >
              {q.icon} {q.label}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT ── */}
      <div style={{ padding:"12px 20px 18px", background:GLASS, backdropFilter:"blur(20px)", borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
        <div style={{
          display:"flex", gap:"9px", alignItems:"flex-end",
          background:"rgba(255,255,255,.06)", borderRadius:"13px",
          border:`1px solid ${BORDER}`, padding:"10px 14px",
        }}>
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,110)+"px"; }}
            placeholder="Escreva a sua mensagem… (Enter para enviar, Shift+Enter nova linha)"
            style={{ flex:1, background:"transparent", border:"none", color:WHITE, fontSize:"14px", lineHeight:"1.6", maxHeight:"110px", overflowY:"auto" }}
          />
          <button
            onClick={() => sendMsg()}
            disabled={!input.trim() || loading}
            style={{
              width:"38px", height:"38px", borderRadius:"10px", border:"none", flexShrink:0,
              background: input.trim() && !loading ? `linear-gradient(135deg,${ACCENT},${BLUE})` : "rgba(255,255,255,.08)",
              color: input.trim() && !loading ? "#fff" : MUTED,
              fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .18s",
            }}
          >
            {loading
              ? <div style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .8s linear infinite" }}/>
              : "➤"}
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:"7px", fontSize:"10px", color:MUTED+"55", letterSpacing:".06em" }}>
          RECEP · POWERED BY CLAUDE · CONFIDENCIAL
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EDITORES (modais reutilizáveis)
// ══════════════════════════════════════════════════════════════════════════════
function PluginEditor({ data, onSave, onClose }) {
  const blank = { name:"", category:"", icon:"🔌", description:"", apiKey:"", endpoint:"", enabled:false };
  const [f, setF] = useState({ ...blank, ...data });
  const u = (k,v) => setF(x => ({ ...x, [k]:v }));
  const isNew = !data?.id;

  return (
    <Modal title={isNew ? "Novo Plugin" : "Editar Plugin"} onClose={onClose}>
      <Field label="NOME DO PLUGIN"  value={f.name}        onChange={v=>u("name",v)}        placeholder="Ex: Google Calendar" />
      <Field label="CATEGORIA"        value={f.category}    onChange={v=>u("category",v)}    placeholder="Ex: Agenda" />
      <Field label="ÍCONE (EMOJI)"    value={f.icon}        onChange={v=>u("icon",v)}        placeholder="📅" />
      <Field label="DESCRIÇÃO"        value={f.description} onChange={v=>u("description",v)} placeholder="O que este plugin faz?" />
      <Field label="API KEY / TOKEN"  value={f.apiKey}      onChange={v=>u("apiKey",v)}      placeholder="Chave de acesso" type="password" mono />
      <Field label="ENDPOINT / URL"   value={f.endpoint}    onChange={v=>u("endpoint",v)}    placeholder="https://api.exemplo.com/v1" />
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
        <Toggle on={f.enabled} onChange={v=>u("enabled",v)}/>
        <span style={{ color:MUTEDL, fontSize:"13px" }}>Ativar imediatamente</span>
      </div>
      <div style={{ display:"flex", gap:"9px", justifyContent:"flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.name || !f.category}>💾 Guardar Plugin</Btn>
      </div>
    </Modal>
  );
}

function FunctionEditor({ data, onSave, onClose }) {
  const blank = { name:"", category:"Custom", icon:"⚡", description:"", enabled:false };
  const [f, setF] = useState({ ...blank, ...data });
  const u = (k,v) => setF(x => ({ ...x, [k]:v }));
  const isNew = !data?.id;

  return (
    <Modal title={isNew ? "Nova Função" : "Editar Função"} onClose={onClose}>
      <Field label="NOME DA FUNÇÃO"  value={f.name}        onChange={v=>u("name",v)}        placeholder="Ex: Gestão de Visitantes" />
      <Field label="CATEGORIA"        value={f.category}    onChange={v=>u("category",v)}    placeholder="Ex: Core / Custom" />
      <Field label="ÍCONE (EMOJI)"    value={f.icon}        onChange={v=>u("icon",v)}        placeholder="🏢" />
      <Field label="DESCRIÇÃO"        value={f.description} onChange={v=>u("description",v)} placeholder="O que esta função faz?" />
      <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
        <Toggle on={f.enabled} onChange={v=>u("enabled",v)}/>
        <span style={{ color:MUTEDL, fontSize:"13px" }}>Ativar imediatamente</span>
      </div>
      <div style={{ display:"flex", gap:"9px", justifyContent:"flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={() => onSave(f)} disabled={!f.name}>💾 Guardar Função</Btn>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA: ADMIN — sub-tabs isolados em componentes próprios
// ══════════════════════════════════════════════════════════════════════════════

/* ── Tab: Visão Geral ── */
function TabOverview({ functions, plugins }) {
  const fOn = functions.filter(f=>f.enabled).length;
  const pOn = plugins.filter(p=>p.enabled).length;

  return (
    <div style={{ animation:"fadeUp .35s ease" }}>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:WHITE, marginBottom:"6px" }}>Visão Geral</h2>
      <p style={{ color:MUTED, fontSize:"13px", marginBottom:"24px" }}>Estado atual do agente Recep.</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"12px", marginBottom:"26px" }}>
        {[
          { label:"Funções Ativas", v:fOn, t:functions.length, c:ACCENT },
          { label:"Plugins Ativos", v:pOn, t:plugins.length,   c:GOLD  },
          { label:"Total Funções",  v:functions.length,        c:MUTEDL },
          { label:"Total Plugins",  v:plugins.length,          c:MUTEDL },
        ].map((s,i) => (
          <Card key={i} style={{ textAlign:"center", padding:"18px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"30px", fontWeight:700, color:s.c }}>
              {s.v}{s.t !== undefined && <span style={{ fontSize:"16px", color:MUTED }}>/{s.t}</span>}
            </div>
            <div style={{ fontSize:"12px", color:MUTED, marginTop:"5px" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ marginBottom:"20px" }}>
        <div style={{ fontSize:"11px", color:MUTED, fontWeight:700, letterSpacing:".09em", marginBottom:"10px" }}>FUNÇÕES ATIVAS</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
          {functions.filter(f=>f.enabled).map(f=><Tag key={f.id} color={ACCENT}>{f.icon} {f.name}</Tag>)}
          {fOn===0 && <span style={{ color:RED, fontSize:"13px" }}>Nenhuma função ativa</span>}
        </div>
      </div>
      <div>
        <div style={{ fontSize:"11px", color:MUTED, fontWeight:700, letterSpacing:".09em", marginBottom:"10px" }}>PLUGINS ATIVOS</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
          {plugins.filter(p=>p.enabled).map(p=><Tag key={p.id} color={GOLD}>{p.icon} {p.name}</Tag>)}
          {pOn===0 && <span style={{ color:MUTED, fontSize:"13px" }}>Nenhum plugin ativo</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Tab: Funções ── */
function TabFunctions({ functions, setFunctions }) {
  const [editing, setEditing] = useState(null); // null | {} | {id,...}

  const save = (f) => {
    if (f.id) { setFunctions(p => p.map(x => x.id===f.id ? f : x)); }
    else       { setFunctions(p => [...p, { ...f, id:"f"+uid() }]); }
    setEditing(null);
  };

  const remove = (id) => {
    if (window.confirm("Remover esta função?")) setFunctions(p => p.filter(x=>x.id!==id));
  };

  const toggle = (id) => setFunctions(p => p.map(x => x.id===id ? { ...x, enabled:!x.enabled } : x));

  return (
    <div style={{ animation:"fadeUp .35s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:WHITE, marginBottom:"5px" }}>Funções do Agente</h2>
          <p style={{ color:MUTED, fontSize:"13px" }}>Gerir as capacidades e comportamentos do Recep.</p>
        </div>
        <Btn onClick={() => setEditing({})}>+ Nova Função</Btn>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {functions.map(f => (
          <Card key={f.id} style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 18px" }}>
            <span style={{ fontSize:"22px", flexShrink:0 }}>{f.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"3px", flexWrap:"wrap" }}>
                <span style={{ color:WHITE, fontWeight:600, fontSize:"14px" }}>{f.name}</span>
                <Tag color={f.category==="Core" ? ACCENT : GOLD}>{f.category}</Tag>
                {!f.enabled && <Tag color={RED}>Desativada</Tag>}
              </div>
              <p style={{ color:MUTED, fontSize:"12px", lineHeight:1.5 }}>{f.description}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"9px", flexShrink:0 }}>
              <Toggle on={f.enabled} onChange={() => toggle(f.id)}/>
              <Btn sm variant="ghost" onClick={() => setEditing(f)}>✏️</Btn>
              {f.category !== "Core" && (
                <Btn sm variant="danger" onClick={() => remove(f.id)}>🗑</Btn>
              )}
            </div>
          </Card>
        ))}
      </div>

      {editing !== null && (
        <FunctionEditor data={editing} onSave={save} onClose={() => setEditing(null)}/>
      )}
    </div>
  );
}

/* ── Tab: Plugins ── */
function TabPlugins({ plugins, setPlugins }) {
  const [editing, setEditing] = useState(null);

  const save = (p) => {
    if (p.id) { setPlugins(prev => prev.map(x => x.id===p.id ? p : x)); }
    else       { setPlugins(prev => [...prev, { ...p, id:"p"+uid() }]); }
    setEditing(null);
  };

  const remove = (id) => {
    if (window.confirm("Remover este plugin?")) setPlugins(prev => prev.filter(x=>x.id!==id));
  };

  const toggle = (id) => setPlugins(prev => prev.map(x => x.id===id ? { ...x, enabled:!x.enabled } : x));

  const categories = [...new Set(plugins.map(p=>p.category))];

  return (
    <div style={{ animation:"fadeUp .35s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:WHITE, marginBottom:"5px" }}>Plugins & APIs</h2>
          <p style={{ color:MUTED, fontSize:"13px" }}>Integrar ferramentas externas para ampliar as capacidades do Recep.</p>
        </div>
        <Btn onClick={() => setEditing({})}>+ Novo Plugin</Btn>
      </div>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom:"24px" }}>
          <div style={{ fontSize:"11px", color:MUTED, fontWeight:700, letterSpacing:".1em", marginBottom:"10px" }}>{cat.toUpperCase()}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
            {plugins.filter(p=>p.category===cat).map(p => (
              <Card key={p.id} style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 18px" }}>
                <span style={{ fontSize:"22px", flexShrink:0 }}>{p.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"3px", flexWrap:"wrap" }}>
                    <span style={{ color:WHITE, fontWeight:600, fontSize:"14px" }}>{p.name}</span>
                    {p.enabled && <Tag color={GREEN}>Ativo</Tag>}
                    {p.apiKey  && <Tag color={GOLD}>🔑 Key</Tag>}
                  </div>
                  <p style={{ color:MUTED, fontSize:"12px" }}>{p.description}</p>
                  {p.endpoint && <p style={{ color:ACCENT+"66", fontSize:"11px", marginTop:"2px", fontFamily:"monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.endpoint}</p>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"9px", flexShrink:0 }}>
                  <Toggle on={p.enabled} onChange={() => toggle(p.id)}/>
                  <Btn sm variant="ghost" onClick={() => setEditing(p)}>✏️ Editar</Btn>
                  <Btn sm variant="danger" onClick={() => remove(p.id)}>🗑</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {editing !== null && (
        <PluginEditor data={editing} onSave={save} onClose={() => setEditing(null)}/>
      )}
    </div>
  );
}

/* ── Tab: Configurações ── */
function TabSettings({ apiKey, setApiKey, setFunctions, setPlugins }) {
  const [localKey, setLocalKey] = useState(apiKey);
  const [saved,    setSaved]    = useState(false);

  const saveKey = () => {
    setApiKey(localKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetFuncs = () => {
    if (window.confirm("Repor todas as funções para o padrão?")) setFunctions([...DEF_FUNCS]);
  };
  const resetPlugins = () => {
    if (window.confirm("Repor todos os plugins para o padrão?")) setPlugins([...DEF_PLUGINS]);
  };

  return (
    <div style={{ animation:"fadeUp .35s ease" }}>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:WHITE, marginBottom:"6px" }}>Configurações</h2>
      <p style={{ color:MUTED, fontSize:"13px", marginBottom:"24px" }}>Configurações globais do agente Recep.</p>

      {/* API Key */}
      <Card style={{ marginBottom:"16px" }}>
        <h3 style={{ color:WHITE, fontWeight:600, fontSize:"15px", marginBottom:"5px" }}>🔑 Anthropic API Key</h3>
        <p style={{ color:MUTED, fontSize:"12px", marginBottom:"14px" }}>
          Necessária para o agente funcionar. Obtenha gratuitamente em{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">console.anthropic.com</a>
        </p>
        <div style={{ display:"flex", gap:"10px" }}>
          <input
            type="password"
            value={localKey}
            onChange={e => setLocalKey(e.target.value)}
            onKeyDown={e => e.key==="Enter" && saveKey()}
            placeholder="sk-ant-api03-..."
            style={{
              flex:1, background:"rgba(255,255,255,.06)",
              border:`1px solid ${BORDER}`, borderRadius:"8px",
              padding:"9px 13px", color:WHITE, fontSize:"13px", fontFamily:"monospace",
            }}
          />
          <Btn onClick={saveKey}>💾 Guardar</Btn>
        </div>
        {saved && <p style={{ color:GREEN, fontSize:"12px", marginTop:"10px" }}>✅ API Key guardada com sucesso.</p>}
        {apiKey && !saved && <p style={{ color:GREEN, fontSize:"12px", marginTop:"10px" }}>✅ API Key configurada.</p>}
      </Card>

      {/* Escalabilidade */}
      <Card style={{ marginBottom:"16px" }}>
        <h3 style={{ color:WHITE, fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>🚀 Plano de Escalabilidade</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:"11px" }}>
          {[
            { fase:"Fase 1", cor:GREEN, titulo:"Gratuito",   items:["Vercel / Netlify hosting","API Key Anthropic","Sem base de dados","Sem autenticação"] },
            { fase:"Fase 2", cor:GOLD,  titulo:"~€10/mês",   items:["Supabase (histórico)","Clerk (autenticação)","Domínio próprio","Logs de conversas"] },
            { fase:"Fase 3", cor:ACCENT,titulo:"Empresarial", items:["Backend próprio","Google Calendar API","Outlook / Teams","Múltiplos agentes"] },
          ].map(f => (
            <div key={f.fase} style={{ background:"rgba(255,255,255,.04)", borderRadius:"10px", padding:"15px", border:`1px solid ${f.cor}22` }}>
              <Tag color={f.cor}>{f.fase}</Tag>
              <div style={{ color:WHITE, fontWeight:600, fontSize:"14px", margin:"8px 0 9px" }}>{f.titulo}</div>
              {f.items.map((item,i) => <div key={i} style={{ color:MUTED, fontSize:"11px", marginBottom:"4px" }}>· {item}</div>)}
            </div>
          ))}
        </div>
      </Card>

      {/* Zona de perigo */}
      <Card>
        <h3 style={{ color:RED, fontWeight:600, fontSize:"15px", marginBottom:"14px" }}>⚠️ Zona de Perigo</h3>
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          <Btn variant="danger" onClick={resetFuncs}>🔄 Repor Funções</Btn>
          <Btn variant="danger" onClick={resetPlugins}>🔄 Repor Plugins</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ── Página Admin (container das tabs) ── */
function PageAdmin({ goto, apiKey, setApiKey, functions, setFunctions, plugins, setPlugins }) {
  const [tab, setTab] = useState("overview");

  const TABS = [
    { id:"overview",  icon:"📊", label:"Visão Geral" },
    { id:"functions", icon:"⚡", label:"Funções" },
    { id:"plugins",   icon:"🔌", label:"Plugins / APIs" },
    { id:"settings",  icon:"⚙️", label:"Configurações" },
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:`linear-gradient(155deg,${NAVY} 0%,#0f2035 100%)` }}>
      {/* ── HEADER ── */}
      <PageHeader
        left={
          <>
            <Btn sm variant="ghost" onClick={() => goto("home")}>← Início</Btn>
            <Divider />
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:WHITE, letterSpacing:".07em" }}>
              ⚙️ PAINEL ADMINISTRATIVO
            </span>
          </>
        }
        right={
          <Btn sm onClick={() => goto("chat")}>🎩 Ir para o Chat</Btn>
        }
      />

      {/* ── BODY: sidebar + conteúdo ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* sidebar */}
        <div style={{
          width:"190px", flexShrink:0, borderRight:`1px solid ${BORDER}`,
          padding:"16px 11px", display:"flex", flexDirection:"column", gap:"3px",
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab===t.id ? "rgba(46,125,200,.2)" : "transparent",
                border: tab===t.id ? `1px solid ${ACCENT}33` : "1px solid transparent",
                borderRadius:"9px", padding:"9px 13px",
                color: tab===t.id ? WHITE : MUTED,
                textAlign:"left", fontSize:"13px",
                display:"flex", alignItems:"center", gap:"8px",
                fontWeight: tab===t.id ? 600 : 400,
                transition:"all .18s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}

          {/* spacer + API status */}
          <div style={{ flex:1 }}/>
          <div style={{ padding:"11px", background:"rgba(255,255,255,.04)", borderRadius:"9px", border:`1px solid ${BORDER}` }}>
            <div style={{ fontSize:"10px", color:MUTED, letterSpacing:".07em", marginBottom:"4px" }}>API KEY</div>
            <div style={{ fontSize:"12px", color: apiKey ? GREEN : RED, fontWeight:600 }}>
              {apiKey ? "✅ Configurada" : "⚠️ Não definida"}
            </div>
          </div>
        </div>

        {/* conteúdo da tab */}
        <div style={{ flex:1, overflowY:"auto", padding:"26px" }}>
          {tab === "overview"  && <TabOverview  functions={functions} plugins={plugins} />}
          {tab === "functions" && <TabFunctions functions={functions} setFunctions={setFunctions} />}
          {tab === "plugins"   && <TabPlugins   plugins={plugins}     setPlugins={setPlugins} />}
          {tab === "settings"  && <TabSettings  apiKey={apiKey} setApiKey={setApiKey} setFunctions={setFunctions} setPlugins={setPlugins} />}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT — router simples, estado global isolado aqui
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page,      setPage]      = useState("home");      // "home" | "chat" | "admin"
  const [apiKey,    setApiKey]    = useState("");
  const [functions, setFunctions] = useState(() => [...DEF_FUNCS]);
  const [plugins,   setPlugins]   = useState(() => [...DEF_PLUGINS]);

  // goto é a única forma de mudar de página — explícito e rastreável
  const goto = useCallback((p) => setPage(p), []);

  return (
    <div style={{ height:"100vh", overflow:"hidden" }}>
      <GlobalStyles />
      {page === "home"  && <PageHome  goto={goto} />}
      {page === "chat"  && <PageChat  goto={goto} apiKey={apiKey} functions={functions} plugins={plugins} />}
      {page === "admin" && <PageAdmin goto={goto} apiKey={apiKey} setApiKey={setApiKey} functions={functions} setFunctions={setFunctions} plugins={plugins} setPlugins={setPlugins} />}
    </div>
  );
}
