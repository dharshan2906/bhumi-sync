import React, { useState } from 'react';
import { 
  Building2, Lock, User, ShieldCheck, 
  ArrowRight, Key, AlertCircle, ArrowLeft, Check
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { username: string; name: string; role: string; designation: string }) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToLanding
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('GIS_OFFICER');
  const [username, setUsername] = useState<string>('ak.sharma@landrecords.gov.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Preset personas for quick SIH evaluation
  const personas: Record<string, { username: string; name: string; designation: string; role: string }> = {
    GIS_OFFICER: {
      username: 'ak.sharma@landrecords.gov.in',
      name: 'Shri A. K. Sharma',
      designation: 'Senior Land Records & GIS Officer',
      role: 'GIS_OFFICER'
    },
    ADMIN: {
      username: 'sunita.deshmukh@rural.gov.in',
      name: 'Dr. Sunita V. Deshmukh',
      designation: 'Director of Urban Land Records (MoRD)',
      role: 'ADMIN'
    },
    REVIEWER: {
      username: 'pc.raman@revenue.gov.in',
      name: 'Shri P. C. Raman',
      designation: 'Assistant Settlement Reviewer',
      role: 'REVIEWER'
    }
  };

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    setUsername(personas[roleKey].username);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(personas[selectedRole]);
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Ministry Bar */}
      <div className="gov-top-bar">
        <div className="gov-emblem-tag">
          <span className="gov-flag-strip">
            <span className="gov-flag-saffron"></span>
            <span className="gov-flag-white"></span>
            <span className="gov-flag-green"></span>
          </span>
          MINISTRY OF RURAL DEVELOPMENT • GOVERNMENT OF INDIA
        </div>
        <button 
          onClick={onBackToLanding}
          style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowLeft size={12} />
          Back to Portal Home
        </button>
      </div>

      {/* Main Login Screen Viewport */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#0f2942',
            color: '#ffffff',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#163a5d',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: '#38bdf8'
            }}>
              <Building2 size={26} />
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              BHUMI-SYNC OFFICER ACCESS
            </h1>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              National Land Record Modernization Programme • SIH26013
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '24px' }}>
            
            {/* Quick Demo Role Picker */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                SELECT AUTHORIZED OFFICER ROLE:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { key: 'GIS_OFFICER', label: 'GIS Officer' },
                  { key: 'ADMIN', label: 'Director' },
                  { key: 'REVIEWER', label: 'Reviewer' }
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleRoleSelect(r.key)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: selectedRole === r.key ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: selectedRole === r.key ? '#eff6ff' : '#ffffff',
                      color: selectedRole === r.key ? '#1d4ed8' : '#64748b',
                      fontSize: '11px',
                      fontWeight: selectedRole === r.key ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Persona Banner */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                color: '#08162b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '12px'
              }}>
                {personas[selectedRole].name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942' }}>
                  {personas[selectedRole].name}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {personas[selectedRole].designation}
                </div>
              </div>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Official Email / Gov ID:
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Password / Digital Certificate PIN:
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '6px' }}
              >
                {isLoading ? 'Authenticating...' : (
                  <>
                    <Lock size={14} />
                    Secure Officer Sign In
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div style={{
              marginTop: '18px',
              padding: '10px 12px',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              border: '1px solid #bfdbfe',
              fontSize: '10px',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} />
              <span>Restricted Access • Authenticated Sessions Monitored via NLRMP Audit Trail</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
