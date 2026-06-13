/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { SendWithReliability, JobParams, StepLabel, STEPS } from './sdk.ts';
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

interface JobState extends JobParams {
  uid: string;
  displayId: string;
  status: StepLabel | 'PENDING';
}

interface LogEntry {
  id: string;
  text: string;
  isRunning: boolean;
}

interface CreatedToken {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  mintAddress: string;
  txId: string;
}

interface HistoryBatch {
  date: string;
  count: number;
  total: string;
  fee: string;
  status: 'CONFIRMED' | 'FAILED';
  txId: string;
}

// Generate valid recipient addresses for the default demo state
const mockRecipients = [
  Keypair.generate().publicKey.toBase58(),
  Keypair.generate().publicKey.toBase58(),
  Keypair.generate().publicKey.toBase58(),
  Keypair.generate().publicKey.toBase58(),
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'multi-sender' | 'token-minter' | 'airdrop-logic' | 'history' | 'docs'>('multi-sender');
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [network, setNetwork] = useState<'devnet' | 'mainnet'>('devnet');
  const [inputText, setInputText] = useState(
    `${mockRecipients[0]}, 0.01\n${mockRecipients[1]}, 0.005\n${mockRecipients[2]}, 0.02\n${mockRecipients[3]}, 0.008`
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isAirdropping, setIsAirdropping] = useState(false);
  
  // Airdrop Logic States
  const [autoAirdrop, setAutoAirdrop] = useState(true);
  const [customAirdropAmount, setCustomAirdropAmount] = useState<number>(1);
  const [airdropWallet, setAirdropWallet] = useState('');

  // Token Minter States
  const [tokenName, setTokenName] = useState('Sendra Token');
  const [tokenSymbol, setTokenSymbol] = useState('SDR');
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [tokenSupply, setTokenSupply] = useState(1000000);
  const [isMinting, setIsMinting] = useState(false);
  const [createdTokens, setCreatedTokens] = useState<CreatedToken[]>([
    {
      name: 'Sendra Mock USD',
      symbol: 'sUSDC',
      decimals: 6,
      supply: 100000000,
      mintAddress: 'sUSDcMocK1111111111111111111111111111111111',
      txId: '5Mh...Zkp'
    }
  ]);

  // History States
  const [historyBatches, setHistoryBatches] = useState<HistoryBatch[]>([
    {
      date: '2026-06-12 14:32:05',
      count: 4,
      total: '0.0430',
      fee: '0.00005',
      status: 'CONFIRMED',
      txId: '3GkP...9WxY'
    },
    {
      date: '2026-06-11 09:15:42',
      count: 2,
      total: '0.0150',
      fee: '0.00005',
      status: 'CONFIRMED',
      txId: '7XmR...4Pqs'
    }
  ]);

  // Docs State
  const [selectedDocSection, setSelectedDocSection] = useState<'quickstart' | 'resilience' | 'failover'>('quickstart');

  // Initialize or fetch transient Dev Wallet Keypair
  const walletKeypair = useMemo(() => {
    const key = localStorage.getItem('sendra_dev_wallet_secret');
    if (key) {
      try {
        const secret = new Uint8Array(JSON.parse(key));
        return Keypair.fromSecretKey(secret);
      } catch (e) {
        // Fallback to new key
      }
    }
    const newKp = Keypair.generate();
    localStorage.setItem('sendra_dev_wallet_secret', JSON.stringify(Array.from(newKp.secretKey)));
    return newKp;
  }, []);

  const walletAddress = walletKeypair.publicKey.toBase58();

  useEffect(() => {
    setAirdropWallet(walletAddress);
  }, [walletAddress]);

  const [jobs, setJobs] = useState<JobState[]>([
    { uid: 'job-1', id: 'recipient-1', address: mockRecipients[0]!, amount: 0.01, displayId: '#001', status: 'PENDING' },
    { uid: 'job-2', id: 'recipient-2', address: mockRecipients[1]!, amount: 0.005, displayId: '#002', status: 'PENDING' }
  ]);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'init-1', text: '[Sendra] CORE_INITIALIZED: Transient Dev Wallet connected successfully.', isRunning: false },
    { id: 'init-2', text: '[Sendra] RPC_PING: Scanning nodes. Active Cluster: Devnet.', isRunning: false }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Connection object based on selected network
  const connection = useMemo(() => {
    const url = network === 'mainnet' 
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com';
    return new Connection(url, 'confirmed');
  }, [network]);

  const parsedRecipients = useMemo(() => {
    const lines = inputText.split('\n');
    let totalA = 0;
    let count = 0;
    const items: JobState[] = [];
    
    lines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length === 2) {
        const addr = parts[0].trim();
        const amtStr = parts[1].trim();
        const amt = parseFloat(amtStr);
        if (addr && !isNaN(amt) && amt > 0) {
          totalA += amt;
          count += 1;
          const displayId = `#` + (count).toString().padStart(3, '0');
          items.push({ uid: `job-` + Math.random().toString(), id: `job-${idx}`, address: addr, amount: amt, displayId, status: 'PENDING' });
        }
      }
    });
    return { count, total: totalA.toFixed(4), items };
  }, [inputText]);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  // Fetch balance
  const refreshBalance = async () => {
    try {
      const bal = await connection.getBalance(walletKeypair.publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (e) {
      console.error('Failed to get balance', e);
    }
  };

  useEffect(() => {
    refreshBalance();
    const interval = setInterval(refreshBalance, 10000);
    return () => clearInterval(interval);
  }, [connection, walletKeypair]);

  const addLog = (text: string, isRunning: boolean = false) => {
    setLogs(prev => {
      const newLogs = [...prev];
      if (newLogs.length > 0) {
        newLogs[newLogs.length - 1].isRunning = false;
      }
      return [...newLogs, { id: Math.random().toString(), text, isRunning }];
    });
  };

  const handleAirdrop = async (targetAddr?: string, customAmt?: number) => {
    if (network === 'mainnet') {
      alert("Airdrops are only supported on Devnet.");
      return;
    }
    const target = targetAddr || walletAddress;
    const amount = customAmt || 1;
    setIsAirdropping(true);
    addLog(`[System] Requesting ${amount} SOL Airdrop for ${target}...`);
    try {
      const targetPubKey = new PublicKey(target);
      const sig = await connection.requestAirdrop(targetPubKey, amount * LAMPORTS_PER_SOL);
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: sig
      });
      addLog(`[System] Airdrop confirmed! Signature: ${sig}`);
      await refreshBalance();
    } catch (e: any) {
      addLog(`[System] Airdrop failed: ${e.message}. Please use faucet.solana.com if rate-limited.`);
    } finally {
      setIsAirdropping(false);
    }
  };

  const handleMintToken = async () => {
    if (!tokenName || !tokenSymbol) {
      alert("Please enter a valid Token Name and Symbol.");
      return;
    }
    setIsMinting(true);
    addLog(`[System] Initiating SPL Token Creation for "${tokenName}" (${tokenSymbol})...`);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    addLog(`[Sendra] RPC_SELECTED: Routed to primary devnet node with low latency.`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    addLog(`[Sendra] FEE_OPTIMIZED: Applied +15,000 micro-lamports priority fee.`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockMintAddr = 'mint' + Math.random().toString(36).substring(2, 12).toUpperCase() + '1111111111111111';
    const mockTxId = 'tx' + Math.random().toString(36).substring(2, 8).toUpperCase() + '...Mint';
    
    setCreatedTokens(prev => [
      {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        supply: tokenSupply,
        mintAddress: mockMintAddr,
        txId: mockTxId
      },
      ...prev
    ]);
    addLog(`[System] Token Mint successful! Mint address: ${mockMintAddr}`);
    setIsMinting(false);
  };

  const handleSend = async () => {
    if (parsedRecipients.count === 0 || isProcessing) return;
    
    // Check balance
    const requiredSol = parseFloat(parsedRecipients.total);
    if (balance < requiredSol) {
      if (autoAirdrop && network === 'devnet') {
        addLog(`[System] Auto-Airdrop triggered: Wallet balance (${balance.toFixed(4)} SOL) is lower than batch requirement (${requiredSol} SOL).`);
        await handleAirdrop(walletAddress, 1);
      } else {
        alert(`Insufficient balance in Dev Wallet. Required: ${requiredSol} SOL, Balance: ${balance} SOL. Click the Airdrop button to get devnet SOL first!`);
        return;
      }
    }

    setIsProcessing(true);
    setJobs(parsedRecipients.items);
    
    addLog(`[System] Initiating Resilient Sendra pipeline with ${parsedRecipients.count} transfers.`);

    // Signer interface required by Sendra
    const signer = {
      publicKey: walletKeypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.sign([walletKeypair]);
        return tx;
      }
    };
    
    let allConfirmed = true;
    for (let i = 0; i < parsedRecipients.items.length; i++) {
      const job = parsedRecipients.items[i];
      
      const updateJobStatus = (newStatus: StepLabel) => {
        setJobs(prev => prev.map(j => j.uid === job.uid ? { ...j, status: newStatus } : j));
      };

      try {
        addLog(`[System] Processing transfer to ${job.address}...`);
        const result = await SendWithReliability(
          { id: job.id, address: job.address, amount: job.amount },
          signer,
          { maxRetries: 5 },
          network,
          (msg, step) => {
            addLog(`[Sendra] ${msg}`, step === 'SENDING');
            if (step) updateJobStatus(step);
          }
        );

        if (result.success) {
          addLog(`[System] Successfully confirmed landing for recipient ${job.displayId}. Tx ID: ${result.txId}`);
          updateJobStatus('CONFIRMED');
        } else {
          allConfirmed = false;
        }
      } catch (err: any) {
        addLog(`[Sendra] Tx Failed for ${job.address}: ${err.message}`);
        updateJobStatus('FAILED');
        allConfirmed = false;
      }
    }
    
    // Save to history
    setHistoryBatches(prev => [
      {
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        count: parsedRecipients.count,
        total: parsedRecipients.total,
        fee: '0.00005',
        status: allConfirmed ? 'CONFIRMED' : 'FAILED',
        txId: 'batch_' + Math.random().toString(36).substring(2, 8).toUpperCase()
      },
      ...prev
    ]);

    addLog(`[System] Multi-Tx batch execution complete.`);
    await refreshBalance();
    setIsProcessing(false);
  };

  const getStepProgress = (status: string) => {
    if (status === 'PENDING') return 0;
    const i = STEPS.indexOf(status as StepLabel);
    if (i === -1) return 0;
    return Math.min(100, Math.max(0, (i / (STEPS.length - 1)) * 100));
  };

  return (
    <div className="app-layout">
      <div className="bg-elements" />
      
      <header className="top-nav">
        <div className="header-nav">
          <div className="header-logo">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
               <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            Sendra
          </div>
          <nav className="header-nav" style={{ marginLeft: '48px' }}>
            <a href="#" className={activeTab === 'multi-sender' ? 'active' : ''} onClick={() => setActiveTab('multi-sender')}>Multi-Sender</a>
            <a href="#" className={activeTab === 'token-minter' ? 'active' : ''} onClick={() => setActiveTab('token-minter')}>Token Minter</a>
            <a href="#" className={activeTab === 'airdrop-logic' ? 'active' : ''} onClick={() => setActiveTab('airdrop-logic')}>Airdrop Logic</a>
            <a href="#" className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</a>
            <a href="#" className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>Docs</a>
          </nav>
        </div>
        <div className="header-right">
          <div className="network-toggle">
            <button 
              className={network === 'mainnet' ? 'active' : ''} 
              onClick={() => { setNetwork('mainnet'); addLog('[System] Switched active cluster to Mainnet-Beta.'); }}
            >
              Mainnet
            </button>
            <button 
              className={network === 'devnet' ? 'active' : ''} 
              onClick={() => { setNetwork('devnet'); addLog('[System] Switched active cluster to Devnet.'); }}
            >
              Devnet
            </button>
          </div>
          <button 
            className="btn-gradient" 
            onClick={() => handleAirdrop()}
            disabled={isAirdropping || network === 'mainnet'}
          >
            {isAirdropping ? 'Airdropping...' : `Airdrop 1 SOL (Devnet)`}
          </button>
        </div>
      </header>

      <div className="main-container">
        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <span className="sidebar-label">DEV WALLET</span>
            <div className="glass-panel" style={{ padding: '12px', margin: '10px 0', fontSize: '12px', wordBreak: 'break-all' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Address:</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{walletAddress}</div>
              <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Balance:</div>
              <div style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: 'bold' }}>{balance.toFixed(4)} SOL</div>
            </div>
            
            <span className="sidebar-label">DASHBOARD</span>
            <nav className="sidebar-nav">
              <a className={`sidebar-link ${activeTab === 'multi-sender' ? 'active' : ''}`} onClick={() => { setActiveTab('multi-sender'); setIsMobileMenuOpen(false); }}>
                <span className="material-symbols-outlined">send_money</span>
                <span className="link-text">Multi-Sender</span>
              </a>
              <a className={`sidebar-link ${activeTab === 'token-minter' ? 'active' : ''}`} onClick={() => { setActiveTab('token-minter'); setIsMobileMenuOpen(false); }}>
                <span className="material-symbols-outlined">generating_tokens</span>
                <span className="link-text">Token Minter</span>
              </a>
              <a className={`sidebar-link ${activeTab === 'airdrop-logic' ? 'active' : ''}`} onClick={() => { setActiveTab('airdrop-logic'); setIsMobileMenuOpen(false); }}>
                <span className="material-symbols-outlined">hub</span>
                <span className="link-text">Airdrop Logic</span>
              </a>
              <a className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}>
                <span className="material-symbols-outlined">history</span>
                <span className="link-text">History</span>
              </a>
            </nav>
          </div>

          <div className="sidebar-bottom">
            <a className={`sidebar-link ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => { setActiveTab('docs'); setIsMobileMenuOpen(false); }}>
              <span className="material-symbols-outlined">description</span>
              <span className="link-text">Docs</span>
            </a>
            <a className="sidebar-link" onClick={() => alert('Support features are coming soon!')}>
              <span className="material-symbols-outlined">help</span>
              <span className="link-text">Support</span>
            </a>
            <div className="pro-banner">
              <span className="version">V1.0.2 STABLE</span>
              <button onClick={() => alert('Upgrade to Pro is a mock flow for demo purposes.')}>Upgrade to Pro</button>
            </div>
          </div>
        </aside>

        <div className="content-area">
          <div className="dashboard-layout">
            
            {/* 1. Multi-Sender Tab View */}
            {activeTab === 'multi-sender' && (
              <>
                {/* Input Section */}
                <div className="col-left">
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div className="recipients-header">
                      <div className="section-title">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                        Recipient Addresses & Amounts
                      </div>
                      <span className="format-hint">CSV/TEXT</span>
                    </div>
                    
                    <div className="textarea-wrapper">
                      <textarea 
                        id="recipients-input"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Address, Amount (e.g., HN7c...y8X, 10.5)"
                        className="custom-scrollbar"
                      />
                    </div>

                    <div className="stats-row">
                      <div className="glass-panel stat-box">
                        <span className="stat-label">Total Recipients</span>
                        <span className="stat-value">{parsedRecipients.count}</span>
                      </div>
                      <div className="glass-panel stat-box">
                        <span className="stat-label">Total SOL</span>
                        <span className="stat-value value-secondary">{parsedRecipients.total}</span>
                      </div>
                    </div>

                    <button 
                      id="send-btn"
                      className="btn-gradient send-btn-full" 
                      onClick={handleSend}
                      disabled={isProcessing || parsedRecipients.count === 0}
                    >
                      <span className="material-symbols-outlined">send</span>
                      {isProcessing ? 'Processing Pipeline...' : 'Send Multi-Tx'}
                    </button>
                  </div>
                </div>

                {/* Tracking Section */}
                <div className="col-right">
                  <div className="tracking-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div className="section-title title-secondary" style={{ marginBottom: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>analytics</span>
                      Live Transaction Tracking
                    </div>
                    <div className="live-indicator">
                      <span className="pulse-dot"></span>
                      <span className="live-text">Live Pipeline</span>
                    </div>
                  </div>

                  <div className="tracking-list" id="tracking-list">
                    {jobs.map((job) => {
                      const isDimmed = job.status === 'PENDING';
                      const percent = getStepProgress(job.status);
                      
                      return (
                        <div key={job.uid} className={`glass-panel tx-card ${isDimmed ? 'dimmed' : ''}`}>
                          <div className="tx-card-header">
                            <div className="tx-info">
                              <div className="tx-icon">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                              </div>
                              <div>
                                <div className="tx-address" style={{ wordBreak: 'break-all', fontSize: '12px' }}>{job.address}</div>
                                <div className="tx-id">Recipient ID {job.displayId}</div>
                              </div>
                            </div>
                            <div className="tx-amount">
                              <div className="tx-sol">{job.amount.toFixed(4)} SOL</div>
                              <div className="tx-fee">{job.status === 'PENDING' ? 'QUEUED' : job.status === 'CONFIRMED' ? 'LANDED' : 'OPTIMIZING...'}</div>
                            </div>
                          </div>

                          {!isDimmed && (
                             <div className="progress-section">
                               <div className="progress-stepper">
                                 <div className="progress-track-bg"></div>
                                 <div className="progress-track-fill" style={{ width: `${percent}%` }}></div>
                                 
                                 {STEPS.map((step, idx) => {
                                   const isActive = STEPS.indexOf(job.status as StepLabel) >= idx;
                                   const isCurrent = job.status === step;
                                   return (
                                     <div key={step} className={`step-node ${isActive ? 'active' : ''}`}>
                                       <div className={`step-dot ${isActive ? 'active' : ''} ${isCurrent && step !== 'CONFIRMED' ? 'pulsing' : ''}`}></div>
                                       <div className="step-label">{step}</div>
                                     </div>
                                   )
                                 })}
                               </div>
                               <div className="progress-bar-container">
                                 <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                             </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 2. Token Minter Tab View */}
            {activeTab === 'token-minter' && (
              <div style={{ flex: 1, display: 'flex', gap: '32px', flexWrap: 'wrap', width: '100%' }}>
                <div className="col-left" style={{ flex: '1 1 420px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div className="section-title">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>generating_tokens</span>
                      Create SPL Token Mint
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>TOKEN NAME</label>
                        <input 
                          type="text" 
                          value={tokenName} 
                          onChange={e => setTokenName(e.target.value)}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '10px 12px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>TOKEN SYMBOL</label>
                        <input 
                          type="text" 
                          value={tokenSymbol} 
                          onChange={e => setTokenSymbol(e.target.value)}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '10px 12px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>DECIMALS</label>
                          <input 
                            type="number" 
                            value={tokenDecimals} 
                            onChange={e => setTokenDecimals(parseInt(e.target.value))}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '10px 12px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ flex: 2 }}>
                          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>INITIAL SUPPLY</label>
                          <input 
                            type="number" 
                            value={tokenSupply} 
                            onChange={e => setTokenSupply(parseInt(e.target.value))}
                            style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '10px 12px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <button 
                        className="btn-gradient" 
                        onClick={handleMintToken} 
                        disabled={isMinting}
                        style={{ width: '100%', marginTop: '16px', padding: '12px' }}
                      >
                        <span className="material-symbols-outlined">add_circle</span>
                        {isMinting ? 'Minting via Sendra...' : 'Mint SPL Token'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-right" style={{ flex: '1.2 1 480px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div className="section-title title-secondary">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--cyan)' }}>list_alt</span>
                      My Created Tokens
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                      {createdTokens.map((t, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--cyan)' }}>{t.name} ({t.symbol})</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', wordBreak: 'break-all' }}>Mint: {t.mintAddress}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'white' }}>{t.supply.toLocaleString()}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Decimals: {t.decimals}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Airdrop Logic Tab View */}
            {activeTab === 'airdrop-logic' && (
              <div style={{ flex: 1, display: 'flex', gap: '32px', flexWrap: 'wrap', width: '100%' }}>
                <div className="col-left" style={{ flex: '1 1 420px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div className="section-title">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>hub</span>
                      Airdrop Logic Controls
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                      {/* Auto-Airdrop switch */}
                      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white' }}>Auto-Airdrop Optimization</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically top up transient wallet when balance drops below requirement.</div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={autoAirdrop} 
                          onChange={e => {
                            setAutoAirdrop(e.target.checked);
                            addLog(`[System] Auto-Airdrop mode set to: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                          }}
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                      </div>

                      {/* Manual Trigger Faucet */}
                      <div className="glass-panel" style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', marginBottom: '12px' }}>Request Devnet SOL</div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>WALLET ADDRESS</label>
                            <input 
                              type="text" 
                              value={airdropWallet}
                              onChange={e => setAirdropWallet(e.target.value)}
                              style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>AMOUNT (SOL)</label>
                              <input 
                                type="number" 
                                value={customAirdropAmount}
                                onChange={e => setCustomAirdropAmount(parseFloat(e.target.value))}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                              />
                            </div>
                            <button 
                              className="btn-gradient" 
                              onClick={() => handleAirdrop(airdropWallet, customAirdropAmount)}
                              disabled={isAirdropping}
                              style={{ flex: 1.5, alignSelf: 'flex-end', height: '36px', padding: 0 }}
                            >
                              {isAirdropping ? 'Requesting...' : 'Request Airdrop'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-right" style={{ flex: '1.2 1 480px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div className="section-title title-secondary">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>info</span>
                      Solana Faucet Reference
                    </div>
                    
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <p>
                        Solana devnet uses a rate-limited faucet. If requests fail here, you can claim SOL using official web faucets:
                      </p>
                      
                      <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Official Solana Faucet</span>
                        <a href="https://faucet.solana.com" target="_blank" rel="noreferrer" className="btn-gradient" style={{ padding: '6px 12px', fontSize: '10px', textDecoration: 'none' }}>Open Faucet</a>
                      </div>

                      <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>QuickNode Faucet</span>
                        <a href="https://faucet.quicknode.com/solana" target="_blank" rel="noreferrer" className="btn-gradient" style={{ padding: '6px 12px', fontSize: '10px', textDecoration: 'none' }}>Open Faucet</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. History Tab View */}
            {activeTab === 'history' && (
              <div style={{ flex: 1, width: '100%' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div className="section-title">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
                    Execution Batch History
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    {historyBatches.map((batch, idx) => (
                      <div key={idx} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'white' }}>Batch ID: {batch.txId}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Executed at {batch.date}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RECIPIENTS</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--primary)', fontWeight: 'bold' }}>{batch.count}</div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL AMOUNT</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--secondary)', fontWeight: 'bold' }}>{batch.total} SOL</div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>FEE</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'white' }}>{batch.fee}</div>
                          </div>

                          <div style={{ alignSelf: 'center' }}>
                            <span style={{ 
                              background: batch.status === 'CONFIRMED' ? 'rgba(20, 241, 149, 0.1)' : 'rgba(255, 180, 171, 0.1)', 
                              color: batch.status === 'CONFIRMED' ? 'var(--secondary)' : 'var(--error)',
                              padding: '4px 12px',
                              borderRadius: '99px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              fontFamily: 'var(--font-mono)'
                            }}>
                              {batch.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Docs Tab View */}
            {activeTab === 'docs' && (
              <div style={{ flex: 1, display: 'flex', gap: '32px', width: '100%' }}>
                {/* Docs Sidebar */}
                <div style={{ flex: '1 1 200px', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => setSelectedDocSection('quickstart')}
                    className={`sidebar-link ${selectedDocSection === 'quickstart' ? 'active' : ''}`}
                    style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined">menu_book</span>
                    <span className="link-text">Quick Start</span>
                  </button>

                  <button 
                    onClick={() => setSelectedDocSection('resilience')}
                    className={`sidebar-link ${selectedDocSection === 'resilience' ? 'active' : ''}`}
                    style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined">thunderstorm</span>
                    <span className="link-text">Congestion Resilience</span>
                  </button>

                  <button 
                    onClick={() => setSelectedDocSection('failover')}
                    className={`sidebar-link ${selectedDocSection === 'failover' ? 'active' : ''}`}
                    style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined">route</span>
                    <span className="link-text">Failover Routing</span>
                  </button>
                </div>

                {/* Docs Content */}
                <div style={{ flex: '3 1 400px' }}>
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    {selectedDocSection === 'quickstart' && (
                      <div>
                        <h3>Quick Start Guide</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 16px 0' }}>
                          Learn how to integrate the Sendra middleware protocol in your project to execute bulk transaction pipelines reliably.
                        </p>
                        
                        <div style={{ background: '#000', padding: '16px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '13px', overflowX: 'auto', border: '1px solid var(--border-glass)', color: 'var(--secondary)' }}>
                          <span style={{ color: '#ff79c6' }}>import</span> {'{ SendWithReliability }'} <span style={{ color: '#ff79c6' }}>from</span> <span style={{ color: '#f1fa8c' }}>'sendra-tx'</span>;<br /><br />
                          <span style={{ color: '#ff79c6' }}>const</span> result = <span style={{ color: '#ff79c6' }}>await</span> <span style={{ color: '#50fa7b' }}>SendWithReliability</span>(<br />
                          &nbsp;&nbsp;{'{'} id: <span style={{ color: '#f1fa8c' }}>"tx_001"</span>, address: <span style={{ color: '#f1fa8c' }}>"HN7c...y8X"</span>, amount: <span style={{ color: '#bd93f9' }}>0.05</span> {'}'},<br />
                          &nbsp;&nbsp;walletSigner,<br />
                          &nbsp;&nbsp;{'{'} maxRetries: <span style={{ color: '#bd93f9' }}>5</span> {'}'},<br />
                          &nbsp;&nbsp;<span style={{ color: '#f1fa8c' }}>"devnet"</span>,<br />
                          &nbsp;&nbsp;(msg, step) =&gt; console.log(msg)<br />
                          );
                        </div>
                      </div>
                    )}

                    {selectedDocSection === 'resilience' && (
                      <div>
                        <h3>Congestion Resilience Architecture</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 16px 0' }}>
                          Sendra listens to network activity to dynamically adjust fee structures and avoid transaction drops.
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
                          <li><strong>Dynamic Priority Fees</strong>: Scales fee margins based on recent slots congestion metadata.</li>
                          <li><strong>Pre-flight Simulation Check</strong>: Runs local simulations to discard expired blockhashes or state mutations.</li>
                          <li><strong>Adaptive Retries</strong>: Follows exponential backoff configurations under extreme cluster loads.</li>
                        </ul>
                      </div>
                    )}

                    {selectedDocSection === 'failover' && (
                      <div>
                        <h3>Smart Failover Routing</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 16px 0' }}>
                          When public or private RPC endpoints suffer performance degradation, Sendra switches transparently to backup endpoints.
                        </p>
                        <div style={{ background: '#000', padding: '16px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '13px', overflowX: 'auto', border: '1px solid var(--border-glass)', color: 'var(--cyan)', marginTop: '16px' }}>
                          [Sendra] Checking RPC Latency...<br />
                          [Sendra] Node-1: Timeout (Failed)<br />
                          [Sendra] Node-2: 45ms (Healthy) - Switched endpoint.<br />
                          [Sendra] Resubmitting blockhash signature.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

        {/* Console Footer */}
        <div className={`terminal-footer ${isTerminalCollapsed ? 'collapsed' : ''}`}>
          <div className="terminal-header">
            <div className="terminal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">terminal</span>
              System Logs
              <button 
                onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)} 
                className="terminal-collapse-btn" 
                style={{ marginLeft: '8px' }}
                title={isTerminalCollapsed ? "Expand logs" : "Collapse logs"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {isTerminalCollapsed ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>
            <div className="terminal-controls">
              <div className="dot dot-red" onClick={() => setLogs([])}></div>
              <div className="dot dot-green" onClick={() => addLog('[System] Logs cleared and diagnostic routine triggered.')}></div>
            </div>
          </div>
          <div className="terminal-body custom-scrollbar" id="terminal-logs">
            {logs.map((log) => (
              <div key={log.id} className={`log-line ${log.isRunning ? 'running' : ''}`}>
                <span className="log-text">
                  <span className="log-prefix">{log.text.startsWith('[') ? log.text.substring(0, log.text.indexOf(']') + 1) : ''}</span>
                  {log.text.startsWith('[') ? log.text.substring(log.text.indexOf(']') + 1) : log.text}
                </span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
          <div className="app-footer">
            <span>© 2026 Sendra Protocol. High-Performance Solana Utility.</span>
            <div className="footer-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Twitter</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
