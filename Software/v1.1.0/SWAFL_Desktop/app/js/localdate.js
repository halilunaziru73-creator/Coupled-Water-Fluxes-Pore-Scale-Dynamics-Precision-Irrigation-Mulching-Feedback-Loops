/* The date and time of the computer of the person (local time), for the names of saved files and the dates printed on reports.
   toISOString() gives the date in UTC, which is yesterday or tomorrow for some hours of every day outside Greenwich. */
'use strict';
window.SWAFLDate = (() => {
  const p = n => String(n).padStart(2, '0');
  const day = d => { d = d || new Date(); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };
  const time = d => { d = d || new Date(); return p(d.getHours()) + '-' + p(d.getMinutes()) + '-' + p(d.getSeconds()); };
  const name = n => { n = String(n); if (/\d{4}-\d{2}-\d{2}/.test(n)) return n; const i = n.lastIndexOf('.'); return i > 0 ? n.slice(0, i) + '_' + day() + '_' + time().slice(0, 5) + n.slice(i) : n + '_' + day() + '_' + time().slice(0, 5); };
  return { name, day, time, stamp: d => day(d) + '-' + time(d), pretty: d => { d = d || new Date(); return day(d) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); } };
})();
