import React, { useEffect, useState } from 'react';
import './popup.css';

interface AuthState {
  isSignedIn: boolean;
  email?: string;
}

export function Popup() {
  const [auth, setAuth] = useState<AuthState>({ isSignedIn: false });

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getAuthState' }, (response) => {
      if (response?.userId) {
        setAuth({ isSignedIn: true, email: response.email || 'Signed in' });
      }
    });
  }, []);

  const handleSignIn = () => {
    chrome.runtime.sendMessage({ action: 'signIn' }, (response) => {
      if (response?.userId) {
        setAuth({ isSignedIn: true, email: response.email || 'Signed in' });
      }
    });
  };

  const handleSignOut = () => {
    chrome.runtime.sendMessage({ action: 'signOut' }, () => {
      setAuth({ isSignedIn: false });
    });
  };

  return (
    <div className="tc-popup">
      <div className="tc-popup-header">
        <svg className="tc-popup-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#7616d0"/>
        </svg>
        <span className="tc-popup-title">TextCoach</span>
      </div>

      <div className="tc-popup-body">
        {auth.isSignedIn ? (
          <>
            <div className="tc-popup-user">
              <span className="tc-popup-email">{auth.email}</span>
            </div>
            <div className="tc-popup-menu">
              <button className="tc-popup-menu-item" onClick={() => chrome.runtime.sendMessage({ action: 'openTab', url: 'https://textcoach.com/account' })}>
                Account
              </button>
              <button className="tc-popup-menu-item" onClick={() => chrome.runtime.sendMessage({ action: 'openTab', url: 'https://textcoach.com/help' })}>
                Help & FAQ
              </button>
              <button className="tc-popup-menu-item" onClick={() => chrome.runtime.sendMessage({ action: 'openTab', url: 'https://chromewebstore.google.com/detail/textcoach' })}>
                Rate Extension
              </button>
            </div>
            <button className="tc-popup-signout" onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <button className="tc-popup-signin" onClick={handleSignIn}>
            Sign In with Google
          </button>
        )}
      </div>

      <div className="tc-popup-footer">
        <span>v2.0.0</span>
      </div>
    </div>
  );
}
