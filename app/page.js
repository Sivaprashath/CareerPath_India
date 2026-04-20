"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// ── Quiz Questions ─────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { q: "Your friend is stuck on a maths problem. What do you do?", options: [
    { text: "Solve it step-by-step logically", type: "Analytical" },
    { text: "Draw a diagram to explain it", type: "Creative" },
    { text: "Organise a group study session", type: "Leader" },
    { text: "Patiently explain until they understand", type: "Helper" },
  ]},
  { q: "Which school project excites you the most?", options: [
    { text: "Building a working science model", type: "Analytical" },
    { text: "Creating a poster or art project", type: "Creative" },
    { text: "Leading a class presentation", type: "Leader" },
    { text: "Volunteering for social awareness", type: "Helper" },
    { text: "Doing deep research on a topic", type: "Explorer" },
  ]},
  { q: "On a free weekend, you would rather…", options: [
    { text: "Solve puzzles or coding challenges", type: "Analytical" },
    { text: "Sketch, paint, or make something creative", type: "Creative" },
    { text: "Plan and organise events for friends", type: "Leader" },
    { text: "Volunteer or help someone in need", type: "Helper" },
    { text: "Read books or explore new topics", type: "Explorer" },
  ]},
  { q: "Which of these subjects do you enjoy the most?", options: [
    { text: "Mathematics / Physics / Computer Science", type: "Analytical" },
    { text: "Art / Design / Music / Literature", type: "Creative" },
    { text: "Business Studies / Economics", type: "Leader" },
    { text: "Biology / Psychology / Social Science", type: "Helper" },
    { text: "History / Geography / General Science", type: "Explorer" },
  ]},
  { q: "When faced with a big problem, you…", options: [
    { text: "Break it into smaller parts and analyse", type: "Analytical" },
    { text: "Think of a unique creative solution", type: "Creative" },
    { text: "Gather a team and delegate tasks", type: "Leader" },
    { text: "Talk to people and understand emotions first", type: "Helper" },
    { text: "Research every possible angle deeply", type: "Explorer" },
  ]},
  { q: "Your ideal future job looks like…", options: [
    { text: "Engineer, Data Scientist, or Developer", type: "Analytical" },
    { text: "Designer, Architect, or Filmmaker", type: "Creative" },
    { text: "CEO, Manager, or Civil Servant (IAS/IPS)", type: "Leader" },
    { text: "Doctor, Nurse, Teacher, or Counsellor", type: "Helper" },
    { text: "Scientist, Researcher, or Archaeologist", type: "Explorer" },
  ]},
  { q: "In a group project, your natural role is…", options: [
    { text: "The one who does technical work", type: "Analytical" },
    { text: "The one who designs and makes it look good", type: "Creative" },
    { text: "The one who leads and assigns tasks", type: "Leader" },
    { text: "The one who keeps the team happy and motivated", type: "Helper" },
    { text: "The one who does all the research", type: "Explorer" },
  ]},
  { q: "Which statement describes you best?", options: [
    { text: "I love logic, numbers and finding patterns", type: "Analytical" },
    { text: "I express myself through art, music or writing", type: "Creative" },
    { text: "I love being in charge and making decisions", type: "Leader" },
    { text: "I feel fulfilled when I help or care for others", type: "Helper" },
    { text: "I love asking 'why' and discovering new things", type: "Explorer" },
  ]},
];

// ── Personality Info ───────────────────────────────────────
const PERSONALITY_INFO = {
  Analytical: { emoji: "🧠", color: "#4f8ef7", desc: "You love logic, data and problem solving. You are built for engineering, technology, mathematics and science careers.", careers: ["Software Engineer","Data Scientist","CA / Finance Analyst","IIT / NIT Graduate"] },
  Creative:   { emoji: "🎨", color: "#f87171", desc: "You thrive on imagination and self-expression. Design, media, architecture and arts are your natural spaces.", careers: ["UX/UI Designer","Architect","Filmmaker","Fashion Designer"] },
  Leader:     { emoji: "👑", color: "#f5c84a", desc: "You are a natural organiser and decision-maker. Management, law, civil services and entrepreneurship suit you.", careers: ["IAS / IPS Officer","MBA Manager","Lawyer","Entrepreneur"] },
  Helper:     { emoji: "🤝", color: "#34d399", desc: "You are empathetic and caring. Medicine, nursing, teaching, psychology and social work are your calling.", careers: ["Doctor / MBBS","Nurse / Paramedical","Psychologist","Teacher / Educator"] },
  Explorer:   { emoji: "🔭", color: "#22d3ee", desc: "You are curious and love discovering the unknown. Research, science and exploration are where you shine.", careers: ["Scientist / Researcher","Biotechnologist","Archaeologist","PhD Scholar"] },
};

// ── Exam Dates (Updated 2026) ──────────────────────────────
const EXAM_DATES = [
  { name: "JEE Main 2026",     date: "2026-04-28", icon: "⚙️",  color: "#4f8ef7", for: ["Analytical","Explorer"] },
  { name: "NEET UG 2026",      date: "2026-05-03", icon: "🏥",  color: "#34d399", for: ["Helper"] },
  { name: "CLAT 2026",         date: "2026-12-01", icon: "⚖️",  color: "#f87171", for: ["Leader"] },
  { name: "CAT 2026",          date: "2026-11-29", icon: "💼",  color: "#f5c84a", for: ["Leader","Analytical"] },
  { name: "GATE 2027",         date: "2027-02-07", icon: "🏛️", color: "#22d3ee", for: ["Analytical","Explorer"] },
  { name: "UPSC Prelims 2026", date: "2026-05-24", icon: "🇮🇳", color: "#f5c84a", for: ["Leader","Explorer"] },
  { name: "CUET UG 2026",      date: "2026-05-15", icon: "🎓",  color: "#a78bfa", for: ["Creative","Helper","Explorer"] },
  { name: "NDA 2026",          date: "2026-09-14", icon: "🪖",  color: "#f87171", for: ["Leader","Analytical"] },
  { name: "IBPS PO 2026",      date: "2026-10-04", icon: "🏦",  color: "#34d399", for: ["Leader","Analytical"] },
  { name: "UGC NET 2026",      date: "2026-06-15", icon: "🧑‍🏫", color: "#22d3ee", for: ["Explorer","Helper"] },
];

// ── Study Schedules ────────────────────────────────────────
const STUDY_SCHEDULES = {
  Analytical: [
    { time:"5:30 AM", activity:"Wake up & light exercise", icon:"🌅" },
    { time:"6:00 AM", activity:"Revision – Maths / Physics formulas", icon:"📐" },
    { time:"7:30 AM", activity:"Breakfast & freshen up", icon:"🍳" },
    { time:"8:30 AM", activity:"Deep Study – Maths / Data topics", icon:"🧠" },
    { time:"11:00 AM", activity:"Problem-solving practice (past papers)", icon:"📋" },
    { time:"1:00 PM", activity:"Lunch & rest", icon:"🍱" },
    { time:"2:00 PM", activity:"Physics / Computer Science study", icon:"💻" },
    { time:"4:30 PM", activity:"Short break – walk / snack", icon:"☕" },
    { time:"5:00 PM", activity:"Mock test / timed question practice", icon:"📝" },
    { time:"7:00 PM", activity:"Dinner & family time", icon:"🍽️" },
    { time:"8:00 PM", activity:"Error analysis – revisit wrong answers", icon:"🔍" },
    { time:"9:30 PM", activity:"Light reading – notes summary", icon:"📖" },
    { time:"10:30 PM", activity:"Sleep – 7–8 hours essential!", icon:"😴" },
  ],
  Creative: [
    { time:"6:00 AM", activity:"Wake up & sketch / journal ideas", icon:"✏️" },
    { time:"7:00 AM", activity:"Breakfast & inspiration browsing", icon:"🍳" },
    { time:"8:00 AM", activity:"Portfolio project / design practice", icon:"🎨" },
    { time:"10:30 AM", activity:"Theory study – Design history / concepts", icon:"📚" },
    { time:"12:30 PM", activity:"Lunch & creative break", icon:"🍱" },
    { time:"1:30 PM", activity:"Entrance exam prep (NID / NIFT / UCEED)", icon:"📋" },
    { time:"3:30 PM", activity:"Practical skills – sketching / digital art", icon:"🖌️" },
    { time:"5:30 PM", activity:"Break – music / walk", icon:"🎵" },
    { time:"6:30 PM", activity:"Portfolio review & refinement", icon:"📂" },
    { time:"8:00 PM", activity:"Dinner & relax", icon:"🍽️" },
    { time:"9:00 PM", activity:"Watch design documentaries / tutorials", icon:"🎬" },
    { time:"10:30 PM", activity:"Sleep – rest is creative fuel!", icon:"😴" },
  ],
  Leader: [
    { time:"5:00 AM", activity:"Wake up – read news / current affairs", icon:"📰" },
    { time:"6:00 AM", activity:"Morning walk & mental planning", icon:"🌅" },
    { time:"7:00 AM", activity:"Breakfast & UPSC/MBA current affairs", icon:"🍳" },
    { time:"8:00 AM", activity:"Deep study – Polity / Economics / GS", icon:"🏛️" },
    { time:"11:00 AM", activity:"Essay / answer writing practice", icon:"✍️" },
    { time:"1:00 PM", activity:"Lunch & short rest", icon:"🍱" },
    { time:"2:00 PM", activity:"Optional / History / Geography study", icon:"🗺️" },
    { time:"4:30 PM", activity:"Group discussion / debate practice", icon:"💬" },
    { time:"6:00 PM", activity:"Mock interview prep / personality dev.", icon:"🎤" },
    { time:"8:00 PM", activity:"Dinner & news review", icon:"🍽️" },
    { time:"9:00 PM", activity:"Revision – daily notes summary", icon:"📖" },
    { time:"10:30 PM", activity:"Sleep – discipline is a leader's strength!", icon:"😴" },
  ],
  Helper: [
    { time:"6:00 AM", activity:"Wake up & light yoga / meditation", icon:"🧘" },
    { time:"7:00 AM", activity:"Breakfast & Biology / Psychology review", icon:"🍳" },
    { time:"8:00 AM", activity:"NEET / AIIMS subject study – Biology", icon:"🧬" },
    { time:"10:30 AM", activity:"Chemistry – organic & inorganic study", icon:"⚗️" },
    { time:"12:30 PM", activity:"Lunch & relaxation", icon:"🍱" },
    { time:"1:30 PM", activity:"Physics for NEET – formulae & MCQs", icon:"🔬" },
    { time:"3:30 PM", activity:"NCERT reading & diagram practice", icon:"📚" },
    { time:"5:30 PM", activity:"Break – help someone, volunteer activity", icon:"🤝" },
    { time:"6:30 PM", activity:"Mock test – NEET style questions", icon:"📝" },
    { time:"8:00 PM", activity:"Dinner & family time", icon:"🍽️" },
    { time:"9:00 PM", activity:"Flashcard revision – definitions & terms", icon:"🃏" },
    { time:"10:30 PM", activity:"Sleep – a healthy mind heals others!", icon:"😴" },
  ],
  Explorer: [
    { time:"6:00 AM", activity:"Wake up & read a research paper / article", icon:"📖" },
    { time:"7:00 AM", activity:"Breakfast & curiosity journaling", icon:"🍳" },
    { time:"8:00 AM", activity:"Core subject deep study (Science / Maths)", icon:"🔭" },
    { time:"10:30 AM", activity:"Research methodology / lab concepts", icon:"🧪" },
    { time:"12:30 PM", activity:"Lunch & nature walk / explore", icon:"🍱" },
    { time:"1:30 PM", activity:"Entrance prep – JAM / JEST / TIFR", icon:"📋" },
    { time:"3:30 PM", activity:"Project work / independent research", icon:"💡" },
    { time:"5:30 PM", activity:"Documentary / science video watching", icon:"🎬" },
    { time:"6:30 PM", activity:"Concept mapping & mind maps", icon:"🗺️" },
    { time:"8:00 PM", activity:"Dinner & relax", icon:"🍽️" },
    { time:"9:00 PM", activity:"Write about what you learnt today", icon:"✍️" },
    { time:"10:30 PM", activity:"Sleep – great discoveries need rest!", icon:"😴" },
  ],
};

