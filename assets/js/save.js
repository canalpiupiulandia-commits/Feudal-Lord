
const SaveSystem = {
  KEY: 'feudalLord_v1',
  save(G) {
    try { localStorage.setItem(this.KEY, JSON.stringify(G)); } catch(e){}
  },
  load() {
    try { const d=localStorage.getItem(this.KEY); return d?JSON.parse(d):null; } catch(e){ return null; }  },
  hasSave() { return !!localStorage.getItem(this.KEY); },
  deleteSave() { localStorage.removeItem(this.KEY); }
};
