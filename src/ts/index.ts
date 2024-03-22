import { Product, Cart, ItemColor, ItemSize } from "./Product";

const serverUrl = "http://localhost:5000";
const serverCartUrl = "http://localhost:5001/cart";
const formato = { style: 'currency', currency: 'BRL' };
const itensByPge = 9;
const checkedValues: { color: string[], size: string[], price: string[] } = {
  color: [],
  size: [],
  price: []
};


function fetchProducts(): Promise<Product[]> {
  return fetch(`${serverUrl}/products`).then(res => res.json());
}

function fetchCart(): Promise<Cart[]> {
  return fetch(serverCartUrl).then(res => res.json());
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

      openMoreColor();
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
        const checkboxes = sizeList.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach((checkbox: HTMLInputElement) => {
          const li = checkbox.closest('li');

          if (checkbox.checked) {
            li.classList.add('selected');
          } else {
            li.classList.remove('selected');
          }
        });

        checkedValues.size = Array.from(checkboxes)
          .filter((checkbox: HTMLInputElement) => checkbox.checked)
          .map((checkbox: HTMLInputElement) => checkbox.value);

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
        data.forEach((product, index) => {
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
          btn.dataset.id = JSON.stringify(product.id);
          btn.dataset.name = product.name;
          btn.dataset.price = JSON.stringify(product.price);
          btn.dataset.image = product.image;
          li.appendChild(btn);

          li.dataset.color = product.color;
          li.dataset.size = JSON.stringify(product.size);
          li.dataset.price = JSON.stringify(product.price);
          li.dataset.id = JSON.stringify(product.id);

          if (index >= itensByPge) li.classList.add('hidden')

          productList.appendChild(li);
        });
      }

      cart();
      loadMore();
    });
}

function updateProducts() {
  const loadMoreBtn = document.querySelector('.load-more');
  if (loadMoreBtn instanceof HTMLElement) {
    loadMoreBtn.style.display = 'flex';
  }

  fetchProducts()
    .then((data: Product[]) => {
      const productList = document.querySelector('.listProducts__list ul');
      productList.innerHTML = '<p class="filter-info">Não existem resultados para essa busca!</p>';


      data.forEach((product, index) => {
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

          montaShelf(product, index);
        }
      });

      loadMore();
    });
}