// ── Career Tree ────────────────────────────────────────────
const TREE = {
  question: "What is your current education level?", icon: "🎓",
  options: [
    { label:"Completed 10th standard", icon:"📘", color:"#4f8ef7", question:"What would you like to do after 10th?", options:[
      { label:"Continue to 11th / 12th", icon:"📚", color:"#4f8ef7", question:"Which stream are you interested in?", options:[
        { label:"Science (PCM)", icon:"🔬", color:"#22d3ee", resultKey:"10_science_pcm" },
        { label:"Science (PCB)", icon:"🧬", color:"#34d399", resultKey:"10_science_pcb" },
        { label:"Commerce",      icon:"📊", color:"#f5c84a", resultKey:"10_commerce" },
        { label:"Arts / Humanities", icon:"🎨", color:"#f87171", resultKey:"10_arts" },
      ]},
      { label:"ITI / Vocational courses",        icon:"🔧", color:"#f5c84a", resultKey:"10_iti" },
      { label:"Government exams (10th pass)",    icon:"🏛️", color:"#34d399", resultKey:"10_govt" },
      { label:"Diploma courses (Polytechnic)",   icon:"🏗️", color:"#f87171", resultKey:"10_diploma" },
    ]},
    { label:"Completed 12th standard", icon:"📗", color:"#22d3ee", question:"Which stream did you study in 12th?", options:[
      { label:"Science – PCM (Maths)", icon:"📐", color:"#4f8ef7", question:"What field interests you?", options:[
        { label:"Engineering / Technology", icon:"⚙️", color:"#4f8ef7", resultKey:"12_pcm_engg" },
        { label:"Architecture",             icon:"🏛️", color:"#22d3ee", resultKey:"12_pcm_arch" },
        { label:"Defence / Armed forces",   icon:"🪖", color:"#f87171", resultKey:"12_pcm_defence" },
        { label:"Pure Sciences / Research", icon:"🔭", color:"#34d399", resultKey:"12_pcm_science" },
      ]},
      { label:"Science – PCB (Biology)", icon:"🧪", color:"#34d399", question:"Which medical/life-science field?", options:[
        { label:"Medicine (MBBS / BDS)",          icon:"🏥", color:"#34d399", resultKey:"12_pcb_mbbs" },
        { label:"Pharmacy",                        icon:"💊", color:"#4f8ef7", resultKey:"12_pcb_pharma" },
        { label:"Nursing / Paramedical",           icon:"🩺", color:"#22d3ee", resultKey:"12_pcb_nursing" },
        { label:"Biotechnology / Life sciences",   icon:"🧬", color:"#f5c84a", resultKey:"12_pcb_biotech" },
      ]},
      { label:"Commerce", icon:"💰", color:"#f5c84a", question:"What area interests you?", options:[
        { label:"Chartered Accountancy (CA)",   icon:"📑", color:"#f5c84a", resultKey:"12_comm_ca" },
        { label:"Business / Management (BBA)",  icon:"💼", color:"#4f8ef7", resultKey:"12_comm_bba" },
        { label:"Banking & Finance",            icon:"🏦", color:"#34d399", resultKey:"12_comm_banking" },
        { label:"Economics / Statistics",       icon:"📈", color:"#f87171", resultKey:"12_comm_eco" },
      ]},
      { label:"Arts / Humanities", icon:"🎭", color:"#f87171", question:"What direction interests you?", options:[
        { label:"Law (LLB / CLAT)",         icon:"⚖️", color:"#f87171", resultKey:"12_arts_law" },
        { label:"Design / Fine Arts",       icon:"🎨", color:"#f5c84a", resultKey:"12_arts_design" },
        { label:"Journalism / Mass Comm.",  icon:"📰", color:"#22d3ee", resultKey:"12_arts_media" },
        { label:"Psychology / Social Work", icon:"🧠", color:"#34d399", resultKey:"12_arts_psych" },
      ]},
    ]},
    { label:"Completed Graduation", icon:"🎓", color:"#f5c84a", question:"What did you graduate in?", options:[
      { label:"Engineering / Technology (B.E/B.Tech)", icon:"💻", color:"#4f8ef7", question:"What's your preferred next step?", options:[
        { label:"M.Tech / M.E (Higher studies)", icon:"📚", color:"#4f8ef7", resultKey:"grad_engg_mtech" },
        { label:"MBA (Management)",              icon:"💼", color:"#f5c84a", resultKey:"grad_engg_mba" },
        { label:"GATE / PSU jobs",               icon:"🏛️", color:"#34d399", resultKey:"grad_engg_gate" },
        { label:"UPSC / Civil services",         icon:"🇮🇳", color:"#f87171", resultKey:"grad_engg_upsc" },
      ]},
      { label:"Science (B.Sc)", icon:"🔬", color:"#34d399", question:"What do you want to pursue?", options:[
        { label:"M.Sc / Research",   icon:"🔭", color:"#34d399", resultKey:"grad_bsc_msc" },
        { label:"Teaching / Education", icon:"🧑‍🏫", color:"#4f8ef7", resultKey:"grad_bsc_teaching" },
        { label:"Government exams",  icon:"🏛️", color:"#f5c84a", resultKey:"grad_bsc_govt" },
      ]},
      { label:"Commerce (B.Com / BBA)", icon:"💰", color:"#f5c84a", question:"What path suits you?", options:[
        { label:"MBA (CAT / MAT)",     icon:"💼", color:"#f5c84a", resultKey:"grad_comm_mba" },
        { label:"CA / CMA (Final)",    icon:"📑", color:"#4f8ef7", resultKey:"grad_comm_ca" },
        { label:"Banking / IBPS exams",icon:"🏦", color:"#34d399", resultKey:"grad_comm_banking" },
      ]},
      { label:"Arts / Humanities (BA / BFA)", icon:"🎭", color:"#f87171", question:"What next?", options:[
        { label:"MA / Higher studies",  icon:"📖", color:"#f87171", resultKey:"grad_arts_ma" },
        { label:"UPSC / Civil services",icon:"🇮🇳", color:"#4f8ef7", resultKey:"grad_arts_upsc" },
        { label:"Law (LLB)",            icon:"⚖️", color:"#f5c84a", resultKey:"grad_arts_law" },
      ]},
    ]},
    { label:"Completed Post-Graduation", icon:"🏅", color:"#f87171", question:"What is your post-graduation in?", options:[
      { label:"M.Tech / M.E",       icon:"⚙️", color:"#4f8ef7", resultKey:"pg_mtech" },
      { label:"MBA",                icon:"💼", color:"#f5c84a", resultKey:"pg_mba" },
      { label:"M.Sc (Science)",     icon:"🔬", color:"#34d399", resultKey:"pg_msc" },
      { label:"MA / M.Com / Other", icon:"📖", color:"#f87171", resultKey:"pg_ma" },
    ]},
  ],
};

// ── Score helpers ──────────────────────────────────────────
function calculateMatchScore(course, studentProfile) {
  if (!studentProfile) return null;
  let score = 60;
  const courseName = (course.name + " " + course.short + " " + course.career_scope).toLowerCase();
  const personality = studentProfile.personality?.toLowerCase() || "";
  const subjects    = studentProfile.subjects?.toLowerCase() || "";
  const personalityMap = {
    analytical: ["engineering","technology","science","mathematics","data","computer","software","statistics","research","gate","iit"],
    creative:   ["design","arts","media","architecture","journalism","film","fashion","animation","fine arts"],
    leader:     ["mba","management","business","bba","entrepreneurship","administration","law","upsc","ias"],
    helper:     ["medicine","mbbs","nursing","pharmacy","psychology","social","paramedical","healthcare","doctor"],
    explorer:   ["research","science","biotechnology","astronomy","geology","archaeology","phd","msc"],
  };
  const hits = (personalityMap[personality] || []).filter(k => courseName.includes(k)).length;
  score += Math.min(hits * 8, 24);
  const subjectHits = subjects.split(/[,\s]+/).filter(s => s.length > 2 && courseName.includes(s)).length;
  score += Math.min(subjectHits * 5, 15);
  return Math.min(Math.max(score, 60), 99);
}

function getScoreColor(score) {
  if (score >= 90) return "#34d399";
  if (score >= 75) return "#4f8ef7";
  if (score >= 65) return "#f5c84a";
  return "#f87171";
}

