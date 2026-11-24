const methodButtons = document.querySelectorAll('[data-method]');
for (const button of methodButtons) button.addEventListener('click', () => {
  for (const option of methodButtons) {
    const active = option === button;
    option.setAttribute('aria-pressed', active);
    document.querySelector(`#${option.dataset.method}-panel`).hidden = !active;
  }
});

document.querySelector('#demo-scan').addEventListener('click', () => {
  document.querySelector('#photo-guides').hidden = false;
  document.querySelector('#photo-output').textContent = 'Ukázkový výsledek: 350 ml · bez uzávěru.';
});

document.querySelector('#demo-weight').addEventListener('submit', (event) => {
  event.preventDefault();
  const gross = document.querySelector('#gross').valueAsNumber;
  const portion = document.querySelector('#portion').valueAsNumber;
  const milliliters = Math.round(750 * (gross - 450) / 700);
  const servings = Math.floor(milliliters / portion);
  const remainder = milliliters % portion;
  document.querySelector('#weight-output').textContent =
    `${milliliters} ml · celé panáky: ${servings} · zbytek ${remainder} ml`;
});

const views = {
  single: ['Přehled · Hlavní bar', [['Poslední inventura', 'Dnes · 02:15'], ['Sklady', 'Bar a zázemí'], ['Pracovní terminál', 'Přístup přes PIN']]],
  multi: ['Přehled majitele · Všechny provozy', [['Centrum', 'Poslední inventura dnes'], ['Nábřeží', 'Poslední inventura včera'], ['Přístupy týmu', 'Podle provozu']]]
};
const viewButtons = document.querySelectorAll('[data-view]');
for (const button of viewButtons) button.addEventListener('click', () => {
  const [title, rows] = views[button.dataset.view];
  document.querySelector('#view-title').textContent = title;
  document.querySelector('#view-list').replaceChildren(...rows.map(([label, value]) => {
    const row = document.createElement('li');
    const name = document.createElement('span');
    const detail = document.createElement('strong');
    name.textContent = label;
    detail.textContent = value;
    row.append(name, detail);
    return row;
  }));
  for (const item of viewButtons) item.setAttribute('aria-pressed', item === button);
});
