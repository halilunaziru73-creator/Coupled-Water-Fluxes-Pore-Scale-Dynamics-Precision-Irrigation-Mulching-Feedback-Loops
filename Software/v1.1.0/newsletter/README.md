# SWAFL release notices (newsletter)

The form at the end of `description.html` collects a first name and an e-mail address. The addresses go to a Google Sheet that you own, and release notices are sent from your own Gmail account (halilunaziru73@gmail.com). No other service is involved and there is no monthly fee.

**What subscribers get:** a confirmation e-mail first (they must click the link), then one short e-mail for each release you announce. Every e-mail has a one-click unsubscribe link. Only confirmed addresses are ever notified.

**What you get:** the sheet **Subscribers** with date, name, e-mail, status (pending, confirmed, unsubscribed), and a menu **SWAFL newsletter** with the count, a test mail to yourself, and the button that notifies everybody.

## Until the sheet is set up

The form already works with one click. It sends each new subscriber (first name and e-mail address) to halilunaziru73@gmail.com through the free form service FormSubmit (formsubmit.co). **The first time anybody subscribes, FormSubmit sends you one activation e-mail: click its link once.** After that every subscription arrives as an e-mail with the subject "SWAFL subscriber: ...", and you can notify everybody from Gmail (put the addresses in Bcc). This route has no confirmation e-mail and no automatic unsubscribe link, so move to the sheet below when you can.

## Setup of the sheet (about 10 minutes, once)

1. Sign in to Google as halilunaziru73@gmail.com. Open https://sheets.google.com and create a blank spreadsheet named **SWAFL subscribers**.
2. In the sheet: **Extensions → Apps Script**. Delete the sample code and paste the whole of `Code.gs` from this folder. Save.
3. **Deploy → New deployment → type: Web app.** *Execute as:* **Me**. *Who has access:* **Anyone**. Press **Deploy** and accept the permissions (Google asks once because the script sends mail and edits the sheet; it is your own script). Copy the **Web app URL** (it ends in `/exec`).
4. Open `Software/v1.1.0/description.html`, find the line `var NEWSLETTER_URL='';` and put the URL between the quotes. Commit and push. The form now works.
5. Back in the sheet, reload the page: the menu **SWAFL newsletter** appears, and the sheet **Message** is created.

## Announcing a release or an update

1. In the sheet **Message** write the subject, the message and the update label (for example `1.1.1` or `2026-12-update`). `{name}` becomes the subscriber's first name and `{link}` the page of the software.
2. Menu **SWAFL newsletter → Send a test to myself**, and read it.
3. Menu **SWAFL newsletter → Notify confirmed subscribers of the release**. Each subscriber gets the mail once for each label; running it again does not send duplicates.

## Limits and good practice

- A free Gmail account can send about **100 recipients a day** (a Google Workspace account about 1,500). If you have more subscribers, the menu sends what the limit allows and you run it again the next day; nobody gets two copies. The menu shows the number you can still send today.
- A new address receives only a confirmation mail until it clicks the link. This keeps mistyped and foreign addresses off the list.
- The list holds only a name, an e-mail address, the date and the status. Say so on your privacy page. To delete a person, delete the row.
- If you change `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so that the link keeps working.
