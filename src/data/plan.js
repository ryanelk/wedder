// Wedding plan content and the pure helpers every tab uses.
// Task, vendor and event definitions live here; everything you change in the app is saved in the data object.

// ---------- Sections ----------
export const TRACKS = [
  { id: 'design', name: 'Design', desc: 'Creative work you make yourselves: the palette, save-the-dates and invitations, the website, DIY décor and signage.' },
  { id: 'logistics', name: 'Logistics', desc: 'Who, where and when: the guest list, floor plan, ceremony location, mailing dates and paperwork.' },
  { id: 'vendors', name: 'Vendors', desc: 'Everything done by a third party: shortlist, compare, book, collect insurance, confirm.' },
  { id: 'dayof', name: 'Day Of', desc: 'What has to be bought, packed, scheduled or staffed for May 23 itself.' },
];

// ---------- Tasks ----------
// T(id, section, due, text, { steps: [[id, text]], ref: { vendor, tab, label }, why })
const T = (id, track, due, text, x) => Object.assign({ id, track, due, text, steps: [] }, x || {});
export const TASKS = [
  // Design
  T('t-colors', 'design', '2026-11-20', 'Decide on color scheme', { ref: { tab: 'vision', label: 'Vision board' }, why: 'Everything else in Design builds on this: save-the-dates, invitations, décor, attire and signage.', steps: [['c1', 'Save references to the Vision tab'], ['c2', 'Narrow to 2–3 palettes'], ['c3', 'Check each against brick, wood beams and the patio greenery'], ['c4', 'Pick one and write the colors in Notes']] }),
  T('t-stddesign', 'design', '2026-11-20', 'Design save-the-dates', { ref: { vendor: 'stationery' }, steps: [['s1', 'Choose digital, printed, or both'], ['s2', 'Lay out with the palette: names, May 23, 2027, Los Angeles, website'], ['s3', 'Proof names and the date'], ['s4', 'Export or print']] }),
  T('t-site', 'design', '2026-11-25', 'Build the wedding website', { steps: [['w1', 'Pick a platform (Zola, Withjoy and The Knot all have free tiers)'], ['w2', 'Add date, Seventh/Place address and schedule'], ['w3', 'Add RSVP with a meal or allergy question'], ['w4', 'Parking section: street parking only, rideshare recommended'], ['w5', 'Link the registry once it exists']] }),
  T('t-attire', 'design', '2026-12-05', 'Choose attire and the court\'s dress code', { ref: { vendor: 'attire' }, why: 'Made-to-order dresses take 4–6 months plus alterations, so this one is early.', steps: [['a1', 'Set a dress code that works with the palette'], ['a2', 'Try off-the-rack and sample sales first'], ['a3', 'Order or rent the dress and suit'], ['a4', 'Send the court their colors or style guide']] }),
  T('t-invdesign', 'design', '2027-03-07', 'Design and print invitations', { ref: { vendor: 'stationery' }, why: 'Needs to be finished before the Mar 28 mail date.', steps: [['i1', 'Write the wording: date, 3:30 pm, location, RSVP by Apr 25'], ['i2', 'Design with the palette'], ['i3', 'Buy paper, envelopes and stamps'], ['i4', 'Print one proof and check it'], ['i5', 'Print and assemble']] }),
  T('t-decor', 'design', '2027-03-21', 'Plan and make DIY decorations', { ref: { vendor: 'florals' }, steps: [['d1', 'List zones: entry, ceremony, bar, buffet, sweetheart table, guest tables, patio, lounge'], ['d2', 'Decide DIY, buy, or florist for each zone'], ['d3', 'Make one test piece'], ['d4', 'Buy materials in bulk'], ['d5', 'Batch sessions; store finished pieces by zone']] }),
  T('t-vows', 'design', '2027-04-15', 'Write vows and the ceremony script', { steps: [['v1', 'Agree on length'], ['v2', 'Draft vows separately'], ['v3', 'Set ceremony order with the officiant']] }),
  T('t-playlist', 'design', '2027-04-30', 'Pick ceremony songs, first dance and a do-not-play list', { ref: { vendor: 'dj' } }),
  T('t-signage', 'design', '2027-05-01', 'Make signage: welcome, seating chart, bar menu, buffet labels', { steps: [['g1', 'List every sign you need'], ['g2', 'Design in the palette'], ['g3', 'Print and mount']] }),

  // Logistics
  T('t-guests', 'logistics', '2026-11-15', 'Finalize guest list and collect addresses', { steps: [['l1', 'Each side drafts a list'], ['l2', 'Merge and cut to 75–85'], ['l3', 'Collect addresses (a shared form works)'], ['l4', 'Keep one spreadsheet with an RSVP column']] }),
  T('t-venueqs', 'logistics', '2026-11-15', 'Get answers to the remaining venue questions', { ref: { tab: 'venue', label: 'Venue questions' } }),
  T('t-std', 'logistics', '2026-11-25', 'Send save-the-dates', { why: 'Needs the guest list and the save-the-date design first.' }),
  T('t-church', 'logistics', '2026-11-30', 'Decide whether the ceremony is at a church', { ref: { vendor: 'church' }, steps: [['h1', 'Shortlist churches within ~20 minutes of Seventh/Place'], ['h2', 'Check May 23 afternoon availability around Sunday services'], ['h3', 'Ask their rules: counseling, officiant, photos, music, décor'], ['h4', 'Map the drive and parking for guests'], ['h5', 'Decide: church or on-site at Seventh/Place']] }),
  T('t-court', 'logistics', '2026-12-15', 'Ask wedding court to be court'),
  T('t-floorplan', 'logistics', '2027-01-15', 'Draw the floor plan for Seventh/Place', { ref: { tab: 'venue', label: 'Floor plan links' }, steps: [['f1', 'Get room dimensions and outlet locations from the venue'], ['f2', 'Place ceremony seating, if on-site'], ['f3', 'Place tables, sweetheart table, bar, buffet line, DJ and lounge'], ['f4', 'Check the buffet and bar lines don\'t cross'], ['f5', 'Paste the share link on the Venue tab, then send it to the caterer, DJ and party supply vendor']] }),
  T('t-hotel', 'logistics', '2027-01-15', 'Hotel room block for out-of-town guests'),
  T('t-insurance', 'logistics', '2027-01-31', 'Buy event insurance for Seventh/Place', { ref: { vendor: 'insurance' }, steps: [['n1', 'Get coverage minimum and wording from the venue'], ['n2', 'Include host liquor liability'], ['n3', 'Buy the policy and send the certificate to the venue']] }),
  T('t-registry', 'logistics', '2027-01-31', 'Set up registry'),
  T('t-invmail', 'logistics', '2027-03-28', 'Mail invitations (8 weeks out)'),
  T('t-rsvp', 'logistics', '2027-04-25', 'RSVPs close; chase stragglers'),
  T('t-license', 'logistics', '2027-04-30', 'Get the LA County marriage license', { steps: [['m1', 'Book an appointment (license is valid 90 days, so after Feb 22)'], ['m2', 'Both bring ID']] }),
  T('t-runofshow', 'logistics', '2027-04-30', 'Write the run of show', { steps: [['r1', 'Block the day: setup 12–3, ceremony 3:30, dinner, toasts, dances, last call, load-out by midnight'], ['r2', 'Pick the person who runs the clock'], ['r3', 'Send it to every vendor']] }),
  T('t-seating', 'logistics', '2027-05-07', 'Seating chart'),
  T('t-walk', 'logistics', '2027-05-09', 'Final walkthrough at Seventh/Place', { ref: { tab: 'venue', label: 'Venue' } }),

  // Vendors
  T('t-caterer', 'vendors', '2026-11-30', 'Shortlist and book a buffet caterer', { ref: { vendor: 'caterer' }, steps: [['k1', 'Shortlist 3 caterers'], ['k2', 'Confirm each meets Seventh/Place\'s outside-caterer rules'], ['k3', 'Get quotes that include staff and serviceware'], ['k4', 'Book and pay the deposit'], ['k5', 'Get their certificate of insurance']] }),
  T('t-photo', 'vendors', '2026-11-30', 'Shortlist and book a photographer', { ref: { vendor: 'photo' }, steps: [['p1', 'Shortlist 3–5 photographers'], ['p2', 'Review one full wedding gallery from each'], ['p3', 'Confirm hours, and both locations if there\'s a church'], ['p4', 'Book'], ['p5', 'Get their certificate of insurance']] }),
  T('t-dj', 'vendors', '2026-12-15', 'Shortlist and book a DJ, or decide on a playlist', { ref: { vendor: 'dj' }, steps: [['j1', 'Shortlist 3 DJs, or price a speaker rental'], ['j2', 'Confirm ceremony audio and a wireless mic'], ['j3', 'Book'], ['j4', 'Get their certificate of insurance']] }),
  T('t-officiant', 'vendors', '2026-12-31', 'Find an officiant', { ref: { vendor: 'officiant' }, why: 'A friend ordained online is legal in California. A church may require its own clergy.' }),
  T('t-hmu', 'vendors', '2027-01-15', 'Shortlist and book hair and makeup', { ref: { vendor: 'hmu' }, steps: [['u1', 'Shortlist 3'], ['u2', 'Book a trial'], ['u3', 'Book'], ['u4', 'Get their certificate of insurance']] }),
  T('t-florist', 'vendors', '2027-01-15', 'Florist, or commit to DIY florals', { ref: { vendor: 'florals' } }),
  T('t-partysupply', 'vendors', '2027-01-31', 'Shortlist a party supply vendor', { ref: { vendor: 'rentals' }, steps: [['y1', 'List what the caterer doesn\'t cover: linens, tableware, glassware'], ['y2', 'Decide on the chair swap'], ['y3', 'Shortlist 3 and get quotes with delivery and pickup times'], ['y4', 'Book'], ['y5', 'Get their certificate of insurance']] }),
  T('t-cake', 'vendors', '2027-01-31', 'Choose cake or desserts', { ref: { vendor: 'cake' } }),
  T('t-tasting', 'vendors', '2027-02-28', 'Catering tasting and lock the menu', { ref: { vendor: 'caterer' } }),
  T('t-rentals', 'vendors', '2027-03-01', 'Finalize the party supply order', { ref: { vendor: 'rentals' } }),
  T('t-rings', 'vendors', '2027-03-31', 'Buy wedding bands'),
  T('t-coi', 'vendors', '2027-04-15', 'Collect a certificate of insurance from every vendor', { ref: { tab: 'vendors', label: 'Vendor list' } }),
  T('t-confirm', 'vendors', '2027-05-07', 'Confirm every vendor: arrival, load-in, final balances', { ref: { tab: 'vendors', label: 'Vendor list' } }),
  T('t-headcount', 'vendors', '2027-05-09', 'Final headcount to the caterer, including vendor meals', { ref: { vendor: 'caterer' } }),

  // Day Of
  T('t-bar', 'dayof', '2027-03-15', 'Pick the drink menu for the bartender', { ref: { vendor: 'alcohol' }, steps: [['b1', 'Choose 2 signature drinks'], ['b2', 'Pick beer and wine'], ['b3', 'Add a non-alcoholic option'], ['b4', 'Send the menu and recipes to the bartender']] }),
  T('t-hmusched', 'dayof', '2027-04-30', 'Set the hair and makeup schedule for the morning', { ref: { vendor: 'hmu' } }),
  T('t-fittings', 'dayof', '2027-04-30', 'Final fittings and pick up attire', { ref: { vendor: 'attire' } }),
  T('t-roles', 'dayof', '2027-05-01', 'Assign day-of jobs', { why: 'There\'s no day-of coordinator, so these need names.', steps: [['o1', 'Timekeeper who runs the run of show'], ['o2', 'Vendor point person'], ['o3', 'Setup crew for 12–3'], ['o4', 'Gifts and cards'], ['o5', 'Load-out crew']] }),
  T('t-setup', 'dayof', '2027-05-07', 'Setup plan for 12–3 pm', { steps: [['e1', 'Load list by zone'], ['e2', 'Who sets up what'], ['e3', 'Load the car the night before']] }),
  T('t-alcohol', 'dayof', '2027-05-14', 'Buy the alcohol, mixers and ice', { ref: { vendor: 'alcohol' }, steps: [['q1', 'Quantities for 75–85 guests'], ['q2', 'Buy where unopened bottles can be returned'], ['q3', 'Ice, cups and garnish if the bar doesn\'t provide them'], ['q4', 'Plan delivery to the venue by noon']] }),
  T('t-kit', 'dayof', '2027-05-20', 'Pack day-of kit, tip envelopes and final payments'),
  T('t-loadout', 'dayof', '2027-05-20', 'Load-out plan: what goes home and who takes it', { why: 'Venue cleaning excludes décor, rentals and personal items, and everything has to be out by midnight.' }),
];

