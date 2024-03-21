import { Product } from "./Product";

const serverUrl = "http://localhost:5000";

interface ItemColor {
  color: string
}

interface ItemSize {
  size: string[];
}

function filterColor() {

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

function filterSize() {
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

function listProducts() {

  fetch(`${serverUrl}/products`)
    .then(res => res.json())
    .then((data: Product[]) => {

      if (data.length) {
        const formato = { style: 'currency', currency: 'BRL' };

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

          document.querySelector('.listProducts__list ul').append(li);
        })
      }
    })
}


function main() {
  filterColor();
  filterSize();
  listProducts();
}


document.addEventListener("DOMContentLoaded", main);
