// Variables
function fetchJSONData() {
    const request = new XMLHttpRequest();
    request.open("GET", "./js/data.json", false);
    request.send(null);
    if (request.status === 200) {
      return JSON.parse(request.responseText);
    } else {
      console.error("Unable to fetch data:", request.statusText);
      throw new Error("Unable to fetch data");
    }
}

function toggler(divId) {
    $("#" + divId).toggle();
}

document.addEventListener('DOMContentLoaded', () => {
    const baseDeDatos = fetchJSONData();
    console.log(baseDeDatos);

    let carrito = [];
    const divisa = '$';
    const DOMitems = document.querySelector('#items');
    const DOMcarrito = document.querySelector('#carrito');
    const DOMItems = document.querySelector('#num-items');
    const miLocalStorage = window.localStorage;

    // Funciones

    /**
    * Dibuja todos los productos a partir de la base de datos. No confundir con el carrito
    */
    function renderizarProductos() {
        baseDeDatos.forEach((info) => {
            // Estructura
            const miNodo = document.createElement('div');
            miNodo.classList.add('col', 'mb-5');
            // Body
            const miNodoCard = document.createElement('div');
            miNodoCard.classList.add('card','h-100');
            // Imagen
            const miNodoImagen = document.createElement('img');
            miNodoImagen.classList.add('card-img-top');
            miNodoImagen.setAttribute('src', info.imagen);
            // Body
            const miNodoCardBody = document.createElement('div');
            miNodoCardBody.classList.add('card-body','p-4','text-center');
            // Titulo
            const miNodoTitle = document.createElement('h5');
            miNodoTitle.classList.add('card-title', 'fw-bolder');
            miNodoTitle.textContent = info.nombre;
            
            // Precio
            const miNodoPrecio = document.createElement('p');
            miNodoPrecio.classList.add('card-text');
            miNodoPrecio.textContent = `${divisa}${info.precio}`;
            // Boton
            const miNodoBoton = document.createElement('button');
            miNodoBoton.classList.add('btn', 'btn-outline-dark','mt-auto');
            miNodoBoton.textContent = 'Agregar al Carrito';
            miNodoBoton.setAttribute('marcador', info.id);
            miNodoBoton.addEventListener('click', anyadirProductoAlCarrito);
            // Insertamos
            miNodoCardBody.appendChild(miNodoTitle);
            miNodoCardBody.appendChild(miNodoPrecio);
            miNodoCard.appendChild(miNodoImagen);
            miNodoCard.appendChild(miNodoCardBody);
            miNodoCard.appendChild(miNodoBoton);
            miNodo.appendChild(miNodoCard);
            DOMitems.appendChild(miNodo);
        });
    }

    /**
    * Evento para añadir un producto al carrito de la compra
    */
    function anyadirProductoAlCarrito(evento) {
        // Anyadimos el Nodo a nuestro carrito
        carrito.push(evento.target.getAttribute('marcador'))
        // Actualizamos el carrito
        renderizarCarrito();
        // Actualizamos el LocalStorage
        guardarCarritoEnLocalStorage();
    }

    /**
    * Dibuja todos los productos guardados en el carrito
    */
    function renderizarCarrito() {
        // Vaciamos todo el html
        DOMcarrito.textContent = '';
        // Quitamos los duplicados
        const carritoSinDuplicados = [...new Set(carrito)];
        // Generamos los Nodos a partir de carrito
        carritoSinDuplicados.forEach((item) => {
            // Obtenemos el item que necesitamos de la variable base de datos
            const miItem = baseDeDatos.filter((itemBaseDatos) => {
                // ¿Coincide las id? Solo puede existir un caso
                return itemBaseDatos.id === parseInt(item);
            });
            // Cuenta el número de veces que se repite el producto
            const numeroUnidadesItem = carrito.reduce((total, itemId) => {
                // ¿Coincide las id? Incremento el contador, en caso contrario no mantengo
                return itemId === item ? total += 1 : total;
            }, 0);
            // Creamos el nodo del item del carrito
            const miNodo = document.createElement('li');
            miNodo.classList.add('dropdown-item', 'text-right', 'mx-15');
            miNodo.textContent = `${numeroUnidadesItem} x ${miItem[0].nombre} - ${divisa}${miItem[0].precio}`;
            // Boton de borrar
            const miBoton = document.createElement('button');
            miBoton.classList.add('btn', 'btn-outline-dark', 'mx-3');
            miBoton.textContent = 'X';
            miBoton.style.marginLeft = '1rem';
            miBoton.dataset.item = item;
            miBoton.addEventListener('click', borrarItemCarrito);
            // Mezclamos nodos
            miNodo.appendChild(miBoton);
            DOMcarrito.appendChild(miNodo);
        });
        const divider = document.createElement('li');
        divider.classList.add('dropdown-divider');
        DOMcarrito.appendChild(divider);
        
        const total = document.createElement('li');
        const totalp = document.createElement('p');
        totalp.classList.add('dropdown-item','text-right');
        totalp.textContent = `Total: $ ${calcularTotal()}`;
        total.appendChild(totalp);
        DOMcarrito.appendChild(total);

        const vaciar = document.createElement('li');
        const vaciarBtn = document.createElement('button');
        vaciarBtn.id = 'boton-vaciar'
        vaciarBtn.classList.add('btn','btn-outline-dark','dropdown-item');
        vaciarBtn.textContent = `Vaciar`;
        vaciar.appendChild(vaciarBtn);
        DOMcarrito.appendChild(vaciar);
        
        DOMItems.textContent = carrito.length; 
        
        vaciarBtn.addEventListener('click', vaciarCarrito);

        // Renderizamos el precio total en el HTML
        //DOMtotal.textContent = calcularTotal();
    }

    /**
    * Evento para borrar un elemento del carrito
    */
    function borrarItemCarrito(evento) {
        // Obtenemos el producto ID que hay en el boton pulsado
        const id = evento.target.dataset.item;
        // Borramos todos los productos
        carrito = carrito.filter((carritoId) => {
            return carritoId !== id;
        });
        // volvemos a renderizar
        renderizarCarrito();
        // Actualizamos el LocalStorage
        guardarCarritoEnLocalStorage();

    }

    /**
     * Calcula el precio total teniendo en cuenta los productos repetidos
     */
    function calcularTotal() {
        // Recorremos el array del carrito
        return carrito.reduce((total, item) => {
            // De cada elemento obtenemos su precio
            const miItem = baseDeDatos.filter((itemBaseDatos) => {
                return itemBaseDatos.id === parseInt(item);
            });
            // Los sumamos al total
            return total + miItem[0].precio;
        }, 0).toFixed(0);
    }

    /**
    * Varia el carrito y vuelve a dibujarlo
    */
    function vaciarCarrito() {
        // Limpiamos los productos guardados
        carrito = [];
        // Renderizamos los cambios
        renderizarCarrito();
        // Borra LocalStorage
        localStorage.clear();

    }

    function guardarCarritoEnLocalStorage () {
        miLocalStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function cargarCarritoDeLocalStorage () {
        // ¿Existe un carrito previo guardado en LocalStorage?
        if (miLocalStorage.getItem('carrito') !== null) {
            // Carga la información
            carrito = JSON.parse(miLocalStorage.getItem('carrito'));
        }
    }

    // Inicio
    cargarCarritoDeLocalStorage();
    renderizarProductos();
    renderizarCarrito();
});