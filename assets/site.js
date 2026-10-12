const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const header = document.querySelector('[data-header]');
const sectionLinks = [...document.querySelectorAll('[data-section-link]')];
const trackedSections = [...new Set(sectionLinks.map((link) => link.hash.slice(1)))]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const navigationReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initializeScrollReveal() {
  const selectors = [
    'main > section:not(.hero)',
    '.hero-layout > *',
    '.section-heading',
    '.metric-grid > *',
    '.task-grid > *',
    '.outcome-pair > *',
    '.embodiment-grid > *',
    '.coverage-grid > *',
    '.leaderboard-masthead > *',
    '.leaderboard-rail-inner > *',
    '.full-board-layout > *',
    '.leaderboard-metric-grid > *',
    '.leaderboard-score-formulas > *'
  ];
  const targets = [...new Set(document.querySelectorAll(selectors.join(',')))];
  if (!targets.length) return;
  targets.forEach((element, index) => {
    element.dataset.scrollReveal = '';
    element.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
  });
  if (navigationReducedMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -9% 0px' });
  targets.forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9) element.classList.add('is-revealed');
    else observer.observe(element);
  });
  document.documentElement.classList.add('scroll-reveal-ready');
}

initializeScrollReveal();

const resourceButtons = [...document.querySelectorAll('[data-resource-button]')];
const resourceFeedback = document.querySelector('[data-resource-feedback]');
let resourceFeedbackTimer;

resourceButtons.forEach((button) => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const label = button.dataset.resourceLabel || button.textContent.trim();
    resourceButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    if (resourceFeedback) {
      resourceFeedback.textContent = `${label} is coming soon.`;
      resourceFeedback.classList.add('is-visible');
    }
    window.clearTimeout(resourceFeedbackTimer);
    resourceFeedbackTimer = window.setTimeout(() => {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
      resourceFeedback?.classList.remove('is-visible');
    }, 2600);
  });
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || destination.href === window.location.href || navigationReducedMotion.matches) return;
  if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
  // Modern browsers perform the cross-document View Transition declared in CSS.
  // Let the native navigation start immediately so the fixed header never pauses.
  if ('startViewTransition' in document) return;
  event.preventDefault();
  document.documentElement.classList.add('is-navigating');
  window.setTimeout(() => { window.location.href = destination.href; }, 100);
});

window.addEventListener('pageshow', () => document.documentElement.classList.remove('is-navigating'));

function setActiveSection(id) {
  sectionLinks.forEach((link) => {
    const active = link.hash === `#${id}`;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

let navigationTicking = false;

function syncNavigation() {
  const probe = window.scrollY + (header?.offsetHeight || 0) + Math.min(window.innerHeight * 0.22, 180);
  let current = trackedSections[0]?.id;

  trackedSections.forEach((section) => {
    if (section.offsetTop <= probe) current = section.id;
  });

  if (current) setActiveSection(current);
  header?.classList.toggle('is-scrolled', window.scrollY > 8);
  navigationTicking = false;
}

function requestNavigationSync() {
  if (navigationTicking) return;
  navigationTicking = true;
  window.requestAnimationFrame(syncNavigation);
}

window.addEventListener('scroll', requestNavigationSync, { passive: true });
window.addEventListener('resize', requestNavigationSync);
window.addEventListener('hashchange', requestNavigationSync);
syncNavigation();

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('is-open', !open);
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('is-open');
}));

// Real GT action excerpts; source intervals are documented in OUTCOME_CLIPS.md.
const outcomeTasks = {
  "pickfruit": {
    "title": "Pick Fruit",
    "success": {
      "title": "Fruit in the Basket",
      "description": "The mango is placed in the basket and remains inside."
    },
    "failure": {
      "title": "Missed Grasp",
      "description": "The gripper withdraws while the mango remains in the basket."
    }
  },
  "hangtowel": {
    "title": "Hang Towel",
    "success": {
      "title": "Towel on the Rail",
      "description": "The towel stays draped over the rail after release."
    },
    "failure": {
      "title": "Dropped Towel",
      "description": "The towel falls instead of remaining on the rail."
    }
  },
  "pourwater": {
    "title": "Pour Water",
    "success": {
      "title": "Water into the Cup",
      "description": "Water transfers into the receiving cup without a visible spill."
    },
    "failure": {
      "title": "Spilled Water",
      "description": "Water spills across the table during the pouring attempt."
    }
  },
  "pulldrawer": {
    "title": "Pull Drawer",
    "success": {
      "title": "Drawer Pulled Open",
      "description": "The gripper catches the handle and pulls the drawer open."
    },
    "failure": {
      "title": "Missed Handle",
      "description": "The gripper retracts and the drawer stays closed."
    }
  }
};
const outcomeButtons = [...document.querySelectorAll('[data-outcome-task]')];
const outcomeCards = [...document.querySelectorAll('[data-outcome-card]')];
const outcomeStatus = document.querySelector('[data-outcome-status]');
const outcomeReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentOutcomeTask = 'pickfruit';

