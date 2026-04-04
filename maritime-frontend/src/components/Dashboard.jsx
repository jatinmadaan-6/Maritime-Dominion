import { useState, useEffect } from "react";

const API = "http://localhost:3000";

function apiCall(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  return fetch(`${API}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  }).then((r) => r.json());
}

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("vessels");
  const [vessels, setVessels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [captains, setCaptains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passport, setPassport] = useState(null);

  const [vesselForm, setVesselForm] = useState({ name: "", imo_number: "", flag_state: "", type: "" });
  const [vesselMsg, setVesselMsg] = useState("");

  const [logForm, setLogForm] = useState({ vessel_id: "", sulfur_level: "", waste_amount: "" });
  const [logMsg, setLogMsg] = useState("");

  const [captainForm, setCaptainForm] = useState({ name: "", license_number: "", nationality: "" });
  const [captainMsg, setCaptainMsg] = useState("");

  const [assignForm, setAssignForm] = useState({ captain_id: "", vessel_id: "", start_date: "" });
  const [assignMsg, setAssignMsg] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [v, l, c] = await Promise.all([
      apiCall("/vessels"),
      apiCall("/logs"),
      apiCall("/captains"),
    ]);
    setVessels(Array.isArray(v) ? v : []);
    setLogs(Array.isArray(l) ? l : []);
    setCaptains(Array.isArray(c) ? c : []);
    setLoading(false);
  };

  const openPassport = async (vesselId) => {
    setPassport("loading");
    const data = await apiCall(`/vessel-passport/${vesselId}`);
    setPassport(data);
  };

  const addVessel = async () => {
    if (!vesselForm.name || !vesselForm.imo_number) { setVesselMsg("Name and IMO number are required."); return; }
    const res = await apiCall("/add-vessel", "POST", vesselForm);
    if (res.id || res.message === "Vessel added") {
      setVesselMsg("✓ Vessel added successfully");
      setVesselForm({ name: "", imo_number: "", flag_state: "", type: "" });
      fetchAll();
    } else { setVesselMsg(res.message || "Error adding vessel"); }
  };

  const addLog = async () => {
    if (!logForm.vessel_id || !logForm.sulfur_level || !logForm.waste_amount) { setLogMsg("All fields are required."); return; }
    const res = await apiCall("/add-log", "POST", {
      vessel_id: parseInt(logForm.vessel_id),
      sulfur_level: parseFloat(logForm.sulfur_level),
      waste_amount: parseFloat(logForm.waste_amount),
    });
    if (res.id || res.message === "Log added") {
      setLogMsg("✓ Log added successfully");
      setLogForm({ vessel_id: "", sulfur_level: "", waste_amount: "" });
      fetchAll();
    } else { setLogMsg(res.message || "Error adding log"); }
  };

  const addCaptain = async () => {
    if (!captainForm.name) { setCaptainMsg("Name is required."); return; }
    const res = await apiCall("/add-captain", "POST", captainForm);
    if (res.id || res.message === "Captain added") {
      setCaptainMsg("✓ Captain registered successfully");
      setCaptainForm({ name: "", license_number: "", nationality: "" });
      fetchAll();
    } else { setCaptainMsg(res.message || "Error adding captain"); }
  };

  const assignCaptain = async () => {
    if (!assignForm.captain_id || !assignForm.vessel_id || !assignForm.start_date) {
      setAssignMsg("All fields are required."); return;
    }
    const res = await apiCall("/assign-captain", "POST", {
      captain_id: parseInt(assignForm.captain_id),
      vessel_id: parseInt(assignForm.vessel_id),
      start_date: assignForm.start_date,
    });
    if (res.id || res.message === "Captain assigned") {
      setAssignMsg("✓ Captain assigned successfully");
      setAssignForm({ captain_id: "", vessel_id: "", start_date: "" });
    } else { setAssignMsg(res.message || "Error assigning captain"); }
  };

  const violations = logs.filter((l) => l.violation);

  if (passport) {
    return <PassportView passport={passport} onBack={() => setPassport(null)} onLogout={onLogout} user={user} />;
  }

  const navItems = [
    { id: "vessels",     label: "Fleet",            icon: "⚓", group: "FLEET" },
    { id: "addVessel",   label: "Add Vessel",        icon: "＋", group: "FLEET" },
    { id: "captains",    label: "Commanders",        icon: "👤", group: "CREW" },
    { id: "addCaptain",  label: "Register Captain",  icon: "＋", group: "CREW" },
    { id: "assignCaptain", label: "Assign Captain",  icon: "↔", group: "CREW" },
    { id: "logs",        label: "Compliance Logs",   icon: "📋", group: "COMPLIANCE" },
    { id: "addLog",      label: "Add Log",           icon: "＋", group: "COMPLIANCE" },
    { id: "violations",  label: "Violations",        icon: "⚠", group: "COMPLIANCE" },
  ];

  const groups = ["FLEET", "CREW", "COMPLIANCE"];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#030912", fontFamily: "'Sora', sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Sora:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── SIDEBAR ── */}
      <div style={{ width: "240px", minWidth: "240px", background: "#040e24", borderRight: "1px solid rgba(180,150,80,0.15)", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "18px", height: "18px", border: "1.5px solid #b49650", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "6px", height: "6px", background: "#b49650" }} />
            </div>
            <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Maritime</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#b49650", paddingLeft: "28px" }}>Dominion</div>
        </div>

        {/* User */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>SIGNED IN AS</div>
          <div style={{ fontSize: "13px" }}>{user?.name}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{user?.email}</div>
        </div>

        {/* Nav — grouped */}
        <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
          {groups.map(group => (
            <div key={group}>
              <div style={{ padding: "12px 24px 6px", fontSize: "9px", letterSpacing: "3px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                {group}
              </div>
              {navItems.filter(i => i.group === group).map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                  width: "100%", padding: "10px 24px",
                  background: activeTab === item.id ? "rgba(180,150,80,0.1)" : "transparent",
                  border: "none",
                  borderLeft: activeTab === item.id ? "2px solid #b49650" : "2px solid transparent",
                  color: activeTab === item.id ? "#b49650" : "rgba(255,255,255,0.45)",
                  fontSize: "12px", letterSpacing: "1px", textAlign: "left",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: "13px" }}>{item.icon}</span>
                  {item.label}
                  {item.id === "violations" && violations.length > 0 && (
                    <span style={{ marginLeft: "auto", background: "#c0392b", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>
                      {violations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(180,150,80,0.1)" }}>
          <button onClick={onLogout} style={{
            width: "100%", padding: "10px", background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)",
            fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#b49650"; e.target.style.color = "#b49650"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(255,255,255,0.4)"; }}
          >Sign Out</button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>
        <PageHeader activeTab={activeTab} />
        {loading && <Loader />}

        {/* FLEET */}
        {!loading && activeTab === "vessels" && (
          <div>
            <StatsRow vessels={vessels} logs={logs} violations={violations} captains={captains} />
            {vessels.length === 0 ? (
              <Empty message="No vessels registered yet." action="Add Vessel" onAction={() => setActiveTab("addVessel")} />
            ) : (
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", marginBottom: "12px" }}>
                  Click any vessel to view its passport
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr>
                      {["ID", "Name", "IMO Number", "Flag State", "Type", ""].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(180,150,80,0.15)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vessels.map((v) => (
                      <tr key={v.id} onClick={() => openPassport(v.id)}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(180,150,80,0.06)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "16px", color: "rgba(255,255,255,0.3)" }}>{v.id}</td>
                        <td style={{ padding: "16px", fontWeight: 500 }}>{v.name}</td>
                        <td style={{ padding: "16px", color: "#b49650", fontFamily: "monospace" }}>{v.imo_number}</td>
                        <td style={{ padding: "16px" }}>{v.flag_state || "—"}</td>
                        <td style={{ padding: "16px" }}>{v.type || "—"}</td>
                        <td style={{ padding: "16px", color: "rgba(180,150,80,0.6)", fontSize: "11px", letterSpacing: "1px" }}>VIEW PASSPORT →</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD VESSEL */}
        {activeTab === "addVessel" && (
          <Form
            fields={[
              { label: "Vessel Name", key: "name", placeholder: "MV Aurora" },
              { label: "IMO Number", key: "imo_number", placeholder: "IMO9876543" },
              { label: "Flag State", key: "flag_state", placeholder: "Panama" },
              { label: "Vessel Type", key: "type", placeholder: "Cargo / Tanker / Bulk Carrier" },
            ]}
            values={vesselForm}
            onChange={(k, v) => setVesselForm({ ...vesselForm, [k]: v })}
            onSubmit={addVessel} message={vesselMsg} submitLabel="Register Vessel"
          />
        )}

        {/* CAPTAINS */}
        {!loading && activeTab === "captains" && (
          captains.length === 0 ? (
            <Empty message="No captains registered yet." action="Register Captain" onAction={() => setActiveTab("addCaptain")} />
          ) : (
            <Table
              headers={["ID", "Name", "License Number", "Nationality"]}
              rows={captains.map(c => [c.id, c.name, c.license_number || "—", c.nationality || "—"])}
            />
          )
        )}

        {/* ADD CAPTAIN */}
        {activeTab === "addCaptain" && (
          <Form
            fields={[
              { label: "Full Name", key: "name", placeholder: "Capt. Raj Malhotra" },
              { label: "License Number", key: "license_number", placeholder: "LIC-001" },
              { label: "Nationality", key: "nationality", placeholder: "Indian" },
            ]}
            values={captainForm}
            onChange={(k, v) => setCaptainForm({ ...captainForm, [k]: v })}
            onSubmit={addCaptain} message={captainMsg} submitLabel="Register Captain"
          />
        )}

        {/* ASSIGN CAPTAIN */}
        {activeTab === "assignCaptain" && (
          <div>
            <div style={{ marginBottom: "24px", padding: "16px 20px", background: "rgba(180,150,80,0.05)", border: "1px solid rgba(180,150,80,0.15)", fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              <strong style={{ color: "#b49650" }}>Note:</strong> Assigning a new captain automatically closes the previous captain's assignment for that vessel.
            </div>
            <Form
              fields={[
                { label: "Captain", key: "captain_id", type: "select", options: captains.map(c => ({ value: c.id, label: `${c.name} (${c.license_number || "No license"})` })) },
                { label: "Vessel", key: "vessel_id", type: "select", options: vessels.map(v => ({ value: v.id, label: `${v.name} (${v.imo_number})` })) },
                { label: "Start Date", key: "start_date", type: "date" },
              ]}
              values={assignForm}
              onChange={(k, v) => setAssignForm({ ...assignForm, [k]: v })}
              onSubmit={assignCaptain} message={assignMsg} submitLabel="Assign Captain"
            />
          </div>
        )}

        {/* LOGS */}
        {!loading && activeTab === "logs" && (
          logs.length === 0 ? (
            <Empty message="No logs yet." action="Add Log" onAction={() => setActiveTab("addLog")} />
          ) : (
            <Table
              headers={["ID", "Vessel", "Sulfur Level", "Waste (t)", "Violation", "Timestamp"]}
              rows={logs.map(l => [
                l.id, l.vessel_name || `Vessel #${l.vessel_id}`,
                `${l.sulfur_level}%`, l.waste_amount,
                l.violation ? <span style={{ color: "#e74c3c", fontWeight: 600 }}>YES</span> : <span style={{ color: "#2ecc71" }}>NO</span>,
                new Date(l.timestamp).toLocaleString(),
              ])}
            />
          )
        )}

        {/* ADD LOG */}
        {activeTab === "addLog" && (
          <div>
            <div style={{ marginBottom: "24px", padding: "16px 20px", background: "rgba(180,150,80,0.05)", border: "1px solid rgba(180,150,80,0.15)", fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              <strong style={{ color: "#b49650" }}>IMO 2020 Rule:</strong> Sulfur level above 0.5% is automatically flagged as a violation.
            </div>
            <Form
              fields={[
                { label: "Vessel", key: "vessel_id", type: "select", options: vessels.map(v => ({ value: v.id, label: `${v.name} (${v.imo_number})` })) },
                { label: "Sulfur Level (%)", key: "sulfur_level", placeholder: "0.3", type: "number" },
                { label: "Waste Amount (tonnes)", key: "waste_amount", placeholder: "40", type: "number" },
              ]}
              values={logForm}
              onChange={(k, v) => setLogForm({ ...logForm, [k]: v })}
              onSubmit={addLog} message={logMsg} submitLabel="Submit Log"
            />
          </div>
        )}

        {/* VIOLATIONS */}
        {!loading && activeTab === "violations" && (
          violations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#2ecc71", fontSize: "16px" }}>
              ✓ No violations detected. Full compliance.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "24px", padding: "16px 20px", background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.25)", color: "#e74c3c", fontSize: "12px" }}>
                ⚠ {violations.length} violation{violations.length > 1 ? "s" : ""} detected. Sulfur levels exceeded IMO 2020 limit of 0.5%.
              </div>
              <Table
                headers={["Log ID", "Vessel", "Sulfur Level", "Waste (t)", "Timestamp"]}
                rows={violations.map(l => [
                  l.id, l.vessel_name || `Vessel #${l.vessel_id}`,
                  <span style={{ color: "#e74c3c", fontWeight: 600 }}>{l.sulfur_level}%</span>,
                  l.waste_amount, new Date(l.timestamp).toLocaleString(),
                ])}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}

// ── PASSPORT PAGE ──────────────────────────────────────────────────────────────
function PassportView({ passport, onBack, onLogout, user }) {
  if (passport === "loading") {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#030912", color: "rgba(255,255,255,0.3)", letterSpacing: "3px", fontFamily: "'Sora', sans-serif" }}>LOADING PASSPORT...</div>;
  }

  const { vessel, captains, logs } = passport;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentViolations = (logs || []).filter(l => l.violation && new Date(l.timestamp) >= thirtyDaysAgo);
  const maxSulfur = logs?.length > 0 ? Math.max(...logs.map(l => l.sulfur_level)) : 0;
  const maxWaste = logs?.length > 0 ? Math.max(...logs.map(l => l.waste_amount)) : 0;
  const activeCaptain = captains?.find(c => !c.end_date);

  const checks = [
    { label: "Sulfur Compliance", description: "IMO 2020 — Max 0.5% sulfur", pass: maxSulfur <= 0.5, detail: logs?.length === 0 ? "No logs recorded" : `Highest recorded: ${maxSulfur}%` },
    { label: "Waste Disposal", description: "Max 100 tonnes per entry", pass: maxWaste <= 100, detail: logs?.length === 0 ? "No logs recorded" : `Highest recorded: ${maxWaste}t` },
    { label: "Violation History", description: "Max 2 violations in 30 days", pass: recentViolations.length <= 2, detail: `${recentViolations.length} violation${recentViolations.length !== 1 ? "s" : ""} in last 30 days` },
    { label: "Active Commander", description: "Vessel must have assigned captain", pass: !!activeCaptain, detail: activeCaptain ? activeCaptain.name : "No active captain assigned" },
  ];

  const allPass = checks.every(c => c.pass);
  const issueDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#030912", fontFamily: "'Sora', sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Sora:wght@300;400;500&display=swap" rel="stylesheet" />

      <div style={{ width: "240px", minWidth: "240px", background: "#040e24", borderRight: "1px solid rgba(180,150,80,0.15)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "18px", height: "18px", border: "1.5px solid #b49650", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "6px", height: "6px", background: "#b49650" }} />
            </div>
            <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Maritime</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#b49650", paddingLeft: "28px" }}>Dominion</div>
        </div>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>SIGNED IN AS</div>
          <div style={{ fontSize: "13px" }}>{user?.name}</div>
        </div>
        <div style={{ flex: 1, padding: "24px" }}>
          <button onClick={onBack} style={{ width: "100%", padding: "12px 16px", background: "rgba(180,150,80,0.08)", border: "1px solid rgba(180,150,80,0.2)", color: "#b49650", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", textAlign: "left" }}>
            ← Back to Fleet
          </button>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(180,150,80,0.1)" }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "40px 60px" }}>
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#b49650", marginBottom: "8px" }}>VESSEL PASSPORT</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "48px", fontWeight: 400, margin: 0 }}>{vessel.name}</h1>
            <div style={{ fontFamily: "monospace", fontSize: "14px", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>{vessel.imo_number}</div>
          </div>
          <div style={{ padding: "20px 32px", background: allPass ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)", border: `2px solid ${allPass ? "#2ecc71" : "#e74c3c"}`, textAlign: "center" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>PORT ENTRY</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 700, color: allPass ? "#2ecc71" : "#e74c3c", letterSpacing: "2px" }}>
              {allPass ? "GRANTED" : "DENIED"}
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "8px" }}>Issued: {issueDate}</div>
          </div>
        </div>

        <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(180,150,80,0.4), transparent)", marginBottom: "40px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Section title="Vessel Details">
              <InfoRow label="Name" value={vessel.name} />
              <InfoRow label="IMO Number" value={vessel.imo_number} mono />
              <InfoRow label="Flag State" value={vessel.flag_state || "Not specified"} />
              <InfoRow label="Type" value={vessel.type || "Not specified"} />
            </Section>

            <Section title="Current Commander">
              {activeCaptain ? (
                <>
                  <InfoRow label="Name" value={activeCaptain.name} />
                  <InfoRow label="License" value={activeCaptain.license_number || "—"} mono />
                  <InfoRow label="Nationality" value={activeCaptain.nationality || "—"} />
                  <InfoRow label="In Command Since" value={new Date(activeCaptain.start_date).toLocaleDateString()} />
                </>
              ) : (
                <div style={{ color: "#e74c3c", fontSize: "13px" }}>⚠ No active captain assigned</div>
              )}
            </Section>

            {captains && captains.filter(c => c.end_date).length > 0 && (
              <Section title="Command History">
                {captains.filter(c => c.end_date).map((c, i) => (
                  <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "13px", marginBottom: "4px" }}>{c.name}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      {new Date(c.start_date).toLocaleDateString()} — {new Date(c.end_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Section title="Compliance Assessment">
              {checks.map((check, i) => (
                <div key={i} style={{ padding: "16px", marginBottom: "8px", background: check.pass ? "rgba(46,204,113,0.04)" : "rgba(231,76,60,0.06)", border: `1px solid ${check.pass ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.2)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500 }}>{check.label}</span>
                    <span style={{ fontSize: "10px", letterSpacing: "2px", fontWeight: 700, color: check.pass ? "#2ecc71" : "#e74c3c" }}>{check.pass ? "✓ PASS" : "✗ FAIL"}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "2px" }}>{check.description}</div>
                  <div style={{ fontSize: "11px", color: check.pass ? "rgba(255,255,255,0.4)" : "#e74c3c" }}>{check.detail}</div>
                </div>
              ))}
            </Section>

            <Section title="Recent Log Entries">
              {!logs || logs.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>No logs recorded for this vessel.</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr>
                      {["Sulfur", "Waste", "Status", "Date"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 12px", color: l.sulfur_level > 0.5 ? "#e74c3c" : "#fff" }}>{l.sulfur_level}%</td>
                        <td style={{ padding: "10px 12px" }}>{l.waste_amount}t</td>
                        <td style={{ padding: "10px 12px" }}>
                          {l.violation ? <span style={{ color: "#e74c3c", fontSize: "10px" }}>VIOLATION</span> : <span style={{ color: "#2ecc71", fontSize: "10px" }}>CLEAN</span>}
                        </td>
                        <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>{new Date(l.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────────
function PageHeader({ activeTab }) {
  const map = {
    vessels: ["FLEET MANAGEMENT", "Your Fleet"],
    addVessel: ["FLEET MANAGEMENT", "Register Vessel"],
    captains: ["CREW MANAGEMENT", "Commanders"],
    addCaptain: ["CREW MANAGEMENT", "Register Captain"],
    assignCaptain: ["CREW MANAGEMENT", "Assign Captain"],
    logs: ["COMPLIANCE", "Compliance Logs"],
    addLog: ["COMPLIANCE", "Add Log Entry"],
    violations: ["ALERTS", "Violations"],
  };
  const [sub, title] = map[activeTab] || ["", ""];
  return (
    <div style={{ marginBottom: "40px", borderBottom: "1px solid rgba(180,150,80,0.1)", paddingBottom: "24px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#b49650", marginBottom: "8px" }}>{sub}</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 400, margin: 0 }}>{title}</h1>
    </div>
  );
}

function StatsRow({ vessels, logs, violations, captains }) {
  const rate = logs.length ? `${Math.round(((logs.length - violations.length) / logs.length) * 100)}%` : "N/A";
  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
      {[
        { label: "Total Vessels", value: vessels.length },
        { label: "Captains", value: captains.length },
        { label: "Violations", value: violations.length },
        { label: "Compliance Rate", value: rate },
      ].map(stat => (
        <div key={stat.label} style={{ flex: 1, padding: "20px 24px", background: "#040e24", border: "1px solid rgba(180,150,80,0.1)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#b49650", marginBottom: "4px" }}>{stat.value}</div>
          <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "#040e24", border: "1px solid rgba(180,150,80,0.1)", padding: "24px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#b49650", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px" }}>{label}</span>
      <span style={{ fontSize: "13px", fontFamily: mono ? "monospace" : "inherit", color: "#fff" }}>{value}</span>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(180,150,80,0.15)" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(180,150,80,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, j) => <td key={j} style={{ padding: "14px 16px", color: j === 0 ? "rgba(255,255,255,0.3)" : "#fff" }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Form({ fields, values, onChange, onSubmit, message, submitLabel }) {
  return (
    <div style={{ maxWidth: "480px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {fields.map(field => (
          <div key={field.key}>
            <label style={{ display: "block", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>{field.label}</label>
            {field.type === "select" ? (
              <select value={values[field.key]} onChange={e => onChange(field.key, e.target.value)}
                style={{ width: "100%", padding: "12px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "14px", fontFamily: "'Sora', sans-serif", outline: "none" }}>
                <option value="" style={{ background: "#030912" }}>Select...</option>
                {field.options?.map(o => <option key={o.value} value={o.value} style={{ background: "#030912" }}>{o.label}</option>)}
              </select>
            ) : (
              <input type={field.type || "text"} placeholder={field.placeholder} value={values[field.key]} onChange={e => onChange(field.key, e.target.value)}
                style={{ width: "100%", padding: "12px 0", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "14px", fontFamily: "'Sora', sans-serif", outline: "none", boxSizing: "border-box" }} />
            )}
          </div>
        ))}
      </div>
      {message && (
        <div style={{ marginTop: "20px", padding: "12px 16px", background: message.startsWith("✓") ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)", border: `1px solid ${message.startsWith("✓") ? "rgba(46,204,113,0.25)" : "rgba(231,76,60,0.25)"}`, color: message.startsWith("✓") ? "#2ecc71" : "#e74c3c", fontSize: "12px" }}>
          {message}
        </div>
      )}
      <button onClick={onSubmit} style={{ marginTop: "32px", padding: "14px 40px", background: "#b49650", border: "none", color: "#000", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}
        onMouseEnter={e => e.target.style.background = "#c9ab5f"}
        onMouseLeave={e => e.target.style.background = "#b49650"}
      >{submitLabel}</button>
    </div>
  );
}

function Empty({ message, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px", marginBottom: "20px" }}>{message}</div>
      <button onClick={onAction} style={{ padding: "12px 32px", background: "transparent", border: "1px solid #b49650", color: "#b49650", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>{action}</button>
    </div>
  );
}

function Loader() {
  return <div style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "2px", fontSize: "12px" }}>LOADING...</div>;
}