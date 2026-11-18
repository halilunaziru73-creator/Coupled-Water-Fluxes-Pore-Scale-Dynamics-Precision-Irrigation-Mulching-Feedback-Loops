/**
 * SWAFL release notices: subscriber list and release e-mails, run from your own Google account.
 *
 * What it does
 *  - receives the form of description.html (name and e-mail address) and writes it to the sheet "Subscribers";
 *  - sends a confirmation e-mail with a link (double opt-in): only confirmed addresses are ever notified;
 *  - gives every e-mail a one-click unsubscribe link;
 *  - adds the menu "SWAFL newsletter" to the sheet, where you see the subscribers and send a release notice.
 * Everything is sent from the Google account that owns this script (halilunaziru73@gmail.com), and the list lives in your own Google Sheet.
 * Setup: see README.md in this folder.
 */

var SUBSCRIBERS = 'Subscribers';          // sheet with the list
var MESSAGE = 'Message';                  // sheet where you write the release notice
var SENDER_NAME = 'SWAFL release notices';
var SITE = 'https://halilunaziru73-creator.github.io/Coupled-Water-Fluxes-Pore-Scale-Dynamics-Precision-Irrigation-Mulching-Feedback-Loops/Software/v1.1.0/description.html';
// columns of the sheet Subscribers
var C = { DATE: 1, NAME: 2, EMAIL: 3, STATUS: 4, TOKEN: 5, CONFIRMED: 6, NOTIFIED: 7 };

function sheet_(name, header) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); if (header) { sh.appendRow(header); sh.setFrozenRows(1); sh.getRange(1, 1, 1, header.length).setFontWeight('bold'); } }
  return sh;
}
function subs_() { return sheet_(SUBSCRIBERS, ['Date', 'Name', 'E-mail', 'Status', 'Token', 'Confirmed on', 'Notified for']); }
function esc_(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function url_() { return ScriptApp.getService().getUrl(); }

/** The form of the page posts here. */
function doPost(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.hp) return text_('ok');                                              // the hidden field is filled in by robots only
    var email = String(p.email || '').trim().toLowerCase(), name = String(p.name || '').trim().slice(0, 80);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return text_('invalid');
    var lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      var sh = subs_(), data = sh.getDataRange().getValues(), row = -1;
      for (var i = 1; i < data.length; i++) if (String(data[i][C.EMAIL - 1]).toLowerCase() === email) { row = i + 1; break; }
      if (row > 0) {
        var st = data[row - 1][C.STATUS - 1];
        if (st === 'confirmed') return text_('ok');
        sh.getRange(row, C.STATUS).setValue('pending');                         // came back after unsubscribing, or never confirmed: ask again
        var tk = data[row - 1][C.TOKEN - 1] || Utilities.getUuid(); sh.getRange(row, C.TOKEN).setValue(tk);
        confirmMail_(name || data[row - 1][C.NAME - 1], email, tk);
      } else {
        var token = Utilities.getUuid();
        sh.appendRow([new Date(), name, email, 'pending', token, '', '']);
        confirmMail_(name, email, token);
      }
    } finally { lock.releaseLock(); }
    return text_('ok');
  } catch (err) { return text_('error'); }
}

/** Links in the e-mails: ?a=confirm&t=TOKEN and ?a=unsub&t=TOKEN */
function doGet(e) {
  var p = (e && e.parameter) || {}, sh = subs_(), data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (p.t && data[i][C.TOKEN - 1] === p.t) {
      if (p.a === 'confirm') { sh.getRange(i + 1, C.STATUS).setValue('confirmed'); sh.getRange(i + 1, C.CONFIRMED).setValue(new Date()); return page_('Subscription confirmed', 'Thank you. You will receive a short e-mail when a new version of SWAFL is released. Every e-mail has a link to unsubscribe.'); }
      if (p.a === 'unsub') { sh.getRange(i + 1, C.STATUS).setValue('unsubscribed'); return page_('You are unsubscribed', 'Your address will not receive any more release notices.'); }
    }
  }
  return page_('Link not valid', 'This link is no longer valid. You can subscribe again on the SWAFL page.');
}
function text_(s) { return ContentService.createTextOutput(s); }
function page_(h, t) { return HtmlService.createHtmlOutput('<div style="font:16px/1.5 Arial,sans-serif;max-width:560px;margin:60px auto;padding:0 16px"><h2>' + esc_(h) + '</h2><p>' + esc_(t) + '</p><p><a href="' + SITE + '">Back to the SWAFL page</a></p></div>').setTitle(h); }

