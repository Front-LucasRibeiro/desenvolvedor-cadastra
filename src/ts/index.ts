import { Product, ItemColor, ItemSize } from "./Product";

const serverUrl = "http://localhost:5000";
const formato = { style: 'currency', currency: 'BRL' };
const checkedValues: { color: string[], size: string[], price: string[] } = {
  color: [],
  size: [],
  price: []
};

function fetchProducts(): Promise<Product[]> {
  return fetch(`${serverUrl}/products`).then(res => res.json());
}

function getFilterColor() {
  fetchProducts()
    .then((data: ItemColor[]) => {
      const uniqueColors = [...new Set(data.map(item => item.color))];
      const colorList = document.querySelector('.filter__item--color ul');

      uniqueColors.forEach(color => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = color;
        checkbox.name = color;
        checkbox.value = color;

        const span = document.createElement('span');
        span.textContent = color;

        label.appendChild(checkbox);
        label.appendChild(span);

        const li = document.createElement('li');
        li.appendChild(label);

        colorList.appendChild(li);
      });

      colorList.addEventListener('change', () => {
        checkedValues.color = Array.from(colorList.querySelectorAll('input:checked')).map((checkbox: HTMLInputElement) => checkbox.value);
        updateProducts();
      });
    })
    .catch(error => {
      console.error('Erro na solicitação:', error);
    });
}

function getFilterSize() {
  fetchProducts()
    .then((data: ItemSize[]) => {
      const sizes = data.flatMap(item => item.size);
      const uniqueSizes = [...new Set(sizes)].sort();
      const sizeList = document.querySelector('.filter__item--size ul');

      uniqueSizes.forEach(size => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = size;
        checkbox.name = size;
        checkbox.value = size;

        const span = document.createElement('span');
        span.textContent = size;

        label.appendChild(checkbox);
        label.appendChild(span);

        const li = document.createElement('li');
        li.appendChild(label);

        sizeList.appendChild(li);
      });

      sizeList.addEventListener('change', () => {
        checkedValues.size = Array.from(sizeList.querySelectorAll('input:checked')).map((checkbox: HTMLInputElement) => checkbox.value);
        updateProducts();
      });
    });
}

function getFilterPrice() {
  const price = document.querySelector('.filter__item--price ul');

  price.addEventListener('change', () => {
    checkedValues.price = Array.from(price.querySelectorAll('input:checked')).map((checkbox: HTMLInputElement) => checkbox.value);
    updateProducts();
  });
}

function getProducts() {
  fetchProducts()
    .then((data: Product[]) => {
      const productList = document.querySelector('.listProducts__list ul');

      if (data.length) {
        data.forEach(product => {
          const li = document.createElement('li');

          const img = document.createElement('img');
          img.src = product.image;
          li.appendChild(img);

          const titulo = document.createElement('h3');
          titulo.textContent = product.name;
          titulo.classList.add('product__title')
          li.appendChild(titulo);

          const price = document.createElement('p');
          price.textContent = String(product.price.toLocaleString('pt-BR', formato));
          price.classList.add('product__price')
          li.appendChild(price);

          const parcelamento = document.createElement('p');
          parcelamento.textContent = `até ${product.parcelamento[0]}x de ${product.parcelamento[1].toLocaleString('pt-BR', formato)}`;
          parcelamento.classList.add('product__parcelamento')
          li.appendChild(parcelamento);

          const btn = document.createElement('button');
          btn.textContent = 'Comprar';
          btn.classList.add('btn-comprar');
          li.appendChild(btn);

          li.dataset.color = product.color;
          li.dataset.size = JSON.stringify(product.size);
          li.dataset.price = JSON.stringify(product.price);

          productList.appendChild(li);
        });
      }
    });
}

