import { Product } from "./Product";

const serverUrl = "http://localhost:5000";
const formato = { style: 'currency', currency: 'BRL' };
const checkedValues: string[] = [];

interface ItemColor {
  color: string
}

interface ItemSize {
  size: string[];
}

function getFilterColor() {

  fetch(`${serverUrl}/products`)
    .then(res => res.json())
    .then((data: ItemColor[]) => {

      // filter color 
      const uniqueColors = [...new Set(data.map((item: ItemColor) => item.color))];

      uniqueColors.map(color => {

        let label = document.createElement('label');
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = color;
        checkbox.name = color;
        checkbox.value = color;

        let span = document.createElement('span');
        span.textContent = color;

        label.append(checkbox)
        label.append(span)

        let li = document.createElement('li')
        li.append(label)

        document.querySelector('.filter__item--color ul').append(li)
      })
    })
    .catch(error => {
      console.error('Erro na solicitação:', error);
    });
}

function getFilterSize() {
  fetch(`${serverUrl}/products`)
    .then(res => res.json())
    .then((data: ItemSize[]) => {

      // filter size 
      function extrairNumeros(array: string[]): string[] {
        // Expressão regular para verificar se uma string contém apenas números
        const regex = /^\d+$/;

        // Filtra apenas os elementos que são números
        const numeros = array.filter(item => regex.test(item));

        // Ordena os números
        numeros.sort((a, b) => parseInt(a) - parseInt(b));

        return numeros;
      }

      const uniqueSizes = [...new Set(data.flatMap((item: ItemSize) => item.size))];
      const sizesOrder = extrairNumeros(uniqueSizes);

      const ordemPersonalizada: Record<string, number> = { 'P': 0, 'M': 1, 'G': 2, 'GG': 3, 'U': 4 };

      // Filtra os tamanhos para incluir apenas os tamanhos desejados
      const tamanhosFiltrados = uniqueSizes.filter(tamanho => tamanho in ordemPersonalizada);

      // Ordena os tamanhos filtrados de acordo com a ordem personalizada
      tamanhosFiltrados.sort((a, b) => {
        // Assegura que 'a' e 'b' são chaves válidas no objeto ordemPersonalizada
        if (!(a in ordemPersonalizada) || !(b in ordemPersonalizada)) {
          throw new Error(`Tamanho inválido: ${a} ou ${b}`);
        }
        // Compara os valores de acordo com a ordem personalizada
        return ordemPersonalizada[a] - ordemPersonalizada[b];
      });

      tamanhosFiltrados.map(size => {
        let li = document.createElement('li')
        li.textContent = size;

        document.querySelector('.filter__item--size ul').append(li)
      })

      sizesOrder.map(size => {
        let li = document.createElement('li')
        li.textContent = size;

        document.querySelector('.filter__item--size ul').append(li)
      })
    })
}

function getProducts() {

  fetch(`${serverUrl}/products`)
    .then(res => res.json())
    .then((data: Product[]) => {

      if (data.length) {

        data.map(product => {
          const li = document.createElement('li');

          const img = document.createElement('img');
          img.src = product.image;
          li.append(img);

          const titulo = document.createElement('h3');
          titulo.textContent = product.name;
          titulo.classList.add('product__title')
          li.append(titulo);

          const price = document.createElement('p');
          price.textContent = String(product.price.toLocaleString('pt-BR', formato));
          price.classList.add('product__price')
          li.append(price);

          const parcelamento = document.createElement('p');
          parcelamento.textContent = `até ${product.parcelamento[0]}x de ${product.parcelamento[1].toLocaleString('pt-BR', formato)}`;
          parcelamento.classList.add('product__parcelamento')
          li.append(parcelamento);

          const btn = document.createElement('button');
          btn.textContent = 'Comprar';
          btn.classList.add('btn-comprar');
          li.append(btn);

          li.dataset.color = product.color;
          li.dataset.size = JSON.stringify(product.size);
          li.dataset.price = JSON.stringify(product.price);

          document.querySelector('.listProducts__list ul').append(li);
        })
      }
    })
}

function montaShelf(product: Product) {
  const li = document.createElement('li');

  const img = document.createElement('img');
  img.src = product.image;
  li.append(img);

  const titulo = document.createElement('h3');
  titulo.textContent = product.name;
  titulo.classList.add('product__title')
  li.append(titulo);

  const price = document.createElement('p');
  price.textContent = String(product.price.toLocaleString('pt-BR', formato));
  price.classList.add('product__price')
  li.append(price);

  const parcelamento = document.createElement('p');
  parcelamento.textContent = `até ${product.parcelamento[0]}x de ${product.parcelamento[1].toLocaleString('pt-BR', formato)}`;
  parcelamento.classList.add('product__parcelamento')
  li.append(parcelamento);

  const btn = document.createElement('button');
  btn.textContent = 'Comprar';
  btn.classList.add('btn-comprar');
  li.append(btn);

  li.dataset.color = product.color;
  li.dataset.size = JSON.stringify(product.size);
  li.dataset.price = JSON.stringify(product.price);

  document.querySelector('.listProducts__list ul').append(li);
}