function showOutcomeTask(task) {
  const next = outcomeTasks[task];
  if (!next || currentOutcomeTask === task) return;
  currentOutcomeTask = task;
  outcomeButtons.forEach((button) => {
    const selected = button.dataset.outcomeTask === task;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  outcomeCards.forEach((card) => {
    const kind = card.dataset.outcomeCard;
    const clip = next[kind];
    const player = card.querySelector('[data-outcome-video]');
    player.pause();
    player.poster = 'assets/outcomes/' + task + '-' + kind + '.jpg';
    player.src = 'assets/outcomes/' + task + '-' + kind + '.mp4';
    const playerLabel = next.title + ' — ' + (kind === 'success' ? 'Success' : 'Failure') + ' GT Action Excerpt';
    if (window.WorldOracleI18n) window.WorldOracleI18n.setLocalizedAttribute(player, 'aria-label', playerLabel);
    else player.setAttribute('aria-label', playerLabel);
    card.querySelector('[data-outcome-title]').textContent = clip.title;
    card.querySelector('[data-outcome-description]').textContent = clip.description;
    player.load();
    if (!outcomeReducedMotion.matches && !document.hidden) player.play().catch(() => {});
  });
  if (outcomeStatus) outcomeStatus.textContent = 'Showing ' + next.title + ' success and failure excerpts.';
}

outcomeButtons.forEach((button) => {
  button.addEventListener('click', () => showOutcomeTask(button.dataset.outcomeTask));
});
outcomeCards.forEach((card) => {
  const player = card.querySelector('[data-outcome-video]');
  player.autoplay = !outcomeReducedMotion.matches;
  if (outcomeReducedMotion.matches) player.pause();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) outcomeCards.forEach((card) => card.querySelector('[data-outcome-video]').pause());
});

function updateModelPreview(scope, model) {
  const panel=scope.querySelector('[data-model-preview]');
  if(!panel)return;
  const player=panel.querySelector('[data-preview-video]');
  const title=panel.querySelector('[data-preview-title]');
  const meta=panel.querySelector('[data-preview-meta]');
  const empty=panel.querySelector('[data-preview-empty]');
  player.pause();
  if(!model){
    panel.classList.remove('is-placeholder');
    player.hidden=true;player.removeAttribute('src');player.load();
    title.textContent='Select a model to compare';
    const defaultEpisode=scope.dataset.trackPanel==='policy'?'ep000008':'ep000000';
    meta.textContent='hangtowel · '+defaultEpisode+' · top_head';
    empty.hidden=false;empty.textContent='Click any model row to show the same benchmark episode beside its scores.';
    return;
  }
  title.textContent=model.model_name;
  if(!model.preview){
    panel.classList.remove('is-placeholder');
    player.hidden=true;player.removeAttribute('src');player.load();
    meta.textContent='Comparison episode unavailable';
    empty.hidden=false;empty.textContent=model.demo?'This illustrative result does not have a submitted episode.':'No public comparison video is available for this legacy result.';
    return;
  }
  panel.classList.toggle('is-placeholder',Boolean(model.preview.placeholder));
  meta.textContent=(model.preview.placeholder?'Letter demo '+model.preview.letter+' · ':'')+
    model.preview.task+' · '+model.preview.episode_id+' · '+model.preview.view+
    (model.preview.placeholder?' · placeholder only':'');
  empty.hidden=true;player.hidden=false;
  if(player.getAttribute('src')!==model.preview.url){player.src=model.preview.url;player.load();}
  player.play().catch(()=>{});
}

const CURATED_PUBLIC_MODELS=new Set(['cosmos 3','cosmos-3 nano','ctrl-world','dreamdojo','ge-sim 2.0','irasim','jointcontrolvideo','oscar']);
const CURRENT_LEADERBOARD_MODELS=new Set(['cosmos 3','cosmos-3 nano','ctrl-world','dreamdojo','ge-sim 2.0','irasim']);
function normalizeCuratedModelStatus(model){
  const name=String(model.model_name||'').toLowerCase();
  if(CURATED_PUBLIC_MODELS.has(name)){model.certified=true;model.model_public=true;}
  if(CURRENT_LEADERBOARD_MODELS.has(name))model.updated_at='2026-10-16';
  return model;
}

function publicResourceUrl(value){
  if(typeof value!=='string'||!value.trim())return null;
  try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch(_){return null;}
}

function appendLeaderboardResources(row,model){
  const cell=document.createElement('td');cell.className='board-resources';
  const resources=[['Code',model.github_url],['Weights',model.huggingface_url],['Paper',model.paper_url]]
    .map(([label,value])=>[label,publicResourceUrl(value)]).filter(([,url])=>url);
  if(resources.length){
    const list=document.createElement('span');list.className='board-resource-list';
    resources.forEach(([label,url])=>{const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=label;link.setAttribute('aria-label',label+' resource for '+model.model_name+' (opens in a new tab)');list.append(link);});
    cell.append(list);
  }else if(model.model_public){
    const status=document.createElement('span');status.className='board-resource-status';status.textContent='Public';status.title='Verified public resources are available; individual links are not included in this record.';cell.append(status);
  }else cell.textContent='—';
  row.append(cell);
}

function leaderboardUpdatedLabel(model){
  const raw=model.evaluated_at??model.updated_at??model.updated;
  if(raw===null||raw===undefined||raw==='')return '—';
  if(typeof raw==='string'&&/^\d{4}-\d{2}-\d{2}/.test(raw))return raw.slice(0,10)+' AoE';
  const numeric=Number(raw),date=Number.isFinite(numeric)?new Date(numeric<(1e12)?numeric*1000:numeric):new Date(raw);
  return Number.isNaN(date.getTime())?'—':date.toISOString().slice(0,10)+' AoE';
}

function appendLeaderboardCertification(row,model){
  const cell=document.createElement('td');cell.className='board-certification';
  const status=document.createElement('span');status.className=model.certified?'is-certified':'is-not-certified';
  status.textContent=model.certified?'Certified':'Non-certified';cell.append(status);row.append(cell);
}

function appendRankTrophy(cell,rank){
  if(!rank||rank>3)return;
  const trophy=document.createElement('span');trophy.className='metric-trophy rank-trophy rank-trophy-'+rank;trophy.setAttribute('aria-hidden','true');cell.append(trophy);
}

function initializeFilterButtons(root) {
  root.querySelectorAll('[data-filter-buttons]').forEach(group=>{
    const select=group.parentElement.querySelector('select');
    if(!select)return;
    const sync=()=>group.querySelectorAll('[data-filter-value]').forEach(button=>{
      const active=button.dataset.filterValue===select.value;
      button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
    });
    group.querySelectorAll('[data-filter-value]').forEach(button=>button.addEventListener('click',()=>{
      select.value=button.dataset.filterValue;sync();select.dispatchEvent(new Event('change',{bubbles:true}));
    }));
    sync();
  });
}

// Public leaderboard: isolated duration/platform selections, no private account fields.
function initializeBoard(board, entries) {
  entries.forEach(normalizeCuratedModelStatus);
  const layoutDemos=JSON.parse(document.getElementById('leaderboard-layout-demos')?.textContent || '[]');
  layoutDemos.forEach(row=>{if(!entries.some(e=>String(e.id)===row.id))entries.push(row);});
  const platforms = { agibot_g2: 'AgiBot G2', yam: 'YAM', human_hands: 'Human Hand' };
  const regimes = { '30s': '30s', full: 'Long Horizon' };
  const fullLayout=Boolean(board.querySelector('[data-sort-metric]'));
  const hasContributor=Boolean(board.querySelector('.col-contributor'));
  const hasView=Boolean(board.querySelector('.col-view'));
  const hasCertification=Boolean(board.querySelector('.col-certification'));
  const hasResources=Boolean(board.querySelector('.col-resources'));
  const hasUpdated=Boolean(board.querySelector('.col-updated'));
  const axes = fullLayout
    ? [['Interaction Spatial','Alignment'],['Multi-View Action','Coherence'],['Multi-View','Score'],['Single-View','Score'],['Physical State','Correctness'],['Key Interaction','Area Fidelity']]
    : [['Physical State','Correctness'],['Key Interaction','Area Fidelity'],['Interaction Spatial','Alignment'],['Multi-View Action','Coherence']];
  const svg = board.querySelector('[data-radar-chart]');
  const body = board.querySelector('[data-board-rows]');
  const regime = board.dataset.boardDuration || '30s';
  let platform = 'agibot_g2', focused = null, current = [], certification = 'all', publicStatus = 'all', sortMetric = 'single';
  const shape = (tag, attrs = {}, text = '') => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([key,value]) => node.setAttribute(key,String(value)));
    if (text) node.textContent = text;
    return node;
  };
  const cell = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
  const point = (axis, value) => {
    const angle = (fullLayout?0:-Math.PI/2) + axis*Math.PI*2/axes.length;
    const radius=fullLayout?184:154;
    return [300+Math.cos(angle)*radius*value/100, 237+Math.sin(angle)*radius*value/100];
  };
  function focus(id) {
    focused = id;
    board.querySelectorAll('[data-radar-series]').forEach(group => {
      group.classList.toggle('is-selected',group.dataset.radarSeries===id);
      group.classList.toggle('is-muted',id!==null && group.dataset.radarSeries!==id);
    });
    body.querySelectorAll('tr').forEach(row => {
      const selected = row.dataset.modelRow===id;
      row.classList.toggle('is-selected',selected);
      row.classList.toggle('is-muted',id!==null && !selected);
      row.querySelector('button').setAttribute('aria-pressed',String(selected));
    });
    const active = [...svg.querySelectorAll('[data-radar-series]')].find(g=>g.dataset.radarSeries===id);
    if (active) svg.append(active);
    const name = current.find(m=>String(m.id)===id)?.model_name;
    updateModelPreview(board,current.find(m=>String(m.id)===id)||null);
    board.querySelector('[data-board-status]').textContent = platforms[platform]+' · '+regimes[regime]+' · '+(name?'Highlighting '+name:'All models shown equally.');
  }
  function chart() {
    svg.replaceChildren();
    // Leave enough horizontal breathing room for the full axis labels at the
    // larger homepage type size. The previous crop clipped the leading "M"
    // from Multi-View Action Coherence in both leaderboard presentations.
    svg.setAttribute('viewBox',axes.length===4?'-105 -20 810 540':'10 -15 580 515');
    svg.append(shape('title',{id:regime==='full'?'long-radar-title':'radar-title'},platforms[platform]+' · '+regimes[regime]+' Metric Comparison'));
    const chartNote=current.some(model=>model.demo)
      ? 'Illustrative entries are explicitly labeled as Demo.'
      : 'Scores shown here are verified held-out test-set retest results.';
    svg.append(shape('desc',{id:regime==='full'?'long-radar-description':'radar-description'},axes.length+' metrics on a 0–100 scale. Unavailable MVAC is plotted at zero only for display. '+chartNote));
    [100,80,60,40,20].forEach(level=>svg.append(shape('polygon',{points:axes.map((_,i)=>point(i,level).join(',')).join(' '),class:level===100?'radar-grid is-outer':'radar-grid'})));
    axes.forEach((lines,i)=>{
      const [x,y]=point(i,100);
      svg.append(shape('line',{x1:300,y1:237,x2:x,y2:y,class:'radar-axis'}));
      const [lx,ly]=point(i,axes.length===4?118:118);
      const label=shape('text',{x:lx,y:ly-6,'text-anchor':Math.abs(lx-300)<1?'middle':lx>300?'start':'end',class:'radar-axis-label'});
      lines.forEach((line,j)=>label.append(shape('tspan',{x:lx,dy:j?23:0},line))); svg.append(label);
    });
    [0,20,40,60,80,100].forEach(level=>svg.append(shape('text',fullLayout
      ? {x:300+170*level/100,y:228,'text-anchor':'middle',class:'radar-level'}
      : {x:307,y:241-142*level/100,class:'radar-level'},String(level))));
    current.forEach(model=>{
      const group=shape('g',{class:'radar-series-group','data-radar-series':String(model.id)});
      const rawValues=radarValues(model);
      const values=rawValues.map(v=>v===null?0:v);
      group.append(shape('polygon',{points:values.map((v,i)=>point(i,v).join(',')).join(' '),fill:model.color,stroke:model.color,class:'radar-series'}));
      values.forEach((v,i)=>{
        const [x,y]=point(i,v);
        const dot=shape('circle',{cx:x,cy:y,r:3.5,fill:model.color,class:'radar-point'});
        dot.append(shape('title',{},model.model_name+' · '+axes[i].join(' ')+': '+(rawValues[i]===null?'Unavailable (displayed at zero)':v.toFixed(2)+(model.demo?' (Demo)':''))));group.append(dot);
        const anchor=Math.abs(x-300)<8?'middle':x>300?'start':'end';
        group.append(shape('text',{x:x+(anchor==='start'?11:anchor==='end'?-11:0),y:y+(y<237?-10:y>237?15:4),'text-anchor':anchor,class:'radar-value','aria-hidden':'true'},rawValues[i]===null?'':v.toFixed(2)));
      });svg.append(group);
    });
  }
  const summaryScores = model => {
    const single = model.single_score ?? model.score;
    const mvc = model.values[3];
    const base = regime==='policy' ? model.values.slice(1,3) : model.values.slice(0,3);
    const multi = model.multiview_score ?? (mvc===null ? null : (base.reduce((sum,value)=>sum+value,0)+mvc)/(base.length+1));
    return [single,multi];
  };
  const tableValues = model => [...summaryScores(model),...model.values.slice(0,4)];
  const radarValues = model => {
    if(!fullLayout)return model.values.slice(0,4);
    const [single,multi]=summaryScores(model);
    return [model.values[2],model.values[3],multi,single,model.values[0],model.values[1]];
  };
  const sortColumns={single:{index:0,label:'Single-View Score'},multi:{index:1,label:'Multi-View Score'},psc:{index:2,label:'PSC'},kiaf:{index:3,label:'KIAF'},isa:{index:4,label:'ISA'},mvac:{index:5,label:'MVAC'}};
  const contributor=model=>CURATED_PUBLIC_MODELS.has(String(model.model_name||'').toLowerCase())?'WorldOracle Team':(model.contributor||model.organization||model.team_name||'—');
  function render() {
    const sortColumn=sortColumns[sortMetric]||sortColumns.single;
    current=entries.filter(m=>m.platform===platform && m.regime===regime)
      .filter(m=>certification==='all' || (certification==='certified')===Boolean(m.certified))
      .filter(m=>publicStatus==='all' || (publicStatus==='public')===Boolean(m.model_public))
      .sort((a,b)=>{
        const av=tableValues(a)[sortColumn.index],bv=tableValues(b)[sortColumn.index];
        if(av===null&&bv!==null)return 1;if(bv===null&&av!==null)return -1;
        return (bv??-Infinity)-(av??-Infinity)||summaryScores(b)[0]-summaryScores(a)[0]||a.model_name.localeCompare(b.model_name);
      });
    body.replaceChildren();
    const scrollWindow=board.querySelector('.board-table-scroll');
    if (scrollWindow) { scrollWindow.scrollTop=0; scrollWindow.scrollLeft=0; }
    const sortNumbers=current.map(model=>tableValues(model)[sortColumn.index]).filter(value=>value!==null).map(value=>Number(value.toFixed(2)));
    current.forEach((model,i)=>{
      const row=document.createElement('tr');row.dataset.modelRow=String(model.id);row.style.setProperty('--series-color',model.color);
      const sortValue=tableValues(model)[sortColumn.index];
      const displayRank=sortValue===null?null:1+sortNumbers.filter(value=>value>Number(sortValue.toFixed(2))).length;
      if(displayRank)row.classList.toggle('rank-'+displayRank,true);
      const rank=cell('td','');const badge=cell('span',displayRank===null?'—':String(displayRank).padStart(2,'0'));badge.setAttribute('class','board-rank');rank.append(badge);if(fullLayout)appendRankTrophy(rank,displayRank);row.append(rank);
      const th=document.createElement('th');th.scope='row';
      const button=document.createElement('button');button.type='button';button.dataset.radarModel=String(model.id);
      button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Highlight '+model.model_name+'. Click again to show all models.');
      const dot=document.createElement('i');dot.style.background=model.color;
      const label=cell('span',model.model_name);
      button.append(dot,label);th.append(button);row.append(th);
      if(hasView){const viewCell=cell('td',model.view_mode==='multi'?'MV':'SV');viewCell.classList.add('board-view');viewCell.title=model.view_mode==='multi'?'Multi-View':'Single-View';row.append(viewCell);}
      if(hasContributor){const contributorCell=cell('td',contributor(model));contributorCell.classList.add('board-contributor');row.append(contributorCell);}
      tableValues(model).forEach(v=>{
        const td=cell('td',v===null?'-':v.toFixed(2));
        if(v===null){td.classList.add('metric-unavailable');td.setAttribute('aria-label','Not evaluated');}
        row.append(td);
      });
      if(hasCertification)appendLeaderboardCertification(row,model);
      if(hasResources)appendLeaderboardResources(row,model);
      if(hasUpdated){const updated=cell('td',leaderboardUpdatedLabel(model));updated.classList.add('board-updated');row.append(updated);}
      button.addEventListener('click',()=>focus(focused===String(model.id)?null:String(model.id)));body.append(row);
    });
    // Competition ranks at displayed precision: ties share rank, nulls never rank.
    const columnLabels=['Single-View Score','Multi-View Score','Physical State Correctness','Key Interaction Area Fidelity','Interaction Spatial Alignment','Multi-View Action Coherence'];
    for (let axis=0;axis<columnLabels.length;axis++) {
      const numeric=current.map(m=>tableValues(m)[axis]).filter(v=>v!==null).map(v=>Number(v.toFixed(2)));
      current.forEach((model,i)=>{
        const value=tableValues(model)[axis];
        if(value===null)return;
        const rank=1+numeric.filter(v=>v>Number(value.toFixed(2))).length;
        if(rank>3)return;
        const metricStart=2+(hasView?1:0)+(hasContributor?1:0);
        const td=body.children[i].children[axis+metricStart];
        td.classList.toggle('metric-place-'+rank,true);
        td.setAttribute('data-metric-place',String(rank));
        td.setAttribute('title',['','Gold · 1st','Silver · 2nd','Bronze · 3rd'][rank]+' — '+columnLabels[axis]);
        const trophy=cell('span','');trophy.setAttribute('class','metric-trophy');trophy.setAttribute('aria-hidden','true');td.append(trophy);
      });
    }
    board.querySelector('[data-board-context]').textContent=platforms[platform]+' · '+regimes[regime]+' · '+current.length+' Models · Sorted by '+sortColumn.label;
    board.querySelector('[data-board-empty]').hidden=current.length!==0;
    const demoBadge=board.querySelector('[data-board-demo]');
    if(demoBadge)demoBadge.hidden=platform==='human_hands' || !current.some(m=>m.demo);
    board.querySelector('.board-radar').classList.toggle('is-empty',!current.length);
    board.querySelector('[data-board-disclaimer]').textContent = current.some(m=>m.demo)
      ? 'Demo scores are illustrative, not benchmark measurements. Platform availability follows existing result artifacts; view labels describe evaluated outputs, not every capability of a model.'
      : current.length ? 'Verified held-out test-set retest results. Unavailable metrics are shown as dashes in the table and plotted at zero on the radar only.'
      : 'No verified model-result artifacts have been confirmed for this selection. Models are not included solely because the paper lists a planned experiment.';
    board.querySelectorAll('[data-board-platform]').forEach(b=>{const on=b.dataset.boardPlatform===platform;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
    chart();focus(null);
  }
  board.querySelectorAll('[data-board-platform]').forEach(b=>b.addEventListener('click',()=>{platform=b.dataset.boardPlatform;render();}));
  board.querySelector('[data-certification-filter]')?.addEventListener('change',event=>{certification=event.target.value;render();});
  board.querySelector('[data-public-filter]')?.addEventListener('change',event=>{publicStatus=event.target.value;render();});
  board.querySelector('[data-sort-metric]')?.addEventListener('change',event=>{sortMetric=event.target.value;render();});
  initializeFilterButtons(board);
  render();
}

// Policy Track results use the same PSC / KIAF / ISA / MVAC score axes as the other Tracks.
function initializePolicy(models){
 const policyContainer=document.querySelector('[data-policy-charts]');
 if(!policyContainer)return;
 models.forEach(normalizeCuratedModelStatus);
 models.forEach(m=>{
  m.single_score ??= (m.po+m.kro+m.ia)/3;
  m.multiview_score ??= m.mvc===null?null:(m.po+m.kro+m.ia+m.mvc)/4;
 });
 const rows=document.querySelector('[data-policy-rows]');rows.replaceChildren();
 const node=(tag,attrs={},text='')=>{
  const n=document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));if(text)n.textContent=text;return n;
 };
 const svg=node('svg',{viewBox:'-80 -30 760 540',role:'img','aria-labelledby':'policy-chart-title policy-chart-desc'});
 svg.append(node('title',{id:'policy-chart-title'},'Policy-Rollout Results Radar'));
 svg.append(node('desc',{id:'policy-chart-desc'},'Six leaderboard metrics on a 0–100 scale. Unsupported metrics are shown as dashes in the table and as zero on the radar only.'));
 const policyAxes=[
  {key:'ia',lines:['Interaction Spatial','Alignment'],name:'Interaction Spatial Alignment'},
  {key:'mvc',lines:['Multi-View Action','Coherence'],name:'Multi-View Action Coherence'},
  {key:'multiview_score',lines:['Multi-View','Score'],name:'Multi-View Score'},
  {key:'single_score',lines:['Single-View','Score'],name:'Single-View Score'},
  {key:'po',lines:['Physical State','Correctness'],name:'Physical State Correctness'},
  {key:'kro',lines:['Key Interaction','Area Fidelity'],name:'Key Interaction Area Fidelity'},
 ];
 const keys=policyAxes.map(axis=>axis.key);
 const point=(axis,value)=>{const angle=axis*2*Math.PI/keys.length;return [300+Math.cos(angle)*154*value/100,237+Math.sin(angle)*154*value/100];};
 [100,80,60,40,20].forEach(level=>svg.append(node('polygon',{points:keys.map((_,i)=>point(i,level).join(',')).join(' '),class:'policy-radar-grid'})));
 policyAxes.forEach((axis,i)=>{
  const [x,y]=point(i,100),[lx,ly]=point(i,125);
  svg.append(node('line',{x1:300,y1:237,x2:x,y2:y,class:'policy-grid'}));
  const label=node('text',{x:lx,y:ly-7,'text-anchor':Math.abs(lx-300)<8?'middle':lx>300?'start':'end',class:'policy-axis'});
  axis.lines.forEach((line,j)=>label.append(node('tspan',{x:lx,dy:j?21:0},line)));
  svg.append(label);
 });
 [0,20,40,60,80,100].forEach(v=>svg.append(node('text',{x:300+142*v/100,y:228,'text-anchor':'middle',class:'policy-tick'},String(v))));
 const groups=models.map((m,i)=>{
  const group=node('g',{'data-policy-series':String(i)});
  group.append(node('polygon',{points:keys.map((k,axis)=>point(axis,m[k]===null?0:m[k]).join(',')).join(' '),fill:m.color,stroke:m.color,class:'policy-radar-series'}));
  keys.forEach((key,axis)=>{
   const [cx,cy]=point(axis,m[key]===null?0:m[key]),dot=node('circle',{cx,cy,r:3.5,fill:m.color});
   dot.append(node('title',{},m.model_name+' · '+policyAxes[axis].name+': '+(m[key]===null?'Not applicable (displayed at zero)':m[key].toFixed(2)+(m.demo?' (Demo)':''))));
   group.append(dot);
  });
  return group;
 });
 groups.forEach(g=>svg.append(g));policyContainer.replaceChildren(svg);
 let selected=null,certification='all',publicStatus='all',sortMetric='single_score';
 const contributor=model=>CURATED_PUBLIC_MODELS.has(String(model.model_name||'').toLowerCase())?'WorldOracle Team':(model.contributor||model.organization||model.team_name||'—');
 function focus(index){
  selected=selected===index?null:index;
  groups.forEach((g,i)=>g.setAttribute('opacity',selected===null||selected===i?'1':'.45'));
  [...rows.children].forEach(r=>{
   const rowIndex=Number(r.dataset.policyIndex);
   r.classList.toggle('is-muted',selected!==null&&selected!==rowIndex);
   r.classList.toggle('is-selected',selected===rowIndex);
   r.querySelector('button').setAttribute('aria-pressed',String(selected===rowIndex));
  });
  updateModelPreview(document.getElementById('policy-track'),selected===null?null:models[selected]);
 }
 const certificationFilter=document.querySelector('[data-policy-certification-filter]');
 const publicFilter=document.querySelector('[data-policy-public-filter]');
 const sortFilter=document.querySelector('[data-policy-sort-metric]');
 function renderPolicyRows(){
  const visible=models.filter(model=>(certification==='all'||(certification==='certified')===Boolean(model.certified))&&
    (publicStatus==='all'||(publicStatus==='public')===Boolean(model.model_public)))
   .sort((a,b)=>{const av=a[sortMetric],bv=b[sortMetric];if(av===null&&bv!==null)return 1;if(bv===null&&av!==null)return -1;return(bv??-Infinity)-(av??-Infinity)||b.single_score-a.single_score||a.model_name.localeCompare(b.model_name);});
  rows.replaceChildren();
  const rankValues=visible.map(model=>model[sortMetric]).filter(value=>value!==null).map(value=>Number(value.toFixed(2)));
  visible.forEach(m=>{
   const modelIndex=models.indexOf(m),row=document.createElement('tr');row.dataset.policyIndex=String(modelIndex);
   const value=m[sortMetric],rank=value===null?null:1+rankValues.filter(other=>other>Number(value.toFixed(2))).length;
   const rankCell=document.createElement('td'),badge=document.createElement('span');badge.className='board-rank';badge.textContent=rank===null?'—':String(rank).padStart(2,'0');rankCell.append(badge);appendRankTrophy(rankCell,rank);row.append(rankCell);
   if(rank)row.classList.add('rank-'+rank);
   const th=document.createElement('th');th.scope='row';
   const button=document.createElement('button');button.type='button';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Highlight '+m.model_name+' radar profile');
   const swatch=document.createElement('i');swatch.style.background=m.color;
   const label=document.createElement('span');label.textContent=m.model_name;
   button.append(swatch,label);button.addEventListener('click',()=>focus(modelIndex));th.append(button);row.append(th);
   const viewCell=document.createElement('td');viewCell.className='board-view';viewCell.textContent=m.view_mode==='multi'||m.multi_view?'MV':'SV';viewCell.title=viewCell.textContent==='MV'?'Multi-View':'Single-View';row.append(viewCell);
   const contributorCell=document.createElement('td');contributorCell.className='board-contributor';contributorCell.textContent=contributor(m);row.append(contributorCell);
   ['single_score','multiview_score','po','kro','ia','mvc'].forEach(k=>{
    const td=document.createElement('td');td.textContent=m[k]===null?'-':m[k].toFixed(2);
    if(m[k]===null){td.classList.add('metric-unavailable');td.setAttribute('aria-label','Not evaluated');}
    if(m[k]!==null){
     const place=1+visible.filter(other=>other[k]!==null&&Number(other[k].toFixed(2))>Number(m[k].toFixed(2))).length;
     if(place<=3){td.classList.add('metric-place-'+place);td.dataset.metricPlace=String(place);td.title=['','Gold · 1st','Silver · 2nd','Bronze · 3rd'][place]+' — '+k.toUpperCase()+(m.demo?' (Demo)':'');const trophy=document.createElement('span');trophy.className='metric-trophy';trophy.setAttribute('aria-hidden','true');td.append(trophy);}
    }
    row.append(td);
   });
   appendLeaderboardCertification(row,m);
   appendLeaderboardResources(row,m);
   const updatedCell=document.createElement('td');updatedCell.className='board-updated';updatedCell.textContent=leaderboardUpdatedLabel(m);row.append(updatedCell);
   rows.append(row);
  });
  models.forEach((model,index)=>{groups[index].style.display=visible.includes(model)?'':'none';});
  selected=null;groups.forEach(group=>group.setAttribute('opacity','1'));updateModelPreview(document.getElementById('policy-track'),null);
 }
 certificationFilter?.addEventListener('change',event=>{certification=event.target.value;renderPolicyRows();});
 publicFilter?.addEventListener('change',event=>{publicStatus=event.target.value;renderPolicyRows();});
 sortFilter?.addEventListener('change',event=>{sortMetric=event.target.value;renderPolicyRows();});
 initializeFilterButtons(document.getElementById('policy-track'));
 renderPolicyRows();
}

