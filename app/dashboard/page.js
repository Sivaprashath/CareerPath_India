"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      let session = null;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }
        session = data.session;
      } catch (err) {
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      try {
        const res = await fetch("/api/save-result");
        const json = await res.json();
        if (json.success) setResults(json.data || []);
        else setError(json.error || "Failed to load results.");
      } catch(e) {
        setError("Could not connect to server.");
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDelete(id) {
    setDeleting(id);
    const { error } = await supabase.from("student_results").delete().eq("id", id);
    if (!error) setResults(prev => prev.filter(r => r.id !== id));
    setDeleting(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  }

  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:#07090f;font-family:'DM Sans',sans-serif;color:#e2e8f0;}
    .dash-root{min-height:100vh;background:#07090f;}
    .dash-header{padding:18px 32px;display:flex;align-items:center;gap:14px;border-bottom:1px solid #1e2640;background:rgba(7,9,15,0.9);backdrop-filter:blur(12px);position:sticky;top:0;z-index:10;}
    .dash-logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#4f8ef7,#7c5cfc);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:15px;color:#fff;}
    .dash-title{font-family:'Syne',sans-serif;font-weight:700;font-size:17px;color:#e2e8f0;}
    .dash-title span{color:#4f8ef7;}
    .dash-right{margin-left:auto;display:flex;align-items:center;gap:10px;}
    .user-chip{padding:6px 12px;border-radius:8px;background:#161c2e;border:1px solid #2a3358;font-size:12px;color:#64748b;}
    .logout-btn{padding:6px 14px;border-radius:8px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
    .home-btn{padding:6px 14px;border-radius:8px;background:rgba(79,142,247,0.1);border:1px solid rgba(79,142,247,0.25);color:#4f8ef7;font-size:12px;text-decoration:none;font-weight:600;}
    .dash-body{max-width:900px;margin:0 auto;padding:36px 24px;}
    .dash-head{margin-bottom:28px;}
    .dash-h1{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:#e2e8f0;margin-bottom:6px;}
    .dash-sub{font-size:13px;color:#64748b;}
    .report-card{background:#0f1320;border:1px solid #2a3358;border-radius:16px;padding:22px;margin-bottom:14px;display:flex;align-items:flex-start;gap:18px;transition:border-color 0.2s;}
    .report-card:hover{border-color:#4f8ef7;}
    .report-emoji{width:46px;height:46px;border-radius:12px;background:#161c2e;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
    .report-info{flex:1;min-width:0;}
    .report-title{font-family:'Syne',sans-serif;font-weight:700;font-size:16px;color:#e2e8f0;margin-bottom:4px;}
    .report-meta{font-size:12px;color:#64748b;display:flex;gap:12px;flex-wrap:wrap;}
    .report-meta span{display:flex;align-items:center;gap:4px;}
    .report-pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;}
    .pill{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:rgba(79,142,247,0.1);border:1px solid rgba(79,142,247,0.25);color:#4f8ef7;}
    .del-btn{padding:7px 14px;border-radius:8px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);color:#f87171;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;flex-shrink:0;transition:background 0.15s;}
    .del-btn:hover{background:rgba(248,113,113,0.15);}
    .empty-state{text-align:center;padding:60px 20px;color:#64748b;}
    .empty-icon{font-size:48px;margin-bottom:16px;}
    .empty-title{font-family:'Syne',sans-serif;font-weight:700;font-size:18px;color:#e2e8f0;margin-bottom:8px;}
    .empty-sub{font-size:13px;line-height:1.6;margin-bottom:24px;}
    .go-btn{display:inline-flex;padding:12px 24px;border-radius:10px;background:linear-gradient(135deg,#4f8ef7,#7c5cfc);color:#fff;text-decoration:none;font-family:'Syne',sans-serif;font-weight:700;font-size:14px;}
    .loading-state{text-align:center;padding:60px 20px;color:#64748b;}
    .spinner{width:32px;height:32px;border:3px solid #1e2640;border-top-color:#4f8ef7;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;}
    @keyframes spin{to{transform:rotate(360deg);}}
    .error-box{color:#f87171;background:rgba(248,113,113,0.05);border:1px solid rgba(248,113,113,0.2);padding:16px;border-radius:10px;font-size:13px;margin-bottom:20px;}
  `;

  return (
    <>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>
      <div className="dash-root">
        <header className="dash-header">
          <div className="dash-logo">CP</div>
          <div className="dash-title">Career<span>Path</span> India</div>
          <div className="dash-right">
            {user && <div className="user-chip">👤 {user.email}</div>}
            <Link href="/" className="home-btn">🏠 Home</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="dash-body">
          <div className="dash-head">
            <div className="dash-h1">📋 My Saved Reports</div>
            <div className="dash-sub">All your career guidance reports in one place</div>
          </div>

          {error && <div className="error-box">⚠️ {error}</div>}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"/>
              <div>Loading your reports…</div>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No saved reports yet</div>
              <div className="empty-sub">
                Complete the career quiz and click<br/>
                <strong style={{color:"#34d399"}}>💾 Save Result</strong> to save your guidance here.
              </div>
              <Link href="/" className="go-btn">🚀 Start Career Quiz</Link>
            </div>
          ) : (
            results.map(r => (
              <div key={r.id} className="report-card">
                <div className="report-emoji">
                  {r.personality === "Analytical" ? "🧠"
                    : r.personality === "Creative" ? "🎨"
                    : r.personality === "Leader" ? "👑"
                    : r.personality === "Helper" ? "🤝" : "🔭"}
                </div>
                <div className="report-info">
                  <div className="report-title">{r.guidance?.title || r.selected_option || "Career Report"}</div>
                  <div className="report-meta">
                    <span>👤 {r.name}</span>
                    <span>🧠 {r.personality}</span>
                    <span>📅 {formatDate(r.created_at)}</span>
                  </div>
                  {r.journey?.length > 0 && (
                    <div className="report-pills">
                      {r.journey.map((j, i) => (
                        <span key={i} className="pill">{j.icon} {j.answer}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="del-btn"
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                >
                  {deleting === r.id ? "…" : "🗑️ Delete"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}