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
  const [loading, setLoading] = useState(true);

  // Add vessel form
  const [vesselForm, setVesselForm] = useState({ name: "", imo_number: "", flag_state: "", type: "" });
  const [vesselMsg, setVesselMsg] = useState("");

  // Add log form
  const [logForm, setLogForm] = useState({ vessel_id: "", sulfur_level: "", waste_amount: "" });
  const [logMsg, setLogMsg] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [v, l] = await Promise.all([
      apiCall("/vessels"),
      apiCall("/logs"),
    ]);
    setVessels(Array.isArray(v) ? v : []);
    setLogs(Array.isArray(l) ? l : []);
    setLoading(false);
  };

  const addVessel = async () => {
    if (!vesselForm.name || !vesselForm.imo_number) {
      setVesselMsg("Name and IMO number are required.");
      return;
    }
    const res = await apiCall("/add-vessel", "POST", vesselForm);
    if (res.id || res.message === "Vessel added") {
      setVesselMsg("✓ Vessel added successfully");
      setVesselForm({ name: "", imo_number: "", flag_state: "", type: "" });
      fetchAll();
    } else {
      setVesselMsg(res.message || "Error adding vessel");
    }
  };

  const addLog = async () => {
    if (!logForm.vessel_id || !logForm.sulfur_level || !logForm.waste_amount) {
      setLogMsg("All fields are required.");
      return;
    }
    const res = await apiCall("/add-log", "POST", {
      vessel_id: parseInt(logForm.vessel_id),
      sulfur_level: parseFloat(logForm.sulfur_level),
      waste_amount: parseFloat(logForm.waste_amount),
    });
    if (res.id || res.message === "Log added") {
      setLogMsg("✓ Log added successfully");
      setLogForm({ vessel_id: "", sulfur_level: "", waste_amount: "" });
      fetchAll();
    } else {
      setLogMsg(res.message || "Error adding log");
    }
  };

  const violations = logs.filter((l) => l.violation);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#030912", fontFamily: "'Sora', sans-serif", color: "#fff" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Sora:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* ── SIDEBAR ── */}
      <div style={{
        width: "240px", minWidth: "240px",
        background: "#040e24",
        borderRight: "1px solid rgba(180,150,80,0.15)",
        display: "flex", flexDirection: "column",
        padding: "0",
      }}>
        {/* Logo */}
        <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{
              width: "18px", height: "18px",
              border: "1.5px solid #b49650", transform: "rotate(45deg)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <div style={{ width: "6px", height: "6px", background: "#b49650" }} />
            </div>
            <span style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
              Maritime
            </span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#b49650", paddingLeft: "28px" }}>
            Dominion
          </div>
        </div>

        {/* User */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(180,150,80,0.1)" }}>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", marginBottom: "4px" }}>SIGNED IN AS</div>
          <div style={{ fontSize: "13px", color: "#fff" }}>{user?.name}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{user?.email}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {[
            { id: "vessels", label: "Fleet", icon: "⚓" },
            { id: "addVessel", label: "Add Vessel", icon: "＋" },
            { id: "logs", label: "Compliance Logs", icon: "📋" },
            { id: "addLog", label: "Add Log", icon: "＋" },
            { id: "violations", label: "Violations", icon: "⚠" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: "100%", padding: "12px 24px",
                background: activeTab === item.id ? "rgba(180,150,80,0.1)" : "transparent",
                border: "none",
                borderLeft: activeTab === item.id ? "2px solid #b49650" : "2px solid transparent",
                color: activeTab === item.id ? "#b49650" : "rgba(255,255,255,0.45)",
                fontSize: "12px", letterSpacing: "1px",
                textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "10px",
                transition: "all 0.2s",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === "violations" && violations.length > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#c0392b",
                  color: "#fff", fontSize: "10px",
                  padding: "2px 6px", borderRadius: "10px"
                }}>{violations.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(180,150,80,0.1)" }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%", padding: "10px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
              fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#b49650"; e.target.style.color = "#b49650"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(255,255,255,0.4)"; }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px", borderBottom: "1px solid rgba(180,150,80,0.1)", paddingBottom: "24px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#b49650", marginBottom: "8px" }}>
            {activeTab === "vessels" && "FLEET MANAGEMENT"}
            {activeTab === "addVessel" && "FLEET MANAGEMENT"}
            {activeTab === "logs" && "COMPLIANCE"}
            {activeTab === "addLog" && "COMPLIANCE"}
            {activeTab === "violations" && "ALERTS"}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 400, margin: 0, color: "#fff" }}>
            {activeTab === "vessels" && "Your Fleet"}
            {activeTab === "addVessel" && "Register Vessel"}
            {activeTab === "logs" && "Compliance Logs"}
            {activeTab === "addLog" && "Add Log Entry"}
            {activeTab === "violations" && "Violations"}
          </h1>
        </div>

        {loading && <div style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "2px" }}>LOADING...</div>}

        {/* ── VESSELS TAB ── */}
        {!loading && activeTab === "vessels" && (
          <div>
            {/* Stats */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
              {[
                { label: "Total Vessels", value: vessels.length },
                { label: "Total Logs", value: logs.length },
                { label: "Violations", value: violations.length },
                { label: "Compliance Rate", value: logs.length ? `${Math.round(((logs.length - violations.length) / logs.length) * 100)}%` : "N/A" },
              ].map(stat => (
                <div key={stat.label} style={{
                  flex: 1, padding: "20px 24px",
                  background: "#040e24",
                  border: "1px solid rgba(180,150,80,0.1)",
                }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "32px", color: "#b49650", marginBottom: "4px" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Vessel Table */}
            {vessels.length === 0 ? (
              <Empty message="No vessels registered yet." action="Add Vessel" onAction={() => setActiveTab("addVessel")} />
            ) : (
              <Table
                headers={["ID", "Name", "IMO Number", "Flag State", "Type"]}
                rows={vessels.map(v => [v.id, v.name, v.imo_number, v.flag_state || "—", v.type || "—"])}
              />
            )}
          </div>
        )}

        {/* ── ADD VESSEL TAB ── */}
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
            onSubmit={addVessel}
            message={vesselMsg}
            submitLabel="Register Vessel"
          />
        )}

        {/* ── LOGS TAB ── */}
        {!loading && activeTab === "logs" && (
          <div>
            {logs.length === 0 ? (
              <Empty message="No logs yet." action="Add Log" onAction={() => setActiveTab("addLog")} />
            ) : (
              <Table
                headers={["ID", "Vessel", "Sulfur Level", "Waste (t)", "Violation", "Timestamp"]}
                rows={logs.map(l => [
                  l.id,
                  l.vessel_name || `Vessel #${l.vessel_id}`,
                  l.sulfur_level,
                  l.waste_amount,
                  l.violation ? <span style={{ color: "#e74c3c", fontWeight: 600 }}>YES</span> : <span style={{ color: "#2ecc71" }}>NO</span>,
                  new Date(l.timestamp).toLocaleString(),
                ])}
              />
            )}
          </div>
        )}

        {/* ── ADD LOG TAB ── */}
        {activeTab === "addLog" && (
          <div>
            <div style={{ marginBottom: "24px", padding: "16px 20px", background: "rgba(180,150,80,0.05)", border: "1px solid rgba(180,150,80,0.15)", fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              <strong style={{ color: "#b49650" }}>IMO 2020 Rule:</strong> Sulfur level above 0.5% is automatically flagged as a violation.
            </div>
            <Form
              fields={[
                { label: "Vessel", key: "vessel_id", placeholder: "Vessel ID", type: "select", options: vessels.map(v => ({ value: v.id, label: `${v.name} (${v.imo_number})` })) },
                { label: "Sulfur Level (%)", key: "sulfur_level", placeholder: "0.3", type: "number" },
                { label: "Waste Amount (tonnes)", key: "waste_amount", placeholder: "40", type: "number" },
              ]}
              values={logForm}
              onChange={(k, v) => setLogForm({ ...logForm, [k]: v })}
              onSubmit={addLog}
              message={logMsg}
              submitLabel="Submit Log"
            />
          </div>
        )}

        {/* ── VIOLATIONS TAB ── */}
        {!loading && activeTab === "violations" && (
          <div>
            {violations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#2ecc71", fontSize: "18px" }}>
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
                    l.id,
                    l.vessel_name || `Vessel #${l.vessel_id}`,
                    <span style={{ color: "#e74c3c", fontWeight: 600 }}>{l.sulfur_level}%</span>,
                    l.waste_amount,
                    new Date(l.timestamp).toLocaleString(),
                  ])}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── REUSABLE COMPONENTS ──────────────────────────────────────

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                padding: "12px 16px", textAlign: "left",
                fontSize: "10px", letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                borderBottom: "1px solid rgba(180,150,80,0.15)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(180,150,80,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "14px 16px", color: j === 0 ? "rgba(255,255,255,0.3)" : "#fff" }}>
                  {cell}
                </td>
              ))}
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
            <label style={{
              display: "block", fontSize: "10px",
              letterSpacing: "2px", textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)", marginBottom: "8px"
            }}>{field.label}</label>

            {field.type === "select" ? (
              <select
                value={values[field.key]}
                onChange={e => onChange(field.key, e.target.value)}
                style={{
                  width: "100%", padding: "12px 0",
                  background: "transparent",
                  border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: "14px",
                  fontFamily: "'Sora', sans-serif", outline: "none",
                }}
              >
                <option value="" style={{ background: "#030912" }}>Select vessel...</option>
                {field.options.map(o => (
                  <option key={o.value} value={o.value} style={{ background: "#030912" }}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={e => onChange(field.key, e.target.value)}
                style={{
                  width: "100%", padding: "12px 0",
                  background: "transparent",
                  border: "none", borderBottom: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: "14px",
                  fontFamily: "'Sora', sans-serif", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {message && (
        <div style={{
          marginTop: "20px", padding: "12px 16px",
          background: message.startsWith("✓") ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)",
          border: `1px solid ${message.startsWith("✓") ? "rgba(46,204,113,0.25)" : "rgba(231,76,60,0.25)"}`,
          color: message.startsWith("✓") ? "#2ecc71" : "#e74c3c",
          fontSize: "12px",
        }}>{message}</div>
      )}

      <button
        onClick={onSubmit}
        style={{
          marginTop: "32px", padding: "14px 40px",
          background: "#b49650", border: "none",
          color: "#000", fontSize: "11px",
          letterSpacing: "3px", textTransform: "uppercase",
          fontWeight: 600, cursor: "pointer",
          fontFamily: "'Sora', sans-serif",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.target.style.background = "#c9ab5f"}
        onMouseLeave={e => e.target.style.background = "#b49650"}
      >
        {submitLabel}
      </button>
    </div>
  );
}

function Empty({ message, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px", marginBottom: "20px" }}>{message}</div>
      <button onClick={onAction} style={{
        padding: "12px 32px", background: "transparent",
        border: "1px solid #b49650", color: "#b49650",
        fontSize: "11px", letterSpacing: "2px",
        textTransform: "uppercase", cursor: "pointer",
      }}>{action}</button>
    </div>
  );
}