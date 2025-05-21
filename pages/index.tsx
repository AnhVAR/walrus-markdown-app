import { useState } from 'react';
import MarkdownInput from '../components/MarkdownInput';
import MarkdownPreview from '../components/MarkdownPreview';
import { WalrusClient } from '@mysten/walrus';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const Home = () => {
  const [markdown, setMarkdown] = useState('');
  const [theme, setTheme] = useState<'github'>('github');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [lastBlobId, setLastBlobId] = useState<string | null>(null);

  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  const walrusClient = new WalrusClient({
    network: 'testnet',
    suiClient: suiClient,
  });

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
  };

  const handlePublishPage = async () => {
    setIsPublishing(true);
    setPublishMessage('Publishing to Walrus (no wallet required)...');

    try {
      const file = new TextEncoder().encode(markdown);

      const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=53', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      let info: {
        status: string;
        blobId: string;
        endEpoch: string | number;
        suiRefType: string;
        suiRef: string;
        suiBaseUrl: string;
      };

      const SUI_NETWORK = "testnet";
      const SUI_VIEW_TX_URL = `https://suiscan.xyz/${SUI_NETWORK}/tx`;
      const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/${SUI_NETWORK}/object`;

      if ('alreadyCertified' in data) {
        info = {
          status: "Already certified",
          blobId: data.alreadyCertified.blobId,
          endEpoch: data.alreadyCertified.endEpoch,
          suiRefType: "Previous Sui Certified Event",
          suiRef: data.alreadyCertified.event.txDigest,
          suiBaseUrl: SUI_VIEW_TX_URL,
        };
      } else if ('newlyCreated' in data) {
        info = {
          status: "Newly created",
          blobId: data.newlyCreated.blobObject.blobId,
          endEpoch: data.newlyCreated.blobObject.storage.endEpoch,
          suiRefType: "Associated Sui Object",
          suiRef: data.newlyCreated.blobObject.id,
          suiBaseUrl: SUI_VIEW_OBJECT_URL,
        };
      } else {
        throw new Error("Unhandled successful response!");
      }

      setPublishMessage(
        `Status: ${info.status}\nBlobId: ${info.blobId}\nStored until epoch: ${info.endEpoch}\n${info.suiRefType}: ${info.suiRef}`
      );
      setLastBlobId(info.blobId);
      alert(
        `Upload thành công!\nStatus: ${info.status}\nBlobId: ${info.blobId}\nXem tại: https://walrus.mystenlabs.com/blobs/${info.blobId}`
      );
    } catch (error: any) {
      console.error('Failed to publish to Walrus:', error);
      setPublishMessage(`Failed to publish: ${error.message}`);
      setLastBlobId(null);
      alert(`Failed to publish: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLiveClick = () => {
    if (lastBlobId) {
      const url = `/live.html?markdown=${encodeURIComponent(`${lastBlobId}`)}`;
      window.open(url, '_blank');
    }
  };

  const handleUploadClick = () => {
    window.open('/upload.html', '_blank');
  };

  return (
    <div style={{ height: '100vh', background: '#f9f9f9' }}>
      <h1 style={{ textAlign: 'center', margin: 0, padding: '24px 0', background: '#222', color: '#fff', fontWeight: 400, fontSize: 28 }}>
        Walrus Markdown Editor
      </h1>
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <label style={{ marginLeft: 24 }}>
          Theme:&nbsp;
          <select value={theme} onChange={e => setTheme(e.target.value as any)}>
            <option value="github">GitHub</option>
          </select>
        </label>
        <button
          style={{
            marginLeft: 24,
            padding: '6px 18px',
            fontSize: 15,
            background: '#6f42c1',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onClick={handlePublishPage}
          disabled={isPublishing}
        >
          {isPublishing ? 'Publishing...' : 'Publish to Walrus'}
        </button>
        <button
          style={{
            marginLeft: 12,
            padding: '6px 18px',
            fontSize: 15,
            background: '#0074d9',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onClick={handleUploadClick}
        >
          Upload File
        </button>
        {lastBlobId && (
          <button
            style={{
              marginLeft: 12,
              padding: '6px 18px',
              fontSize: 15,
              background: '#2ecc40',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onClick={handleLiveClick}
          >
            Live
          </button>
        )}
        {publishMessage && <p style={{ marginTop: '8px', fontSize: '14px' }}>{publishMessage}</p>}
      </div>
      <div
        style={{
          display: 'flex',
          height: 'calc(100vh - 140px)',
          borderTop: '1px solid #ddd',
        }}
      >
        <div style={{ flex: 1, borderRight: '1px solid #ddd', background: '#fff', padding: 0 }}>
          <div style={{ padding: '8px 16px', background: '#f3f3f3', borderBottom: '1px solid #eee', fontWeight: 500 }}>Input</div>
          <div style={{ padding: 0, height: 'calc(100% - 40px)' }}>
            <MarkdownInput
              onChange={handleMarkdownChange}
              defaultValue={`# Welcome to Walrus Markdown Editor!

Type your *Markdown* on the left, see the **preview** on the right.
Below is an example of Markdown and custom objects supported by this project for Sui and Walrus:

**Standard Markdown**: You can use headings, lists, code blocks, images, links, etc.
- Heading 1:  
  # This is an H1
- Heading 2:  
  ## This is an H2
- **Bold text**: 
- *Italic text*:
- [Link to Google](https://www.google.com)
- Image:
  ![Walrus Logo](https://walrus.mystenlabs.com/logo.svg)

**Walrus Components**:
:::sui-connect:::

:::walruscan
Ghb7sd6LKzprnGk_QKeLmO2Qvq8inFOO9pgNLICA4Wk
:::

:::suiscan
0x6dda5411a5f404d16eacc45257fc26b607ad8382b4f9587a0b8c5aeba9391793
:::

:::walrus-image
dbJFsCxPEKfyitXSZS42wSTxWXhyrVexcytVqYSQ_wQ
50
50
:::
Try editing this content or add your own!

`}
            />
          </div>
        </div>
        <div style={{ flex: 1, background: '#fff', padding: 0 }}>
          <div style={{ padding: '8px 16px', background: '#f3f3f3', borderBottom: '1px solid #eee', fontWeight: 500 }}>Preview</div>
          <div style={{ padding: '16px', height: 'calc(100% - 40px)', overflowY: 'auto' }}>
            <MarkdownPreview markdown={markdown} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;