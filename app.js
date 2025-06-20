
const ethContracts = {
  '0x29be0951309805ddcfa90592c3bf765925871344': 'PandaMania',
  '0x870b1fa5d36696af7b3cfa0e2721872efd790b51': 'Red Panda Pals',
  '0xc0613cde37d2eceddc496f3d85cec12ffa2bdd00': 'Bamboo Buddies'
};

const pandaTokenContract = '0x67c778b5e5705aaa46707f3f16e498beef627b0b';

const ethProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
const abstractProvider = new ethers.providers.JsonRpcProvider('https://api.mainnet.abs.xyz');

const ALCHEMY_API_KEY = 'zceGjdJmrtYyTqJAHEN8yWTnwMXNKR_J';
const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}`;

function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}

function showTab(tabName) {
  document.getElementById('nftTab').style.display = tabName === 'nft' ? 'block' : 'none';
  document.getElementById('tokenTab').style.display = tabName === 'token' ? 'block' : 'none';
}

async function checkWallets() {
  const input = document.getElementById('wallets').value;
  const walletList = input.split(/[\s,]+/).filter(w => w.length > 0);
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  // Display contract reference
  const refBlock = document.createElement('div');
  let refHTML = '<h4>Tracked NFT Contracts:</h4>';
  for (const [addr, name] of Object.entries(ethContracts)) {
    refHTML += `<div><code>${addr}</code> (${name})</div>`;
  }
  refBlock.innerHTML = refHTML;
  resultsDiv.appendChild(refBlock);

  let totalNFTs = 0;
  let walletsWithNFTs = 0;

  for (const wallet of walletList) {
    let found = false;
    let nftCount = 0;

    const walletDiv = document.createElement('div');
    walletDiv.className = 'wallet-entry';
    walletDiv.innerHTML = `<strong>${wallet}:</strong>`;

    for (const [ca, name] of Object.entries(ethContracts)) {
      const url = `${ALCHEMY_BASE_URL}/getNFTs?owner=${wallet}&contractAddresses[]=${ca}&withMetadata=false`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const owned = data?.ownedNfts?.length || 0;
        if (owned > 0) {
          found = true;
          nftCount += owned;
          walletDiv.innerHTML += `<br> - Holds ${owned} NFTs from contract ${ca} (${name})`;
        }
      } catch (err) {
        walletDiv.innerHTML += `<br> - Error checking contract ${ca}`;
      }
    }

    if (found) {
      totalNFTs += nftCount;
      walletsWithNFTs++;
      walletDiv.innerHTML += `<br><span style="color:lightgreen;">✅ Official NFTs held!</span>`;
    } else {
      walletDiv.innerHTML += `<br><span style="color:orange;">❌ No tracked NFTs found.</span>`;
    }

    resultsDiv.appendChild(walletDiv);
  }

  const summary = document.createElement('div');
  summary.innerHTML = `<hr><strong>Summary:</strong><br>
    Wallets scanned: ${walletList.length}<br>
    Wallets with official NFTs: ${walletsWithNFTs}<br>
    Total NFTs held from tracked contracts: ${totalNFTs}`;
  resultsDiv.appendChild(summary);
}

async function checkTokenBalance() {
  const trackWallet = document.getElementById('trackWallet').value.trim();
  const tokenResults = document.getElementById('tokenResults');
  tokenResults.innerHTML = '';

  if (!trackWallet) {
    tokenResults.innerHTML = '<p>Please enter a wallet address.</p>';
    return;
  }

  const abi = ['function balanceOf(address owner) view returns (uint256)'];
  const tokenContract = new ethers.Contract(pandaTokenContract, abi, abstractProvider);
  const walletDiv = document.createElement('div');
  walletDiv.innerHTML = `<strong>Tracking wallet:</strong> ${trackWallet}`;

  try {
    const tokenBalance = await tokenContract.balanceOf(trackWallet);
    const formatted = ethers.utils.formatUnits(tokenBalance, 18);
    walletDiv.innerHTML += `<br><strong>Total Panda Tokens:</strong> ${formatted}`;
  } catch (err) {
    walletDiv.innerHTML += `<br> - Error checking Panda Token balance`;
  }

  tokenResults.appendChild(walletDiv);
}
