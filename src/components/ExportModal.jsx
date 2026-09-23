import { useState } from "react";
import Receipt from "./Receipt";

export default function ExportModal({ order, onClose }) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat]       = useState("png");

  const handleExport = async () => {
    setExporting(true);
    try {
      const html2canvas = (
        await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js")
      ).default;

      const el     = document.getElementById("receipt-export");
      const canvas = await html2canvas(el, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Fuerza fuentes del sistema en el clon antes de capturar
          const receipt = clonedDoc.getElementById("receipt-export");
          if (receipt) {
            receipt.style.fontFamily = "Courier New, Courier, monospace";
            receipt.querySelectorAll("*").forEach(el => {
              el.style.fontFamily = "Courier New, Courier, monospace";
            });
          }
        }
      });
      const slug = order.clientName.replace(/\s+/g, "-");

      if (format === "png") {
        const link    = document.createElement("a");
        link.download = `pedido-${slug}.png`;
        link.href     = canvas.toDataURL("image/png");
        link.click();
      } else {
        const { jsPDF } = await import(
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        );
        const imgData = canvas.toDataURL("image/png");
        const pdf     = new jsPDF({
          orientation: "portrait", unit: "px",
          format: [canvas.width / 2, canvas.height / 2],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`pedido-${slug}.pdf`);
      }
    } catch (e) {
      console.error(e);
      alert("Error al exportar. Intenta de nuevo.");
    }
    setExporting(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000088", zIndex: 2000, color: "black",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 28, padding: "28px 24px",
        width: "100%", maxWidth: 420, fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 32px 80px #00000033",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20, color: "black" }}>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 20 }}>
            Exportar pedido
          </h3>
          <button onClick={onClose} style={{
            background: "#F1F5F9", border: "none", borderRadius: "50%",
            width: 36, height: 36, fontSize: 18, cursor: "pointer",
          }}>×</button>
        </div>

        {/* Selector de formato */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, color: "black",}}>
          {[{ key: "png", label: "📸 Imagen PNG" }, { key: "pdf", label: "📄 PDF" }].map((f) => (
            <button key={f.key} onClick={() => setFormat(f.key)} style={{
              flex: 1, padding: "12px", borderRadius: 14, border: "2px solid",
              borderColor: format === f.key ? "#F97316" : "#E2E8F0",
              background:  format === f.key ? "#FFF7ED" : "#fff",
              color:       format === f.key ? "#F97316" : "#64748B",
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>{f.label}</button>
          ))}
        </div>

        {/* Preview del ticket */}
        <div style={{
          background: "white", borderRadius: 16,
          marginBottom: 30, height: 320, overflowY: "auto",
          display: "flex", justifyContent: "center",
        }}>
          <div style={{ transform: "scale(0.90)", transformOrigin: "top center", flexShrink: 0 }}>
            <Receipt order={order} />
          </div>
        </div>

        {/* Botón descargar */}
        <button onClick={handleExport} disabled={exporting} style={{
          width: "100%", padding: "15px", borderRadius: 16, border: "none",
          background: exporting
            ? "#E2E8F0"
            : "linear-gradient(135deg, #F97316, #EF4444)",
          color:      "black",
          fontSize: 15, fontWeight: 700,
          cursor: exporting ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}>
          {exporting ? "Exportando..." : `Descargar ${format.toUpperCase()}`}
        </button>
      </div>

      {/* Ticket oculto para capturar */}
      <div style={{ position: "fixed", color: "black", left: -9999, top: -9999, zIndex: -1 }}>
        <Receipt order={order} />
      </div>
    </div>
  );
}