// ── Fetch Guidance ─────────────────────────────────────────
async function fetchGuidance(opt, journey, studentProfile) {
  const journeyText = journey.map(j => `${j.question} → ${j.answer}`).join("\n");
  const profileText = studentProfile
    ? `Student Name: ${studentProfile.name}\nStrengths: ${studentProfile.strengths}\nSubjects: ${studentProfile.subjects}\nPersonality: ${studentProfile.personality}`
    : "No profile provided.";
  const prompt = `You are a career guidance expert for Indian students.
Student Profile:\n${profileText}\nJourney:\n${journeyText}
Generate detailed guidance for: "${opt.label}"
Return ONLY valid JSON (no markdown, no explanation):
{
  "title":"",
  "description":"",
  "scholarships":[
    {"name":"","provider":"","amount":"","eligibility":"","type":"Central/State/Private"}
  ],
  "courses":[
    {
      "name":"","icon":"🎓","short":"","duration":"","eligibility":"",
      "approx_fees":"","entrance_exams":[],"career_scope":"",
      "top_colleges":[],"job_roles":[],"avg_salary":""
    }
  ],
  "govt_exams":[
    {"name":"","icon":"🏛️","conducting_body":"","eligibility":"","exam_date":"","posts":"","salary_range":"","color":"#4f8ef7"}
  ],
  "roadmap":[
    {"step":"1","month":"Month 1-3","title":"","action":""},
    {"step":"2","month":"Month 4-8","title":"","action":""},
    {"step":"3","month":"Month 9-12","title":"","action":""},
    {"step":"4","month":"Year 2+","title":"","action":""}
  ]
}
Rules:
- Include EXACTLY 6 courses relevant to this career path
- Each course must list AT LEAST 6 top_colleges (IITs, NITs, central universities, top private)
- Each course must list 4-5 job_roles and avg_salary in LPA
- Include EXACTLY 5 scholarships (mix of central govt, state govt, private)
- Include EXACTLY 5 govt_exams currently conducted in India relevant to this path
- All data must be India-specific and accurate for 2025-2026
- Return ONLY JSON, nothing else.`;
  const res = await fetch("/api/guidance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, label: opt.label }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
  return await res.json();
}

// ── Save as PDF ────────────────────────────────────────────
function saveAsPDF(guidanceData, studentProfile, selectedOpt, journey) {
  const name = studentProfile?.name || "Student";
  const date = new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" });
  const roadmapHTML = (guidanceData.roadmap||[]).map((s,i) => {
    const c = ["#4f8ef7","#22d3ee","#34d399","#f5c84a"];
    return `<div style="display:flex;gap:16px;margin-bottom:20px;">
      <div style="width:36px;height:36px;border-radius:50%;background:${c[i]||"#4f8ef7"};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px;flex-shrink:0;">${s.step}</div>
      <div>
        <div style="font-size:11px;color:${c[i]};font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">${s.month}</div>
        <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${s.title}</div>
        <div style="font-size:13px;color:#555;line-height:1.6;">${s.action}</div>
      </div>
    </div>`;
  }).join("");
  const coursesHTML = (guidanceData.courses||[]).map(c =>
    `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;">
      <div style="font-size:16px;margin-bottom:4px;">${c.icon||"📌"} <strong>${c.name}</strong></div>
      <div style="font-size:13px;color:#64748b;margin-bottom:8px;">${c.short}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:12px;">
        <div><span style="color:#94a3b8;font-size:10px;">Duration</span><br/>${c.duration}</div>
        <div><span style="color:#94a3b8;font-size:10px;">Eligibility</span><br/>${c.eligibility}</div>
        <div><span style="color:#34d399;font-size:10px;">Fees</span><br/><strong>${c.approx_fees}</strong></div>
      </div>
      ${c.entrance_exams?.length ? `<div style="margin-top:8px;font-size:12px;"><strong>Exams:</strong> ${c.entrance_exams.join(", ")}</div>` : ""}
    </div>`
  ).join("");
  const scholHTML = (guidanceData.scholarships||[]).map(s =>
    `<div style="border-left:4px solid #f5c84a;padding:12px 16px;background:#fffbf0;border-radius:0 8px 8px 0;margin-bottom:10px;">
      <div style="font-weight:700;font-size:14px;">${s.name}</div>
      <div style="font-size:12px;color:#64748b;">🏛️ ${s.provider}</div>
      <div style="font-size:12px;margin-top:6px;"><strong>Amount:</strong> ${s.amount} · <strong>Eligibility:</strong> ${s.eligibility}</div>
    </div>`
  ).join("");
  const journeyHTML = journey.map(j =>
    `<span style="background:#f1f5f9;border-radius:20px;padding:4px 12px;font-size:12px;margin:3px;">${j.icon} ${j.answer}</span>`
  ).join(" → ");
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>Career Report - ${name}</title>
<style>body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;margin:0;}@media print{.no-print{display:none!important;}}</style>
</head><body>
  <div style="background:linear-gradient(135deg,#4f8ef7,#7c5cfc);padding:36px 40px;color:#fff;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:13px;opacity:0.8;margin-bottom:6px;text-transform:uppercase;">CareerPath India · AI Report</div>
        <div style="font-size:28px;font-weight:800;margin-bottom:4px;">${guidanceData.title||selectedOpt?.label}</div>
        <div style="font-size:14px;opacity:0.85;max-width:500px;line-height:1.6;">${guidanceData.description||""}</div>
      </div>
      <div style="text-align:right;opacity:0.85;font-size:12px;">
        <div style="font-size:18px;font-weight:700;">${name}</div>
        <div>${studentProfile?.personality||""}</div>
        <div>${date}</div>
      </div>
    </div>
  </div>
  <div style="padding:32px 40px;">
    <div style="margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">Journey</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">${journeyHTML}</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:18px;font-weight:800;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f1f5f9;">🗺️ Study Roadmap</div>
      ${roadmapHTML}
    </div>
    ${scholHTML ? `<div style="margin-bottom:32px;"><div style="font-size:18px;font-weight:800;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f1f5f9;">🏆 Scholarships</div>${scholHTML}</div>` : ""}
    <div style="margin-bottom:32px;">
      <div style="font-size:18px;font-weight:800;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #f1f5f9;">📚 Courses</div>
      ${coursesHTML}
    </div>
    <div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;border-top:1px solid #f1f5f9;">
      Generated by CareerPath India · Powered by Gemini AI · ${date}
    </div>
  </div>
  <div class="no-print" style="position:fixed;bottom:24px;right:24px;display:flex;gap:10px;">
    <button onclick="window.print()" style="padding:12px 24px;background:linear-gradient(135deg,#4f8ef7,#7c5cfc);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">🖨️ Print / Save PDF</button>
    <button onclick="window.close()" style="padding:12px 24px;background:#f1f5f9;color:#64748b;border:none;border-radius:10px;font-size:14px;cursor:pointer;">✕ Close</button>
  </div>
</body></html>`;
  const win = window.open(URL.createObjectURL(new Blob([html], { type:"text/html" })), "_blank");
  if (win) win.focus();
}

// ── Supabase DB Helpers ────────────────────────────────────
async function dbSaveProfile(userId, profile) {
  await supabase.from("user_profiles").upsert({
    user_id:     userId,
    name:        profile.name,
    strengths:   profile.strengths,
    subjects:    profile.subjects,
    personality: profile.personality,
    updated_at:  new Date().toISOString(),
  }, { onConflict: "user_id" });
}

async function dbLoadProfile(userId) {
  const { data } = await supabase
    .from("user_profiles").select("*")
    .eq("user_id", userId).single();
  return data;
}

async function dbSaveUserData(userId, payload) {
  const { data: existing } = await supabase
    .from("user_data")
    .select("*")
    .eq("user_id", userId)
    .single();

  await supabase.from("user_data").upsert({
    ...(existing || {}),
    user_id: userId,
    ...payload,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
}

async function dbLoadUserData(userId) {
  const { data } = await supabase
    .from("user_data").select("*")
    .eq("user_id", userId).single();
  return data;
}
// ── User Likes DB Helpers ──────────────────────────────────
// ── User Likes DB Helpers ──────────────────────────────────

async function dbSaveLike(userId, userName, item) {
  // First check if this course is already liked by this user
  const { data: existing } = await supabase
    .from("user_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("item_type", "course")
    .filter("item_data->>name", "eq", item.name)
    .maybeSingle();

  // Only insert if it doesn't already exist
  if (!existing) {
    const { error } = await supabase.from("user_likes").insert({
      user_id:   userId,
      user_name: userName,
      item_type: "course",
      item_data: item,
    });
    if (error) console.error("dbSaveLike error:", error.message);
  }
}

async function dbRemoveLike(userId, itemName) {
  const { error } = await supabase
    .from("user_likes")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", "course")
    .filter("item_data->>name", "eq", itemName);   // ✅ Correct filter syntax

  if (error) console.error("dbRemoveLike error:", error.message);
}

async function dbLoadLikes(userId) {
  const { data, error } = await supabase
    .from("user_likes")
    .select("item_data")
    .eq("user_id", userId)
    .eq("item_type", "course");

  if (error) console.error("dbLoadLikes error:", error.message);
  return (data || []).map(row => row.item_data);
}

// ── Login Screen Component ─────────────────────────────────
function LoginScreen() {
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState("");

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function handleEmail(e) {
    e.preventDefault();
    setError(""); setMsg(""); setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMsg("✅ Check your email to confirm your account!");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#0f1117",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'DM Sans',sans-serif", padding:20
    }}>
      <div style={{
        width:"100%", maxWidth:460,
        background:"#1a1d27", border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:24, padding:"44px 40px",
        boxShadow:"0 24px 80px rgba(0,0,0,0.5)"
      }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:60, height:60, borderRadius:18, margin:"0 auto 16px",
            background:"linear-gradient(135deg,#4f8ef7,#7c5cfc)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28
          }}>🎓</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"#fff" }}>
            Career<span style={{ color:"#4f8ef7" }}>Path</span> India
          </div>
          <div style={{ fontSize:15, color:"rgba(255,255,255,0.45)", marginTop:8 }}>
            AI-Powered Career Guidance for Indian Students
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{
          display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:12,
          padding:4, marginBottom:28, border:"1px solid rgba(255,255,255,0.08)"
        }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMsg(""); }} style={{
              flex:1, padding:"10px 0", borderRadius:9, border:"none",
              background: mode === m ? "linear-gradient(135deg,#4f8ef7,#7c5cfc)" : "transparent",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
              fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15,
              cursor:"pointer", transition:"all 0.2s", textTransform:"capitalize"
            }}>{m === "login" ? "🔑 Login" : "✨ Sign Up"}</button>
          ))}
        </div>

        {/* Google OAuth */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width:"100%", padding:"13px 0", borderRadius:12,
          background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
          color:"#fff", fontFamily:"'DM Sans',sans-serif",
          fontWeight:600, fontSize:16, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          marginBottom:20
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>or with email</span>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <input
            type="email" placeholder="Email address" required
            value={email} onChange={e => setEmail(e.target.value)}
            style={{
              background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:10, padding:"13px 16px", color:"#fff",
              fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:"none"
            }}
          />
          <input
            type="password" placeholder="Password (min 6 chars)" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={{
              background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:10, padding:"13px 16px", color:"#fff",
              fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:"none"
            }}
          />
          {error && (
            <div style={{ color:"#f87171", fontSize:14, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", padding:"10px 14px", borderRadius:8 }}>
              ⚠️ {error}
            </div>
          )}
          {msg && (
            <div style={{ color:"#34d399", fontSize:14, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", padding:"10px 14px", borderRadius:8 }}>
              {msg}
            </div>
          )}
          <button type="submit" disabled={loading} style={{
            padding:"14px 0", borderRadius:10, border:"none",
            background:"linear-gradient(135deg,#4f8ef7,#7c5cfc)",
            color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:700,
            fontSize:16, cursor:"pointer", opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Please wait…" : mode === "login" ? "🚀 Login & Continue" : "✨ Create Account"}
          </button>
        </form>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:"rgba(255,255,255,0.25)" }}>
          🔒 Your data is private and secured with Supabase Auth
        </div>
      </div>
    </div>
  );
}
// ── Exam Countdown Component ───────────────────────────────
function ExamCountdown({ personality }) {
  const today = new Date();
  const relevant = EXAM_DATES.filter(e => !personality || e.for.includes(personality));
  const upcoming = relevant
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date) - today) / (1000*60*60*24)) }))
    .filter(e => e.daysLeft >= 0)
    .sort((a,b) => a.daysLeft - b.daysLeft);
  const past = relevant
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date) - today) / (1000*60*60*24)) }))
    .filter(e => e.daysLeft < 0)
    .sort((a,b) => b.daysLeft - a.daysLeft)
    .slice(0, 3);

  function urgencyColor(days) {
    if (days <= 7)  return "#f87171";
    if (days <= 30) return "#f5c84a";
    if (days <= 90) return "#4f8ef7";
    return "#34d399";
  }

  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:16, padding:24, marginBottom:28, animation:"fadeUp 0.4s ease both" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
        <span style={{ fontSize:26 }}>📅</span>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, color:"var(--text)" }}>
            Upcoming Exam Countdowns
          </div>
          <div style={{ fontSize:14, color:"var(--muted)" }}>
            {personality ? `Filtered for ${personality} personality` : "All major Indian exams"}
          </div>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div style={{ color:"var(--muted)", fontSize:15, padding:"20px 0", textAlign:"center" }}>
          🎉 All exams for this year are done! Next cycle coming soon.
        </div>
      ) : (
        <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none" }}>
          {upcoming.map((exam, i) => (
            <div key={i} style={{
              minWidth:180,
              background:"var(--surface2)",
              border:`1px solid ${urgencyColor(exam.daysLeft)}44`,
              borderRadius:14,
              padding:18,
              flexShrink:0,
              borderTop:`4px solid ${urgencyColor(exam.daysLeft)}`
            }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{exam.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:4, lineHeight:1.3 }}>
                {exam.name}
              </div>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:12 }}>
                {new Date(exam.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:urgencyColor(exam.daysLeft) }}>
                  {exam.daysLeft}
                </span>
                <span style={{ fontSize:13, color:"var(--muted)" }}>days left</span>
              </div>
              {exam.daysLeft <= 7  && <div style={{ marginTop:6, fontSize:12, color:"#f87171", fontWeight:700 }}>⚠️ Very Soon!</div>}
              {exam.daysLeft <= 30 && exam.daysLeft > 7 && <div style={{ marginTop:6, fontSize:12, color:"#f5c84a", fontWeight:700 }}>🔥 Coming up!</div>}
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid var(--border)" }}>
          <div style={{ fontSize:13, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
            Recently Passed
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {past.map((exam, i) => (
              <span key={i} style={{
                padding:"5px 12px", borderRadius:20,
                background:"var(--surface2)", border:"1px solid var(--border)",
                fontSize:13, color:"var(--muted)"
              }}>
                {exam.icon} {exam.name} · {Math.abs(exam.daysLeft)}d ago
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Study Planner Modal ────────────────────────────────────
function StudyPlannerModal({ personality, onClose }) {
  const schedule = STUDY_SCHEDULES[personality] || STUDY_SCHEDULES["Analytical"];
  const info     = PERSONALITY_INFO[personality]  || PERSONALITY_INFO["Analytical"];

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}
    >
      <div
        style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:22, padding:32, maxWidth:540, width:"100%", maxHeight:"90vh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <div style={{ fontSize:13, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Daily Study Planner</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"var(--text)" }}>
              {info.emoji} {personality} Type Schedule
            </div>
          </div>
          <button onClick={onClose} style={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, padding:"7px 16px", color:"var(--muted)", cursor:"pointer", fontSize:14 }}>
            ✕ Close
          </button>
        </div>

        <div style={{ background:`${info.color}11`, border:`1px solid ${info.color}33`, borderRadius:12, padding:"12px 16px", marginBottom:22, fontSize:14, color:"var(--text)", lineHeight:1.7 }}>
          💡 {info.desc}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {schedule.map((slot, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"12px 14px", borderRadius:10,
              background: i % 2 === 0 ? "var(--surface2)" : "transparent"
            }}>
              <div style={{ minWidth:78, fontSize:13, fontWeight:700, color:info.color, fontFamily:"'Syne',sans-serif" }}>{slot.time}</div>
              <div style={{ fontSize:20 }}>{slot.icon}</div>
              <div style={{ fontSize:14, color:"var(--text)", flex:1 }}>{slot.activity}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:22, padding:"14px 18px", borderRadius:12, background:"rgba(245,200,74,0.08)", border:"1px solid rgba(245,200,74,0.2)", fontSize:13, color:"var(--gold)", textAlign:"center" }}>
          ⭐ Consistency is more important than intensity — follow this daily for 90 days!
        </div>
      </div>
    </div>
  );
}

// ── Aptitude Quiz Component ────────────────────────────────
function AptitudeQuiz({ onComplete }) {
  const [current, setCurrent]   = useState(0);
  const [scores, setScores]     = useState({ Analytical:0, Creative:0, Leader:0, Helper:0, Explorer:0 });
  const [result, setResult]     = useState(null);
  const [animating, setAnimating] = useState(false);

  function pickOption(type) {
    if (animating) return;
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (current + 1 >= QUIZ_QUESTIONS.length) {
        const winner = Object.entries(newScores).sort((a,b) => b[1]-a[1])[0][0];
        setResult(winner);
      } else {
        setCurrent(c => c + 1);
      }
    }, 300);
  }

  if (result) {
    const info = PERSONALITY_INFO[result];
    return (
      <div className="quiz-result-card">
        <div style={{ fontSize:80, marginBottom:18 }}>{info.emoji}</div>
        <div style={{ fontSize:13, color:info.color, fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>
          Your Personality Type
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:"var(--text)", marginBottom:14 }}>
          {result}
        </div>
        <div style={{ fontSize:16, color:"var(--muted)", lineHeight:1.7, marginBottom:24, maxWidth:440, textAlign:"center" }}>
          {info.desc}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:30 }}>
          {info.careers.map(c => (
            <span key={c} style={{
              padding:"6px 16px", borderRadius:20,
              background:`${info.color}18`, border:`1px solid ${info.color}44`,
              color:info.color, fontSize:14, fontWeight:600
            }}>{c}</span>
          ))}
        </div>
        <button className="profile-submit-btn" style={{ maxWidth:340, fontSize:16 }} onClick={() => onComplete(result)}>
          Continue with {result} Profile →
        </button>
        <button className="profile-skip-btn" style={{ marginTop:12, fontSize:14 }} onClick={() => onComplete(null)}>
          Skip quiz result, enter manually
        </button>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[current];
  const progress = (current / QUIZ_QUESTIONS.length) * 100;

  return (
    <div className="quiz-card">
      <div style={{ fontSize:13, color:"var(--accent)", fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:18 }}>
        🧠 Aptitude Quiz · Question {current + 1} of {QUIZ_QUESTIONS.length}
      </div>

      <div style={{ background:"var(--surface2)", borderRadius:99, height:6, marginBottom:26, overflow:"hidden" }}>
        <div style={{
          width:`${progress}%`, height:"100%",
          background:"linear-gradient(90deg,var(--accent),var(--accent2))",
          borderRadius:99, transition:"width 0.4s ease"
        }} />
      </div>

      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, color:"var(--text)", marginBottom:24, lineHeight:1.4 }}>
        {q.q}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {q.options.map((opt, i) => (
          <button key={i} className="quiz-opt-btn" onClick={() => pickOption(opt.type)}>
            <span className="quiz-opt-label" style={{ fontSize:15 }}>{opt.text}</span>
            <span style={{ fontSize:14, color:"var(--muted)", marginLeft:"auto" }}>→</span>
          </button>
        ))}
      </div>

      <button className="profile-skip-btn" style={{ marginTop:20, fontSize:14 }} onClick={() => onComplete(null)}>
        Skip quiz entirely
      </button>
    </div>
  );
}

// ── Compare Modal ──────────────────────────────────────────
function CompareModal({ courses, studentProfile, onClose }) {
  const [a, b] = courses;
  const scoreA = calculateMatchScore(a, studentProfile);
  const scoreB = calculateMatchScore(b, studentProfile);
  const winner = scoreA > scoreB ? "a" : scoreB > scoreA ? "b" : null;

  function Row({ label, va, vb, highlight }) {
    // Helper to extract string from potential object arrays
    const extractString = (val) => {
      if (Array.isArray(val)) {
        return val.map(item => typeof item === 'object' && item !== null ? item.name || JSON.stringify(item) : item).join(", ") || "—";
      }
      return typeof val === 'object' && val !== null ? val.name || JSON.stringify(val) : val || "—";
    };

    const dispA = extractString(va);
    const dispB = extractString(vb);

    return (
      <tr style={{ borderBottom:"1px solid var(--border)" }}>
        <td style={{ padding:"13px 14px", fontSize:13, color:"var(--muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.6px", whiteSpace:"nowrap", background:"var(--surface2)" }}>
          {label}
        </td>
        <td style={{ padding:"13px 14px", fontSize:14, color: highlight==="a" ? "var(--green)" : "var(--text)", fontWeight: highlight==="a" ? 700 : 400, borderLeft:"1px solid var(--border)", borderRight:"1px solid var(--border)" }}>
          {dispA}
        </td>
        <td style={{ padding:"13px 14px", fontSize:14, color: highlight==="b" ? "var(--green)" : "var(--text)", fontWeight: highlight==="b" ? 700 : 400 }}>
          {dispB}
        </td>
      </tr>
    );
  }

  return (
    <div className="compare-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={e => e.stopPropagation()}>
        <div className="compare-header">
          <div>
            <div style={{ fontSize:13, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>Course Comparison</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"var(--text)" }}>📊 Side-by-Side Analysis</div>
          </div>
          <button onClick={onClose} style={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, padding:"7px 16px", color:"var(--muted)", cursor:"pointer", fontSize:14 }}>
            ✕ Close
          </button>
        </div>

        {winner && (
          <div style={{ margin:"0 0 18px", padding:"13px 18px", borderRadius:10, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.25)", fontSize:14, color:"var(--green)", display:"flex", alignItems:"center", gap:8 }}>
            🏆 <strong>{winner==="a" ? a.name : b.name}</strong> is a better match — <strong>{winner==="a" ? scoreA : scoreB}%</strong> match score!
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 1fr", gap:0, marginBottom:2 }}>
          <div />
          {[a, b].map((c, idx) => {
            const sc      = idx === 0 ? scoreA : scoreB;
            const scColor = sc ? getScoreColor(sc) : "var(--accent)";
            const isWinner = (idx===0 && winner==="a") || (idx===1 && winner==="b");
            return (
              <div key={idx} style={{ padding:"12px 14px", borderLeft: idx===1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"var(--text)", marginBottom:4 }}>
                  {isWinner && "🏆 "}{c.icon} {c.name}
                </div>
                {sc && (
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ flex:1, height:5, background:"var(--surface2)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ width:`${sc}%`, height:"100%", background:scColor, borderRadius:99 }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:scColor }}>{sc}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <tbody>
              <Row label="Short Form"   va={a.short}         vb={b.short} />
              <Row label="Duration"     va={a.duration}      vb={b.duration} />
              <Row label="Eligibility"  va={a.eligibility}   vb={b.eligibility} />
              <Row label="Approx Fees"  va={a.approx_fees}   vb={b.approx_fees} highlight={scoreA >= scoreB ? "a" : "b"} />
              <Row label="Avg Salary"   va={a.avg_salary}    vb={b.avg_salary}   highlight={scoreA >= scoreB ? "a" : "b"} />
              <Row label="Entrance"     va={a.entrance_exams} vb={b.entrance_exams} />
              <Row label="Job Roles"    va={a.job_roles}     vb={b.job_roles} />
              <Row label="Top Colleges" va={a.top_colleges}  vb={b.top_colleges} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── ChatBot Component ──────────────────────────────────────
function ChatBot({ studentProfile, guidanceData, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `Hi ${studentProfile?.name || "there"}! 👋 I'm your CareerPath AI assistant.\n\nI know your profile — you are a **${studentProfile?.personality || "student"}** type with interest in **${studentProfile?.subjects || "various subjects"}**.\n\nAsk me anything about your career, courses, exams, or study tips!`
    }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

