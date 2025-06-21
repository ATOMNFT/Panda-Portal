
const ethContracts = {
  '0x29be0951309805ddcfa90592c3bf765925871344': 'PandaMania',
  '0x870b1fa5d36696af7b3cfa0e2721872efd790b51': 'Red Panda Pals',
  '0xc0613cde37d2eceddc496f3d85cec12ffa2bdd00': 'Bamboo Buddies',
  '0xb3ed773a2b61b53a7a8da02eb0555b4126b874ff': 'Panda Cubs',
  '0x5c39cde98ebd0195cc6ccd81ab8be82948da28af': 'Red Panda Cubs',
  '0xde07b22e52f2144bf52f5c4c4275ed1f8dd72b49': 'Bamboo Shoots'
};

const pandaTokenContract = '0x67c778b5e5705aaa46707f3f16e498beef627b0b';

const ethProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
const abstractProvider = new ethers.providers.JsonRpcProvider('https://api.mainnet.abs.xyz');

const ALCHEMY_API_KEY = 'zceGjdJmrtYyTqJAHEN8yWTnwMXNKR_J';
const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}`;

let currentView = 'text';

function showTab(tabName) {
  document.getElementById('nftTab').style.display = tabName === 'nft' ? 'block' : 'none';
  document.getElementById('tokenTab').style.display = tabName === 'token' ? 'block' : 'none';
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
}

function toggleView() {
  const button = document.getElementById('toggleViewBtn');
  const textView = document.getElementById('results');
  const tableView = document.getElementById('tableResults');

  if (currentView === 'text') {
    textView.style.display = 'none';
    tableView.style.display = 'block';
    button.textContent = '📝 Text View';
    currentView = 'table';
  } else {
    textView.style.display = 'block';
    tableView.style.display = 'none';
    button.textContent = '📊 Table View';
    currentView = 'text';
  }
}

async function checkWallets() {
  const input = document.getElementById('wallets').value;
  const walletList = input.split(/[\s,]+/).filter(w => w.length > 0);

  const resultsDiv = document.getElementById('results');
  const tableDiv = document.getElementById('tableResults');
  resultsDiv.innerHTML = '';
  tableDiv.innerHTML = '';

  // Reference block
  const refBlock = document.createElement('div');
  let refHTML = '<h4>Tracked NFT Contracts:</h4>';
  for (const [addr, name] of Object.entries(ethContracts)) {
    refHTML += `<div><code>${addr}</code> (${name})</div>`;
  }
  refBlock.innerHTML = refHTML;
  resultsDiv.appendChild(refBlock);

  // Table header
  const table = document.createElement('table');
  table.className = 'nft-summary-table';
  const header = table.insertRow();
  header.insertCell().outerHTML = '<th>Wallet</th>';
  Object.values(ethContracts).forEach(name => header.insertCell().outerHTML = `<th>${name}</th>`);
  header.insertCell().outerHTML = '<th>Status</th>';

  let totalNFTs = 0;
  let walletsWithNFTs = 0;

  for (const wallet of walletList) {
    let found = false;
    let nftCount = 0;

    const walletDiv = document.createElement('div');
    walletDiv.className = 'wallet-entry';
    walletDiv.innerHTML = `<strong>${wallet}:</strong>`;

    const tableRow = table.insertRow();
    tableRow.insertCell().textContent = wallet;

    for (const [ca, name] of Object.entries(ethContracts)) {
      const url = `${ALCHEMY_BASE_URL}/getNFTs?owner=${wallet}&contractAddresses[]=${ca}&withMetadata=false`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const owned = data?.ownedNfts?.length || 0;
        tableRow.insertCell().textContent = owned;

        if (owned > 0) {
          found = true;
          nftCount += owned;
          walletDiv.innerHTML += `<br> - Holds ${owned} NFTs from contract ${ca} (${name})`;
        }
      } catch {
        walletDiv.innerHTML += `<br> - Error checking contract ${ca}`;
        tableRow.insertCell().textContent = 'Err';
      }
    }

    if (found) {
      totalNFTs += nftCount;
      walletsWithNFTs++;
      walletDiv.innerHTML += `<br><span style="color:lightgreen;">✅ Official NFTs held!</span>`;
      tableRow.insertCell().innerHTML = '✅';
    } else {
      walletDiv.innerHTML += `<br><span style="color:orange;">❌ No tracked NFTs found.</span>`;
      tableRow.insertCell().innerHTML = '❌';
    }

    resultsDiv.appendChild(walletDiv);
  }

  const summary = document.createElement('div');
  summary.innerHTML = `<hr><strong>Summary:</strong><br>
    Wallets scanned: ${walletList.length}<br>
    Wallets with official NFTs: ${walletsWithNFTs}<br>
    Total NFTs held from tracked contracts: ${totalNFTs}`;
  resultsDiv.appendChild(summary);
  tableDiv.appendChild(table);
}

// Animate numbers for token display
function animateCount(el, value) {
  const duration = 1000;
  const startTime = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = (value * progress).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
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
	  const formatted = parseFloat(ethers.utils.formatUnits(tokenBalance, 18));
	  walletDiv.innerHTML += `<br><strong>Total $PANDA Tokens:</strong> <span id="animatedToken">0.0000</span>`;
	  tokenResults.appendChild(walletDiv);

	  // Animate the balance count
	  animateCount(document.getElementById('animatedToken'), formatted);
	} catch {
	  walletDiv.innerHTML += `<br> - Error checking Panda Token balance`;
	}

  tokenResults.appendChild(walletDiv);
}
