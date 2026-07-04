import { useState } from "react";
import { findUserByUsername } from "../api";

export default function LoginScreen({ users, onLogin }) {
  const [step, setStep]           = useState("username"); // "username" | "pin"
  const [username, setUsername]   = useState("");
  const [pin, setPin]             = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError]         = useState("");
  const [shake, setShake]         = useState(false);
  const [checking, setChecking]   = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleUsername = async () => {
    if (!username.trim()) return;
    setChecking(true);
    const u = await findUserByUsername(username);
    setChecking(false);
    if (!u) { setError("Usuario no encontrado"); triggerShake(); return; }
    setFoundUser(u);
    setError("");
    setStep("pin");
  };

  const pressPin = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === foundUser.pin) {
        onLogin(foundUser);
      } else {
        setError("PIN incorrecto");
        triggerShake();
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const backToUsername = () => {
    setStep("username");
    setPin("");
    setFoundUser(null);
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0F172A", padding: 24,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "#1E293B", borderRadius: 28, padding: "48px 40px",
        width: "100%", maxWidth: 380, boxShadow: "0 40px 80px #00000080",
        border: "1px solid #334155", animation: "fadeUp 0.4s ease",
      }}>
        {/* Logo + título */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, #F97316, #EF4444)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 16px", boxShadow: "0 8px 24px #F9731644",
          }}>🛍️</div>
          <h1 style={{
            margin: 0, fontFamily: "'Playfair Display', serif",
            fontSize: 28, color: "#F8FAFC", fontWeight: 900,
          }}>Maciaga </h1>
          <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: 14 }}>
            {step === "username" ? "Ingresa tu usuario" : `Hola, ${foundUser?.name}!`}
          </p>
        </div>

        {/* Paso 1: usuario */}
        {step === "username" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.3s ease" }}>
            <input
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleUsername()}
              placeholder="Tu usuario..."
              autoFocus
              style={{
                padding: "14px 18px", borderRadius: 14,
                border: `2px solid ${shake ? "#EF4444" : "#334155"}`,
                background: "#0F172A", color: "#F8FAFC", fontSize: 16,
                fontFamily: "inherit", outline: "none",
                animation: shake ? "shake 0.5s" : "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e)  => (e.target.style.borderColor = "#F97316")}
              onBlur={(e)   => (e.target.style.borderColor = "#334155")}
            />
            {error && (
              <p style={{ color: "#EF4444", fontSize: 13, margin: 0, textAlign: "center" }}>
                {error}
              </p>
            )}
            <button onClick={handleUsername} disabled={checking} style={{
              padding: "15px", borderRadius: 14, border: "none",
              background: checking ? "#475569" : "linear-gradient(135deg, #F97316, #EF4444)",
              color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: checking ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
              {checking ? "Buscando..." : "Continuar →"}
            </button>
          </div>
        )}

        {/* Paso 2: PIN */}
        {step === "pin" && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 24, animation: "fadeUp 0.3s ease",
          }}>
            {/* Dots */}
            <div style={{ display: "flex", gap: 14, animation: shake ? "shake 0.5s" : "none" }}>
              {[0,1,2,3].map((i) => (
                <div key={i} style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: pin.length > i ? "#F97316" : "#334155",
                  transition: "all 0.15s",
                  transform: pin.length > i ? "scale(1.2)" : "scale(1)",
                  boxShadow: pin.length > i ? "0 0 10px #F9731688" : "none",
                }}/>
              ))}
            </div>

            {/* Teclado */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => (
                <button key={i}
                  onClick={() =>
                    d === "⌫" ? setPin((p) => p.slice(0, -1))
                    : d !== "" && pressPin(String(d))
                  }
                  style={{
                    width: 72, height: 72, borderRadius: 18,
                    border: `1.5px solid ${d === "" ? "transparent" : "#334155"}`,
                    background: d === "⌫" ? "#3D1A1A" : d === "" ? "transparent" : "#1E293B",
                    color: d === "⌫" ? "#EF4444" : "#F8FAFC",
                    fontSize: d === "⌫" ? 18 : 22, fontWeight: 700,
                    cursor: d === "" ? "default" : "pointer",
                    fontFamily: "inherit", transition: "transform 0.1s",
                  }}
                  onMouseDown={(e) => { if (d !== "") e.currentTarget.style.transform = "scale(0.92)"; }}
                  onMouseUp={(e)   => { e.currentTarget.style.transform = "scale(1)"; }}
                >{d}</button>
              ))}
            </div>

            {error && (
              <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>
            )}

            <button onClick={backToUsername} style={{
              background: "none", border: "none", color: "#64748B",
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>
              ← Cambiar usuario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
