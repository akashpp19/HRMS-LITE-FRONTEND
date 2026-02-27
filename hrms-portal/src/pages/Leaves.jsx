import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/common/Avatar';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';

const leaveTypes = ['Sick Leave','Casual Leave','Annual Leave','Maternity Leave','Paternity Leave','Unpaid Leave','Other'];
const tabs = ['all','pending','approved','rejected'];

const statusCfg = {
  pending:  { bg:'#fef9c3', tc:'#b45309', dot:'#eab308', label:'Pending' },
  approved: { bg:'#dcfce7', tc:'#15803d', dot:'#22c55e', label:'Approved' },
  rejected: { bg:'#fee2e2', tc:'#dc2626', dot:'#ef4444', label:'Rejected' },
};
const statusCfgDark = {
  pending:  { bg:'rgba(234,179,8,0.18)',  tc:'#fde047', dot:'#eab308', label:'Pending' },
  approved: { bg:'rgba(34,197,94,0.18)',  tc:'#86efac', dot:'#22c55e', label:'Approved' },
  rejected: { bg:'rgba(239,68,68,0.18)',  tc:'#fca5a5', dot:'#ef4444', label:'Rejected' },
};

export default function Leaves() {
  const { employees, leaveRequests, addLeaveRequest, updateLeaveRequest, deleteLeaveRequest } = useApp();
  const { isDark, t } = useTheme();
  const [activeTab, setActiveTab] = useState("all");
  const [empFilter, setEmpFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ employeeId:"", leaveType:"Casual Leave", startDate:"", endDate:"", reason:"" });

  const card = { background: t.cardBg, borderRadius:16, boxShadow: t.cardShadow, border:`1px solid ${t.cardBorder}` };
  const inputStyle = { width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${t.inputBorder}`, fontSize:13, outline:"none", fontFamily:"inherit", color: t.inputText, background: t.inputBg, boxSizing:"border-box", transition:"border-color 0.15s" };
  const btnPrimary = { background:"linear-gradient(135deg,#5b21b6,#7c3aed)", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontSize:13, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 };
  const btnGhost = { background: t.btnGhostBg, color: t.btnGhostText, border:`1.5px solid ${t.btnGhostBorder}`, borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" };
  const overlay = { position:"fixed", inset:0, background: t.overlayBg, backdropFilter:"blur(4px)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16 };
  const modalBox = { background: t.modalBg, borderRadius:20, padding:32, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.3)" };

  const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
  const counts = {
    all: leaveRequests.length,
    pending: leaveRequests.filter(l=>l.status==="pending").length,
    approved: leaveRequests.filter(l=>l.status==="approved").length,
    rejected: leaveRequests.filter(l=>l.status==="rejected").length,
  };
  const filtered = useMemo(() => leaveRequests
    .filter(l => {
      if (activeTab !== "all" && l.status !== activeTab) return false;
      if (empFilter !== "all" && l.employeeId !== empFilter) return false;
      if (typeFilter !== "all" && l.leaveType !== typeFilter) return false;
      if (dateFrom && (l.startDate||"") < dateFrom) return false;
      if (dateTo   && (l.startDate||"") > dateTo)   return false;
      return true;
    })
    .sort((a,b) => (b.startDate||"").localeCompare(a.startDate||"")),
    [leaveRequests, activeTab, empFilter, typeFilter, dateFrom, dateTo]
  );

  const chips = [];
  if (empFilter !== "all") {
    const emp = empMap[empFilter];
    chips.push({ key:"emp", label: emp ? `${emp.firstName} ${emp.lastName}` : empFilter, clear: () => setEmpFilter("all") });
  }
  if (typeFilter !== "all") chips.push({ key:"type", label: typeFilter, clear: () => setTypeFilter("all") });
  if (dateFrom) chips.push({ key:"from", label: `From: ${dateFrom}`, clear: () => setDateFrom("") });
  if (dateTo)   chips.push({ key:"to",   label: `To: ${dateTo}`,     clear: () => setDateTo("") });
  const clearAll = () => { setEmpFilter("all"); setTypeFilter("all"); setDateFrom(""); setDateTo(""); };

  const fc = (f,v) => setForm(p=>({...p,[f]:v}));
  const focus = e => e.target.style.borderColor="#7c3aed";
  const blur  = e => e.target.style.borderColor = t.inputBorder;

  const handleAdd = () => {
    addLeaveRequest({ ...form, id:`LR${Date.now()}`, status:"pending", appliedDate:format(new Date(),"yyyy-MM-dd") });
    setForm({ employeeId:"", leaveType:"Casual Leave", startDate:"", endDate:"", reason:"" });
    setModal(null);
  };
  const handleAction = (id, status) => updateLeaveRequest(id, { status });
  const handleDelete = () => { deleteLeaveRequest(deleteId); setDeleteId(null); setModal(null); };
  const getDays = lr => {
    try { return differenceInCalendarDays(parseISO(lr.endDate),parseISO(lr.startDate))+1; } catch { return "?"; }
  };
  const getStatusCfg = s => (isDark ? statusCfgDark : statusCfg)[s] || { bg:t.badgeBg, tc:t.badgeText, dot:t.muted, label:s };

  const Label = ({ch}) => <div style={{ fontSize:12,fontWeight:700,color:t.label,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em" }}>{ch}</div>;

  return (
    <div style={{ fontFamily:"Inter,system-ui,sans-serif" }}>

      {/* KPI Cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:24 }}>
        {[
          { label:"Total Requests", value:counts.all, bg:t.kpi1Bg, tc:t.kpi1Text, emoji:"📋" },
          { label:"Pending", value:counts.pending, bg:t.kpi4Bg, tc:t.kpi4Text, emoji:"⏳" },
          { label:"Approved", value:counts.approved, bg:t.kpi3Bg, tc:t.kpi3Text, emoji:"✅" },
          { label:"Rejected", value:counts.rejected, bg:t.kpi5Bg, tc:t.kpi5Text, emoji:"❌" },
        ].map(s=>(
          <div key={s.label} style={{ ...card,padding:"18px 20px",display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:46,height:46,borderRadius:14,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{s.emoji}</div>
            <div>
              <div style={{ fontSize:26,fontWeight:800,color:s.tc,lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11,color:t.muted,fontWeight:500,marginTop:3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} value={empFilter} onChange={e => setEmpFilter(e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="all">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
          <select style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="all">All Leave Types</option>
            {leaveTypes.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>📅 From</span>
          <input type="date" style={{ ...inputStyle, width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} onFocus={focus} onBlur={blur} />
          <span style={{ fontSize: 13, color: '#64748b' }}>→</span>
          <input type="date" style={{ ...inputStyle, width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} onFocus={focus} onBlur={blur} />
        </div>
        {chips.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
            {chips.map(c => (
              <span key={c.key} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                color: '#7c3aed', fontSize: 12, fontWeight: 600,
                padding: '4px 10px 4px 12px', borderRadius: 99,
              }}>
                {c.label}
                <button onClick={c.clear} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7c3aed', lineHeight: 1, fontSize: 14, padding: 0, display: 'flex', alignItems: 'center' }}>×</button>
              </span>
            ))}
            <button onClick={clearAll} style={{ fontSize: 12, fontWeight: 600, color: t.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>Clear all</button>
          </div>
        )}
      </div>

      {/* Tabs + Add button */}
      <div style={{ ...card,padding:"14px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap" }}>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {tabs.map(tab=>{
            const active = activeTab===tab;
            return (
              <button key={tab} onClick={()=>setActiveTab(tab)} style={{
                padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,textTransform:"capitalize",transition:"all .15s",
                background: active?"linear-gradient(135deg,#5b21b6,#7c3aed)":t.badgeBg,
                color: active?"#fff":t.badgeText,
                boxShadow: active?"0 4px 12px rgba(124,58,237,0.3)":"none",
              }}>
                {tab} <span style={{ marginLeft:4,background:active?"rgba(255,255,255,0.22)":t.divider,color:active?"#fff":t.muted,padding:"1px 7px",borderRadius:99,fontSize:11,fontWeight:700 }}>{counts[tab]}</span>
              </button>
            );
          })}
        </div>
        <button style={btnPrimary} onClick={()=>setModal("add")}>＋ New Request</button>
      </div>

      {/* Table */}
      <div style={{ ...card,overflow:"hidden" }}>
        {filtered.length===0 ? (
          <div style={{ padding:72,textAlign:"center" }}>
            <div style={{ fontSize:52,marginBottom:12 }}>📋</div>
            <div style={{ fontSize:16,fontWeight:700,color:t.h2,marginBottom:4 }}>No leave requests</div>
            <div style={{ fontSize:13,color:t.muted }}>{activeTab!=="all"?`No ${activeTab} requests`:"Submit the first leave request"}</div>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:780 }}>
              <thead>
                <tr style={{ background:t.tableHeadBg,borderBottom:`2px solid ${t.tableDivider}` }}>
                  {["Employee","Type","Period","Days","Reason","Status","Actions"].map(h=>(
                    <th key={h} style={{ padding:"13px 20px",textAlign:h==="Actions"?"right":"left",fontSize:11,fontWeight:700,color:t.tableHeadText,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lr=>{
                  const emp=empMap[lr.employeeId];
                  const scfg=getStatusCfg(lr.status);
                  return (
                    <tr key={lr.id}
                      style={{ borderBottom:`1px solid ${t.tableDivider}`,transition:"background .15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=t.tableRowHover}
                      onMouseLeave={e=>e.currentTarget.style.background=""}
                    >
                      <td style={{ padding:"13px 20px" }}>
                        {emp?(
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <Avatar firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                            <div>
                              <div style={{ fontSize:13,fontWeight:600,color:t.h1,whiteSpace:"nowrap" }}>{emp.firstName} {emp.lastName}</div>
                              <div style={{ fontSize:11,color:t.muted }}>{emp.department}</div>
                            </div>
                          </div>
                        ):<span style={{ fontSize:13,color:t.muted }}>{lr.employeeId}</span>}
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span style={{ background:t.kpi1Bg,color:t.kpi1Text,fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:99 }}>{lr.leaveType}</span>
                      </td>
                      <td style={{ padding:"13px 20px",fontSize:13,color:t.sub,whiteSpace:"nowrap" }}>
                        {lr.startDate?format(parseISO(lr.startDate),"MMM d"):"—"} – {lr.endDate?format(parseISO(lr.endDate),"MMM d, yyyy"):"—"}
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span style={{ background:t.badgeBg,color:t.bodyText,fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:99 }}>{getDays(lr)}d</span>
                      </td>
                      <td style={{ padding:"13px 20px",fontSize:12,color:t.sub,maxWidth:180 }}>
                        <div style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{lr.reason}</div>
                      </td>
                      <td style={{ padding:"13px 20px" }}>
                        <span style={{ background:scfg.bg,color:scfg.tc,fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:99,display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
                          <span style={{ width:6,height:6,borderRadius:"50%",background:scfg.dot,flexShrink:0 }} />
                          {scfg.label}
                        </span>
                      </td>
                      <td style={{ padding:"13px 20px",textAlign:"right" }}>
                        <div style={{ display:"flex",gap:4,justifyContent:"flex-end",alignItems:"center" }}>
                          {lr.status==="pending" && (
                            <>
                              <button onClick={()=>handleAction(lr.id,"approved")}
                                style={{ background:"#dcfce7",color:"#15803d",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}
                                onMouseEnter={e=>e.currentTarget.style.background="#bbf7d0"}
                                onMouseLeave={e=>e.currentTarget.style.background="#dcfce7"}
                              >✔ Approve</button>
                              <button onClick={()=>handleAction(lr.id,"rejected")}
                                style={{ background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}
                                onMouseEnter={e=>e.currentTarget.style.background="#fecaca"}
                                onMouseLeave={e=>e.currentTarget.style.background="#fee2e2"}
                              >✕ Reject</button>
                            </>
                          )}
                          <button onClick={()=>{ setDeleteId(lr.id); setModal("delete"); }}
                            style={{ background:"transparent",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:t.muted }}
                            onMouseEnter={e=>{e.currentTarget.style.background="#fff1f2";e.currentTarget.style.color="#dc2626";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=t.muted;}}
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding:"12px 20px",borderTop:`1px solid ${t.divider}`,fontSize:12,color:t.muted }}>
              Showing {filtered.length} of {leaveRequests.length} requests
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {modal==="add" && (
        <div style={overlay} onClick={()=>setModal(null)}>
          <div style={modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
              <h2 style={{ fontSize:20,fontWeight:800,color:t.h1,margin:0 }}>📋 New Leave Request</h2>
              <button onClick={()=>setModal(null)} style={{ background:t.badgeBg,border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18,color:t.muted }}>×</button>
            </div>
            <div style={{ marginBottom:16 }}>
              <Label ch="Employee *" />
              <select style={inputStyle} value={form.employeeId} onChange={e=>fc("employeeId",e.target.value)} onFocus={focus} onBlur={blur}>
                <option value="">Select employee</option>
                {employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <Label ch="Leave Type" />
              <select style={inputStyle} value={form.leaveType} onChange={e=>fc("leaveType",e.target.value)} onFocus={focus} onBlur={blur}>
                {leaveTypes.map(tp=><option key={tp} value={tp}>{tp}</option>)}
              </select>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16 }}>
              <div><Label ch="Start Date *" /><input type="date" style={inputStyle} value={form.startDate} onChange={e=>fc("startDate",e.target.value)} onFocus={focus} onBlur={blur}/></div>
              <div><Label ch="End Date *" /><input type="date" style={inputStyle} value={form.endDate} onChange={e=>fc("endDate",e.target.value)} onFocus={focus} onBlur={blur}/></div>
            </div>
            <div style={{ marginBottom:24 }}>
              <Label ch="Reason *" />
              <textarea rows={3} style={{ ...inputStyle,resize:"none" }} value={form.reason} onChange={e=>fc("reason",e.target.value)} placeholder="Reason for leave…" onFocus={focus} onBlur={blur}/>
            </div>
            <div style={{ display:"flex",gap:12,justifyContent:"flex-end" }}>
              <button style={btnGhost} onClick={()=>setModal(null)}>Cancel</button>
              <button style={btnPrimary} onClick={handleAdd}>✔ Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal==="delete" && (
        <div style={overlay} onClick={()=>{ setModal(null); setDeleteId(null); }}>
          <div style={{ ...modalBox,maxWidth:400,textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:52,marginBottom:12 }}>🗑️</div>
            <h2 style={{ fontSize:20,fontWeight:800,color:t.h1,marginBottom:8 }}>Delete Request?</h2>
            <p style={{ fontSize:14,color:t.sub,marginBottom:28 }}>This leave request will be permanently removed.</p>
            <div style={{ display:"flex",gap:12,justifyContent:"center" }}>
              <button style={btnGhost} onClick={()=>{ setModal(null); setDeleteId(null); }}>Cancel</button>
              <button style={{ ...btnPrimary,background:"#ef4444" }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
