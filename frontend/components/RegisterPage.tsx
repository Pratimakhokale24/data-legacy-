import React, { useState } from 'react';
import * as api from '../services/apiService';

type Props = {
  onRegistered: () => void;
  onGoToLogin: () => void;
};

const steps = ['Company', 'Admin', 'Confirm'];

export default function RegisterPage({ onRegistered, onGoToLogin }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const canNext = () => {
    if (step === 0) return companyName.trim().length > 1;
    if (step === 1)
      return (
        email.includes('@') && password.length >= 8 && contactName.trim().length > 1
      );
    if (step === 2) return acceptTerms;
    return false;
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.register({
        email,
        password,
        companyName,
        companyDomain,
        contactName,
        acceptTerms: acceptTerms,
      });
      onRegistered();
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <h2 style={{ marginBottom: 8 }}>Create Company Account</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Please complete the steps to set up your company.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {steps.map((label, i) => (
          <div
            key={label}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              textAlign: 'center',
              background: i === step ? '#2d6cdf' : '#f0f3f8',
              color: i === step ? '#fff' : '#333',
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            Company name
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ABCD"
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
          <label>
            Company domain (optional)
            <input
              value={companyDomain}
              onChange={(e) => setCompanyDomain(e.target.value)}
              placeholder="ABC.com"
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            Contact person
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="mr. mahi rane"
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Pratima.K@gmail.com"
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
          <label>
            Password (min 8 chars)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: 10, marginTop: 6 }}
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            I agree to the Terms and acknowledge secure data handling.
          </label>
          <div style={{ background: '#f7f9fc', padding: 12, borderRadius: 8 }}>
            <strong>Company</strong>: {companyName || '—'}
            <br />
            <strong>Domain</strong>: {companyDomain || '—'}
            <br />
            <strong>Contact</strong>: {contactName || '—'}
            <br />
            <strong>Email</strong>: {email || '—'}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: '#b00020', marginTop: 12 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} disabled={loading}>
            Back
          </button>
        )}
        {step < steps.length - 1 && (
          <button onClick={() => canNext() && setStep((s) => s + 1)} disabled={!canNext() || loading}>
            Next
          </button>
        )}
        {step === steps.length - 1 && (
          <button onClick={submit} disabled={!canNext() || loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        )}
        <button style={{ marginLeft: 'auto' }} onClick={onGoToLogin} disabled={loading}>
          Already registered? Log in
        </button>
      </div>
    </div>
  );
}