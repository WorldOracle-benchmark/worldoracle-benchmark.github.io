/* No persistent tokens/file contents in localStorage. Server is the resume authority. */
const chunkUploadAssetBase = typeof document !== 'undefined' && document.currentScript
  ? new URL('.', document.currentScript.src).href : '';
function uploadRanges(size, chunk) {
  return Array.from({length: Math.ceil(size / chunk)}, (_, index) => ({index, start: index * chunk, end: Math.min(size, (index + 1) * chunk)}));
}
function missingUploadParts(size, chunk, received) {
  const present = new Set(received);
  return uploadRanges(size, chunk).filter(part => !present.has(part.index));
}
function retryableUpload(status) { return [0, 408, 409, 429, 500, 502, 503, 504].includes(status); }
function sha256Hex(value) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  const length = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(length); padded.set(bytes); padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const bits = bytes.length * 8;
  view.setUint32(length - 8, Math.floor(bits / 0x100000000));
  view.setUint32(length - 4, bits >>> 0);
  const h = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const k = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const w = new Uint32Array(64), rotr = (n, x) => (x >>> n) | (x << (32 - n));
  for (let offset = 0; offset < length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
      const s1 = rotr(17, y) ^ rotr(19, y) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a,b,c,d,e,f,g,z] = h;
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const t1 = (z + s1 + ((e & f) ^ (~e & g)) + k[i] + w[i]) >>> 0;
      const s0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const t2 = (s0 + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      z=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    h[0]=(h[0]+a)>>>0; h[1]=(h[1]+b)>>>0; h[2]=(h[2]+c)>>>0; h[3]=(h[3]+d)>>>0;
    h[4]=(h[4]+e)>>>0; h[5]=(h[5]+f)>>>0; h[6]=(h[6]+g)>>>0; h[7]=(h[7]+z)>>>0;
  }
  return Array.from(h, word => word.toString(16).padStart(8, '0')).join('');
}
async function digestHex(buffer) {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return sha256Hex(buffer);
}
function checksumRoot(size, chunk, hashes) {
  return sha256Hex(new TextEncoder().encode(`${size}:${chunk}:${hashes.join(',')}`));
}
async function fileFingerprint(file, chunk) {
  const edge = Math.min(1024 * 1024, file.size);
  const first = await digestHex(await file.slice(0, edge).arrayBuffer());
  const last = file.size <= edge ? first : await digestHex(await file.slice(file.size - edge).arrayBuffer());
  return sha256Hex(new TextEncoder().encode(`${file.size}:${chunk}:${first}:${last}`));
}
function createChunkHasher(workerUrl) {
  let worker;
  try { if (typeof Worker !== 'undefined') worker = new Worker(workerUrl); } catch (_) { worker = null; }
  if (!worker) return {digest: async buffer => ({hash: await digestHex(buffer), buffer}), close() {}};
  let sequence = 0;
  const pending = new Map();
  worker.onmessage = event => {
    const job = pending.get(event.data.id);
    if (!job) return;
    pending.delete(event.data.id);
    job.resolve({hash: event.data.hash, buffer: event.data.buffer});
  };
  worker.onerror = error => {
    const failure = new Error(error?.message || 'The background checksum worker stopped unexpectedly.');
    pending.forEach(job => job.reject(failure)); pending.clear(); worker.terminate(); worker = null;
  };
  return {
    digest(buffer) {
      if (!worker) return Promise.reject(new Error('The background checksum worker stopped. Retry the upload.'));
      return new Promise((resolve, reject) => {
        const id = sequence++; pending.set(id, {resolve, reject});
        worker.postMessage({id, buffer}, [buffer]);
      });
    },
    close() { if (worker) worker.terminate(); worker = null; }
  };
}
if (typeof module !== 'undefined') module.exports = {uploadRanges, missingUploadParts, retryableUpload, sha256Hex, digestHex, checksumRoot};