function updateProducts() {
  fetchProducts()
    .then((data: Product[]) => {
      const productList = document.querySelector('.listProducts__list ul');
      productList.innerHTML = '<p class="filter-info">Não existem resultados para essa busca!</p>';

      data.forEach(product => {
        let isVisible = true;

        // Filtro de cores
        if (checkedValues.color.length > 0 && !checkedValues.color.includes(product.color)) {
          isVisible = false;
        }

        // Filtro de tamanhos
        if (checkedValues.size.length > 0 && !product.size.some(size => checkedValues.size.includes(size))) {
          isVisible = false;
        }

        // Filtro de preço
        if (checkedValues.price.length > 0) {
          let isPriceInRange = false;
          checkedValues.price.forEach(filter => {
            const [rangeStart, rangeEnd] = filter.split('-').map(Number);
            if (rangeEnd) {
              if (product.price >= rangeStart && product.price <= rangeEnd) {
                isPriceInRange = true;
              }
            } else {
              if (product.price >= rangeStart) {
                isPriceInRange = true;
              }
            }
          });
          if (!isPriceInRange) {
            isVisible = false;
          }
        }

        if (isVisible) {
          const productList = document.querySelector('.listProducts__list ul .filter-info');

          if (productList) {
            productList.remove();
          }

          montaShelf(product);
        }
      });
    });
}

function montaShelf(product: Product) {
  const li = document.createElement('li');

  const img = document.createElement('img');
  img.src = product.image;
  li.appendChild(img);

  const titulo = document.createElement('h3');
  titulo.textContent = product.name;
  titulo.classList.add('product__title')
  li.appendChild(titulo);

  const price = document.createElement('p');
  price.textContent = String(product.price.toLocaleString('pt-BR', formato));
  price.classList.add('product__price')
  li.appendChild(price);

  const parcelamento = document.createElement('p');
  parcelamento.textContent = `até ${product.parcelamento[0]}x de ${product.parcelamento[1].toLocaleString('pt-BR', formato)}`;
  parcelamento.classList.add('product__parcelamento')
  li.appendChild(parcelamento);

  const btn = document.createElement('button');
  btn.textContent = 'Comprar';
  btn.classList.add('btn-comprar');
  li.appendChild(btn);

  li.dataset.color = product.color;
  li.dataset.size = JSON.stringify(product.size);
  li.dataset.price = JSON.stringify(product.price);

  document.querySelector('.listProducts__list ul').appendChild(li);
}

function toggleFilter() {
  let filterItems = document.querySelectorAll('.filter__item--top');

  filterItems.forEach(item => {
    item.addEventListener('click', function () {
      item.classList.toggle('ativo');

      let ulElement = item.nextElementSibling;

      // Verificando se o próximo elemento é uma ul
      if (ulElement && ulElement.tagName.toLowerCase() === 'div') {
        ulElement.classList.toggle('ativo');
      }
    });
  });

  clearFilter();
}

function clearFilter() {
  let elemLimpar = document.querySelector('.buttons__item--limpar');

  elemLimpar.addEventListener('click', function () {
    let checkboxes = document.querySelectorAll('.filter__item input[type="checkbox"]');

    checkboxes.forEach((checkbox: HTMLInputElement) => {
      checkbox.checked = false;
    });

    checkedValues.color = []
    checkedValues.size = []
    checkedValues.price = []
  
    updateProducts()  
  });
}


function filterMob() {
  let elemFiltrar = document.querySelector('.filter__mob__item--filtrar');
  elemFiltrar.addEventListener('click', function () {
    let sidebar = document.querySelector('.sidebar') as HTMLElement;
    sidebar.style.display = 'block';
  });

  toggleFilter()
}

function closeFilterMob() {
  let elements = document.querySelectorAll('.top__filter--close, .buttons__item--aplicar');

  elements.forEach(elem => {
    elem.addEventListener('click', function () {
      let sidebar = document.querySelector('.sidebar') as HTMLElement;
      sidebar.style.display = 'none';

      let filterOrder = document.querySelector('.filter__order__mob') as HTMLElement;
      filterOrder.style.display = 'none';
    });
  });
}

function filterOrderMob(){
  let elemFiltrar = document.querySelector('.filter__mob__item--ordenar');

  elemFiltrar.addEventListener('click', function () {
    let orderFilter = document.querySelector('.filter__order__mob') as HTMLElement;
    orderFilter.style.display = 'block';
  });
}


function main() {
  getProducts();
  getFilterColor();
  getFilterSize();
  getFilterPrice();
  filterMob();
  closeFilterMob();
  filterOrderMob();
}

document.addEventListener("DOMContentLoaded", main);

