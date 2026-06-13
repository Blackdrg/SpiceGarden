import re

files = [
    ('apps/restaurant-dashboard/src/pages/onboarding/business.tsx', [
        ('Legal Business Name', 'biz-legal-name'),
        ('Trade Name', 'biz-trade-name'),
        ('GSTIN', 'biz-gstin'),
        ('Business Type', 'biz-business-type'),
        ('Registration Date', 'biz-reg-date'),
    ]),
    ('apps/restaurant-dashboard/src/pages/onboarding/gst.tsx', [
        ('State Code', 'gst-state-code'),
    ]),
    ('apps/restaurant-dashboard/src/pages/onboarding/payout.tsx', [
        ('Account Holder Name', 'payout-holder'),
        ('Account Number', 'payout-acct-num'),
        ('Confirm Account Number', 'payout-confirm-acct'),
        ('IFSC Code', 'payout-ifsc'),
        ('Bank Name', 'payout-bank'),
        ('Branch Name', 'payout-branch'),
    ]),
]

for fpath, pairs in files:
    with open(fpath, 'r', encoding='utf-8') as fh:
        text = fh.read()
    for label_text, input_id in pairs:
        label_pat = r'(<label[^>]*>)' + re.escape(label_text) + r'(</label>)'
        label_repl = r'\1<label htmlFor="' + input_id + '">' + label_text + r'\2'
        text = re.sub(label_pat, label_repl, text, count=1)
        input_pat = r'(<input[^>]*?aria-label="' + re.escape(label_text) + r'"[^>]*?)(\s*/>)'
        input_repl = r'\1 id="' + input_id + r'"\2'
        text = re.sub(input_pat, input_repl, text, count=1)
    with open(fpath, 'w', encoding='utf-8') as fh:
        fh.write(text)
    print(f'Fixed: {fpath}')