if (typeof document !== 'undefined') {
  const form = document.querySelector('[data-chunk-upload]');
  if (form) {
    const base = new URL(form.dataset.uploadBase, location.href).href;
    const next = new URL(form.dataset.uploadNext, location.href).href;
    const viewModeUrl = form.dataset.viewModeUrl ? new URL(form.dataset.viewModeUrl, location.href).href : '';
    const token = window.WorldOracleAccount?.token() || '';
    const input = form.querySelector('[name="package"]');
    const viewMode = form.querySelector('[name="view_mode"]');
    const submit = form.querySelector('button[type="submit"]');
    const pause = form.querySelector('[data-upload-pause]');
    const cancel = form.querySelector('[data-upload-cancel]');
    const box = form.querySelector('[data-upload-progress]');
    const bar = box.querySelector('progress');
    const label = box.querySelector('[data-upload-label]');
    const status = form.querySelector('[data-submit-status]');
    const controllers = new Set();
    let config, session = null, paused = false, busy = false, task = null;
    const mib = bytes => (bytes / 1048576).toFixed(1);
    const displayBytes = bytes => bytes >= 1073741824
      ? `${(bytes / 1073741824).toFixed(bytes % 1073741824 ? 1 : 0)} GiB`
      : `${mib(bytes)} MiB`;
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const stop = () => { paused = true; controllers.forEach(controller => controller.abort()); };
    function checkPaused() { if (paused) throw new DOMException('Paused', 'AbortError'); }
    function show(message, error = false) {
      box.hidden = false; status.textContent = message;
      status.classList.toggle('upload-error', error);
      status.setAttribute('role', error ? 'alert' : 'status');
    }
    function update(bytes, total, speed = '') {
      box.hidden = false; bar.max = total || 1; bar.value = bytes;
      label.textContent = `Server Received: ${Math.min(100, 100 * bytes / (total || 1)).toFixed(1)}% · ${mib(bytes)} / ${mib(total)} MiB${speed}`;
    }
    async function api(url, {method = 'GET', body, raw = false, retry = false, headers = {}} = {}) {
      for (let attempt = 0; ; attempt++) {
        const controller = new AbortController(); controllers.add(controller);
        const timer = setTimeout(() => controller.abort(), raw ? 360000 : 90000);
        try {
          const response = await fetch(url, {method, mode: 'cors', credentials: 'omit', signal: controller.signal,
            headers: {'Authorization': `Bearer ${token}`, ...(body === undefined ? {} : {'Content-Type': raw ? 'application/octet-stream' : 'application/json'}), ...headers},
            body: body === undefined ? undefined : raw ? body : JSON.stringify(body)});
          const json = await response.json().catch(() => ({}));
          if (!response.ok || response.redirected) {
            const error = new Error(json.error || (response.redirected || response.status === 401 ? 'Please sign in again and reopen this draft to resume.' : `Upload request failed (${response.status}).`));
            error.status = response.status; throw error;
          }
          return json;
        } catch (error) {
          const failure = error instanceof Error
            ? error
            : new Error(error?.message || 'The upload request failed unexpectedly.');
          if (paused || !retry || attempt >= 5 || !retryableUpload(failure.status || 0)) throw failure;
          show(`Connection interrupted or server busy. Retrying (${attempt + 1}/5)…`);
        } finally { clearTimeout(timer); controllers.delete(controller); }
        await sleep(Math.min(8000, 500 * 2 ** attempt) + Math.random() * 300);
        checkPaused();
      }
    }
    async function poll() {
      pause.hidden = true; cancel.hidden = false;
      submit.textContent = 'Checking Upload…';
      while (session && ['queued', 'checking'].includes(session.state)) {
        checkPaused();
        show(session.state === 'queued' ? 'Upload received. Waiting for file assembly and Track checks… You may return to this draft later.' : 'Checking file integrity and Track requirements… No evaluation has started.');
        await sleep(2000); checkPaused();
        session = await api(`${base}/${session.id}`, {retry: true});
      }
      if (session?.state === 'complete') {
        update(session.total_bytes, session.total_bytes);
        show('Upload verified. Opening declarations…');
        submit.textContent = 'Upload Verified'; location.assign(next); return;
      }
      if (session && ['failed', 'cancelled', 'expired'].includes(session.state)) {
        throw new Error(session.error || 'Upload ended. Choose the file to start a new upload.');
      }
    }
    submit.disabled = true;
    const ready = api(base).then(result => {
      config = result; session = result.upload;
      if (session) {
        update(session.received_bytes, session.total_bytes); cancel.hidden = false;
        if (session.state === 'uploading') {
          submit.textContent = 'Resume Upload';
          show(`Saved upload: ${session.filename}. Reselect the same ZIP to verify and resume. Parts are retained for 48 hours after the last successful part.`);
        } else {
          busy = true; submit.disabled = true; input.disabled = true;
          task = poll().catch(error => show(error.message, true)).finally(() => {busy = false; submit.disabled = false; input.disabled = false; submit.textContent = 'Retry Upload / Check';});
        }
      }
    }).catch(error => { show(error.message, true); }).finally(() => { if (!busy) submit.disabled = false; });
    // Avoid an unhandled rejection if the initial status request fails before a click.
    ready.catch(() => {});
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (busy) return;
      paused = false; busy = true; submit.disabled = true; input.disabled = true;
      submit.textContent = 'Preparing Upload…';
      task = (async () => {
        await ready; checkPaused();
        if (viewModeUrl) {
          if (!viewMode?.value) throw new Error('Choose Single-View or Multi-View before uploading.');
          await api(viewModeUrl, {method: 'PATCH', body: {view_mode: viewMode.value}, retry: true});
          // Saving the view type invalidates uploads made for older metadata.
          config = await api(base, {retry: true});
          session = config.upload;
        } else if (!config) config = await api(base, {retry: true});
        const file = input.files[0];
        if (!file) throw new Error('Choose the original ZIP file to start or resume.');
        if (!file.size || file.size > config.max_bytes) throw new Error(`Choose a ZIP no larger than ${displayBytes(config.max_bytes)}.`);
        pause.hidden = false;
        show('Checking file identity before starting the resumable upload…');
        const fingerprint = await fileFingerprint(file, config.chunk_bytes);
        checkPaused();
        session = await api(base, {method: 'POST', body: {filename: file.name, size: file.size, fingerprint}, retry: true});
        cancel.hidden = false;
        if (session.state === 'complete') { location.assign(next); return; }
        if (session.state === 'uploading') {
          submit.textContent = 'Uploading…';
          const ranges = uploadRanges(file.size, session.chunk_bytes);
          const hashes = new Array(ranges.length), received = new Set(session.parts);
          let cursor = 0, confirmed = session.received_bytes;
          const started = performance.now(), initial = confirmed;
          update(confirmed, file.size);
          const laneCount = Math.min(config.parallelism || 6, ranges.length);
          const workerUrl = new URL('chunk-hasher.js?v=20261013-upload-worker-fallback-v1', chunkUploadAssetBase);
          async function lane(hasher) {
            while (cursor < ranges.length) {
              checkPaused(); const range = ranges[cursor++];
              let buffer = await file.slice(range.start, range.end).arrayBuffer();
              let result;
              try {
                result = await hasher.digest(buffer);
              } catch (_) {
                // A Worker can be reclaimed under memory pressure while several
                // large chunks are being hashed. Re-read the detached buffer and
                // continue with Web Crypto instead of aborting every upload lane.
                buffer = await file.slice(range.start, range.end).arrayBuffer();
                result = {hash: await digestHex(buffer), buffer};
              }
              buffer = result.buffer;
              hashes[range.index] = result.hash;
              if (session.checksums?.[String(range.index)] !== result.hash) {
                await api(`${base}/${session.id}/parts/${range.index}`, {method: 'POST', raw: true, body: buffer, retry: true,
                  headers: {'X-Chunk-SHA256': result.hash}});
                if (!received.has(range.index)) confirmed += range.end - range.start;
              }
              update(confirmed, file.size, ` · ${mib((confirmed - initial) / Math.max(0.1, (performance.now() - started) / 1000))} MiB/s`);
              if (!paused) show(`Hashing and uploading verified parts in ${laneCount} parallel lanes…`);
            }
          }
          const hashers = Array.from({length: laneCount}, () => createChunkHasher(workerUrl));
          let laneError;
          await Promise.all(hashers.map(hasher => lane(hasher).catch(error => {laneError ||= error; stop();})))
            .finally(() => hashers.forEach(hasher => hasher.close()));
          if (laneError) throw laneError;
          checkPaused();
          session = await api(`${base}/${session.id}/complete`, {method: 'POST', body: {part_root: checksumRoot(file.size, session.chunk_bytes, hashes)}, retry: true});
        }
        await poll();
      })().catch(error => {
        const reason = error?.message || 'An unexpected browser upload error occurred.';
        show(error?.name === 'AbortError' ? 'Upload paused. Received parts are saved; use Resume Upload to continue.' : `Upload Failed: ${reason} You have not advanced to the next step. Use Retry Upload to try again.`, error?.name !== 'AbortError');
        submit.textContent = error?.name === 'AbortError' ? 'Resume Upload' : 'Retry Upload';
      }).finally(() => {busy = false; input.disabled = false; submit.disabled = session?.state === 'complete'; pause.hidden = true;});
    });
    pause.addEventListener('click', stop);
    cancel.addEventListener('click', async () => {
      const confirmation = 'Cancel this upload and schedule its temporary parts for removal? Your draft is kept.';
      if (!session || !window.confirm(window.WorldOracleI18n?.localize(confirmation) || confirmation)) return;
      cancel.disabled = true; stop(); if (task) await task;
      paused = false;
      try {
        await api(`${base}/${session.id}/cancel`, {method: 'POST', body: {}});
        session = null; cancel.hidden = true; input.value = ''; update(0, 1);
        show('Upload cancelled. Temporary parts will be cleaned automatically. Your draft is unchanged.');
        submit.textContent = 'Start Upload';
      } catch (error) { show(error.message); }
      finally {cancel.disabled = false;}
    });
    window.addEventListener('beforeunload', event => {
      if (busy && session?.state === 'uploading') {event.preventDefault(); event.returnValue = '';}
    });
  }
}