function verificaItensCheckados() {
  // verifica itens por checkados 
  document.querySelectorAll('.filter label input').forEach((input: HTMLInputElement) => {
    // Adicionar ou remover valores do array com base no estado do input
    input.addEventListener('change', () => {
      if (input.checked && !checkedValues.includes(input.value)) {
        checkedValues.push(input.value); // Adicionar valor ao array se o input estiver marcado e ainda não estiver presente no array
      } else if (!input.checked && checkedValues.includes(input.value)) {
        const index = checkedValues.indexOf(input.value);
        if (index !== -1) {
          checkedValues.splice(index, 1); // Remover valor do array se o input estiver desmarcado e estiver presente no array
        }
      }
    });
  });
}

function checkItemFilter() {
  fetch(`${serverUrl}/products`)
    .then(res => res.json())
    .then((data: Product[]) => {
      if (data.length) {

        data.forEach((product: Product) => {
          // Verifica se o produto atende a todos os critérios selecionados
          const corFiltrada = checkedValues.includes(product.color);
          let precoFiltrado = true;

          checkedValues.forEach((itemFiltered: string) => {
            const [rangeItemInicio, rangeItemFinal] = itemFiltered.split('-').map(Number);
            if (rangeItemFinal === undefined) {
              if (product.price < rangeItemInicio) {
                precoFiltrado = false;
              }
            } else {
              if (product.price < rangeItemInicio || product.price > rangeItemFinal) {
                precoFiltrado = false;
              }
            }
          });

          console.log('checkedValuess', checkedValues)

          // Se o produto atender a todos os critérios, monte a prateleira
          if (corFiltrada && precoFiltrado) {
            montaShelf(product);
          }
        });

        if (checkedValues.length === 0) {
          getProducts()
        }
      }
    });
}


function filter() {

  document.querySelectorAll('.filter__item--color label input').forEach(element => {
    // Adicione um ouvinte de evento a cada elemento
    element.addEventListener('click', function (e) {
      const listItems: NodeListOf<HTMLUListElement> = document.querySelectorAll('.listProducts__list ul');
      listItems.forEach((item: HTMLUListElement) => {
        item.innerHTML = '';
      });

      verificaItensCheckados();

      // colors and price 
      checkItemFilter();
    });
  });

  checkPriceFilter();
}


function fetchCheckPrice(){
  fetch(`${serverUrl}/products`)
  .then(res => res.json())
  .then((data: Product[]) => {
    if (data.length) {

      let hasProductInRange = false;

      data.forEach((product: Product) => {
        let isInRange = true;
        checkedValues.map((itemFiltered: string) => {
          let [rangeItemInicio, rangeItemFinal] = itemFiltered.split('-').map(Number);

          if (rangeItemFinal === undefined) {
            if (product.price < rangeItemInicio) {
              isInRange = false;
            }
          } else {
            if (product.price < rangeItemInicio || product.price > rangeItemFinal) {
              isInRange = false;
            }
          }
        });

        console.log('checkedValuess', checkedValues)

        if (isInRange) {
          montaShelf(product);
          hasProductInRange = true;
        }

      });

      // Se nenhum produto estiver dentro do intervalo, emita uma mensagem
      if (!hasProductInRange) {
        const lista = document.querySelectorAll('.listProducts__list ul');
        lista.forEach((ul: HTMLElement) => {
          ul.innerHTML = '<p class="filter-info">Não existem produtos para essa busca!</p>';
        });
      }

      if (checkedValues.length === 0) {
        getProducts()
      }
    }
  });
}


function checkPriceFilter() {
  document.querySelectorAll('.filter__item--price label input').forEach(element => {
    // Adicione um ouvinte de evento a cada elemento
    element.addEventListener('click', function (e) {
      const listItems: NodeListOf<HTMLUListElement> = document.querySelectorAll('.listProducts__list ul');
      listItems.forEach((item: HTMLUListElement) => {
        item.innerHTML = '';
      });

      verificaItensCheckados();
      fetchCheckPrice();
    });
  });
}

function main() {
  getProducts();
  getFilterColor();
  getFilterSize();

  setTimeout(function () {
    filter()
  }, 1000)
}


document.addEventListener("DOMContentLoaded", main);
