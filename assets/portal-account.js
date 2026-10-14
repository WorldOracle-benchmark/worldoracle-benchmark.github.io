(() => {
  'use strict';
  const api = window.WorldOracleAccount;
  const page = document.body.dataset.accountPage;
  if (!api || !page) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const tracks = {main:'WorldOracle-Core', policy:'WorldOracle-Policy', long_horizon:'WorldOracle-Long'};
  const platforms = {agibot_g2:'AgiBot G2', yam:'YAM', human_hands:'Human Hands'};
  const statuses = {draft:'Draft', submitted:'Submitted', under_review:'Under Review', needs_changes:'Needs Changes', accepted:'Accepted', finished:'Finished', rejected:'Rejected', withdrawn:'Withdrawn'};
  function message(text, error = false, root = document) {
    const node = $('[data-message]', root); if (!node) return;
    node.textContent = text || ''; node.hidden = !text; node.classList.toggle('error', error);
    if (error) node.scrollIntoView({behavior:'smooth', block:'center'});
  }
  function busy(form, value, label = 'Working…') {
    const button = form.querySelector('[type="submit"]'); if (!button) return;
    if (!button.dataset.label) button.dataset.label = button.textContent;
    button.disabled = value; button.textContent = value ? label : button.dataset.label;
  }
  function enhancePlatformSelect(select) {
    if (!select || select.dataset.platformEnhanced === 'true') return null;
    select.dataset.platformEnhanced = 'true';
    select.classList.add('platform-select-native');
    select.setAttribute('aria-hidden','true');
    select.tabIndex = -1;

    const control = document.createElement('div');
    control.className = 'platform-select-control';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'platform-select-trigger';
    trigger.setAttribute('aria-haspopup','listbox');
    trigger.setAttribute('aria-expanded','false');
    const value = document.createElement('span');
    value.className = 'platform-select-value';
    const chevron = document.createElement('span');
    chevron.className = 'platform-select-chevron';
    chevron.setAttribute('aria-hidden','true');
    trigger.append(value,chevron);

    const menu = document.createElement('div');
    menu.className = 'platform-select-menu';
    menu.setAttribute('role','listbox');
    menu.setAttribute('aria-label','Platform');
    menu.hidden = true;
    const items = [...select.options].map(option => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'platform-select-option';
      item.dataset.value = option.value;
      item.setAttribute('role','option');
      const mark = document.createElement('span');
      mark.className = 'platform-select-mark';
      mark.setAttribute('aria-hidden','true');
      const label = document.createElement('span');
      label.textContent = option.textContent;
      item.append(mark,label);
      menu.append(item);
      return item;
    });
    control.append(trigger,menu);
    select.insertAdjacentElement('afterend',control);

    const availableItems = () => items.filter(item => !item.disabled && !item.hidden);
    const sync = () => {
      const selected = select.options[select.selectedIndex];
      value.textContent = selected?.textContent || 'Select a platform';
      trigger.disabled = select.disabled;
      items.forEach((item,index) => {
        const option = select.options[index];
        const active = index === select.selectedIndex;
        item.disabled = Boolean(option.disabled);
        item.hidden = Boolean(option.hidden);
        item.classList.toggle('is-selected',active);
        item.setAttribute('aria-selected',String(active));
        item.setAttribute('aria-disabled',String(Boolean(option.disabled)));
      });
    };
    const close = (restoreFocus=false) => {
      menu.hidden = true;
      control.classList.remove('is-open');
      trigger.setAttribute('aria-expanded','false');
      if (restoreFocus) trigger.focus();
    };
    const open = (focusSelected=false) => {
      if (trigger.disabled) return;
      menu.hidden = false;
      control.classList.add('is-open');
      trigger.setAttribute('aria-expanded','true');
      if (focusSelected) (items[select.selectedIndex]?.disabled ? availableItems()[0] : items[select.selectedIndex])?.focus();
    };
    const choose = item => {
      if (!item || item.disabled || item.hidden) return;
      select.value = item.dataset.value;
      select.dispatchEvent(new Event('change',{bubbles:true}));
      sync(); close(true);
    };
    trigger.addEventListener('click',()=>menu.hidden?open(false):close(false));
    trigger.addEventListener('keydown',event=>{
      if (!['ArrowDown','ArrowUp'].includes(event.key)) return;
      event.preventDefault(); open(true);
    });
    items.forEach(item=>{
      item.addEventListener('click',()=>choose(item));
      item.addEventListener('keydown',event=>{
        if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(item); return; }
        if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const available = availableItems();
        const index = available.indexOf(item);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? available.length - 1 :
          (index + (event.key === 'ArrowDown' ? 1 : -1) + available.length) % available.length;
        available[next]?.focus();
      });
    });
    select.addEventListener('change',sync);
    document.addEventListener('pointerdown',event=>{ if (!control.contains(event.target)) close(false); });
    sync();
    return {sync,close};
  }
  async function loadAccount() {
    const {email, team, models, can_submit, submission_reason, quota, must_change_password, resources, resource_update, account_type} = await api.request('/api/v1/account');
    document.querySelectorAll('[data-account-email]').forEach(node => { node.textContent = email; });
    if (must_change_password && page !== 'change-password') location.replace(new URL('../change-password/', location.href));
    return {email, team, models, can_submit, submission_reason, quota, resources, resource_update, account_type};
  }
  document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', api.logout));

  async function login() {
    const form = $('[data-login-form]');
    if (api.token()) {
      try { await api.request('/api/v1/account'); location.replace(new URL('../dashboard/', location.href)); return; }
      catch (_) {}
    }
    form.addEventListener('submit', async event => {
      event.preventDefault(); message(''); busy(form, true, 'Signing in…');
      try {
        const payload = await api.request('/api/v1/auth/login', {method:'POST', body:{email:form.email.value, password:form.password.value}});
        api.saveToken(payload.token); location.replace(new URL('../dashboard/', location.href));
      } catch (error) { message(error.message, true); }
      finally { busy(form, false); }
    });
  }

  async function dashboard() {
    if (!api.requireSession()) return;
    const [account, initial] = await Promise.all([loadAccount(), api.request('/api/v1/submissions')]);
    $('[data-team]').textContent = account.team?.team_name || 'Registration Pending';
    $('[data-model]').textContent = account.team?.model_name || account.email;
    const note = $('[data-account-state]');
    note.textContent = account.can_submit
      ? (account.account_type === 'internal'
          ? 'Internal account · Evaluations use idle capacity, stay behind all regular participants, and never update the public leaderboard. Up to 3 active submissions are allowed.'
          : "Each weekly cycle starts from this account's first formal submission. Every Track receives 2 submissions, with 6 total across all Tracks.")
      : account.submission_reason;
    const quota = $('[data-quota-overview]');
    if (quota && account.quota) {
      const limits = account.quota;
      if (limits.unlimited) {
        $('[data-quota-reset]', quota).textContent = `No weekly limit · maximum ${limits.active_limit || 3} active submissions`;
        quota.querySelectorAll('[data-quota-track]').forEach(node => { node.textContent = 'Unlimited'; });
        $('[data-quota-total]', quota).textContent = '3 active max';
      } else {
        const reset = limits.resets_at
          ? new Intl.DateTimeFormat(undefined, {dateStyle:'medium', timeStyle:'short'}).format(new Date(limits.resets_at * 1000))
          : 'The first formal submission starts the seven-day cycle.';
        $('[data-quota-reset]', quota).textContent = limits.resets_at ? `Resets ${reset}` : reset;
        Object.entries(limits.remaining_tracks || {}).forEach(([key, value]) => {
          const node = quota.querySelector(`[data-quota-track="${key}"]`);
          if (node) node.textContent = `${value} / ${limits.track_limit}`;
        });
        $('[data-quota-total]', quota).textContent = `${limits.remaining_total} / ${limits.total_limit}`;
      }
      quota.hidden = false;
    }
    const create = $('[data-new-submission]'); create.hidden = !account.can_submit;
    create.addEventListener('click', async () => {
      create.disabled = true;
      try { const data = await api.request('/api/v1/submissions', {method:'POST', body:{}}); location.assign(`../edit/?id=${encodeURIComponent(data.submission.id)}&step=1`); }
      catch (error) { message(error.message, true); create.disabled = false; }
    });
    const list = $('[data-submission-list]');
    let submissions = initial.submissions;
    const trackOrder = ['main', 'policy', 'long_horizon'];
    const sortKeys = {main:'created', policy:'created', long_horizon:'created'};
    const submittedAt = item => item.submitted_at || item.created;
    const number = value => value == null ? '—' : Number(value).toFixed(2);
    const displayTrack = item => trackOrder.includes(item.metadata?.benchmark_track)
      ? item.metadata.benchmark_track : 'main';
    const sortRows = (rows, sortKey) => [...rows].sort((a,b) => {
      if (sortKey === 'single' || sortKey === 'multi') {
        const key = sortKey === 'single' ? 'single_view' : 'multi_view';
        const left = a.summary_scores?.[key], right = b.summary_scores?.[key];
        if (left == null && right == null) return submittedAt(b) - submittedAt(a);
        if (left == null) return 1; if (right == null) return -1;
        return right - left || submittedAt(b) - submittedAt(a);
      }
      return submittedAt(b) - submittedAt(a);
    });
    const renderTable = trackKey => {
      const sortKey = sortKeys[trackKey];
      const trackSubmissions = submissions.filter(item => displayTrack(item) === trackKey);
      const rows = sortRows(trackSubmissions, sortKey).map(item => {
        const meta=item.metadata, editable=['draft','needs_changes'].includes(item.status), encodedId=encodeURIComponent(item.id);
        const href=editable?`../edit/?id=${encodedId}&step=1`:`../view/?id=${encodedId}`;
        const current=item.current_stage||{key:item.status,label:statuses[item.status]||item.status,progress:null};
        const progress=current.key==='evaluating'?`<progress max="100" value="${Number(current.progress)||0}" aria-label="Overall evaluation progress"></progress><small>${Number(current.progress)||0}%</small>`:'';
        const queue=current.key==='submitted'&&item.queue_ahead!=null?`<strong>${Number(item.queue_ahead)}</strong><small>${Number(item.queue_ahead)===1?'team':'teams'} ahead</small>`:'—';
        const submitted=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(submittedAt(item)*1000));
        const platform = trackKey === 'policy' ? platforms.agibot_g2 : (platforms[meta.embodiment]||'Not selected');
        return `<tr class="submission-sheet-row" tabindex="0" data-href="${href}"><td><time>${escape(submitted)}</time><code>${escape(item.id.slice(0,8))}</code></td><td>${escape(tracks[meta.benchmark_track]||'Not selected')}</td><td>${escape(platform)}</td><td class="score-cell">${item.version?`V${escape(item.version)}`:'—'}</td><td><span class="badge ${escape(current.key)}">${escape(current.label)}</span>${progress}</td><td class="queue-cell">${queue}</td><td class="score-cell">${number(item.summary_scores?.single_view)}</td><td class="score-cell">${number(item.summary_scores?.multi_view)}</td><td>${item.status==='draft'?`<button class="table-action danger" type="button" data-delete="${escape(item.id)}">Delete</button>`:`<a class="table-action" href="${href}">Details →</a>`}</td></tr>`;
      }).join('');
      const body = rows || `<tr class="submission-sheet-empty-row"><td colspan="9">No submissions in this Track.</td></tr>`;
      return `<div class="submission-sheet-wrap submission-track-sheet" data-submission-track="${trackKey}"><table class="submission-sheet"><thead><tr><th><button type="button" data-track="${trackKey}" data-sort="created" aria-sort="${sortKey==='created'?'descending':'none'}">Submitted ${sortKey==='created'?'↓':''}</button></th><th>Track</th><th>Platform</th><th>Version</th><th>Stage</th><th>Queue</th><th><button type="button" data-track="${trackKey}" data-sort="single" aria-sort="${sortKey==='single'?'descending':'none'}">SV Score ${sortKey==='single'?'↓':''}</button></th><th><button type="button" data-track="${trackKey}" data-sort="multi" aria-sort="${sortKey==='multi'?'descending':'none'}">MV Score ${sortKey==='multi'?'↓':''}</button></th><th></th></tr></thead><tbody>${body}</tbody></table></div>`;
    };
    const render = () => {
      list.innerHTML=trackOrder.map(renderTable).join('');
      list.querySelectorAll('[data-sort]').forEach(button=>button.addEventListener('click',()=>{sortKeys[button.dataset.track]=button.dataset.sort;render();}));
      list.querySelectorAll('[data-href]').forEach(row=>{row.addEventListener('click',event=>{if(!event.target.closest('a,button'))location.assign(row.dataset.href);});row.addEventListener('keydown',event=>{if(event.key==='Enter')location.assign(row.dataset.href);});});
      list.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',async event=>{event.stopPropagation();if(!confirm('Delete this draft? Its audit record and uploaded materials may be retained privately.'))return;try{await api.request(`/api/v1/submissions/${encodeURIComponent(button.dataset.delete)}`,{method:'DELETE',body:{}});submissions=submissions.filter(item=>item.id!==button.dataset.delete);render();}catch(error){message(error.message,true);}}));
    };
    render();
    if (submissions.some(item=>item.current_stage?.key==='submitted')) setInterval(async()=>{
      try { submissions=(await api.request('/api/v1/submissions')).submissions;render(); } catch (_) {}
    },10000);
  }

  async function editor() {
    if (!api.requireSession()) return;
    await loadAccount();
    const params = new URLSearchParams(location.search), sid = params.get('id');
    const requestedStep = Number.parseInt(params.get('step') || '1', 10);
    const step = Number.isFinite(requestedStep) ? Math.max(1, Math.min(4, requestedStep)) : 1;
    if (!sid) { location.replace('../dashboard/'); return; }
    const {submission:item} = await api.request(`/api/v1/submissions/${encodeURIComponent(sid)}`);
    $('[data-submission-id]').textContent = sid.slice(0,8); $('[data-step]').textContent = step;
    document.querySelectorAll('[data-step-link]').forEach((node, index) => { const number = index + 1; node.href = `?id=${encodeURIComponent(sid)}&step=${number}`; node.closest('li').className = number === step ? 'current' : number < step ? 'done' : ''; });
    const root = $('[data-editor]'), meta = item.metadata;
    if (step === 1) {
      root.innerHTML = `<h2>Model and Track</h2><p class="muted">This account is permanently bound to one organizer-approved model.</p><form data-step-form><fieldset class="track-choice"><legend>Choose Your Benchmark Track</legend>${Object.entries(tracks).map(([key,label],index)=>`<label class="track-option"><input type="radio" name="benchmark_track" value="${key}" ${meta.benchmark_track===key?'checked':''} required><span class="track-card-copy"><span class="track-number">Track ${index+1}</span><strong>${label}</strong></span></label>`).join('')}</fieldset><div class="field-grid"><div class="locked-field"><span>Registered Model</span><output>${escape(meta.model_name || 'Organizer approval required')}</output></div><label>Platform<select name="embodiment" required data-platform>${Object.entries(platforms).map(([key,label])=>`<option value="${key}" ${meta.embodiment===key?'selected':''}>${label}</option>`).join('')}</select></label></div><label>Submission Notes <small class="muted">Optional</small><textarea name="notes" rows="4" maxlength="4000">${escape(meta.notes || '')}</textarea></label><p class="notice error" data-message hidden></p><div class="form-actions"><button class="button primary" type="submit">Save and Continue →</button></div></form>`;
      const form = $('[data-step-form]', root), platform = $('[data-platform]', root), platformMenu = enhancePlatformSelect(platform);
      const sync = () => { const policy = form.benchmark_track.value === 'policy'; [...platform.options].forEach(option => { option.disabled = policy && option.value !== 'agibot_g2'; option.hidden = option.disabled; }); if (policy) platform.value='agibot_g2'; platformMenu?.sync(); };
      form.addEventListener('change', sync); sync();
      form.addEventListener('submit', async event => { event.preventDefault(); busy(form,true); try { await api.request(`/api/v1/submissions/${encodeURIComponent(sid)}`, {method:'PATCH', body:{benchmark_track:form.benchmark_track.value, embodiment:platform.value, notes:form.notes.value}}); location.assign(`?id=${encodeURIComponent(sid)}&step=2`); } catch(error){message(error.message,true,root);} finally{busy(form,false);} });
    } else if (step === 2) {
      root.innerHTML = `<h2>Upload Materials</h2><p class="muted">One ZIP containing the preview-2 manifest, README and prediction videos.</p><form data-chunk-upload data-upload-base="${escape(api.base)}/api/v1/uploads/${encodeURIComponent(sid)}" data-upload-next="?id=${encodeURIComponent(sid)}&step=3"><label class="upload-zone">Choose Your Package<input type="file" name="package" accept=".zip,application/zip" required><span>ZIP · Resumable upload · No credentials</span></label><div class="submission-notice-strip">Before uploading, review the <a class="inline-policy-link" href="../notices/submission-materials/" target="_blank" rel="noopener">Submission Materials notice</a>.</div><div class="upload-progress" data-upload-progress hidden><progress value="0" max="1"></progress><span data-upload-label>Ready</span><div class="actions"><button type="button" class="button" data-upload-pause hidden>Pause Upload</button><button type="button" class="button" data-upload-cancel hidden>Cancel Upload</button></div></div><p class="small muted">Files are hashed locally and uploaded in resumable 16 MiB parts. Uploading does not submit your result.</p><div class="form-actions"><a class="button" href="?id=${encodeURIComponent(sid)}&step=1">← Back</a><button class="button primary" type="submit">Start Upload</button></div><p class="small muted" data-submit-status role="status"></p></form>${item.has_package ? `<div class="callout">Current package: ${escape(item.package_name)}. <a href="?id=${encodeURIComponent(sid)}&step=3">Keep it and continue →</a></div>` : ''}`;
      const script = document.createElement('script'); script.src='../../assets/chunk-upload.js?v=20261013-upload-worker-fallback-v1'; document.body.append(script);
    } else if (step === 3) {
      if (!item.has_package) { location.replace(`?id=${encodeURIComponent(sid)}&step=2`); return; }
      const declarations = {authentic:'The materials accurately reflect this model and evaluation setup.', rights:'I have permission to submit these artifacts for evaluation.', secrets:'The package contains no credentials or unnecessary personal information.', review:'I have read the <a class="inline-policy-link" href="../notices/evaluation-rules/" target="_blank" rel="noopener">Evaluation Rules</a> and <a class="inline-policy-link" href="../notices/integrity-review/" target="_blank" rel="noopener">Integrity &amp; Review notice</a>.'};
      root.innerHTML = `<h2>Declarations</h2><p class="muted">Confirm these statements for the current package before submitting.</p><form data-step-form>${Object.entries(declarations).map(([key,text])=>`<label class="check declaration"><input type="checkbox" name="${key}" required><span>${text}</span></label>`).join('')}<p class="notice error" data-message hidden></p><div class="form-actions"><a class="button" href="?id=${encodeURIComponent(sid)}&step=2">← Back</a><button class="button primary" type="submit">Save and Continue →</button></div></form>`;
      const form=$('[data-step-form]',root); form.addEventListener('submit',async event=>{event.preventDefault();busy(form,true);try{await api.request(`/api/v1/submissions/${encodeURIComponent(sid)}/declarations`,{method:'POST',body:Object.fromEntries(Object.keys(declarations).map(key=>[key,form[key].checked]))});location.assign(`?id=${encodeURIComponent(sid)}&step=4`);}catch(error){message(error.message,true,root);}finally{busy(form,false);}});
    } else {
      if (!item.consent) { location.replace(`?id=${encodeURIComponent(sid)}&step=3`); return; }
      root.innerHTML = `<h2>Confirm and Submit</h2><dl class="summary"><dt>Model</dt><dd>${escape(meta.model_name)}</dd><dt>Track</dt><dd>${escape(tracks[meta.benchmark_track])}</dd><dt>Platform</dt><dd>${escape(platforms[meta.embodiment])}</dd><dt>Package</dt><dd>${escape(item.package_name)}</dd><dt>SHA-256</dt><dd><code>${escape(item.package_hash)}</code></dd></dl><div class="submission-notice-strip">Submitting enters the formal queue and uses quota under the <a class="inline-policy-link" href="../notices/evaluation-rules/" target="_blank" rel="noopener">Evaluation Rules</a>.</div><p class="notice error" data-message hidden></p><form data-step-form><div class="form-actions"><a class="button" href="?id=${encodeURIComponent(sid)}&step=3">← Back</a><button class="button primary" type="submit">Submit for Evaluation</button></div></form>`;
      const form=$('[data-step-form]',root); form.addEventListener('submit',async event=>{event.preventDefault();busy(form,true,'Submitting…');try{await api.request(`/api/v1/submissions/${encodeURIComponent(sid)}/submit`,{method:'POST',body:{}});location.assign(`../view/?id=${encodeURIComponent(sid)}`);}catch(error){message(error.message,true,root);busy(form,false);}});
    }
  }

  async function view() {
    if (!api.requireSession()) return; await loadAccount();
    const sid = new URLSearchParams(location.search).get('id'); if (!sid) { location.replace('../dashboard/'); return; }
    const encodedId = encodeURIComponent(sid);
    const {submission:item}=await api.request(`/api/v1/submissions/${encodedId}`), meta=item.metadata, root=$('[data-detail]');
    const current=item.current_stage||{key:item.status,label:statuses[item.status]||item.status};
    const final=['accepted','finished'].includes(current.key), summary=item.summary_scores||{}, scores=item.run?.scores||{};
    const score=value=>value==null?'—':Number(value).toFixed(2);
    const queue=item.queue_ahead==null?'—':`${Number(item.queue_ahead)} ${Number(item.queue_ahead)===1?'team':'teams'} ahead`;
    const timeline=(item.timeline||item.events||[]).map(event=>{const date=new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'medium'}).format(new Date(event.created*1000));return `<li><span class="badge ${escape(event.stage||event.status)}">${escape(event.label||statuses[event.status]||event.status)}</span><time>${escape(date)}</time><p>${escape(event.note||'')}</p></li>`;}).join('');
    const result=final?`<section class="result-score-panel"><h3>Evaluation Results</h3><div class="result-score-totals"><div><span>Single-View Score</span><strong>${score(summary.single_view)}</strong></div><div><span>Multi-View Score</span><strong>${score(summary.multi_view)}</strong></div></div><dl class="summary"><dt>Physical Correctness</dt><dd>${score(scores.physical)}</dd><dt>Interaction Region Fidelity</dt><dd>${score(scores.key_area)}</dd><dt>Spatial Consistency</dt><dd>${score(scores.spatial)}</dd><dt>Multi-View Consistency</dt><dd>${score(scores.multiview)}</dd></dl></section>`:'';
    root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">Submission ${escape(sid.slice(0,8))}</p><h1>${escape(meta.model_name||'Untitled Draft')}</h1><span class="badge ${escape(current.key)}">${escape(current.label)}</span></div><a class="text-link" href="../dashboard/">← My Submissions</a></div><div class="wizard-layout"><div class="panel"><h2>Submission Details</h2><dl class="summary"><dt>Track</dt><dd>${escape(tracks[meta.benchmark_track]||'Not set')}</dd><dt>Platform</dt><dd>${escape(platforms[meta.embodiment]||'Not set')}</dd><dt>Version</dt><dd>${item.version?`V${escape(item.version)}`:'Assigned after Accepted / Finished'}</dd><dt>Current Stage</dt><dd>${escape(current.label)}</dd>${current.key==='submitted'?`<dt>Live Queue</dt><dd>${escape(queue)}</dd>`:''}<dt>Package</dt><dd>${escape(item.package_name||'Not uploaded')}</dd>${item.package_hash?`<dt>SHA-256</dt><dd><code>${escape(item.package_hash)}</code></dd>`:''}</dl>${result}<h3>Submission Notes</h3><p class="user-text">${escape(meta.notes||'No notes provided.')}</p><div class="actions">${['draft','needs_changes'].includes(item.status)?`<a class="button primary" href="../edit/?id=${encodedId}&step=1">Edit Submission →</a>`:''}${item.has_package?'<button class="button" type="button" data-download>Download Package</button>':''}</div>${!['draft','accepted','finished','rejected','withdrawn'].includes(item.status)?'<button class="text-button danger" type="button" data-withdraw>Withdraw Submission</button>':''}<p class="notice error" data-message hidden></p></div><aside class="panel"><h2>Stage Timeline</h2><ol class="timeline">${timeline}</ol></aside></div>`;
    $('[data-download]',root)?.addEventListener('click',async()=>{try{const response=await api.request(`/api/v1/submissions/${encodedId}/download`,{raw:true});const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`worldoracle-${sid.slice(0,8)}.zip`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){message(error.message,true,root);}});
    $('[data-withdraw]',root)?.addEventListener('click',async()=>{if(!confirm('Withdraw this submission?'))return;try{await api.request(`/api/v1/submissions/${encodedId}/withdraw`,{method:'POST',body:{}});location.reload();}catch(error){message(error.message,true,root);}});
  }

  async function profile() {
    if (!api.requireSession()) return; const account=await loadAccount();
    const resources=account.resources||{github_url:'',huggingface_url:'',paper_url:'',supplemental:''};
    const update=account.resource_update;
    const pending=update?.status==='pending';
    const rejected=update?.status==='rejected';
    const root=$('[data-profile]');
    root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">Submission Account</p><h1>${escape(account.team?.team_name||'Registration Pending')}</h1><p class="muted">${escape(account.email)}</p></div><a class="button" href="../change-password/">Change Password</a></div><section class="panel team-summary"><h2>Registered Model</h2><dl class="summary"><dt>Model</dt><dd>${escape(account.team?.model_name||'Pending')}</dd><dt>Organization</dt><dd>${escape(account.team?.organization||'Pending')}</dd><dt>Status</dt><dd>${escape(account.team?.team_status||'pending')}</dd></dl></section><section class="panel resource-update-panel"><div class="page-heading"><div><p class="eyebrow">Organizer-reviewed</p><h2>Public Model Resources</h2><p class="muted small">Request changes to Paper, Code, or Weights. Existing public links remain unchanged until approval.</p></div>${update?`<span class="badge ${escape(update.status)}">Latest: ${escape(update.status==='pending'?'updating':update.status)}</span>`:''}</div><dl class="summary"><dt>Code</dt><dd>${escape(resources.github_url||'Not published')}</dd><dt>Weights</dt><dd>${escape(resources.huggingface_url||'Not published')}</dd><dt>Paper</dt><dd>${escape(resources.paper_url||'Not published')}</dd></dl>${pending?`<div class="callout"><strong>Update #${escape(update.id)} is awaiting organizer review.</strong><br>You can submit another change after this request is approved or rejected.</div>`:`${rejected?`<div class="notice error"><strong>Previous request rejected:</strong> ${escape(update.review_reason||'Contact the organizers for details.')}</div>`:''}<button class="button primary" type="button" data-resource-toggle>Request Public Resource Update →</button><form class="resource-update-form" data-resource-form hidden><label>Code Repository <span class="optional-label">Optional</span><input type="url" name="github_url" maxlength="500" value="${escape(resources.github_url)}"></label><label>Model Weights <span class="optional-label">Optional</span><input type="url" name="huggingface_url" maxlength="500" value="${escape(resources.huggingface_url)}"></label><label>Paper / Technical Report <span class="optional-label">Optional</span><input type="url" name="paper_url" maxlength="500" value="${escape(resources.paper_url)}"></label><label>Review Notes <span class="optional-label">Optional · private</span><textarea name="supplemental" maxlength="4000">${escape(resources.supplemental)}</textarea></label><p class="notice error" data-message hidden></p><div class="actions"><button class="button primary" type="submit">Submit Update for Review</button><button class="button" type="button" data-resource-cancel>Cancel</button></div></form>`}</section>`;
    const toggle=$('[data-resource-toggle]',root), form=$('[data-resource-form]',root);
    toggle?.addEventListener('click',()=>{toggle.hidden=true;form.hidden=false;form.querySelector('input')?.focus();});
    $('[data-resource-cancel]',root)?.addEventListener('click',()=>{form.hidden=true;toggle.hidden=false;message('',false,form);});
    form?.addEventListener('submit',async event=>{
      event.preventDefault(); message('',false,form); busy(form,true,'Submitting…');
      try {
        const result=await api.request('/api/v1/account/resource-update',{method:'POST',body:{github_url:form.github_url.value,huggingface_url:form.huggingface_url.value,paper_url:form.paper_url.value,supplemental:form.supplemental.value}});
        const notice=window.WorldOracleI18n?.localize(result.message)||result.message;
        if(window.WorldOracleProfileToast) window.WorldOracleProfileToast(notice,{type:'success',title:window.WorldOracleI18n?.localize('Update submitted')||'Update submitted'});
        else message(notice,false,form);
        window.setTimeout(()=>location.reload(),2800);
      } catch(error) {
        const notice=window.WorldOracleI18n?.localize(error.message)||error.message;
        if(window.WorldOracleProfileToast) window.WorldOracleProfileToast(notice,{type:'error',title:window.WorldOracleI18n?.localize('Update not submitted')||'Update not submitted'});
        else message(notice,true,form);
        busy(form,false);
      }
    });
  }

  async function changePassword() {
    if (!api.requireSession()) return; await loadAccount(); const form=$('[data-password-form]');
    form.addEventListener('submit',async event=>{event.preventDefault();busy(form,true);try{const result=await api.request('/api/v1/auth/change-password',{method:'POST',body:{current_password:form.current_password.value,password:form.password.value,confirm:form.confirm.value}});alert(window.WorldOracleI18n?.localize(result.message) || result.message);api.logout();}catch(error){message(error.message,true);busy(form,false);}});
  }

  const handlers={login,dashboard,editor,view,profile,'change-password':changePassword};
  Promise.resolve(handlers[page]?.()).catch(error=>message(error.message,true));
})();
