"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walrusImageExtension = exports.suiscanExtension = exports.walruscanExtension = exports.suiConnectExtension = void 0;
exports.suiConnectExtension = {
    name: 'sui-connect',
    level: 'block',
    start(src) { return src.match(/:::sui-connect/)?.index; },
    tokenizer(src) {
        const rule = /^:::sui-connect\s*([\s\S]*?):::/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'sui-connect',
                raw: match[0],
                text: match[1].trim(),
            };
        }
        return undefined;
    },
    renderer(token) {
        const id = `sui-connect-${Math.random().toString(36).substr(2, 9)}`;
        return `
            <div id="${id}" class="sui-connect-block">
            <select id="${id}-select" class="sui-wallet-select">
                <option>Loading wallets...</option>
            </select>
            <button id="${id}-btn" class="sui-connect-btn" disabled>Connect Sui Wallet</button>
            <button id="${id}-disconnect" class="sui-disconnect-btn" style="display:none;margin-left:8px;">Disconnect</button>
            </div>
            
        `;
    },
};
// <script type="module">
// import { getWallets } from 'https://esm.sh/@mysten/wallet-standard';
// const select = document.getElementById('${id}-select');
// const btn = document.getElementById('${id}-btn');
// const disconnectBtn = document.getElementById('${id}-disconnect');
// let walletsArr = [];
// let connectedIdx = null;
// async function loadWallets() {
//     const wallets = getWallets();
//     walletsArr = wallets.get();
//     select.innerHTML = '';
//     if (walletsArr.length === 0) {
//     select.innerHTML = '<option>No Sui wallet found</option>';
//     btn.disabled = true;
//     } else {
//     walletsArr.forEach((wallet, idx) => {
//         const opt = document.createElement('option');
//         opt.value = idx;
//         opt.textContent = wallet.name || wallet.id || 'Wallet #' + (idx + 1);
//         select.appendChild(opt);
//     });
//     btn.disabled = false;
//     }
// }
// select.addEventListener('change', () => {
//     btn.disabled = walletsArr.length === 0 || select.selectedIndex === -1;
// });
// btn.onclick = async () => {
//     const idx = select.selectedIndex;
//     if (idx < 0 || !walletsArr[idx]) return;
//     const wallet = walletsArr[idx];
//     try {
//     const result = await wallet.features['standard:connect'].connect();
//     const address = result.accounts?.[0]?.address || 'Unknown';
//     btn.textContent = 'Connected: ' + address;
//     btn.disabled = true;
//     select.disabled = true;
//     disconnectBtn.style.display = '';
//     connectedIdx = idx;
//     } catch (e) {
//     alert('Connect failed: ' + e);
//     }
// };
// disconnectBtn.onclick = async () => {
//     if (connectedIdx === null || !walletsArr[connectedIdx]) return;
//     const wallet = walletsArr[connectedIdx];
//     try {
//     if (wallet.features['standard:disconnect']) {
//         await wallet.features['standard:disconnect'].disconnect();
//     }
//     } catch (e) {
//     // Có thể wallet không hỗ trợ disconnect, bỏ qua lỗi
//     }
//     btn.textContent = 'Connect Sui Wallet';
//     btn.disabled = false;
//     select.disabled = false;
//     disconnectBtn.style.display = 'none';
//     connectedIdx = null;
// };
// loadWallets();
// </script>
exports.walruscanExtension = {
    name: 'walruscan',
    level: 'block',
    start(src) { return src.match(/:::walruscan/)?.index; },
    tokenizer(src) {
        const rule = /^:::walruscan\s*([\s\S]*?):::/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'walruscan',
                raw: match[0],
                blobId: match[1].trim(),
            };
        }
        return undefined;
    },
    renderer(token) {
        const blobId = token.blobId;
        const url = blobId
            ? `https://walruscan.com/testnet/blob/${encodeURIComponent(blobId)}`
            : `https://walruscan.com/testnet/home`;
        const btnLabel = blobId
            ? `View Blob: ${blobId}`
            : `Open Walruscan`;
        return `
            <div class="walruscan-block">
                <button onclick="window.open('${url}', '_blank', 'noopener,noreferrer')">
                    ${btnLabel}
                </button>
            </div>
        `;
    },
};
exports.suiscanExtension = {
    name: 'suiscan',
    level: 'block',
    start(src) { return src.match(/:::suiscan/)?.index; },
    tokenizer(src) {
        const rule = /^:::suiscan\s*([\s\S]*?):::/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'suiscan',
                raw: match[0],
                accountId: match[1].trim(),
            };
        }
        return undefined;
    },
    renderer(token) {
        const accountId = token.accountId;
        const url = accountId
            ? `https://suiscan.xyz/testnet/account/${encodeURIComponent(accountId)}`
            : `https://suiscan.xyz/testnet/`;
        const btnLabel = accountId
            ? `View Account: ${accountId}`
            : `Open Suiscan`;
        return `
            <div class="suiscan-block">
                <button onclick="window.open('${url}', '_blank', 'noopener,noreferrer')">
                    ${btnLabel}
                </button>
            </div>
        `;
    },
};
exports.walrusImageExtension = {
    name: 'walrus-image',
    level: 'block',
    start(src) { return src.match(/:::walrus-image/)?.index; },
    tokenizer(src) {
        // Hỗ trợ cú pháp: :::walrus-image <blobId> [width] [height] :::
        const rule = /^:::walrus-image\s*([^\s]+)(?:\s+(\d+))?(?:\s+(\d+))?\s*:::/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'walrus-image',
                raw: match[0],
                blobId: match[1].trim(),
                width: match[2] ? parseInt(match[2], 10) : undefined,
                height: match[3] ? parseInt(match[3], 10) : undefined,
            };
        }
        return undefined;
    },
    renderer(token) {
        const { blobId, width, height } = token;
        if (!blobId) {
            return `<div class="walrus-image-block">No blobId provided.</div>`;
        }
        const objUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${encodeURIComponent(blobId)}`;
        const sizeAttrs = [
            width ? `width="${width}"` : '',
            height ? `height="${height}"` : '',
            width || height ? 'style="max-width:100%;height:auto;"' : ''
        ].join(' ');
        return `
            <div class="walrus-image-block">
                <object type="image/png" data="${objUrl}" class="col-4 ps-0" ${sizeAttrs}></object>
            </div>
        `;
    },
};