export const PHASES = [
  { title: 'Lock the essentials', when: 'Nov 2026', start: '2026-11-01', end: '2026-11-30' },
  { title: 'Book the rest', when: 'Dec 2026 – Jan 2027', start: '2026-12-01', end: '2027-01-31' },
  { title: 'Details', when: 'Feb – Mar 2027', start: '2027-02-01', end: '2027-03-31' },
  { title: 'Final month', when: 'Apr 2027', start: '2027-04-01', end: '2027-04-30' },
  { title: 'Wedding month', when: 'May 1 – 22, 2027', start: '2027-05-01', end: '2027-05-22' },
];

export const VENUE_QS = [
  ['q-ins', 'Insurance: coverage minimum and the exact additional-insured wording for your policy and vendor certificates'],
  ['q-cater', 'Outside caterer rules: license, approved list, kitchen or prep space, power'],
  ['q-bar', 'Bartender count and hours, and whether they need the drink menu in advance'],
  ['q-music', 'Music cutoff: when does sound have to stop so load-out finishes by midnight'],
  ['q-decor', 'Décor rules: candles, hanging items, petals or confetti'],
];

export const VENDORS = [
  { id: 'venue', name: 'Venue: Seventh/Place', tag: 'venue', by: '2026-10-31', est: [6950, 6950], def: { status: 'booked', amount: 6950 }, noCoi: true, noShort: true, guide: 'Paid in full. Includes staff, tables, 100 chairs, uplights, pipe and drape, bartending and the champagne toast.' },
  { id: 'church', name: 'Ceremony church', tag: 'venue', by: '2026-11-30', est: [300, 1500], optional: true, noCoi: true, guide: 'If you go off-site. Fees or suggested donations vary widely; ask about required counseling, their officiant, photo rules and parking.' },
  { id: 'caterer', name: 'Caterer', tag: 'food', by: '2026-11-30', est: [2800, 4400], guide: 'Buffet for ~80: roughly $35–55pp including staff. Ask whether plates, flatware, glassware and service staff are included; whatever they don\'t cover goes to the party supply vendor.' },
  { id: 'photo', name: 'Photographer', tag: 'vendor', by: '2026-11-30', est: [500, 2000], guide: 'Coverage from getting ready through the send-off is roughly 8 hours. If the ceremony is at a church, confirm they cover both locations and the church allows them inside.' },
  { id: 'stationery', name: 'Save-the-dates and invitations', tag: 'people', by: '2026-11-15', est: [100, 100], noCoi: true, noShort: true, guide: 'DIY save-the-dates and invitations, materials only.' },
  { id: 'attire', name: 'Attire and alterations', tag: 'logistics', by: '2026-12-05', est: [450, 1000], noCoi: true, guide: 'Order early; alterations need 6–8 weeks on top of delivery.' },
  { id: 'dj', name: 'DJ / music', tag: 'vendor', by: '2026-12-15', est: [1200, 2500], guide: 'Confirm they cover ceremony audio, a wireless mic, and both indoor and patio if you use both.' },
  { id: 'officiant', name: 'Officiant', tag: 'people', by: '2026-12-31', est: [300, 700], noCoi: true, guide: 'A friend ordained online is legal in California and costs nothing. A church may require its own clergy.' },
  { id: 'hmu', name: 'Hair and makeup', tag: 'vendor', by: '2027-01-15', est: [300, 750], guide: 'Ask about a trial and an on-site start time that fits your access window.' },
  { id: 'florals', name: 'Florals and décor', tag: 'venue', by: '2027-01-15', est: [500, 1250], guide: 'Uplights and pipe and drape are included, so florals can stay small: bar, sweetheart table, ceremony.' },
  { id: 'insurance', name: 'Event insurance (venue)', tag: 'budget', by: '2027-01-31', est: [150, 400], noCoi: true, guide: 'One-day liability policy naming Seventh/Place as additional insured. Host liquor liability matters since you supply the alcohol.' },
  { id: 'cake', name: 'Cake / desserts', tag: 'food', by: '2027-01-31', est: [400, 400], guide: 'Ask the caterer first; bundling dessert can drop a cake-cutting fee.' },
  { id: 'rentals', name: 'Party supply vendor', tag: 'logistics', by: '2027-01-31', est: [500, 1800], guide: 'Linens and tableware the caterer doesn\'t cover, plus replacement chairs if you swap the venue\'s white wood ones. Chair swaps add delivery and pickup inside your 12 hours.' },
  { id: 'alcohol', name: 'Alcohol and drink menu', tag: 'food', by: '2027-03-15', est: [650, 1150], noCoi: true, guide: 'You supply it for 75–85 guests; bartending and the toast champagne are included. Two signature drinks plus beer and wine keeps the shopping list short. Warehouse stores often take back unopened bottles.' },
];