const publicApiBase=(document.querySelector('meta[name="worldoracle-api-base"]')?.content||'').replace(/\/$/,'');
if(publicApiBase){
 document.querySelectorAll('[data-service-path]').forEach(link=>{
  try{link.href=new URL(link.dataset.servicePath,publicApiBase+'/').href;}catch(_){}
 });
}

function validMetric(value){
 return value===null||(typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100);
}

function normalizePublicEntry(entry){
 if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||typeof entry.model_name!=='string'||
    !['agibot_g2','yam','human_hands'].includes(entry.platform)||
    !['30s','policy','full'].includes(entry.regime)||!['single','multi'].includes(entry.view_mode)||
    !Array.isArray(entry.values)||entry.values.length!==5||!entry.values.every(validMetric)||
    !validMetric(entry.score)||!validMetric(entry.single_score)||!validMetric(entry.multiview_score))return null;
 const normalized={...entry};
 normalized.model_name=entry.model_name.slice(0,160);
 normalized.color=/^#[0-9a-f]{6}$/i.test(entry.color||'')?entry.color:'#53756c';
 normalized.certified=Boolean(entry.certified);normalized.model_public=Boolean(entry.model_public);
 normalized.demo=Boolean(entry.demo);normalized.policy_participated=Boolean(entry.policy_participated);
 if(entry.preview&&typeof entry.preview==='object'&&typeof entry.preview.url==='string'){
  try{normalized.preview={...entry.preview,url:new URL(entry.preview.url,publicApiBase+'/').href};}
  catch(_){normalized.preview=null;}
 }
 return normalized;
}

