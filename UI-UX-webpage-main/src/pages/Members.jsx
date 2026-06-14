import React, { useState } from 'react'
import { useHome } from '../context/HomeContext'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import styles from './Members.module.css'
import { UserCircle } from 'lucide-react'

const ROLES = ['Admin', 'Full Access', 'Partial Access', 'View Only']

export default function Members() {
  const { members, addMember, removeMember } = useHome()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('Partial Access')

  const handleAdd = () => {
    if (!name.trim()) return
    addMember(name.trim(), role)
    setName(''); setRole('Partial Access')
    setShowModal(false)
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.length} people have access to your home`}
        action={
         <button
  onClick={() => setShowModal(true)}
 style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:12,border:'none',background:'#393a3b',color:'white',fontSize:'clamp(11px,2.5vw,13px)',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}
>
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  Add Member
</button>
        }
      />

      <div className={styles.list}>
        {members.map(m => (
          <div key={m.id} className={`${styles.card} glass`}>
            <span className={styles.avatar}><UserCircle size={40} strokeWidth={1.5} color="#6b7280" /></span>
            <div className={styles.info}>
              <div className={styles.name}>{m.name}</div>
              <div className={styles.role}>{m.role}</div>
            </div>
            <span className={`tag ${m.role === 'Admin' ? 'tag-teal' : 'tag-amber'}`}>{m.role}</span>
            {m.role !== 'Admin' && (
              <button className={styles.remove} onClick={() => removeMember(m.id)}>Remove</button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add New Member" onClose={() => setShowModal(false)}>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sara" autoFocus onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <label>Access Level</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'#f0f0f0',color:'#666',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}} onClick={() => setShowModal(false)}>Cancel</button>
            <button style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'var(--accent)',color:'white',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700}} onClick={handleAdd}>Add</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