export const STATUSES = [['todo', 'Not started'], ['research', 'Researching'], ['quoted', 'Quoted'], ['booked', 'Booked'], ['skip', 'Not needed']];

export const EVENTS = [
  { id: 'bach', title: 'Bachelor and bachelorette', when: 'Week before the wedding · May 16–22, 2027', tasks: [['e-bach-org', 'Pick organizers'], ['e-bach-plan', 'Choose location and format'], ['e-bach-book', 'Book travel or reservations'], ['e-bach-funds', 'Collect funds from attendees']] },
  { id: 'intimate', title: 'Intimate ceremony', when: 'Separate date TBD', tasks: [['e-ic-when', 'Decide before, after, or same weekend'], ['e-ic-list', 'Guest list and size'], ['e-ic-venue', 'Pick a spot'], ['e-ic-budget', 'Set its budget']] },
];

// ---------- Constants ----------
export const WEDDING_DATE = '2027-05-23';
export const TARGET = 16000;

// ---------- Dates and formatting ----------
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function parseD(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
export function today() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
export function isoToday() { const d = today(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
export function daysUntil(s) { return Math.round((parseD(s) - today()) / 864e5); }
export function fmtD(s) { const d = parseD(s); return MON[d.getMonth()] + ' ' + d.getDate(); }
export function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
export function k(n) { return n >= 1000 ? '$' + (Math.round(n / 100) / 10).toString().replace(/\.0$/, '') + 'k' : money(n); }
export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
export const trackName = id => (TRACKS.find(t => t.id === id) || { name: id }).name;
export const vendorById = id => VENDORS.find(v => v.id === id);
export const statusName = id => (STATUSES.find(s => s[0] === id) || [id, id])[1];

// ---------- Tasks ----------
// Built-in and custom tasks are the base; edits made in the app are stored as overrides in data.taskState[id].
export const OV_KEYS = ['text', 'due', 'track', 'why', 'stepEdits', 'stepHidden'];
export function tstate(data, id) {
  const s = JSON.parse(JSON.stringify((data.taskState || {})[id] || {}));
  s.done = !!s.done; s.doneAt = s.doneAt || ''; s.steps = s.steps || {}; s.extra = s.extra || []; s.notes = s.notes || '';
  return s;
}
export function withTask(prev, id, fn) {
  const st = tstate(prev, id);
  fn(st);
  return { ...prev, taskState: { ...(prev.taskState || {}), [id]: st } };
}
export function baseTasks(data) {
  return TASKS.concat(Object.entries(data.customTasks || {}).map(([cid, c]) => ({ id: 'c-' + cid, cid, text: c.text, track: c.track || 'logistics', due: c.due || '', why: '', steps: [], custom: true })));
}
export function applyOv(data, b) {
  const s = (data.taskState || {})[b.id] || {}, has = key => Object.prototype.hasOwnProperty.call(s, key);
  const se = s.stepEdits || {}, sh = s.stepHidden || {};
  return {
    ...b,
    text: has('text') ? s.text : b.text,
    due: has('due') ? s.due : b.due,
    track: has('track') && TRACKS.some(t => t.id === s.track) ? s.track : b.track,
    why: has('why') ? s.why : (b.why || ''),
    steps: b.steps.filter(x => !sh[x[0]]).map(x => [x[0], se[x[0]] || x[1]]),
    hidden: !!s.hidden,
    edited: OV_KEYS.some(has),
  };
}
const withOv = data => baseTasks(data).map(b => applyOv(data, b));
export const allTasks = data => withOv(data).filter(t => !t.hidden);
export const deletedTasks = data => withOv(data).filter(t => t.hidden);
export const findTask = (data, id) => withOv(data).find(t => t.id === id);
export const findBase = (data, id) => baseTasks(data).find(t => t.id === id);
export function stepCount(t, st) {
  return {
    total: t.steps.length + st.extra.length,
    done: t.steps.filter(s => st.steps[s[0]]).length + st.extra.filter(x => x.done).length,
  };
}
export const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999');
export function trackStats(data, id) {
  const list = allTasks(data).filter(t => t.track === id);
  const done = list.filter(t => tstate(data, t.id).done).length;
  const next = list.filter(t => !tstate(data, t.id).done).sort(byDue)[0];
  return { total: list.length, done, next };
}
export function phaseIndex(t) {
  if (!t.due) return -1;
  for (let i = 0; i < PHASES.length; i++) if (t.due <= PHASES[i].end) return i;
  return PHASES.length - 1;
}

// ---------- Vendors and budget ----------
export function vstate(data, v) { return { status: 'todo', amount: '', contact: '', notes: '', ...(v.def || {}), ...((data.vendorState || {})[v.id] || {}) }; }
export function withVendor(prev, vid, patch) {
  return { ...prev, vendorState: { ...(prev.vendorState || {}), [vid]: { ...vstate(prev, vendorById(vid)), ...patch } } };
}
export const numOr = (x, d) => (x === '' || x == null || isNaN(parseFloat(x))) ? d : parseFloat(x);
export function est(data, v) { const s = vstate(data, v), lo = numOr(s.estLo, v.est[0]), hi = numOr(s.estHi, v.est[1]); return [lo, Math.max(lo, hi)]; }
export function estText(data, v, f) { const e = est(data, v); return f(e[0]) + (e[1] !== e[0] ? '–' + f(e[1]) : ''); }
export function isActive(data, v) { const s = vstate(data, v).status; return s !== 'skip' && !(v.optional && s === 'todo'); }
export function autoCounted(data, v) {
  const s = vstate(data, v), amt = parseFloat(s.amount), e = est(data, v);
  if (s.status === 'skip') return 0;
  if ((s.status === 'booked' || s.status === 'quoted') && !isNaN(amt)) return amt;
  if (v.optional && s.status === 'todo') return 0;
  return (e[0] + e[1]) / 2;
}
export function counted(data, v) { const o = numOr(vstate(data, v).counted, null); return { val: o !== null ? o : autoCounted(data, v), manual: o !== null }; }
export function totals(data) {
  let committed = 0, projected = 0, booked = 0, active = 0;
  VENDORS.forEach(v => {
    const s = vstate(data, v), amt = parseFloat(s.amount);
    if (s.status === 'booked' && !isNaN(amt)) committed += amt;
    projected += counted(data, v).val;
    if (isActive(data, v)) { active++; if (s.status === 'booked') booked++; }
  });
  return { committed, projected, booked, active };
}