async function loadPublicLeaderboard(){
 const fallback=JSON.parse(document.getElementById('leaderboard-data')?.textContent||'[]');
 if(!publicApiBase)return{entries:fallback,source:'embedded'};
 const controller=new AbortController();
 const timeout=window.setTimeout(()=>controller.abort(),6000);
 try{
  const response=await fetch(publicApiBase+'/api/v1/leaderboard',{method:'GET',mode:'cors',credentials:'omit',cache:'no-cache',headers:{Accept:'application/json'},signal:controller.signal});
  if(!response.ok)throw new Error('Leaderboard service returned HTTP '+response.status);
  const payload=await response.json();
  if(payload?.api_version!=='v1'||payload?.schema_version!=='public-leaderboard-1'||!Array.isArray(payload.entries))throw new Error('Leaderboard service schema mismatch');
  const entries=payload.entries.map(normalizePublicEntry);
  if(entries.some(entry=>entry===null))throw new Error('Leaderboard service returned an invalid entry');
  document.body.dataset.leaderboardSource='api';
  return{entries,source:'api'};
 }catch(error){
  document.body.dataset.leaderboardSource='embedded';
  console.warn('WorldOracle leaderboard API unavailable; using embedded public snapshot.',error);
  return{entries:fallback,source:'embedded'};
 }finally{window.clearTimeout(timeout);}
}

