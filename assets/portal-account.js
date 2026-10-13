(() => {
  'use strict';
  const api = window.WorldOracleAccount;
  const page = document.body.dataset.accountPage;
  if (!api || !page) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const tracks = {main:'Main Track', policy:'Policy Track', long_horizon:'Long-Horizon Track'};
  const platforms = {agibot_g2:'AgiBot G2', yam:'YAM', human_hands:'Human Hands'};
  const statuses = {draft:'Draft', submitted:'Submitted', under_review:'Under Review', needs_changes:'Needs Changes', accepted:'Accepted', rejected:'Rejected', withdrawn:'Withdrawn'};
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
  async function loadAccount() {
    const {email, team, models, can_submit, submission_reason, quota, must_change_password} = await api.request('/api/v1/account');
    document.querySelectorAll('[data-account-email]').forEach(node => { node.textContent = email; });
    if (must_change_password && page !== 'change-password') location.replace(new URL('../change-password/', location.href));
    return {email, team, models, can_submit, submission_reason, quota};
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
    const [account, result] = await Promise.all([loadAccount(), api.request('/api/v1/submissions')]);
    $('[data-team]').textContent = account.team?.team_name || 'Registration Pending';
    $('[data-model]').textContent = account.team?.model_name || account.email;
    const note = $('[data-account-state]');
    note.textContent = account.can_submit ? 'Formal evaluations use a rolling seven-day quota: 2 per Track and 6 total.' : account.submission_reason;
    const create = $('[data-new-submission]'); create.hidden = !account.can_submit;
    create.addEventListener('click', async () => {
      create.disabled = true;
      try { const data = await api.request('/api/v1/submissions', {method:'POST', body:{}}); location.assign(`../edit/?id=${encodeURIComponent(data.submission.id)}&step=1`); }
      catch (error) { message(error.message, true); create.disabled = false; }
    });
    const list = $('[data-submission-list]');
    if (!result.submissions.length) { list.innerHTML = '<div class="empty"><span class="empty-symbol">↗</span><h2>Your First Submission Starts Here.</h2><p>Create a draft and save your progress one step at a time.</p></div>'; return; }
    list.innerHTML = result.submissions.map(item => {
      const meta = item.metadata, run = item.run;
      const editable = ['draft','needs_changes'].includes(item.status);
      const href = editable ? `../edit/?id=${item.id}&step=1` : `../view/?id=${item.id}`;
      const stage = run ? `${escape(run.stage_label)} · ${run.progress}%` : statuses[item.status] || item.status;
      return `<article class="submission-item"><div><span class="badge ${escape(item.status)}">${escape(statuses[item.status] || item.status)}</span><h2><a href="${href}">${escape(meta.model_name || 'Untitled Draft')}</a></h2><p class="muted">${escape(tracks[meta.benchmark_track] || 'Track not selected')} · ${escape(platforms[meta.embodiment] || 'Platform not selected')}</p><code>${escape(item.id.slice(0,8))}</code></div><div class="submission-actions"><a class="button" href="${href}">${editable ? 'Continue Draft' : 'View Submission'} →</a>${item.status === 'draft' ? `<button type="button" data-delete="${item.id}">Delete Draft</button>` : ''}<div class="submission-result"><span>Current Stage</span><strong>${stage}</strong></div></div></article>`;
    }).join('');
    list.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', async () => {
      if (!confirm('Delete this draft? Its audit record and uploaded materials may be retained privately.')) return;
      try { await api.request(`/api/v1/submissions/${button.dataset.delete}`, {method:'DELETE', body:{}}); button.closest('.submission-item').remove(); }
      catch (error) { message(error.message, true); }
    }));
  }

  async function editor() {
    if (!api.requireSession()) return;
    await loadAccount();
    const params = new URLSearchParams(location.search), sid = params.get('id'), step = Math.max(1, Math.min(4, Number(params.get('step') || 1)));
    if (!sid) { location.replace('../dashboard/'); return; }
    const {submission:item} = await api.request(`/api/v1/submissions/${encodeURIComponent(sid)}`);
    $('[data-submission-id]').textContent = sid.slice(0,8); $('[data-step]').textContent = step;
    document.querySelectorAll('[data-step-link]').forEach((node, index) => { const number = index + 1; node.href = `?id=${encodeURIComponent(sid)}&step=${number}`; node.closest('li').className = number === step ? 'current' : number < step ? 'done' : ''; });
    const root = $('[data-editor]'), meta = item.metadata;
    if (step === 1) {
      root.innerHTML = `<h2>Model and Track</h2><p class="muted">This account is permanently bound to one organizer-approved model.</p><form data-step-form><fieldset class="track-choice"><legend>Choose Your Benchmark Track</legend>${Object.entries(tracks).map(([key,label],index)=>`<label class="track-option"><input type="radio" name="benchmark_track" value="${key}" ${meta.benchmark_track===key?'checked':''} required><span class="track-card-copy"><span class="track-number">Track ${index+1}</span><strong>${label}</strong></span></label>`).join('')}</fieldset><div class="field-grid"><div class="locked-field"><span>Registered Model</span><output>${escape(meta.model_name || 'Organizer approval required')}</output></div><label>Platform<select name="embodiment" required data-platform>${Object.entries(platforms).map(([key,label])=>`<option value="${key}" ${meta.embodiment===key?'selected':''}>${label}</option>`).join('')}</select></label></div><label>Submission Notes <small class="muted">Optional</small><textarea name="notes" rows="4" maxlength="4000">${escape(meta.notes || '')}</textarea></label><p class="notice error" data-message hidden></p><div class="form-actions"><button class="button primary" type="submit">Save and Continue →</button></div></form>`;
      const form = $('[data-step-form]', root), platform = $('[data-platform]', root);
      const sync = () => { const policy = form.benchmark_track.value === 'policy'; [...platform.options].forEach(option => option.disabled = policy && option.value !== 'agibot_g2'); if (policy) platform.value='agibot_g2'; };
      form.addEventListener('change', sync); sync();
      form.addEventListener('submit', async event => { event.preventDefault(); busy(form,true); try { await api.request(`/api/v1/submissions/${sid}`, {method:'PATCH', body:{benchmark_track:form.benchmark_track.value, embodiment:platform.value, notes:form.notes.value}}); location.assign(`?id=${sid}&step=2`); } catch(error){message(error.message,true,root);} finally{busy(form,false);} });
    } else if (step === 2) {
      root.innerHTML = `<h2>Upload Materials</h2><p class="muted">One ZIP containing the preview-2 manifest, README and prediction videos.</p><form data-chunk-upload data-upload-base="${escape(api.base)}/api/v1/uploads/${encodeURIComponent(sid)}" data-upload-next="?id=${encodeURIComponent(sid)}&step=3"><label class="upload-zone">Choose Your Package<input type="file" name="package" accept=".zip,application/zip" required><span>ZIP · Resumable upload · No credentials</span></label><div class="upload-progress" data-upload-progress hidden><progress value="0" max="1"></progress><span data-upload-label>Ready</span><div class="actions"><button type="button" class="button" data-upload-pause hidden>Pause Upload</button><button type="button" class="button" data-upload-cancel hidden>Cancel Upload</button></div></div><p class="small muted">Files are hashed locally and uploaded in resumable 16 MiB parts. Uploading does not submit your result.</p><div class="form-actions"><a class="button" href="?id=${sid}&step=1">← Back</a><button class="button primary" type="submit">Start Upload</button></div><p class="small muted" data-submit-status role="status"></p></form>${item.has_package ? `<div class="callout">Current package: ${escape(item.package_name)}. <a href="?id=${sid}&step=3">Keep it and continue →</a></div>` : ''}`;
      const script = document.createElement('script'); script.src='../../assets/chunk-upload.js?v=20261013-upload-worker-fallback-v1'; document.body.append(script);
    } else if (step === 3) {
      if (!item.has_package) { location.replace(`?id=${sid}&step=2`); return; }
      const declarations = {authentic:'The materials accurately reflect this model and evaluation setup.', rights:'I have permission to submit these artifacts for evaluation.', secrets:'The package contains no credentials or unnecessary personal information.', review:'I understand that structural validation is not a benchmark score.'};
      root.innerHTML = `<h2>Declarations</h2><form data-step-form>${Object.entries(declarations).map(([key,text])=>`<label class="check declaration"><input type="checkbox" name="${key}" required><span>${text}</span></label>`).join('')}<p class="notice error" data-message hidden></p><div class="form-actions"><a class="button" href="?id=${sid}&step=2">← Back</a><button class="button primary" type="submit">Save and Continue →</button></div></form>`;
      const form=$('[data-step-form]',root); form.addEventListener('submit',async event=>{event.preventDefault();busy(form,true);try{await api.request(`/api/v1/submissions/${sid}/declarations`,{method:'POST',body:Object.fromEntries(Object.keys(declarations).map(key=>[key,form[key].checked]))});location.assign(`?id=${sid}&step=4`);}catch(error){message(error.message,true,root);}finally{busy(form,false);}});
    } else {
      if (!item.consent) { location.replace(`?id=${sid}&step=3`); return; }
      root.innerHTML = `<h2>Confirm and Submit</h2><dl class="summary"><dt>Model</dt><dd>${escape(meta.model_name)}</dd><dt>Track</dt><dd>${escape(tracks[meta.benchmark_track])}</dd><dt>Platform</dt><dd>${escape(platforms[meta.embodiment])}</dd><dt>Package</dt><dd>${escape(item.package_name)}</dd><dt>SHA-256</dt><dd><code>${escape(item.package_hash)}</code></dd></dl><p class="notice error" data-message hidden></p><form data-step-form><div class="form-actions"><a class="button" href="?id=${sid}&step=3">← Back</a><button class="button primary" type="submit">Submit for Evaluation</button></div></form>`;
      const form=$('[data-step-form]',root); form.addEventListener('submit',async event=>{event.preventDefault();busy(form,true,'Submitting…');try{await api.request(`/api/v1/submissions/${sid}/submit`,{method:'POST',body:{}});location.assign(`../view/?id=${sid}`);}catch(error){message(error.message,true,root);busy(form,false);}});
    }
  }

  async function view() {
    if (!api.requireSession()) return; await loadAccount();
    const sid = new URLSearchParams(location.search).get('id'); if (!sid) { location.replace('../dashboard/'); return; }
    const {submission:item}=await api.request(`/api/v1/submissions/${sid}`), meta=item.metadata, root=$('[data-detail]');
    root.innerHTML=`<div class="page-heading"><div><p class="eyebrow">Submission ${escape(sid.slice(0,8))}</p><h1>${escape(meta.model_name||'Untitled Draft')}</h1><span class="badge ${escape(item.status)}">${escape(statuses[item.status]||item.status)}</span></div><a class="text-link" href="../dashboard/">← My Submissions</a></div><div class="wizard-layout"><div class="panel"><h2>Submission Details</h2><dl class="summary"><dt>Track</dt><dd>${escape(tracks[meta.benchmark_track]||'Not set')}</dd><dt>Platform</dt><dd>${escape(platforms[meta.embodiment]||'Not set')}</dd><dt>Package</dt><dd>${escape(item.package_name||'Not uploaded')}</dd>${item.package_hash?`<dt>SHA-256</dt><dd><code>${escape(item.package_hash)}</code></dd>`:''}</dl><h3>Submission Notes</h3><p class="user-text">${escape(meta.notes||'No notes provided.')}</p><div class="actions">${['draft','needs_changes'].includes(item.status)?`<a class="button primary" href="../edit/?id=${sid}&step=1">Edit Submission →</a>`:''}${item.has_package?'<button class="button" type="button" data-download>Download Package</button>':''}</div>${!['draft','accepted','rejected','withdrawn'].includes(item.status)?'<button class="text-button danger" type="button" data-withdraw>Withdraw Submission</button>':''}<p class="notice error" data-message hidden></p></div><aside class="panel"><h2>Submission History</h2><ol class="timeline">${item.events.map(event=>`<li><span class="badge ${escape(event.status)}">${escape(statuses[event.status]||event.status)}</span><p>${escape(event.note)}</p></li>`).join('')}</ol></aside></div>`;
    $('[data-download]',root)?.addEventListener('click',async()=>{try{const response=await api.request(`/api/v1/submissions/${sid}/download`,{raw:true});const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`worldoracle-${sid.slice(0,8)}.zip`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){message(error.message,true,root);}});
    $('[data-withdraw]',root)?.addEventListener('click',async()=>{if(!confirm('Withdraw this submission?'))return;try{await api.request(`/api/v1/submissions/${sid}/withdraw`,{method:'POST',body:{}});location.reload();}catch(error){message(error.message,true,root);}});
  }

  async function profile() {
    if (!api.requireSession()) return; const account=await loadAccount();
    $('[data-profile]').innerHTML=`<div class="page-heading"><div><p class="eyebrow">Submission Account</p><h1>${escape(account.team?.team_name||'Registration Pending')}</h1><p class="muted">${escape(account.email)}</p></div><a class="button" href="../change-password/">Change Password</a></div><section class="panel team-summary"><h2>Registered Model</h2><dl class="summary"><dt>Model</dt><dd>${escape(account.team?.model_name||'Pending')}</dd><dt>Organization</dt><dd>${escape(account.team?.team_name||'Pending')}</dd><dt>Status</dt><dd>${escape(account.team?.team_status||'pending')}</dd></dl></section>`;
  }

  async function changePassword() {
    if (!api.requireSession()) return; await loadAccount(); const form=$('[data-password-form]');
    form.addEventListener('submit',async event=>{event.preventDefault();busy(form,true);try{const result=await api.request('/api/v1/auth/change-password',{method:'POST',body:{current_password:form.current_password.value,password:form.password.value,confirm:form.confirm.value}});api.logout();alert(result.message);}catch(error){message(error.message,true);busy(form,false);}});
  }

  const handlers={login,dashboard,editor,view,profile,'change-password':changePassword};
  Promise.resolve(handlers[page]?.()).catch(error=>message(error.message,true));
})();
