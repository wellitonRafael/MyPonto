import { useState, useRef, useEffect } from "react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type TimeRecord = { entry?: string; exit?: string };
type Records = Record<string, TimeRecord>;

type DayMenuState = {
  day: number;
  x: number;
  y: number;
} | null;

type ProfileMenuOpen = boolean;

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getNow() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function App() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [records, setRecords] = useState<Records>({});
  const [dayMenu, setDayMenu] = useState<DayMenuState>(null);
  const [profileOpen, setProfileOpen] = useState<ProfileMenuOpen>(false);
  const [activeModal, setActiveModal] = useState<null | "perfil" | "configuracoes" | "lembretes">(null);
  const [toast, setToast] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState("");
  const [pendingAction, setPendingAction] = useState<null | { key: string; type: "entry" | "exit" }>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const dayMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (dayMenuRef.current && !dayMenuRef.current.contains(e.target as Node)) {
        setDayMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function handleDayClick(day: number, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const rootRect = document.getElementById("root")!.getBoundingClientRect();
    let x = rect.left - rootRect.left;
    let y = rect.bottom - rootRect.top + 8;
    if (x + 220 > rootRect.width) x = rootRect.width - 228;
    if (y + 120 > rootRect.height) y = rect.top - rootRect.top - 128;
    setDayMenu({ day, x, y });
    setProfileOpen(false);
  }

  function handleRegister(type: "entry" | "exit") {
    if (!dayMenu) return;
    const key = formatDateKey(viewYear, viewMonth, dayMenu.day);
    setTimeInput(getNow());
    setPendingAction({ key, type });
    setDayMenu(null);
  }

  function confirmTime() {
    if (!pendingAction || !timeInput) return;
    setRecords((prev) => ({
      ...prev,
      [pendingAction.key]: {
        ...prev[pendingAction.key],
        [pendingAction.type === "entry" ? "entry" : "exit"]: timeInput,
      },
    }));
    showToast(
      pendingAction.type === "entry"
        ? `Entrada registrada: ${timeInput}`
        : `Saída registrada: ${timeInput}`
    );
    setPendingAction(null);
    setTimeInput("");
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  return (
    <div className="min-h-full flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* TOP BAR */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            P
          </div>
          <span className="font-semibold tracking-tight" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem" }}>
            PontoApp
          </span>
        </div>

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((o) => !o); setDayMenu(null); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
            style={{
              background: profileOpen ? "var(--muted)" : "transparent",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              MR
            </div>
            <span className="text-sm font-medium hidden sm:block">Marina Rocha</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-lg shadow-lg border z-50 overflow-hidden"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Conectado como</p>
                <p className="text-sm font-semibold">marina.rocha@empresa.com</p>
              </div>
              {[
                { label: "Editar Perfil", icon: "👤", key: "perfil" as const },
                { label: "Configurações", icon: "⚙️", key: "configuracoes" as const },
                { label: "Lembretes", icon: "🔔", key: "lembretes" as const },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActiveModal(item.key); setProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-[var(--muted)]"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex items-start justify-center p-6 sm:p-10">
        <div
          className="w-full max-w-2xl rounded-2xl shadow-sm border overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Calendar header */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div>
              <h2
                className="text-2xl font-bold leading-none"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {MONTHS[viewMonth]}
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{viewYear}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
                className="px-3 h-9 rounded-lg text-xs font-semibold border transition-colors hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                Hoje
              </button>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border)" }}>
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center py-3 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              if (!day) return (
                <div key={`empty-${idx}`} className="border-b border-r last:border-r-0 h-16"
                  style={{ borderColor: "var(--border)" }} />
              );
              const key = formatDateKey(viewYear, viewMonth, day);
              const rec = records[key];
              const today_ = isToday(day);
              return (
                <button
                  key={key}
                  onClick={(e) => handleDayClick(day, e)}
                  className="relative h-16 flex flex-col items-center justify-start pt-2 border-b border-r last:border-r-0 transition-colors hover:bg-[var(--muted)] group"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors"
                    style={
                      today_
                        ? { background: "var(--accent)", color: "var(--accent-foreground)" }
                        : {}
                    }
                  >
                    {day}
                  </span>
                  {(rec?.entry || rec?.exit) && (
                    <div className="flex gap-1 mt-1">
                      {rec.entry && (
                        <span
                          className="text-[9px] font-semibold px-1 rounded"
                          style={{ background: "#d1fae5", color: "#065f46" }}
                        >
                          ↑{rec.entry}
                        </span>
                      )}
                      {rec.exit && (
                        <span
                          className="text-[9px] font-semibold px-1 rounded"
                          style={{ background: "#fee2e2", color: "#991b1b" }}
                        >
                          ↓{rec.exit}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-6 py-3 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="w-3 h-3 rounded" style={{ background: "#d1fae5" }} />
              Entrada
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="w-3 h-3 rounded" style={{ background: "#fee2e2" }} />
              Saída
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="w-3 h-3 rounded" style={{ background: "var(--accent)" }} />
              Hoje
            </div>
          </div>
        </div>
      </main>

      {/* DAY CONTEXT MENU */}
      {dayMenu && (
        <div
          ref={dayMenuRef}
          className="fixed z-50 w-52 rounded-xl shadow-xl border overflow-hidden"
          style={{
            left: dayMenu.x,
            top: dayMenu.y,
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              {String(dayMenu.day).padStart(2, "0")} de {MONTHS[viewMonth]}
            </p>
          </div>
          <button
            onClick={() => handleRegister("entry")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-[var(--muted)]"
          >
            <span className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{ background: "#d1fae5", color: "#065f46" }}>↑</span>
            Registrar Entrada
          </button>
          <button
            onClick={() => handleRegister("exit")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-[var(--muted)]"
          >
            <span className="w-6 h-6 rounded flex items-center justify-center text-xs" style={{ background: "#fee2e2", color: "#991b1b" }}>↓</span>
            Registrar Saída
          </button>
        </div>
      )}

      {/* TIME INPUT MODAL */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div
            className="rounded-2xl shadow-2xl border w-80 overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-semibold text-base" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {pendingAction.type === "entry" ? "Registrar Entrada" : "Registrar Saída"}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {MONTHS[viewMonth]}, {pendingAction.key.split("-")[2]}
              </p>
            </div>
            <div className="px-6 py-5">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
                Horário
              </label>
              <input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm font-mono outline-none transition-colors"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--muted)",
                  color: "var(--foreground)",
                }}
                autoFocus
              />
            </div>
            <div className="flex gap-2 px-6 pb-5">
              <button
                onClick={() => { setPendingAction(null); setTimeInput(""); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[var(--muted)]"
                style={{ borderColor: "var(--border)" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmTime}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div
            className="rounded-2xl shadow-2xl border w-96 overflow-hidden"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-semibold text-base" style={{ fontFamily: "'DM Serif Display', serif" }}>
                {activeModal === "perfil" ? "Editar Perfil" : activeModal === "configuracoes" ? "Configurações" : "Lembretes"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--muted)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              {activeModal === "perfil" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>MR</div>
                    <div>
                      <p className="font-semibold">Marina Rocha</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Analista de Sistemas</p>
                    </div>
                  </div>
                  {["Nome completo", "Cargo", "E-mail"].map((label, i) => (
                    <div key={label}>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>{label}</label>
                      <input
                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                        style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--foreground)" }}
                        defaultValue={["Marina Rocha", "Analista de Sistemas", "marina.rocha@empresa.com"][i]}
                      />
                    </div>
                  ))}
                </div>
              )}
              {activeModal === "configuracoes" && (
                <div className="space-y-4">
                  {[
                    { label: "Notificações por e-mail", desc: "Receber resumo semanal de ponto" },
                    { label: "Modo escuro", desc: "Interface com fundo escuro" },
                    { label: "Confirmar registros", desc: "Exibir diálogo antes de salvar" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
                      </div>
                      <div className="w-10 h-6 rounded-full cursor-pointer relative" style={{ background: "var(--accent)" }}>
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeModal === "lembretes" && (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--muted-foreground)" }}>Lembretes ativos</p>
                  {[
                    { hora: "08:00", label: "Lembrete de entrada", dias: "Seg–Sex" },
                    { hora: "18:00", label: "Lembrete de saída", dias: "Seg–Sex" },
                    { hora: "12:00", label: "Intervalo de almoço", dias: "Todos os dias" },
                  ].map((r) => (
                    <div
                      key={r.hora}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border"
                      style={{ borderColor: "var(--border)", background: "var(--muted)" }}
                    >
                      <div>
                        <p className="text-sm font-semibold font-mono">{r.hora}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{r.label} · {r.dias}</p>
                      </div>
                      <div className="w-10 h-6 rounded-full cursor-pointer relative" style={{ background: "var(--accent)" }}>
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 pb-5">
              <button
                onClick={() => { setActiveModal(null); showToast("Alterações salvas."); }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
