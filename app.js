const manifestUrl = 'https://Michalich1.github.io/Mops-ton-wallet/tonconnect-manifest.json';

const connector = new TonConnectSDK.TonConnect({
  manifestUrl: manifestUrl
});

const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const statusEl = document.getElementById('status');
const walletAddressEl = document.getElementById('walletAddress');
const walletsEl = document.getElementById('wallets');

function setStatus(text) {
  statusEl.textContent = `Status: ${text}`;
}

function setWallet(address) {
  walletAddressEl.textContent = `Wallet: ${address || '-'}`;
}

function renderWalletButtons(wallets) {
  walletsEl.innerHTML = '';

  wallets.forEach((wallet) => {
    if (!wallet.universalLink || !wallet.bridgeUrl) return;

    const btn = document.createElement('button');
    btn.className = 'wallet-btn';
    btn.textContent = `Connect with ${wallet.name}`;
    btn.addEventListener('click', () => {
      const link = connector.connect({
        universalLink: wallet.universalLink,
        bridgeUrl: wallet.bridgeUrl
      });

      window.location.href = link;
    });

    walletsEl.appendChild(btn);
  });
}

connector.onStatusChange((wallet) => {
  if (wallet) {
    setStatus('connected');
    setWallet(wallet.account.address);
  } else {
    setStatus('not connected');
    setWallet('');
  }
});

async function init() {
  setStatus('restoring connection');
  await connector.restoreConnection();

  if (connector.wallet) {
    setStatus('connected');
    setWallet(connector.wallet.account.address);
  } else {
    setStatus('ready to connect');
  }

  const wallets = await connector.getWallets();
  renderWalletButtons(wallets);
}

connectBtn.addEventListener('click', async () => {
  setStatus('loading wallets');
  const wallets = await connector.getWallets();
  renderWalletButtons(wallets);
});

disconnectBtn.addEventListener('click', async () => {
  if (connector.connected) {
    await connector.disconnect();
  }
  setStatus('disconnected');
  setWallet('');
});

init().catch((err) => {
  console.error(err);
  setStatus('error');
});
