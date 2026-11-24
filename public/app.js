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
