import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Save, Building2, Sliders, Database, Upload, Download, RotateCcw } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, exportData, importData, resetData } = useApp();
  const { isDark, toggleTheme, t } = useTheme();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importOk, setImportOk] = useState(false);
  const [importErr, setImportErr] = useState('');
  const card = { background: t.cardBg, borderRadius: 18, boxShadow: t.cardShadow, border: `1px solid ${t.cardBorder}`, overflow: 'hidden' };
  const inputStyle = { width:'100%', padding:'10px 14px', borderRadius:10, border:`1.5px solid ${t.inputBorder}`, fontSize:13, outline:'none', fontFamily:'inherit', color:t.inputText, background:t.inputBg, boxSizing:'border-box', transition:'border-color 0.15s' };
  const btnPrimary = { background:'linear-gradient(135deg,#5b21b6,#7c3aed)', color:'#fff', border:'none', borderRadius:11, padding:'11px 26px', fontSize:14, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 4px 16px rgba(124,58,237,0.35)', transition:'all 0.2s' };
  const btnGhost = { background:t.btnGhostBg, color:t.btnGhostText, border:`1.5px solid ${t.btnGhostBorder}`, borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer' };
  const overlay = { position:'fixed', inset:0, background:t.overlayBg, backdropFilter:'blur(4px)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 };
  const modalBox = { background:t.modalBg, borderRadius:20, padding:32, width:'100%', maxWidth:400, textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' };

  const fc = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const focus = e => e.target.style.borderColor = '#7c3aed';
  const blur = e => e.target.style.borderColor = t.inputBorder;

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportErr('');
    setImportOk(false);
    importData(file)
      .then(() => { setImportOk(true); setTimeout(() => setImportOk(false), 3000); })
      .catch(() => setImportErr('Invalid or corrupt backup file.'));
  };

  const handleReset = () => {
    resetData();
    setForm({ companyName:'', companyEmail:'', companyPhone:'', companyAddress:'', timezone:'Asia/Kolkata', dateFormat:'DD/MM/YYYY', weekStart:'Monday' });
    setResetConfirm(false);
  };

  const SectionHeader = ({ icon: Icon, title, sub, color }) => (
    <div style={{ padding:'18px 24px', borderBottom:`1px solid ${t.divider}`, background:t.sectionHeadBg, display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:44, height:44, borderRadius:13, background:`rgba(${color},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid rgba(${color},0.2)` }}>
        <Icon size={20} style={{ color:`rgb(${color})` }} />
      </div>
      <div>
        <div style={{ fontSize:15, fontWeight:700, color:t.h1 }}>{title}</div>
        <div style={{ fontSize:12, color:t.muted, marginTop:1 }}>{sub}</div>
      </div>
    </div>
  );

  const Field = ({ label, children }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:11, fontWeight:700, color:t.label, marginBottom:7, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
      {children}
    </div>
  );

  const Toggle = ({ label, sub, value, onChange }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:`1px solid ${t.divider}` }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:t.h2 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:t.muted, marginTop:2 }}>{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width:44, height:24, borderRadius:99, border:'none', cursor:'pointer',
          background: value ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : t.badgeBg,
          position:'relative', transition:'all 0.25s', flexShrink:0,
          boxShadow: value ? '0 2px 10px rgba(124,58,237,0.4)' : 'none',
        }}
      >
        <span style={{
          position:'absolute', top:3, left: value ? 22 : 3,
          width:18, height:18, borderRadius:'50%', background:'#fff',
          boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left 0.25s',
        }}/>
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily:"Inter,system-ui,sans-serif" }}>

      {/* Centered content */}
      <div style={{ maxWidth:720, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>

        {/* Company Info */}
        <div style={card}>
          <SectionHeader icon={Building2} title="Company Information" sub="Basic details about your organization" color="124,58,237" />
          <div style={{ padding:'24px' }}>
            <Field label="Company Name">
              <input style={inputStyle} value={form.companyName||''} onChange={e=>fc('companyName',e.target.value)} placeholder="HRMS Lite Corp" onFocus={focus} onBlur={blur}/>
            </Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <Field label="Email">
                <input style={inputStyle} type="email" value={form.companyEmail||''} onChange={e=>fc('companyEmail',e.target.value)} placeholder="admin@company.com" onFocus={focus} onBlur={blur}/>
              </Field>
              <Field label="Phone">
                <input style={inputStyle} value={form.companyPhone||''} onChange={e=>fc('companyPhone',e.target.value)} placeholder="+91 98765 43210" onFocus={focus} onBlur={blur}/>
              </Field>
            </div>
            <Field label="Address">
              <input style={inputStyle} value={form.companyAddress||''} onChange={e=>fc('companyAddress',e.target.value)} placeholder="123 Tech Park, Bangalore" onFocus={focus} onBlur={blur}/>
            </Field>
          </div>
        </div>

        {/* Preferences */}
        <div style={card}>
          <SectionHeader icon={Sliders} title="Preferences" sub="Timezone, date format and other settings" color="59,130,246" />
          <div style={{ padding:'0 24px' }}>
            <Toggle label="Dark Mode" sub="Switch to dark interface" value={isDark} onChange={toggleTheme} />
            <div style={{ paddingTop:18, paddingBottom:6 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Field label="Timezone">
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.timezone||'Asia/Kolkata'} onChange={e=>fc('timezone',e.target.value)} onFocus={focus} onBlur={blur}>
                    {['Asia/Kolkata','UTC','America/New_York','Europe/London','Asia/Singapore','Australia/Sydney'].map(z=><option key={z}>{z}</option>)}
                  </select>
                </Field>
                <Field label="Date Format">
                  <select style={{ ...inputStyle, cursor:'pointer' }} value={form.dateFormat||'DD/MM/YYYY'} onChange={e=>fc('dateFormat',e.target.value)} onFocus={focus} onBlur={blur}>
                    {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(f=><option key={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Week Starts On">
                <div style={{ display:'flex', gap:8 }}>
                  {['Monday','Sunday','Saturday'].map(d=>(
                    <button key={d} onClick={()=>fc('weekStart',d)} style={{
                      flex:1, padding:'9px 0', borderRadius:10, border:`1.5px solid ${form.weekStart===d?'#7c3aed':t.inputBorder}`,
                      background: form.weekStart===d?'linear-gradient(135deg,#5b21b6,#7c3aed)':'transparent',
                      color: form.weekStart===d?'#fff':t.bodyText,
                      fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                    }}>{d}</button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:14 }}>
          {saved && (
            <span style={{ fontSize:13, color:'#22c55e', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              ✔ Settings saved successfully
            </span>
          )}
          <button
            style={btnPrimary}
            onClick={handleSave}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(124,58,237,0.45)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 16px rgba(124,58,237,0.35)';}}
          >
            <Save size={15} /> Save Settings
          </button>
        </div>

        {/* Data Management */}
        <div style={card}>
          <SectionHeader icon={Database} title="Data Management" sub="Export, import or reset your HRMS data" color="239,68,68" />
          <div style={{ padding:24 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
              {/* Export */}
              <div style={{ border:`1.5px dashed ${t.cardBorder}`, borderRadius:14, padding:'20px', textAlign:'center', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#7c3aed';e.currentTarget.style.background=isDark?'rgba(124,58,237,0.08)':'#faf5ff';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=t.cardBorder;e.currentTarget.style.background='transparent';}}
              >
                <div style={{ width:48,height:48,borderRadius:14,background:t.kpi1Bg,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
                  <Download size={22} style={{ color:t.kpi1Text }} />
                </div>
                <div style={{ fontSize:14,fontWeight:700,color:t.h2,marginBottom:4 }}>Export Data</div>
                <div style={{ fontSize:11,color:t.muted,marginBottom:14,lineHeight:1.4 }}>Download all employees, attendance and leave data as JSON</div>
                <button style={{ ...btnPrimary,fontSize:12,padding:'8px 18px',boxShadow:'none' }} onClick={exportData}>
                  <Download size={13}/> Export
                </button>
              </div>

              {/* Import */}
              <div style={{ border:`1.5px dashed ${t.cardBorder}`, borderRadius:14, padding:'20px', textAlign:'center', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.background=isDark?'rgba(59,130,246,0.08)':'#eff6ff';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=t.cardBorder;e.currentTarget.style.background='transparent';}}
              >
                <div style={{ width:48,height:48,borderRadius:14,background:t.kpi2Bg,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
                  <Upload size={22} style={{ color:t.kpi2Text }} />
                </div>
                <div style={{ fontSize:14,fontWeight:700,color:t.h2,marginBottom:4 }}>Import Data</div>
                <div style={{ fontSize:11,color:t.muted,marginBottom:14,lineHeight:1.4 }}>Restore from a previously exported JSON backup file</div>
                <label style={{ ...btnPrimary,fontSize:12,padding:'8px 18px',background:'linear-gradient(135deg,#1d4ed8,#3b82f6)',boxShadow:'none',cursor:'pointer' }}>
                  <Upload size={13}/> Import
                  <input type="file" accept=".json" style={{ display:'none' }} onChange={handleImport}/>
                </label>
                {importOk && <div style={{ fontSize:11,color:'#22c55e',marginTop:8,fontWeight:600 }}>✔ Imported successfully</div>}
                {importErr && <div style={{ fontSize:11,color:'#ef4444',marginTop:8 }}>{importErr}</div>}
              </div>

              {/* Reset */}
              <div style={{ border:`1.5px dashed ${t.cardBorder}`, borderRadius:14, padding:'20px', textAlign:'center', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.background=isDark?'rgba(239,68,68,0.08)':'#fff5f5';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=t.cardBorder;e.currentTarget.style.background='transparent';}}
              >
                <div style={{ width:48,height:48,borderRadius:14,background:t.kpi5Bg,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
                  <RotateCcw size={22} style={{ color:t.kpi5Text }} />
                </div>
                <div style={{ fontSize:14,fontWeight:700,color:t.h2,marginBottom:4 }}>Reset Data</div>
                <div style={{ fontSize:11,color:t.muted,marginBottom:14,lineHeight:1.4 }}>Restore all data to factory defaults. This cannot be undone</div>
                <button style={{ ...btnPrimary,fontSize:12,padding:'8px 18px',background:'linear-gradient(135deg,#dc2626,#ef4444)',boxShadow:'none' }} onClick={()=>setResetConfirm(true)}>
                  <RotateCcw size={13}/> Reset
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Reset Confirm Modal */}
      {resetConfirm && (
        <div style={overlay} onClick={()=>setResetConfirm(false)}>
          <div style={modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:52,marginBottom:12 }}>⚠️</div>
            <h2 style={{ fontSize:20,fontWeight:800,color:t.h1,marginBottom:8 }}>Reset All Data?</h2>
            <p style={{ fontSize:14,color:t.sub,marginBottom:28,lineHeight:1.6 }}>All employees, attendance records, and leave requests will be permanently deleted and settings will be cleared. This cannot be undone.</p>
            <div style={{ display:'flex',gap:12,justifyContent:'center' }}>
              <button style={btnGhost} onClick={()=>setResetConfirm(false)}>Cancel</button>
              <button style={{ ...btnPrimary,background:'linear-gradient(135deg,#dc2626,#ef4444)' }} onClick={handleReset}>Reset Everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