function montaShelf(product: Product, index: number) {
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

  if (index >= itensByPge) li.classList.add('hidden')

  document.querySelector('.listProducts__list ul').appendChild(li);

  cart();
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

function filterOrderMob() {
  let elemFiltrar = document.querySelector('.filter__mob__item--ordenar');

  elemFiltrar.addEventListener('click', function () {
    let orderFilter = document.querySelector('.filter__order__mob') as HTMLElement;
    orderFilter.style.display = 'block';
  });
}

function showBtnLoadMore(loadMoreBtn: Element) {
  // Ocultar o botão "Load More" se não houver mais itens ocultos
  if (document.querySelectorAll('.listProducts__list ul .hidden').length === 0) {
    if (loadMoreBtn instanceof HTMLElement) {
      loadMoreBtn.style.display = 'none';
    }
  } else {
    if (loadMoreBtn instanceof HTMLElement) {
      loadMoreBtn.style.display = 'flex';
    }
  }
}

function loadMore() {
  const loadMoreBtn = document.querySelector('.load-more');
  const hiddenItems = document.querySelectorAll('.listProducts__list ul .hidden');

  // Ocultar todos os itens que excedem o número por página
  hiddenItems.forEach((item, index) => {
    if (index >= itensByPge && item instanceof HTMLElement) {
      item.style.display = 'none';
    }
  });

  // Mostrar mais itens quando o botão "Load More" for clicado
  loadMoreBtn.addEventListener('click', function () {
    hiddenItems.forEach((item, index) => {
      if (index >= itensByPge) {
        return;
      }
      if (item instanceof HTMLElement) {
        item.style.display = ''; // Mostrar item
        item.classList.remove('hidden');
      }
    });

    showBtnLoadMore(loadMoreBtn)
  });
}

function getListCart() {
  fetchCart()
    .then((res) => {
      let qtdProducts = res.length;

      let iconCartdocument = document.querySelector('.header__cart')
      iconCartdocument.innerHTML = `
        <div class="qtd__products">${qtdProducts}</div>
      `;

      if (res.length) {

        let listCart = document.querySelector('.carrinho ul')
        listCart.innerHTML = "";

        res.map(product => {
          let li = document.createElement('li')
          let price = "";

          price = Number(product.price).toLocaleString('pt-BR', formato);

          li.innerHTML = `
            <img src="${product.image}" alt="${product.name}" />
            <div class="carrinho__info">
              <h3 class="carrinho__titulo">${product.name}</h3>
              <p class="carrinho__price">${price}</p>

              <div class="carrinho__seletor">
              <input type="text" min="1" value="${product.qtd}" disabled />
              </div>
            </div>
            <span class="carrinho__remove" data-id="${product.id}">
              <img src="/img/remove.png" alt="Remover produto" data-id="${product.id}" />
            </span>
          `;

          listCart.append(li)
          removeCart(product.id);
        })

      } else {
        let listCart = document.querySelector('.carrinho ul')
        listCart.innerHTML = "<li class='carrinho__empty'>Carrinho vazio.</li>";
      }
    })
    .catch(error => {
      console.error('Erro na solicitação do Cart:', error);
    });
}

function openCart() {
  let btnComprar = document.querySelectorAll('.btn-comprar,.header__cart')

  btnComprar.forEach(btn => {
    btn.addEventListener('click', function () {
      let cart = document.querySelector('.carrinho');
      if (cart instanceof HTMLElement) {
        cart.classList.toggle('ativo');
      }

      let overlay = document.querySelector('.carrinho__overlay')
      if (overlay instanceof HTMLElement) {
        overlay.style.display = "block";
      }
    });
  });
}

function closeCart() {
  let close = document.querySelector('.carrinho__close');

  close.addEventListener('click', function () {
    let cart = document.querySelector('.carrinho');
    cart.classList.remove('ativo')

    let overlay = document.querySelector('.carrinho__overlay')
    if (overlay instanceof HTMLElement) {
      overlay.style.display = "none";
    }
  })
}

function addCart(data: object) {

  interface CartResponse {
    id: string;
    name: string;
    price: number;
    parcelamento: Array<number>;
    color: string;
    image: string;
    size: Array<string>;
    date: string;
    qtd: string;
  }

  interface RequestOptions {
    method: string;
    headers: {
      [key: string]: string;
    };
    body?: string;
  }

  const options: RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  fetch(serverCartUrl, options)
    .then((response: Response) => {
      if (!response.ok) {
        throw new Error('Ocorreu um erro ao enviar os dados.');
      }
      return response.json() as Promise<CartResponse>;
    })
    .then((data: CartResponse) => {
      console.log('Dados enviados com sucesso:', data);

      getListCart();
    })
    .catch((error: Error) => {
      console.error('Erro ao enviar os dados:', error);
      alteraQuantidade(data);
    });

}

function alteraQuantidade(data: any) {

  let id = data.id
  let qtd = ""

  fetchCart()
    .then((res) => {
      if (res.length) {

        res.map(product => {
          if (Number(product.id) === Number(id)) {
            qtd = String(Number(data.qtd) + Number(product.qtd))

            const updateData = {
              qtd
            };

            const requestOptions = {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updateData)
            };

            fetch(`${serverCartUrl}/${id}`, requestOptions)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Ocorreu um erro ao atualizar o produto.');
                }
                return response.json();
              })
              .then(data => {
                getListCart();
                console.log('Produto atualizado com sucesso:', data);
              })
              .catch(error => {
                console.error('Erro ao atualizar o produto:', error);
              });
          }
        })
      }
    })
}

function removeCart(id: string) {
  const url = `${serverCartUrl}/${id}`;
  let remover = document.querySelectorAll('.carrinho__remove');

  remover.forEach(produto => {
    produto.addEventListener('click', function (e) {
      const target = e.target as HTMLElement;
      const dataset = target.dataset;

      if (dataset.id === id) {
        fetch(url, {
          method: 'DELETE'
        }).then(response => {
          if (!response.ok) {
            throw new Error('Erro ao excluir o produto.');
          }

          getListCart();

          console.log('Produto excluído com sucesso.');

          setTimeout(function () {
            alert('Produto removido com sucesso!');
          }, 1000)

        }).catch(error => {
          console.error('Erro ao enviar solicitação DELETE:', error);
        });
      }
    })
  })

}

const cart = () => {
  getListCart();
  openCart();
  closeCart();

  let btnComprar = document.querySelectorAll('.btn-comprar')

  btnComprar.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const target = e.target as HTMLElement;
      const dataset = target.dataset;

      let id = dataset.id.replace(/"/g, '');
      const name = dataset.name;
      const price = dataset.price;
      const image = dataset.image;

      let data = {
        id,
        name,
        price,
        image,
        qtd: '1'
      }

      addCart(data);
    });
  });
}

function openMoreColor() {
  const colors = document.querySelectorAll('.filter__item--color li');

  colors.forEach((cor, index) => {
    if (index >= 4) {
      if (cor instanceof HTMLElement) {
        cor.style.display = 'none';
      }
    }
  });

  const more = document.querySelector('.filter__more');
  more.addEventListener('click', function () {
    colors.forEach((cor, index) => {
      if (index >= 4) {
        if (cor instanceof HTMLElement) {
          cor.style.display = 'block';
        }
      }
    });
    more.remove();
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