function policyModels(entries){
 return entries.filter(model=>model.platform==='agibot_g2'&&model.regime==='policy').map(model=>({
  id:model.id,model_name:model.model_name,color:model.color,demo:model.demo,preview:model.preview,
  certified:model.certified,model_public:model.model_public,organization:model.organization||'',team_name:model.team_name||'',contributor:model.contributor||'',
  public_profile:model.public_profile||null,multi_view:model.view_mode==='multi',view_mode:model.view_mode,
  github_url:model.github_url||'',huggingface_url:model.huggingface_url||'',paper_url:model.paper_url||'',
  evaluated_at:model.evaluated_at??null,updated_at:model.updated_at??null,updated:model.updated??null,
  single_score:model.single_score,multiview_score:model.multiview_score,
  po:model.values[0],kro:model.values[1],ia:model.values[2],mvc:model.values[3]
 }));
}

async function initializePublicLeaderboards(){
 const loaded=await loadPublicLeaderboard();
 document.querySelectorAll('.benchmark-board').forEach(board=>initializeBoard(board,loaded.entries));
 const embeddedPolicy=JSON.parse(document.getElementById('policy-results-data')?.textContent||'[]');
 initializePolicy(loaded.source==='api'?policyModels(loaded.entries):embeddedPolicy);
}

initializePublicLeaderboards();
