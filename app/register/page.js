"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  }

  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:#07090f;font-family:'DM Sans',sans-serif;}
    .auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;background:#07090f;}
    .auth-card{background:#0f1320;border:1px solid #2a3358;border-radius:20px;padding:40px;width:100%;max-width:420px;}
    .auth-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#4f8ef7,#7c5cfc);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:#fff;margin:0 auto 20px;}
    .auth-title{font-family:'Syne',sans-serif;font-weight:800;font-size:24px;color:#e2e8f0;text-align:center;margin-bottom:6px;}
    .auth-sub{font-size:13px;color:#64748b;text-align:center;margin-bottom:28px;}
    .form-group{margin-bottom:16px;}
    .form-label{display:block;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;}
    .form-input{width:100%;background:#161c2e;border:1px solid #2a3358;border-radius:10px;padding:12px 14px;color:#e2e8f0;font-size:14px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color 0.2s;}
    .form-input:focus{border-color:#4f8ef7;}
    .auth-btn{width:100%;padding:14px;border-radius:10px;border:none;cursor:pointer;background:linear-gradient(135deg,#4f8ef7,#7c5cfc);color:#fff;font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-top:8px;transition:opacity 0.2s;}
    .auth-btn:disabled{opacity:0.6;cursor:not-allowed;}
    .auth-error{color:#f87171;font-size:13px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);padding:10px 14px;border-radius:8px;margin-bottom:16px;}
    .auth-success{color:#34d399;font-size:13px;background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.2);padding:14px;border-radius:8px;text-align:center;line-height:1.6;}
    .auth-link{text-align:center;margin-top:20px;font-size:13px;color:#64748b;}
    .auth-link a{color:#4f8ef7;text-decoration:none;font-weight:600;}
    .back-home{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:20px;color:#64748b;font-size:13px;text-decoration:none;}
    .back-home:hover{color:#e2e8f0;}
  `;

  return (
    <>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"/>
      <div className="auth-wrap">
        <div className="auth-card">
          <Link href="/" className="back-home">← Back to home</Link>
          <div className="auth-logo">CP</div>
          <div className="auth-title">Create Account</div>
          <div className="auth-sub">Save and revisit your career reports</div>
          {done ? (
            <div className="auth-success">
              ✅ Account created!<br/>
              Check your email to confirm, then <Link href="/login" style={{color:"#4f8ef7"}}>login here</Link>.
            </div>
          ) : (
            <>
              {error && <div className="auth-error">⚠️ {error}</div>}
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="Hariharan" value={name} onChange={e=>setName(e.target.value)} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required/>
                </div>
                <button className="auth-btn" disabled={loading}>
                  {loading ? "Creating account…" : "Create Account →"}
                </button>
              </form>
              <div className="auth-link">
                Already have account? <Link href="/login">Login here</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}