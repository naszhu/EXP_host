const textFile = './picnames.txt';
const psFile = './ps.txt';

let picnames = [];
let oldids = [];

async function preloadExperimentFiles() {
  const [picText, psText] = await Promise.all([
    fetch(textFile).then(r => r.text()),
    fetch(psFile).then(r => r.text())
  ]);

  picnames = picText.replace(/\r/g, '').split('\n').slice(0, 2362 - 1);
  oldids = psText.replace(/\r/g, '').split('\n');

  console.log("Loaded picnames:", picnames);
  console.log("Loaded old IDs:", oldids);
}