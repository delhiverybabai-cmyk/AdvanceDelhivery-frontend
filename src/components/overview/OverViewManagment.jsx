import React from "react";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "48px 24px",
  },
  main: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#e5f0ff",
    marginBottom: "24px",
    letterSpacing: "-0.03em",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "18px",
  },
  card: {
    background: "rgba(15,23,42,0.95)",
    borderRadius: "16px",
    border: "1px solid rgba(148,163,184,0.18)",
    padding: "20px 18px",
    cursor: "pointer",
    boxShadow: "0 6px 22px rgba(15,23,42,0.55)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, border 0.15s",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: "6px",
  },
  cardSubtitle: {
    fontSize: "13px",
    color: "#9ca3af",
  },
};

function formatTodayForQuery() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

const OverViewManagment = () => {
  const dateRange = formatTodayForQuery();

  const cards = [
    {
      label: "In Transit",
      url: `/rt-connection`,
      description: "View all consignments currently in transit.",
    },
    {
      label: "Audit Missing",
      url: `https://hq.delhivery.com/p/list/1?q=&nsl=L-PMA&extra={"cn_code":"INMPBEHO"}&date_filter=cs.sd&date_range=${encodeURIComponent(
        dateRange
      )}`,
      description: "Check consignments missing in audit for the selected date.",
    },
    {
      label: "CS Escalation",
      url: "cs-escalation",
      description: "Open CS escalation workspace.",
    },
  ];

  const handleRedirect = (url) => {
    window.open(url, "_blank", "noopener");
  };

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <h1 style={styles.header}>Overview Management</h1>
        <div style={styles.grid}>
          {cards.map((card) => (
            <div
              key={card.label}
              style={styles.card}
              onClick={() => handleRedirect(card.url)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 30px rgba(15,23,42,0.85)";
                e.currentTarget.style.border =
                  "1px solid rgba(248,250,252,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 22px rgba(15,23,42,0.55)";
                e.currentTarget.style.border =
                  "1px solid rgba(148,163,184,0.18)";
              }}
            >
              <div style={styles.cardTitle}>{card.label}</div>
              <div style={styles.cardSubtitle}>{card.description}</div>
              {card.label !== "CS Escalation" && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Date: {dateRange}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OverViewManagment;