function confirmMail_(name, email, token) {
  var link = url_() + '?a=confirm&t=' + encodeURIComponent(token);
  MailApp.sendEmail({ to: email, name: SENDER_NAME, subject: 'Please confirm your subscription to SWAFL release notices',
    body: 'Hello' + (name ? ' ' + name : '') + ',\n\nPlease confirm that you want to receive a short e-mail when a new version of SWAFL is released:\n' + link + '\n\nIf you did not ask for this, ignore this message and nothing will be sent to you.\n\nNaziru Halilu\n' + SITE,
    htmlBody: '<p>Hello' + (name ? ' ' + esc_(name) : '') + ',</p><p>Please confirm that you want to receive a short e-mail when a new version of SWAFL is released:</p><p><a href="' + link + '">Confirm my subscription</a></p><p>If you did not ask for this, ignore this message and nothing will be sent to you.</p><p>Naziru Halilu<br><a href="' + SITE + '">SWAFL</a></p>' });
}

/** The menu in the sheet. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('SWAFL newsletter')
    .addItem('Show the number of subscribers', 'count')
    .addItem('Send a test to myself', 'testToMe')
    .addItem('Notify confirmed subscribers of the release', 'notifyAll')
    .addToUi();
  messageSheet_();
}
function messageSheet_() {
  var sh = sheet_(MESSAGE), v = sh.getRange('A1:B3').getValues();
  if (!sh.getRange('A1').getValue()) {
    sh.getRange('A1:A3').setValues([['Subject'], ['Message (use {name} for the first name and {link} for the page)'], ['Release label (a notice is sent once for each label)']]).setFontWeight('bold');
    sh.getRange('B1:B3').setValues([['SWAFL 1.1.1 is released'], ['Hello {name},\n\nA new version of SWAFL is released. What is new, and the download, are on the page:\n{link}\n\nNaziru Halilu'], ['1.1.1']]);
    sh.setColumnWidth(1, 260); sh.setColumnWidth(2, 640); sh.getRange('B2').setWrap(true);
  }
  return sh;
}
function count() {
  var d = subs_().getDataRange().getValues(), n = { confirmed: 0, pending: 0, unsubscribed: 0 };
  for (var i = 1; i < d.length; i++) n[d[i][C.STATUS - 1]] = (n[d[i][C.STATUS - 1]] || 0) + 1;
  SpreadsheetApp.getUi().alert('Confirmed: ' + n.confirmed + '\nWaiting for confirmation: ' + n.pending + '\nUnsubscribed: ' + n.unsubscribed + '\n\nMails you can still send today: ' + MailApp.getRemainingDailyQuota());
}
function body_(tpl, name, token) {
  var t = String(tpl).replace(/\{name\}/g, name || 'reader').replace(/\{link\}/g, SITE);
  return t + '\n\n--\nYou receive this because you subscribed to SWAFL release notices. Unsubscribe: ' + url_() + '?a=unsub&t=' + encodeURIComponent(token);
}
function testToMe() {
  var m = messageSheet_().getRange('B1:B3').getValues(), me = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({ to: me, name: SENDER_NAME, subject: '[test] ' + m[0][0], body: body_(m[1][0], 'Naziru', 'test') });
  SpreadsheetApp.getUi().alert('A test was sent to ' + me + '.');
}
function notifyAll() {
  var ui = SpreadsheetApp.getUi(), m = messageSheet_().getRange('B1:B3').getValues(), subject = m[0][0], tpl = m[1][0], label = String(m[2][0]).trim();
  if (!subject || !tpl || !label) { ui.alert('Fill in the subject, the message and the release label on the sheet "Message".'); return; }
  var sh = subs_(), d = sh.getDataRange().getValues(), todo = [];
  for (var i = 1; i < d.length; i++) if (d[i][C.STATUS - 1] === 'confirmed' && String(d[i][C.NOTIFIED - 1]) !== label) todo.push(i);
  if (!todo.length) { ui.alert('Nobody is left to notify for "' + label + '" (all confirmed subscribers have it already).'); return; }
  var quota = MailApp.getRemainingDailyQuota(), n = Math.min(todo.length, quota);
  if (ui.alert('Send "' + subject + '" to ' + n + ' of ' + todo.length + ' confirmed subscribers?' + (n < todo.length ? '\n\nYour daily limit allows ' + quota + ' mails today. Run it again tomorrow for the rest.' : ''), ui.ButtonSet.OK_CANCEL) !== ui.Button.OK) return;
  var sent = 0;
  for (var k = 0; k < n; k++) {
    var r = todo[k], name = String(d[r][C.NAME - 1]).split(' ')[0];
    try { MailApp.sendEmail({ to: d[r][C.EMAIL - 1], name: SENDER_NAME, subject: subject, body: body_(tpl, name, d[r][C.TOKEN - 1]) }); sh.getRange(r + 1, C.NOTIFIED).setValue(label); sent++; } catch (e) { }
  }
  ui.alert('Sent: ' + sent + ' of ' + todo.length + '.' + (sent < todo.length ? ' The rest can be sent by running it again (today if the limit allows, otherwise tomorrow).' : ''));
}
