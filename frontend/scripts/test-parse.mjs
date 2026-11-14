/* Temporary harness for the order-text parser. */
import { parseOrderText } from '../src/lib/parseOrder.js';

const samples = [
  {
    label: 'labelled bengali',
    text: 'নাম: হুমায়রা\nফোন: 01784204717\nঠিকানা: ঢাকা রামপুরা বনশ্রী ফরাজী হাসপাতাল, ই ব্লক, 1 রোড, 38 নাম্বার বাসা\n১২৩০/-\nহিজাব ২ পিস',
  },
  {
    label: 'plain lines (no labels)',
    text: 'Ratri - P\nmadrasar mor, Manikgonj sodor\n01647658918\n1300',
  },
  {
    label: 'english labels',
    text: 'Name: Avijit\nPhone: 01717193747\nAddress: Dhanmondi\nAmount: 1230\nNote: Urgent',
  },
  {
    label: 'amount with tk',
    text: 'মোবাইল: 01890613999\nটাকা ৫০০',
  },
  {
    label: 'product line only note',
    text: 'সুমাইয়া - S/M\nচুয়াডাঙ্গা, দামুড়হুদা, বোয়ালমারি\n01707056346\n২৪৫০/-',
  },
  {
    label: 'phone with spaces',
    text: 'Nasrin\n01744614826\nSirajganj raypur 1 number jutmil\n1230',
  },
  {
    label: 'bangla digits phone',
    text: 'কামাল\n০১৭৩৫৮৯৭১৯২\nগাজীপুর\n৫০০/-',
  },
  {
    label: 'empty',
    text: '   ',
  },
  {
    label: 'single word name',
    text: 'Moury',
  },
];

for (const sample of samples) {
  console.log('---', sample.label, '---');
  console.log('input :', JSON.stringify(sample.text));
  console.log('parsed:', JSON.stringify(parseOrderText(sample.text)));
}