async function sendMessage(e) {
  e.preventDefault();
  if (!input.trim() || loading) return;

  const userMsg = input.trim();
  setInput("");
  setMessages(prev => [...prev, { role: "user", text: userMsg }]);
  setLoading(true);

  try {
    const profileText = studentProfile
      ? `Student Name: ${studentProfile.name}, Personality: ${studentProfile.personality}, Subjects: ${studentProfile.subjects}, Strengths: ${studentProfile.strengths}`
      : "No student profile.";

    const guidanceContext = guidanceData
      ? `Current career path: ${guidanceData.title}. Relevant courses: ${guidanceData.courses?.map(c => c.name).join(", ")}.`
      : "";

    const prompt = `You are a friendly career guidance assistant for Indian students.
Student Profile: ${profileText}
${guidanceContext}

Student asks: "${userMsg}"

Give a helpful, friendly reply in 2-4 sentences using emojis.
Focus on Indian colleges, entrance exams, and career paths.
Reply as plain text only — no JSON, no bullet points unless needed.`;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (data.error) {
      setMessages(prev => [...prev, {
        role: "bot",
        text: "⚠️ Ollama is not running. Please start Ollama on your Mac with: `ollama serve`"
      }]);
    } else {
      setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
    }

  } catch (err) {
    setMessages(prev => [...prev, {
      role: "bot",
      text: "❌ Could not connect to Ollama. Make sure it's running locally!"
    }]);
  }

  setLoading(false);
}

  const suggestions = [
    "What are the best courses for me?",
    "How to prepare for JEE?",
    "What salary can I expect?",
    "Top colleges in Tamil Nadu?",
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:20 }}>
      <div style={{
        width:"100%", maxWidth:420, height:"80vh",
        background:"var(--surface)", border:"1px solid var(--border2)",
        borderRadius:22, display:"flex", flexDirection:"column",
        overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.5)",
        animation:"fadeUp 0.3s ease both"
      }}>
        {/* Header */}
        <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12, background:"linear-gradient(135deg,rgba(79,142,247,0.15),rgba(124,92,252,0.1))" }}>
          <div style={{ width:44, height:44, borderRadius:14, background:"linear-gradient(135deg,#4f8ef7,#7c5cfc)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🤖</div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)" }}>CareerPath AI</div>
            <div style={{ fontSize:13, color:"#34d399" }}>● Online — ask me anything!</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:"auto", background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, padding:"6px 14px", color:"var(--muted)", cursor:"pointer", fontSize:13 }}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 8px", display:"flex", flexDirection:"column", gap:12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display:"flex", justifyContent: msg.role==="user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth:"82%", padding:"12px 16px", borderRadius:16,
                background: msg.role==="user"
                  ? "linear-gradient(135deg,#4f8ef7,#7c5cfc)"
                  : "var(--surface2)",
                color: msg.role==="user" ? "#fff" : "var(--text)",
                fontSize:14, lineHeight:1.6,
                borderBottomRightRadius: msg.role==="user" ? 4 : 16,
                borderBottomLeftRadius:  msg.role==="bot"  ? 4 : 16,
                border: msg.role==="bot" ? "1px solid var(--border)" : "none"
              }}>
                {msg.text.split("\n").map((line, j) => (
                  <div key={j} style={{ marginBottom: j < msg.text.split("\n").length - 1 ? 4 : 0 }}>
                    {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", justifyContent:"flex-start" }}>
              <div style={{ padding:"12px 18px", borderRadius:16, borderBottomLeftRadius:4, background:"var(--surface2)", border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", animation:`bounce 1s ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length <= 1 && (
          <div style={{ padding:"0 12px 10px", display:"flex", gap:6, flexWrap:"wrap" }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); }}
                style={{ padding:"6px 12px", borderRadius:20, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.25)", color:"var(--accent)", fontSize:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} style={{ padding:"12px 14px", borderTop:"1px solid var(--border)", display:"flex", gap:10 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            placeholder="Ask about careers, exams, colleges…"
            style={{
              flex:1, background:"var(--surface2)", border:"1px solid var(--border2)",
              borderRadius:12, padding:"11px 14px", color:"var(--text)",
              fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none"
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} style={{
            width:44, height:44, borderRadius:12, border:"none",
            background:"linear-gradient(135deg,#4f8ef7,#7c5cfc)",
            color:"#fff", fontSize:18, cursor:"pointer",
            opacity: loading || !input.trim() ? 0.5 : 1
          }}>→</button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
// ── Roadmap Timeline Component ─────────────────────────────
function RoadmapTimeline({ roadmap }) {
  const colors = ["#4f8ef7","#22d3ee","#34d399","#f5c84a"];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {(roadmap||[]).map((s, i) => (
        <div key={i} style={{ display:"flex", gap:18, position:"relative" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{
              width:44, height:44, borderRadius:"50%",
              background:`linear-gradient(135deg,${colors[i]||"#4f8ef7"},${colors[i]||"#4f8ef7"}99)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:800, fontSize:16, flexShrink:0,
              boxShadow:`0 4px 16px ${colors[i]||"#4f8ef7"}44`
            }}>{s.step}</div>
            {i < (roadmap.length - 1) && (
              <div style={{ width:2, flex:1, background:`linear-gradient(${colors[i]},${colors[i+1]||colors[i]})`, minHeight:40, opacity:0.3 }} />
            )}
          </div>
          <div style={{ paddingBottom:28, flex:1 }}>
            <div style={{ fontSize:12, color:colors[i]||"#4f8ef7", fontWeight:700, textTransform:"uppercase", letterSpacing:1.5, marginBottom:4 }}>
              {s.month}
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)", marginBottom:6 }}>
              {s.title}
            </div>
            <div style={{ fontSize:15, color:"var(--muted)", lineHeight:1.7 }}>
              {s.action}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Govt Exam Card ─────────────────────────────────────────
function GovtExamCard({ exam }) {
  return (
    <div style={{
      background:"var(--surface2)", border:`1px solid ${exam.color}33`,
      borderRadius:14, padding:18, borderLeft:`4px solid ${exam.color}`
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <span style={{ fontSize:24 }}>{exam.icon}</span>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"var(--text)" }}>{exam.name}</div>
          <div style={{ fontSize:13, color:"var(--muted)" }}>{exam.conducting_body}</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          ["📅 Exam Date", exam.exam_date],
          ["💰 Salary",    exam.salary_range],
          ["📋 Posts",     exam.posts],
          ["🎓 Eligible",  exam.eligibility],
        ].map(([label, val]) => (
          <div key={label} style={{ background:"var(--surface)", borderRadius:8, padding:"8px 12px" }}>
            <div style={{ fontSize:12, color:"var(--muted)", marginBottom:3 }}>{label}</div>
            <div style={{ fontSize:13, color:"var(--text)", fontWeight:600 }}>{val||"—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Scholarship Card ───────────────────────────────────────
function ScholarshipCard({ s }) {
  const typeColor = s.type === "Central" ? "#4f8ef7" : s.type === "State" ? "#34d399" : "#f5c84a";
  return (
    <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:14, padding:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"var(--text)", flex:1 }}>{s.name}</div>
        <span style={{ padding:"3px 10px", borderRadius:20, background:`${typeColor}18`, border:`1px solid ${typeColor}44`, color:typeColor, fontSize:12, fontWeight:600, flexShrink:0 }}>
          {s.type}
        </span>
      </div>
      <div style={{ fontSize:14, color:"var(--muted)", marginBottom:10 }}>🏛️ {s.provider}</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <span style={{ padding:"4px 12px", borderRadius:8, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", fontSize:13, color:"#34d399" }}>
          💰 {s.amount}
        </span>
        <span style={{ padding:"4px 12px", borderRadius:8, background:"var(--surface)", border:"1px solid var(--border)", fontSize:13, color:"var(--muted)" }}>
          📋 {s.eligibility}
        </span>
      </div>
    </div>
  );
}

// ── Course Card ────────────────────────────────────────────
// ── Course Card ────────────────────────────────────────────
function CourseCard({ course, studentProfile, onCompare, isInCompare, onLike, isLiked }) {
  const [expanded, setExpanded] = useState(false);
  const score = calculateMatchScore(course, studentProfile);
  const scoreColor = score ? getScoreColor(score) : "var(--accent)";

  // Helper to safely render arrays that might contain objects
  const renderList = (items) => {
    if (!Array.isArray(items)) return "—";
    return items.map(item => typeof item === 'object' && item !== null ? item.name || JSON.stringify(item) : item).join(" • ");
  };

  return (
    <div style={{
      background:"var(--surface)", border:"1px solid var(--border2)",
      borderRadius:16, overflow:"hidden",
      boxShadow: expanded ? "0 8px 32px rgba(0,0,0,0.2)" : "var(--shadow)",
      transition:"all 0.3s ease"
    }}>
      <div style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>
          <div style={{
            width:50, height:50, borderRadius:14, flexShrink:0,
            background:"linear-gradient(135deg,rgba(79,142,247,0.15),rgba(124,92,252,0.1))",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:24
          }}>{course.icon||"🎓"}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)", marginBottom:3 }}>
              {course.name}
            </div>
            <div style={{ fontSize:14, color:"var(--muted)" }}>{course.short}</div>
          </div>
          {score && (
            <div style={{ textAlign:"center", flexShrink:0 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:scoreColor }}>{score}%</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>match</div>
            </div>
          )}
        </div>

        {score && (
          <div style={{ background:"var(--surface2)", borderRadius:99, height:6, marginBottom:14, overflow:"hidden" }}>
            <div style={{ width:`${score}%`, height:"100%", background:`linear-gradient(90deg,${scoreColor},${scoreColor}99)`, borderRadius:99, transition:"width 0.8s ease" }} />
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {[
            ["⏱️ Duration",   course.duration],
            ["📋 Eligibility", course.eligibility],
            ["💰 Fees",        course.approx_fees],
          ].map(([label, val]) => (
            <div key={label} style={{ background:"var(--surface2)", borderRadius:10, padding:"8px 10px" }}>
              <div style={{ fontSize:11, color:"var(--muted)", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:13, color:"var(--text)", fontWeight:600 }}>{val||"—"}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
          {(course.entrance_exams||[]).map(ex => (
            <span key={typeof ex === 'object' ? ex.name||JSON.stringify(ex) : ex} style={{ padding:"4px 10px", borderRadius:8, background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.2)", fontSize:12, color:"var(--accent)" }}>
              {typeof ex === 'object' ? ex.name || JSON.stringify(ex) : ex}
            </span>
          ))}
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setExpanded(e => !e)} style={{
            flex:1, padding:"9px 0", borderRadius:10, border:"1px solid var(--border2)",
            background:"var(--surface2)", color:"var(--text)", cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14
          }}>
            {expanded ? "▲ Less" : "▼ More Details"}
          </button>
          <button onClick={() => onLike(course)} style={{
            width:40, height:40, borderRadius:10, border:"1px solid var(--border2)",
            background: isLiked ? "rgba(248,113,113,0.15)" : "var(--surface2)",
            color: isLiked ? "#f87171" : "var(--muted)", cursor:"pointer", fontSize:18
          }}>♥</button>
          <button onClick={() => onCompare(course)} style={{
            width:40, height:40, borderRadius:10, border:"1px solid var(--border2)",
            background: isInCompare ? "rgba(79,142,247,0.15)" : "var(--surface2)",
            color: isInCompare ? "var(--accent)" : "var(--muted)", cursor:"pointer", fontSize:16
          }}>⇄</button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding:"0 20px 20px", borderTop:"1px solid var(--border2)" }}>
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:12, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
              Top Colleges in India
            </div>
            <div style={{ fontSize:14, color:"var(--text)", lineHeight:1.6 }}>
              {renderList(course.top_colleges)}
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:12, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
              Job Roles & Career Scope
            </div>
            <div style={{ fontSize:14, color:"var(--text)", lineHeight:1.6 }}>
              {renderList(course.job_roles)}
            </div>
          </div>
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:12, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
              Average Starting Salary
            </div>
            <div style={{ fontSize:15, color:"#34d399", fontWeight:700 }}>
              {course.avg_salary || "—"} LPA
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function CareerPathIndia() {
  const [journey, setJourney]                         = useState([]);
  const [currentNode, setCurrentNode]                 = useState(null);
  const [phase, setPhase]                             = useState("auth_loading");
  const [selectedOpt, setSelectedOpt]                 = useState(null);
  const [guidanceData, setGuidanceData]               = useState(null);
  const [error, setError]                             = useState(null);
  const [studentProfile, setStudentProfile]           = useState(null);
  const [detectedPersonality, setDetectedPersonality] = useState(null);
  const [compareList, setCompareList]                 = useState([]);
  const [showCompare, setShowCompare]                 = useState(false);
  const [showPlanner, setShowPlanner]                 = useState(false);
  const [showChat, setShowChat]                       = useState(false);
  const [authUser, setAuthUser]                       = useState(null);
  const [likedItems, setLikedItems]                   = useState([]);
  const [showLiked, setShowLiked]                     = useState(false);
  const [activeTab, setActiveTab]                     = useState("courses");
  const mainRef = useRef(null);
  const initCalledRef = useRef(false); // ← ADD THIS

  // ── Auth + Data Loader ─────────────────────────────────
    // Auth & Data Loader
  useEffect(() => {
    async function initApp(user) {
  if (!user) { setPhase("login"); return; }

  setAuthUser(user);

  const [savedProfile, savedData, savedLikes] = await Promise.all([
    dbLoadProfile(user.id),
    dbLoadUserData(user.id),
    dbLoadLikes(user.id),
  ]);

  // ── Restore liked items ──────────────────────────────
  if (savedLikes?.length) setLikedItems(savedLikes);

  // ── No profile at all → fresh user → start quiz ─────
  if (!savedProfile) {
    setPhase("quiz");
    return;
  }

  // ── Has profile → restore it ─────────────────────────
  setStudentProfile(savedProfile);

  // ── Has completed guidance → go straight to results ──
  if (savedData?.guidance) {
    setGuidanceData(savedData.guidance);
    setSelectedOpt(savedData.selectedopt || null);
    setJourney(savedData.journey || []);
    setPhase("results");   // ✅ Never asks questions again
    return;
  }

  // ── Has a saved mid-journey (answered some but not done) ──
  if (savedData?.journey?.length > 0 && savedData?.currentnode) {
    setJourney(savedData.journey);
    setCurrentNode(savedData.currentnode);
    setPhase("question");  // ✅ Resume from where they left off
    return;
  }

  // ── Has profile but no journey yet → start from TREE ─
  setCurrentNode(TREE);
  setPhase("question");
}
    // ... rest of useEffect

  supabase.auth.getSession().then(({ data: { session } }) => {
    initApp(session?.user || null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
    // ✅ Only re-init on actual sign in/out, not on every token refresh
    if (_e === "SIGNED_IN")  initApp(session?.user);
    if (_e === "SIGNED_OUT") {
      setAuthUser(null);
      setPhase("login");
      setStudentProfile(null);
      setJourney([]);
      setGuidanceData(null);
    }
    // ✅ Ignore TOKEN_REFRESHED and other events — they caused re-asking
  });

  return () => listener?.subscription?.unsubscribe();
}, []);

  // ── Handle Profile Complete ────────────────────────────
  async function handleProfileComplete(profile) {
    setStudentProfile(profile);
    if (profile) {
      // --- SAVE LOCALLY ---
      localStorage.setItem("careerpath_profile", JSON.stringify(profile));
      
      if (authUser) {
        await dbSaveProfile(authUser.id, profile);
        // Also save to userdata so initApp finds it
        await dbSaveUserData(authUser.id, { journey: [], guidance: null, selectedopt: null });
      }
    }
    setCurrentNode(TREE);
    setPhase("question");
  }

  // ── Select Option ──────────────────────────────────────
   // Select Option
 function selectOption(parentNode, opt) {
  const newJourney = [...journey, {
    question: parentNode.question,
    answer:   opt.label,
    icon:     opt.icon,
    color:    opt.color,
  }];
  setJourney(newJourney);

  if (opt.resultKey) {
    setSelectedOpt(opt);
    setPhase("loading");
    setError(null);

    fetchGuidance(opt, newJourney, studentProfile)
      .then(async (data) => {
        setGuidanceData(data);
        setPhase("results");
        if (authUser) {
          await dbSaveUserData(authUser.id, {
            journey:      newJourney,
            guidance:     data,
            selectedopt:  opt,
            currentnode:  null,   // ✅ clear currentnode when done
            likeditems:   likedItems,
          });
        }
      })
      .catch(err => {
        setError(err.message || "Could not load guidance.");
        setPhase("results");
      });

  } else if (opt.options) {
    setCurrentNode(opt);
    setPhase("question");
    // ✅ Save mid-journey progress so reload resumes here
    if (authUser) {
      dbSaveUserData(authUser.id, {
        journey:     newJourney,
        currentnode: opt,        // ← saves which question they're on
        guidance:    null,
        selectedopt: null,
      });
    }
  }
}

  // ── Toggle Like ────────────────────────────────────────
 async function toggleLike(item) {
  const exists = likedItems.some(i => i.name === item.name);

  if (exists) {
    // Remove from state
    setLikedItems(prev => prev.filter(i => i.name !== item.name));
    // Remove from DB
    if (authUser) {
      await dbRemoveLike(authUser.id, item.name);
    }
  } else {
    // Add to state
    setLikedItems(prev => [...prev, item]);
    // Save to DB with user_name  ✅
    if (authUser) {
      const userName = studentProfile?.name || authUser.email || "Unknown";
      await dbSaveLike(authUser.id, userName, item);
    }
  }
}

  // ── Compare ────────────────────────────────────────────
  function toggleCompare(course) {
    setCompareList(prev => {
      if (prev.some(c => c.name === course.name)) return prev.filter(c => c.name !== course.name);
      if (prev.length >= 2) return [prev[1], course];
      return [...prev, course];
    });
  }

  // ── Start Over ─────────────────────────────────────────
    async function startOver() {
    localStorage.removeItem("careerpath_profile"); 
    localStorage.removeItem("careerpath_journey"); // --- CLEAR JOURNEY TOO ---
    
    if (authUser) {
      await dbSaveUserData(authUser.id, { journey: [], guidance: null, selectedopt: null, likeditems: [] });
    }
    // ... rest of startOver
    setLikedItems([]);
    setJourney([]);
    setGuidanceData(null);
    setError(null);
    setStudentProfile(null);
    setCurrentNode(null);
    setDetectedPersonality(null);
    setCompareList([]);
    setShowCompare(false);
    setPhase("quiz");
  }

  // ── Sign Out ───────────────────────────────────────────
    async function signOut() {
    localStorage.removeItem("careerpath_profile"); // --- CLEAR LOCAL DATA ---
    await supabase.auth.signOut();
    setAuthUser(null);
    setPhase("login");
    setStudentProfile(null);
    setJourney([]);
    setGuidanceData(null);
  }

  // ── Profile Form ───────────────────────────────────────
  function ProfileForm({ detectedPersonality, onComplete }) {
    const [name,        setName]        = useState("");
    const [strengths,   setStrengths]   = useState("");
    const [subjects,    setSubjects]    = useState("");
    const [personality, setPersonality] = useState(detectedPersonality || "");

    function submit(e) {
      e.preventDefault();
      if (!name.trim()) return;
      onComplete({ name: name.trim(), strengths: strengths.trim(), subjects: subjects.trim(), personality });
    }

    const inputStyle = {
      width:"100%", background:"var(--surface2)", border:"1px solid var(--border2)",
      borderRadius:12, padding:"14px 16px", color:"var(--text)",
      fontSize:16, fontFamily:"'DM Sans',sans-serif", outline:"none",
      boxSizing:"border-box"
    };

    return (
      <div className="profile-card">
        <div style={{ fontSize:13, color:"var(--accent)", fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>
          Step 2 of 2
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"var(--text)", marginBottom:8 }}>
          Your Student Profile
        </div>
        <div style={{ fontSize:15, color:"var(--muted)", marginBottom:28 }}>
          This helps us personalise your career guidance
        </div>
        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={{ display:"block", fontSize:14, color:"var(--muted)", marginBottom:6, fontWeight:600 }}>
              Your Name *
            </label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hariharan" required style={inputStyle} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:14, color:"var(--muted)", marginBottom:6, fontWeight:600 }}>
              Your Strengths
            </label>
            <input value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="e.g. Problem solving, creative thinking" style={inputStyle} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:14, color:"var(--muted)", marginBottom:6, fontWeight:600 }}>
              Favourite Subjects
            </label>
            <input value={subjects} onChange={e => setSubjects(e.target.value)} placeholder="e.g. Maths, Physics, Computer Science" style={inputStyle} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:14, color:"var(--muted)", marginBottom:8, fontWeight:600 }}>
              Personality Type
            </label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {Object.entries(PERSONALITY_INFO).map(([key, info]) => (
                <button key={key} type="button"
                  onClick={() => setPersonality(key)}
                  style={{
                    padding:"8px 16px", borderRadius:20,
                    background: personality === key ? `${info.color}22` : "var(--surface2)",
                    border: personality === key ? `2px solid ${info.color}` : "2px solid var(--border2)",
                    color: personality === key ? info.color : "var(--muted)",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                    fontWeight:600, fontSize:14, transition:"all 0.2s"
                  }}>
                  {info.emoji} {key}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="profile-submit-btn" style={{ fontSize:16, marginTop:8 }}>
            Start My Career Journey →
          </button>
        </form>
      </div>
    );
  }
    // ── CSS Styles ─────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #0f1117;
      --surface:  #1a1d27;
      --surface2: #21253a;
      --border:   rgba(255,255,255,0.06);
      --border2:  rgba(255,255,255,0.10);
      --text:     #e8eaf0;
      --muted:    rgba(255,255,255,0.45);
      --accent:   #4f8ef7;
      --accent2:  #7c5cfc;
      --green:    #34d399;
      --gold:     #f5c84a;
      --red:      #f87171;
      --cyan:     #22d3ee;
      --shadow:   0 4px 24px rgba(0,0,0,0.3);
    }

    body { font-family:'DM Sans',sans-serif; font-size:16px; background:var(--bg); color:var(--text); }

    .cp-root {
      min-height: 100vh;
      background: var(--bg);
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
    }

    /* ── Navbar ── */
    .cp-nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(15,17,23,0.92);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border2);
      padding: 0 28px;
      height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .cp-nav-logo {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 22px; color: #fff;
    }
    .cp-nav-logo span { color: var(--accent); }
    .cp-nav-actions { display: flex; align-items: center; gap: 10px; }
    .cp-nav-btn {
      padding: 8px 18px; border-radius: 10px;
      border: 1px solid var(--border2);
      background: var(--surface); color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 14px; cursor: pointer;
      transition: all 0.2s;
    }
    .cp-nav-btn:hover { background: var(--surface2); border-color: var(--accent); }
    .cp-nav-btn.primary {
      background: linear-gradient(135deg,var(--accent),var(--accent2));
      border: none; color: #fff;
    }
    .cp-nav-user {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 14px; border-radius: 20px;
      background: var(--surface); border: 1px solid var(--border2);
      font-size: 14px; color: var(--text);
    }
    .cp-nav-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg,var(--accent),var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 14px; color: #fff;
    }

    /* ── Center Wrapper ── */
    .cp-center {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center; justify-content: center;
      padding: 40px 20px;
    }

    /* ── Quiz Card ── */
    .quiz-card {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 22px;
      padding: 40px 36px;
      max-width: 600px; width: 100%;
      animation: fadeUp 0.4s ease both;
      box-shadow: 0 24px 80px rgba(0,0,0,0.4);
    }
    .quiz-result-card {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 22px;
      padding: 48px 36px;
      max-width: 560px; width: 100%;
      text-align: center;
      animation: fadeUp 0.4s ease both;
      box-shadow: 0 24px 80px rgba(0,0,0,0.4);
    }
    .quiz-opt-btn {
      width: 100%; padding: 16px 20px;
      background: var(--surface2); border: 1px solid var(--border2);
      border-radius: 14px; color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 15px; cursor: pointer; text-align: left;
      display: flex; align-items: center; gap: 12px;
      transition: all 0.18s;
    }
    .quiz-opt-btn:hover {
      border-color: var(--accent);
      background: rgba(79,142,247,0.08);
      transform: translateX(4px);
    }
    .quiz-opt-label { flex: 1; font-size: 15px; }

    /* ── Profile Card ── */
    .profile-card {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 22px;
      padding: 40px 36px;
      max-width: 580px; width: 100%;
      animation: fadeUp 0.4s ease both;
      box-shadow: 0 24px 80px rgba(0,0,0,0.4);
    }
    .profile-submit-btn {
      width: 100%; padding: 16px 0;
      border-radius: 12px; border: none;
      background: linear-gradient(135deg,var(--accent),var(--accent2));
      color: #fff; font-family: 'Syne', sans-serif;
      font-weight: 700; font-size: 16px; cursor: pointer;
      transition: opacity 0.2s;
    }
    .profile-submit-btn:hover { opacity: 0.88; }
    .profile-skip-btn {
      width: 100%; padding: 12px 0;
      border-radius: 10px; border: 1px solid var(--border2);
      background: transparent; color: var(--muted);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px; cursor: pointer;
    }

    /* ── Question Card ── */
    .question-card {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 22px;
      padding: 40px 36px;
      max-width: 640px; width: 100%;
      animation: fadeUp 0.35s ease both;
      box-shadow: 0 24px 80px rgba(0,0,0,0.4);
    }
    .option-btn {
      width: 100%; padding: 18px 20px;
      background: var(--surface2); border: 1px solid var(--border2);
      border-radius: 14px; color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 16px; font-weight: 500;
      cursor: pointer; text-align: left;
      display: flex; align-items: center; gap: 14px;
      transition: all 0.18s;
    }
    .option-btn:hover {
      border-color: var(--accent);
      background: rgba(79,142,247,0.08);
      transform: translateX(6px);
    }

    /* ── Results Page ── */
    .results-root {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 20px 80px;
    }
    .results-hero {
      background: linear-gradient(135deg,rgba(79,142,247,0.12),rgba(124,92,252,0.08));
      border: 1px solid rgba(79,142,247,0.2);
      border-radius: 22px;
      padding: 32px;
      margin-bottom: 28px;
      animation: fadeUp 0.4s ease both;
    }
    .section-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 22px;
      color: var(--text);
      margin-bottom: 18px;
      display: flex; align-items: center; gap: 10px;
    }

    /* ── Tabs ── */
    .tabs-bar {
      display: flex; gap: 6px; flex-wrap: wrap;
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 14px; padding: 6px;
      margin-bottom: 24px;
    }
    .tab-btn {
      padding: 10px 20px; border-radius: 10px; border: none;
      background: transparent; color: var(--muted);
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 15px; cursor: pointer;
      transition: all 0.2s; white-space: nowrap;
    }
    .tab-btn.active {
      background: linear-gradient(135deg,var(--accent),var(--accent2));
      color: #fff;
    }

    /* ── Dashboard ── */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .dash-stat-card {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 16px;
      padding: 22px 20px;
    }
    .dash-bar-wrap {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }

    /* ── Compare ── */
    .compare-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 200; display: flex;
      align-items: center; justify-content: center; padding: 20px;
    }
    .compare-modal {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 22px; padding: 28px;
      max-width: 780px; width: 100%;
      max-height: 90vh; overflow-y: auto;
      animation: fadeUp 0.3s ease both;
    }
    .compare-header {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 20px;
    }

    /* ── Loading ── */
    .loading-card {
      background: var(--surface);
      border: 1px solid var(--border2);
      border-radius: 22px; padding: 56px 36px;
      max-width: 480px; width: 100%; text-align: center;
      animation: fadeUp 0.4s ease both;
    }
    .spinner {
      width: 56px; height: 56px;
      border: 4px solid var(--border2);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 24px;
    }

    /* ── Liked Panel ── */
    .liked-panel {
      position: fixed; top: 64px; right: 0; bottom: 0;
      width: 360px; background: var(--surface);
      border-left: 1px solid var(--border2);
      z-index: 150; overflow-y: auto; padding: 24px;
      animation: slideIn 0.3s ease both;
    }

    /* ── Chat FAB ── */
    .chat-fab {
      position: fixed; bottom: 28px; right: 28px;
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg,var(--accent),var(--accent2));
      border: none; color: #fff; font-size: 26px;
      cursor: pointer; z-index: 199;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(79,142,247,0.4);
      transition: transform 0.2s;
    }
    .chat-fab:hover { transform: scale(1.1); }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
    @keyframes pulse {
      0%,100% { opacity:1; }
      50%      { opacity:0.5; }
    }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

    /* ── Responsive ── */
    @media (max-width: 640px) {
      .cp-nav { padding: 0 16px; }
      .quiz-card, .profile-card, .question-card { padding: 28px 20px; }
      .results-root { padding: 20px 14px 80px; }
      .dashboard-grid { grid-template-columns: 1fr 1fr; }
      .tabs-bar { gap: 4px; }
      .tab-btn { padding: 8px 12px; font-size: 13px; }
    }
  `;

  // ── Dashboard Component (inline) ──────────────────────
  function Dashboard() {
    const info        = PERSONALITY_INFO[studentProfile?.personality] || PERSONALITY_INFO["Analytical"];
    const courses     = guidanceData?.courses     || [];
    const exams       = guidanceData?.govt_exams  || [];
    const scholarships= guidanceData?.scholarships|| [];
    const journey_len = journey.length;

    // Bar chart data — match scores
    const barData = courses.slice(0,5).map(c => ({
      name:  c.name.length > 16 ? c.name.slice(0,16)+"…" : c.name,
      score: calculateMatchScore(c, studentProfile) || 70,
      color: getScoreColor(calculateMatchScore(c, studentProfile) || 70),
    }));

    // Salary data
    const salaryData = courses.slice(0,5).map(c => ({
      name:   c.name.length > 14 ? c.name.slice(0,14)+"…" : c.name,
      salary: parseInt((c.avg_salary||"0").replace(/[^0-9]/g,"")) || 0,
    }));
    const maxSalary = Math.max(...salaryData.map(s => s.salary), 1);

    return (
      <div style={{ animation:"fadeUp 0.4s ease both" }}>

        {/* Welcome Banner */}
        <div style={{
          background:"linear-gradient(135deg,rgba(79,142,247,0.15),rgba(124,92,252,0.1))",
          border:"1px solid rgba(79,142,247,0.2)",
          borderRadius:20, padding:"28px 28px", marginBottom:24,
          display:"flex", alignItems:"center", gap:20, flexWrap:"wrap"
        }}>
          <div style={{
            width:72, height:72, borderRadius:20, flexShrink:0,
            background:`linear-gradient(135deg,${info.color}33,${info.color}11)`,
            border:`2px solid ${info.color}44`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:36
          }}>{info.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, color:"var(--muted)", marginBottom:4 }}>Welcome back 👋</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:"var(--text)", marginBottom:4 }}>
              {studentProfile?.name}
            </div>
            <div style={{ fontSize:15, color:info.color, fontWeight:600 }}>
              {info.emoji} {studentProfile?.personality} Type · {studentProfile?.subjects}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>Logged in as</div>
            <div style={{ fontSize:14, color:"var(--text)", fontWeight:600 }}>{authUser?.email}</div>
            <button onClick={startOver} style={{
              marginTop:8, padding:"6px 14px", borderRadius:8,
              background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)",
              color:"#f87171", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif"
            }}>🔄 Reset Journey</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="dashboard-grid">
          {[
            { icon:"🎯", label:"Career Path",    value: selectedOpt?.label || "—",          color:"#4f8ef7" },
            { icon:"📚", label:"Courses Found",  value: courses.length,                      color:"#34d399" },
            { icon:"🏛️", label:"Govt Exams",    value: exams.length,                        color:"#f5c84a" },
            { icon:"🏆", label:"Scholarships",   value: scholarships.length,                 color:"#f87171" },
            { icon:"❤️", label:"Saved Courses",  value: likedItems.length,                  color:"#f87171" },
            { icon:"🗺️", label:"Journey Steps", value: journey_len,                        color:"#22d3ee" },
            { icon:"🧠", label:"Personality",    value: studentProfile?.personality || "—", color:info.color },
            { icon:"📅", label:"Upcoming Exams", value: EXAM_DATES.filter(e => {
                const d = Math.ceil((new Date(e.date)-new Date())/(1000*60*60*24));
                return d >= 0 && (!studentProfile?.personality || e.for.includes(studentProfile.personality));
              }).length, color:"#a78bfa" },
          ].map((s,i) => (
            <div key={i} className="dash-stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Match Score Bar Chart */}
        <div className="dash-bar-wrap">
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"var(--text)", marginBottom:20 }}>
            📊 Course Match Scores
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {barData.map((b, i) => (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:14, color:"var(--text)", fontWeight:500 }}>{b.name}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:b.color }}>{b.score}%</span>
                </div>
                <div style={{ height:10, background:"var(--surface2)", borderRadius:99, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:99,
                    width:`${b.score}%`,
                    background:`linear-gradient(90deg,${b.color},${b.color}88)`,
                    transition:"width 1s ease"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Chart */}
        <div className="dash-bar-wrap">
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"var(--text)", marginBottom:20 }}>
            💰 Average Salary Comparison (LPA)
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:14, height:160, padding:"0 8px" }}>
            {salaryData.map((s, i) => {
              const h = s.salary > 0 ? Math.max((s.salary / maxSalary) * 130, 20) : 20;
              const cols = ["#4f8ef7","#34d399","#f5c84a","#f87171","#22d3ee"];
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                  <div style={{ fontSize:12, color:"var(--muted)", fontWeight:600 }}>
                    {s.salary > 0 ? `${s.salary}L` : "—"}
                  </div>
                  <div style={{
                    width:"100%", height:h,
                    background:`linear-gradient(180deg,${cols[i]},${cols[i]}66)`,
                    borderRadius:"8px 8px 0 0",
                    transition:"height 0.8s ease"
                  }} />
                  <div style={{ fontSize:11, color:"var(--muted)", textAlign:"center", lineHeight:1.3 }}>
                    {s.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Journey Path */}
        {journey.length > 0 && (
          <div className="dash-bar-wrap">
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"var(--text)", marginBottom:16 }}>
              🗺️ Your Journey Path
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
              {journey.map((j, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{
                    padding:"8px 16px", borderRadius:20,
                    background:`${j.color||"#4f8ef7"}18`,
                    border:`1px solid ${j.color||"#4f8ef7"}44`,
                    fontSize:14, color:j.color||"#4f8ef7", fontWeight:600
                  }}>
                    {j.icon} {j.answer}
                  </div>
                  {i < journey.length - 1 && (
                    <span style={{ color:"var(--muted)", fontSize:18 }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personality Breakdown */}
        <div className="dash-bar-wrap">
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"var(--text)", marginBottom:16 }}>
            🧠 Personality Profile — {studentProfile?.personality}
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            <div style={{
              flex:1, minWidth:200, background:`${info.color}11`,
              border:`1px solid ${info.color}33`, borderRadius:14, padding:20
            }}>
              <div style={{ fontSize:48, marginBottom:12 }}>{info.emoji}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:info.color, marginBottom:8 }}>
                {studentProfile?.personality} Personality
              </div>
              <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.7 }}>{info.desc}</div>
            </div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:13, color:"var(--muted)", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>
                Recommended Careers
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {info.careers.map((c,i) => (
                  <div key={i} style={{
                    padding:"10px 14px", borderRadius:10,
                    background:"var(--surface2)", border:"1px solid var(--border)",
                    fontSize:14, color:"var(--text)", fontWeight:500,
                    display:"flex", alignItems:"center", gap:8
                  }}>
                    <span style={{ color:info.color }}>▶</span> {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
    // ── RENDER ─────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="cp-root">

        {/* ── AUTH LOADING ── */}
        {phase === "auth_loading" && (
          <div className="cp-center">
            <div className="loading-card">
              <div className="spinner" />
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, color:"var(--text)", marginBottom:8 }}>
                CareerPath India
              </div>
              <div style={{ fontSize:15, color:"var(--muted)" }}>Loading your profile…</div>
            </div>
          </div>
        )}

        {/* ── LOGIN ── */}
        {phase === "login" && <LoginScreen />}

        {/* ── QUIZ ── */}
        {phase === "quiz" && (
          <>
            <nav className="cp-nav">
              <div className="cp-nav-logo">Career<span>Path</span> India</div>
              <div className="cp-nav-actions">
                <span style={{ fontSize:14, color:"var(--muted)" }}>Step 1 of 2 — Aptitude Quiz</span>
              </div>
            </nav>
            <div className="cp-center">
              <AptitudeQuiz
                onComplete={detected => {
                  setDetectedPersonality(detected);
                  setPhase("profile");
                }}
              />
            </div>
          </>
        )}

        {/* ── PROFILE ── */}
        {phase === "profile" && (
          <>
            <nav className="cp-nav">
              <div className="cp-nav-logo">Career<span>Path</span> India</div>
              <div className="cp-nav-actions">
                <span style={{ fontSize:14, color:"var(--muted)" }}>Step 2 of 2 — Your Profile</span>
              </div>
            </nav>
            <div className="cp-center">
              <ProfileForm
                detectedPersonality={detectedPersonality}
                onComplete={handleProfileComplete}
              />
            </div>
          </>
        )}

        {/* ── QUESTION ── */}
        {phase === "question" && currentNode && (
          <>
            <nav className="cp-nav">
              <div className="cp-nav-logo">Career<span>Path</span> India</div>
              <div className="cp-nav-actions">
                {studentProfile && (
                  <div className="cp-nav-user">
                    <div className="cp-nav-avatar">
                      {studentProfile.name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <span>{studentProfile.name}</span>
                  </div>
                )}
                <button className="cp-nav-btn" onClick={startOver}>🔄 Restart</button>
                <button className="cp-nav-btn" onClick={signOut}>Sign Out</button>
              </div>
            </nav>
            <div className="cp-center">
              <div className="question-card">

                {/* Welcome back banner */}
                {studentProfile && (
                  <div style={{
                    background:"rgba(79,142,247,0.08)",
                    border:"1px solid rgba(79,142,247,0.18)",
                    borderRadius:12, padding:"10px 16px",
                    marginBottom:22, display:"flex",
                    alignItems:"center", gap:10, flexWrap:"wrap"
                  }}>
                    <span style={{ fontSize:20 }}>
                      {PERSONALITY_INFO[studentProfile.personality]?.emoji || "🎓"}
                    </span>
                    <span style={{ fontSize:15, color:"var(--accent)", fontWeight:700 }}>
                      Welcome back, {studentProfile.name}!
                    </span>
                    <span style={{ fontSize:13, color:"var(--muted)", marginLeft:"auto" }}>
                      {studentProfile.personality} · {studentProfile.subjects}
                    </span>
                  </div>
                )}

                {/* Journey breadcrumb */}
                {journey.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
                    {journey.map((j,i) => (
                      <span key={i} style={{
                        padding:"4px 12px", borderRadius:20, fontSize:13,
                        background:`${j.color||"#4f8ef7"}18`,
                        border:`1px solid ${j.color||"#4f8ef7"}33`,
                        color: j.color || "var(--accent)"
                      }}>{j.icon} {j.answer}</span>
                    ))}
                  </div>
                )}

                {/* Question Icon */}
                <div style={{
                  width:64, height:64, borderRadius:18, marginBottom:20,
                  background:"linear-gradient(135deg,rgba(79,142,247,0.15),rgba(124,92,252,0.1))",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:32
                }}>
                  {currentNode.icon || "🎯"}
                </div>

                <div style={{ fontSize:13, color:"var(--accent)", fontWeight:700, textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>
                  Choose Your Path
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:"var(--text)", marginBottom:26, lineHeight:1.4 }}>
                  {currentNode.question}
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {currentNode.options.map((opt, i) => (
                    <button key={i} className="option-btn"
                      onClick={() => selectOption(currentNode, opt)}
                      style={{ borderLeft:`4px solid ${opt.color||"var(--accent)"}` }}
                    >
                      <span style={{ fontSize:24 }}>{opt.icon}</span>
                      <span style={{ flex:1, fontSize:16 }}>{opt.label}</span>
                      <span style={{ color:"var(--muted)", fontSize:18 }}>→</span>
                    </button>
                  ))}
                </div>

                {journey.length > 0 && (
                  <button className="profile-skip-btn" style={{ marginTop:18 }}
                    onClick={() => {
                      const newJourney = journey.slice(0,-1);
                      setJourney(newJourney);
                      setCurrentNode(newJourney.length === 0 ? TREE : currentNode);
                      setPhase("question");
                      window.location.reload();
                    }}
                  >
                    ← Go Back
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <>
            <nav className="cp-nav">
              <div className="cp-nav-logo">Career<span>Path</span> India</div>
            </nav>
            <div className="cp-center">
              <div className="loading-card">
                <div className="spinner" />
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:"var(--text)", marginBottom:10 }}>
                  Analysing Your Profile…
                </div>
                <div style={{ fontSize:15, color:"var(--muted)", marginBottom:22, lineHeight:1.7 }}>
                  Gemini AI is finding the best courses, scholarships and exam dates for <strong style={{ color:"var(--accent)" }}>{selectedOpt?.label}</strong>
                </div>
                {[
                  "🔍 Matching your personality type…",
                  "📚 Finding top courses in India…",
                  "🏆 Searching scholarships…",
                  "📅 Checking exam dates 2026…",
                  "🗺️ Building your roadmap…",
                ].map((s, i) => (
                  <div key={i} style={{
                    fontSize:14, color:"var(--muted)",
                    padding:"6px 0", borderBottom:"1px solid var(--border)",
                    animation:`pulse 1.5s ${i*0.3}s infinite`,
                    display:"flex", alignItems:"center", gap:8
                  }}>{s}</div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── RESULTS ── */}
        {phase === "results" && (
          <>
            <nav className="cp-nav">
              <div className="cp-nav-logo">Career<span>Path</span> India</div>
              <div className="cp-nav-actions">
                {studentProfile && (
                  <div className="cp-nav-user">
                    <div className="cp-nav-avatar">
                      {studentProfile.name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <span>{studentProfile.name}</span>
                  </div>
                )}
                <button className="cp-nav-btn"
                  onClick={() => setShowPlanner(true)}
                  title="Daily Study Planner">
                  📅 Planner
                </button>
                <button className="cp-nav-btn"
                  onClick={() => setShowLiked(p => !p)}
                  style={{ position:"relative" }}>
                  ❤️ Saved
                  {likedItems.length > 0 && (
                    <span style={{
                      position:"absolute", top:-6, right:-6,
                      width:18, height:18, borderRadius:"50%",
                      background:"#f87171", color:"#fff",
                      fontSize:11, fontWeight:800,
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}>{likedItems.length}</span>
                  )}
                </button>
                {compareList.length === 2 && (
                  <button className="cp-nav-btn primary"
                    onClick={() => setShowCompare(true)}>
                    ⇄ Compare ({compareList.length})
                  </button>
                )}
                {guidanceData && (
                  <button className="cp-nav-btn"
                    onClick={() => saveAsPDF(guidanceData, studentProfile, selectedOpt, journey)}>
                    📥 PDF
                  </button>
                )}
                <button className="cp-nav-btn" onClick={startOver}>🔄 Restart</button>
                <button className="cp-nav-btn" onClick={signOut}>Sign Out</button>
              </div>
            </nav>

            <div className="results-root" ref={mainRef}>

              {/* Error Banner */}
              {error && (
                <div style={{
                  background:"rgba(248,113,113,0.08)",
                  border:"1px solid rgba(248,113,113,0.25)",
                  borderRadius:14, padding:"16px 20px",
                  marginBottom:20, color:"#f87171", fontSize:15
                }}>
                  ⚠️ {error} — Showing partial results.
                </div>
              )}

              {/* Results Hero */}
              {guidanceData && (
                <div className="results-hero">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                        {journey.map((j,i) => (
                          <span key={i} style={{
                            padding:"4px 12px", borderRadius:20, fontSize:13,
                            background:`${j.color||"#4f8ef7"}18`,
                            border:`1px solid ${j.color||"#4f8ef7"}33`,
                            color: j.color || "var(--accent)"
                          }}>{j.icon} {j.answer}</span>
                        ))}
                      </div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:"var(--text)", marginBottom:10, lineHeight:1.3 }}>
                        {guidanceData.title || selectedOpt?.label}
                      </div>
                      <div style={{ fontSize:16, color:"var(--muted)", lineHeight:1.7, maxWidth:640 }}>
                        {guidanceData.description}
                      </div>
                    </div>
                    {studentProfile && (
                      <div style={{
                        padding:"16px 20px", borderRadius:14,
                        background:"rgba(255,255,255,0.04)",
                        border:"1px solid var(--border2)", textAlign:"right", flexShrink:0
                      }}>
                        <div style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>Personalised for</div>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"var(--text)" }}>
                          {studentProfile.name}
                        </div>
                        <div style={{ fontSize:14, color:PERSONALITY_INFO[studentProfile.personality]?.color || "var(--accent)" }}>
                          {PERSONALITY_INFO[studentProfile.personality]?.emoji} {studentProfile.personality}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Exam Countdown */}
              <ExamCountdown personality={studentProfile?.personality} />

              {/* Tabs */}
              <div className="tabs-bar">
                {[
                  { key:"dashboard",    label:"📊 Dashboard"   },
                  { key:"courses",      label:"📚 Courses"     },
                  { key:"roadmap",      label:"🗺️ Roadmap"    },
                  { key:"exams",        label:"🏛️ Govt Exams" },
                  { key:"scholarships", label:"🏆 Scholarships"},
                ].map(t => (
                  <button key={t.key} className={`tab-btn${activeTab===t.key?" active":""}`}
                    onClick={() => setActiveTab(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── TAB: DASHBOARD ── */}
              {activeTab === "dashboard" && <Dashboard />}

              {/* ── TAB: COURSES ── */}
              {activeTab === "courses" && (
                <div style={{ animation:"fadeUp 0.4s ease both" }}>
                  {compareList.length > 0 && (
                    <div style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"12px 18px", borderRadius:12, marginBottom:18,
                      background:"rgba(79,142,247,0.08)",
                      border:"1px solid rgba(79,142,247,0.2)"
                    }}>
                      <span style={{ fontSize:14, color:"var(--accent)" }}>
                        ⇄ Comparing: {compareList.map(c=>c.name).join(" vs ")}
                      </span>
                      {compareList.length === 2 && (
                        <button className="cp-nav-btn primary" style={{ padding:"6px 14px", fontSize:13 }}
                          onClick={() => setShowCompare(true)}>
                          View Comparison
                        </button>
                      )}
                      <button style={{ marginLeft:"auto", background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:18 }}
                        onClick={() => setCompareList([])}>✕</button>
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:20 }}>
                    {(guidanceData?.courses||[]).map((course, i) => (
                      <CourseCard
                        key={i}
                        course={course}
                        studentProfile={studentProfile}
                        onCompare={toggleCompare}
                        isInCompare={compareList.some(c => c.name === course.name)}
                        onLike={toggleLike}
                        isLiked={likedItems.some(l => l.name === course.name)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB: ROADMAP ── */}
              {activeTab === "roadmap" && (
                <div style={{ animation:"fadeUp 0.4s ease both" }}>
                  <div style={{
                    background:"var(--surface)", border:"1px solid var(--border2)",
                    borderRadius:18, padding:28
                  }}>
                    <div className="section-title">🗺️ Your Study Roadmap</div>
                    <RoadmapTimeline roadmap={guidanceData?.roadmap} />
                  </div>
                </div>
              )}

              {/* ── TAB: GOVT EXAMS ── */}
              {activeTab === "exams" && (
                <div style={{ animation:"fadeUp 0.4s ease both" }}>
                  <div className="section-title">🏛️ Government Exams</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
                    {(guidanceData?.govt_exams||[]).map((exam, i) => (
                      <GovtExamCard key={i} exam={exam} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB: SCHOLARSHIPS ── */}
              {activeTab === "scholarships" && (
                <div style={{ animation:"fadeUp 0.4s ease both" }}>
                  <div className="section-title">🏆 Scholarships & Financial Aid</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:16 }}>
                    {(guidanceData?.scholarships||[]).map((s, i) => (
                      <ScholarshipCard key={i} s={s} />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* ── LIKED PANEL ── */}
            {showLiked && (
              <div className="liked-panel">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:"var(--text)" }}>
                    ❤️ Saved Courses
                  </div>
                  <button onClick={() => setShowLiked(false)}
                    style={{ background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, padding:"6px 14px", color:"var(--muted)", cursor:"pointer", fontSize:13 }}>
                    ✕
                  </button>
                </div>
                {likedItems.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--muted)", fontSize:15 }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>💔</div>
                    No saved courses yet.<br/>Tap ♥ on any course to save it.
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {likedItems.map((item, i) => (
                      <div key={i} style={{
                        background:"var(--surface2)", border:"1px solid var(--border)",
                        borderRadius:12, padding:16
                      }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                          <div>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:4 }}>
                              {item.icon} {item.name}
                            </div>
                            <div style={{ fontSize:13, color:"var(--muted)" }}>{item.short}</div>
                          </div>
                          <button onClick={() => toggleLike(item)}
                            style={{ background:"none", border:"none", color:"#f87171", fontSize:20, cursor:"pointer" }}>
                            ♥
                          </button>
                        </div>
                        <div style={{ marginTop:10, display:"flex", gap:8 }}>
                          <span style={{ padding:"4px 10px", borderRadius:8, background:"var(--surface)", border:"1px solid var(--border)", fontSize:12, color:"var(--muted)" }}>
                            ⏱️ {item.duration}
                          </span>
                          <span style={{ padding:"4px 10px", borderRadius:8, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", fontSize:12, color:"#34d399" }}>
                            💰 {item.avg_salary}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CHAT FAB ── */}
            {!showChat && (
              <button className="chat-fab" onClick={() => setShowChat(true)} title="Ask AI Assistant">
                🤖
              </button>
            )}
          </>
        )}

        {/* ── MODALS ── */}
        {showPlanner && studentProfile && (
          <StudyPlannerModal
            personality={studentProfile.personality}
            onClose={() => setShowPlanner(false)}
          />
        )}
        {showCompare && compareList.length === 2 && (
          <CompareModal
            courses={compareList}
            studentProfile={studentProfile}
            onClose={() => setShowCompare(false)}
          />
        )}
        {showChat && (
          <ChatBot
            studentProfile={studentProfile}
            guidanceData={guidanceData}
            onClose={() => setShowChat(false)}
          />
        )}

      </div>
    </>
  );
}