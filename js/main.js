
class Producto { //clase constructora de productos
  constructor(id, nombre, precio, descripcion, cantidad, tipo, imagen) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.cantidad = cantidad;
    this.tipo = tipo;
    this.imagen = imagen;
  };

  vender() { //metodo para descontar producto cada vez que se venda
    if (this.cantidad >= 1) {
      this.cantidad -= 1;
    }
  }

  reponer(cantidadAReponer) { // metodo para cargar mas productos
    this.cantidad = this.cantidad + cantidadAReponer;
  }

};

const productos = async () => { //funcion para traer los productos de un JSON
  try {
    const response = await fetch("./json/productos.json");
    const data = await response.json();
    let productos = data.map(item => { //se pasan los productos del JSON por la clase contructora
      const { id, nombre, precio, descripcion, cantidad, tipo, imagen } = item;
      return new Producto(id, nombre, precio, descripcion, cantidad, tipo, imagen);
    });
    return productos
  }
  catch (error) { // mesaje de error si no se puede cargar correctamente el JSON
    document.body.innerHTML = `
    <div class="errorCarga">
      <h1>Nala - Wine Bar</h1>
      <p>Error al cargar la pagina</p>
    </div>`;
  }
};

const usuarios = async () => { //funcion para traer a los usuarios ya cargados en un JSON
  try {
    const response = await fetch("./json/usuarios.json");
    const data = await response.json();
    return data
  }
  catch (error) {  // mesaje de error si no se puede cargar correctamente el JSON
    document.body.innerHTML = `
    <div class="errorCarga">
      <h1>Nala - Wine Bar</h1>
      <p>Error al cargar la pagina</p>
    </div>`;
  }
}

//declaracion de variables
let container = document.getElementById("container");
const listaDeUsuarios = JSON.parse(localStorage.getItem("usuarios")) || await usuarios(); // si hay usuarios guardados en localStorage los carga sino carga los de la funcion
let pagIniciarSesion = document.getElementById("iniciarSesion");
const usuarioIniciado = JSON.parse(localStorage.getItem("usuarioIniciado")) || []; // si algun usuario inicio sesion lo carga  
let pagCrearCuenta = document.getElementById("crearCuenta");
const listaDeProductos = await productos(); // carga los productos de la funcion
let pagProductos = document.getElementById("productos");
const carrito = JSON.parse(localStorage.getItem("carrito")) || []; // si hay productos guardados en carrito en el localStorage los guarda 
let pagCarritoDeCompras = document.getElementById("carritoDeCompras");
let contadorCarrito = document.getElementById("contadorCarrito");
contadorCarrito.innerHTML = carrito.length; //muestra la cantidad de productos en el carrito 

const admin = (productos) => { // funcion si el usuario es administrador del e-commerce

  let paginas = document.getElementById("paginas");
  paginas.innerHTML = `
  <a href="#panelAdministrador" id="panelAdministrador">Panel Administrador</a>`;
  let panelAdministrador = document.getElementById("panelAdministrador");

  const evento = () => { // funcion para mostrar productos para reponer stock
    container.innerHTML = "";
    let titulo = document.createElement("h1");
    titulo.innerHTML = "Panel Administrador";
    container.append(titulo);
    let menorAMayor = productos.sort((a, b) => a.cantidad - b.cantidad) // ordena de menor a mayor segun la cantidad de productos
    menorAMayor.forEach((item) => {
      let div = document.createElement("div");
      div.className = "card-admin";
      div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}">
        <h2>${item.nombre}</h2>
        <p>Cantidad: ${item.cantidad}</p>
        <div>
        <input type="number" name="cantidadReponer-${item.nombre}-${item.id}" id="cantidadReponer-${item.nombre}-${item.id}" min="1" max="10" value="1">
        <button type="button" id="btn-${item.nombre}-${item.id}">Reponer</button>
        </div>
      `;
      container.append(div);

      let cantidadReponer = document.getElementById(`cantidadReponer-${item.nombre}-${item.id}`);
      let botonCantidadReponer = document.getElementById(`btn-${item.nombre}-${item.id}`);

      const reponer = () => { // funcion para reponer stock
        item.reponer(parseInt(cantidadReponer.value))
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-right',
          iconColor: 'white',
          customClass: {
            popup: 'colored-toast'
          },
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        })
        Toast.fire({
          icon: 'success',
          title: `Se agrego ${cantidadReponer.value} ${item.nombre} al stock`
        });
      };

      botonCantidadReponer.addEventListener("click", reponer) // evento para reponer stock
    });
  };

  panelAdministrador.addEventListener("click", evento) // evento para mostrar los productos

}

const iniciarSesion = () => { //funcion para iniciar sesion
  container.innerHTML = "";
  let div = document.createElement("div"); // formulario de inicio de sesion
  div.id = "formIniciarSesion";
  div.innerHTML = `
  <h1>Iniciar Sesion</h1>
  <form>
  <input type="text" class="usuarioIS" id="usuarioIS" placeholder="Usuario:">
  <input type="password" class="passwordIS" id="passwordIS" placeholder="Contraseña:">
  <button type="submit" class="submitIS" id="submitIS">Iniciar sesion</button>
  </form>
  `;
  container.append(div);

  let submitIS = document.getElementById("submitIS")
  let usuarioIS = document.getElementById("usuarioIS")
  let passwordIS = document.getElementById("passwordIS")

  const evento = (e) => { //funcion para pasar en los eventos para poder iniciar sesion
    e.preventDefault()
    let usuarioValido = false

    listaDeUsuarios.forEach((item) => {
      if (usuarioIS.value === item.usuario && passwordIS.value === item.contraseña) { // validacion de usuario y contraseña
        div.innerHTML = `<h1>Bienvenido nuevamente ${item.nombre}`;
        usuarioIniciado.push(item);
        localStorage.setItem("usuarioIniciado", JSON.stringify(usuarioIniciado)) // se carga el usuario en el localStorage
        usuarioValido = true;
      }
    });

    if (usuarioValido) { // si el usuario es correcto
      usuarioIniciado[0].admin
        ? (admin(listaDeProductos),
          cerrarSesion()) //si el usuario es administrador inicia la funcion de administrador
        : setTimeout(() => { // si el usuario no es administrador recarga la pagina
          location.reload()
        }, 3000)
    } else { // si el usuario es incorrecto
      div.innerHTML = `
      <h1>Usuario o contraseña incorrecta</h1>
      <p>Vuelve a intentar</p>`;
      setTimeout(iniciarSesion, 3000)
    }
  };

  submitIS.addEventListener("click", evento); // evento para confirmar el inicio de sesion 
  passwordIS.addEventListener("keyup", (e) => { // evento para confirmar el inicio de sesion
    if (event.key === "Enter") {
      evento(e);
    }
  })
}

const cerrarSesion = () => { // funcion para cerrar sesion
  if ("usuarioIniciado" in localStorage) { // si hay una sesion iniciada
    let usuario = document.getElementById("usuario");
    usuario.innerHTML = "";
    let nombre = document.createElement("a");
    nombre.innerHTML = `${usuarioIniciado[0].nombre}`; //se agrega el nombre del usuario 
    let separador = document.createElement("p");
    separador.innerHTML = " | "
    let cerrar = document.createElement("button");
    cerrar.innerHTML = "CERRAR SESION"; // se agrega la opcion de cerrar sesion
    usuario.append(nombre);
    usuario.append(separador);
    usuario.append(cerrar);
    cerrar.addEventListener("click", () => { //evento para cerrar session
      localStorage.removeItem("usuarioIniciado");
      container.innerHTML = `<h2>Sesion cerrada con exito</h2>`
      setTimeout(() => {
        location.reload()
      }, 1000);
    })
  }
}

const crearCuenta = () => { // funcion para crear cuenta nueva
  container.innerHTML = "";
  let div = document.createElement("div");
  div.id = "formCrearCuenta"; // formulario para la creacion de una cuenta
  div.innerHTML = `
  <h1>Crear Cuenta</h1>
  <form>
  <input type="text" class="nombreCC" id="nombreCC" placeholder="Nombre y Apellido:">
  <input type="text" class="usuarioCC" id="usuarioCC" placeholder="Usuario:">
  <input type="password" class="passwordCC" id="passwordCC" placeholder="Contraseña:">
  <button type="submit" class="submitCC" id="submitCC">Crear Cuenta</button>
  </form>
  `;
  container.append(div);


  let submitCC = document.getElementById("submitCC")
  let nombreCC = document.getElementById("nombreCC")
  let usuarioCC = document.getElementById("usuarioCC")
  let passwordCC = document.getElementById("passwordCC")

  const evento = (e) => { // funcion para pasar en el evento para crear cuenta
    e.preventDefault()
    let usuarioInvalido = false
    listaDeUsuarios.forEach((item) => {
      if (usuarioCC.value === item.usuario) { // condicional para que no se repita el usuario
        div.innerHTML = `
      <h1>Usuario no valido</h1>
      <p>Vuelve a intentar</p>`;
        usuarioInvalido = true;
      }
    });
    if (usuarioInvalido) { // si el usuario es invalido se recarga la funcion
      setTimeout(crearCuenta, 3000)
    } else { // si el usuario es valido
      const nombreApellido = nombreCC.value.split(" "); // se crea un arreglo con el nombre y apellido
      const palabrasCapitalizadas = nombreApellido.map((palabra) => { //se capitaliza el nombre
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      });
      const nombreEnMayuscula = palabrasCapitalizadas.join(" "); // se crea una cadena con el nombre y apellido capitalizados
      let nuevoUsuario = { nombre: `${nombreEnMayuscula}`, usuario: `${usuarioCC.value}`, contraseña: `${passwordCC.value}`, admin: false } // se crea el nuevo usuario
      listaDeUsuarios.push(nuevoUsuario) // se añade a la lista de usuarios
      localStorage.setItem("usuarios", JSON.stringify(listaDeUsuarios)) // se actualiza la lista de usuarios en el localStorage
      div.innerHTML = `
      <h1>Cuenta creada con exito</h1>
      <p>Ya Puedes iniciar sesion`;
      setTimeout(() => { // se envia al usuario a que inicie sesion
        iniciarSesion()
      }, 3000)
    };
  };

  submitCC.addEventListener("click", evento) // evento para poder crear la cuenta
}

const card = (item) => { // funcion para la creacion de las cartas de los productos
  if (item.cantidad === 0) { // productos sin stock
    let nombre = item.nombre.split(" ").join("");
    let div = document.createElement("div");
    div.setAttribute("id", `${nombre}-${item.id}`);
    div.className = "card-producto-sinStock";
    div.innerHTML = `
    <img src="${item.imagen}" alt="${item.nombre}">
    <div>
      <h2>${item.nombre} Sin Stock</h2>
    </div>
  `;
    container.append(div);
  } else { // productos con stock
    let nombre = item.nombre.split(" ").join("");
    let div = document.createElement("div");
    div.setAttribute("id", `${nombre}-${item.id}`);
    div.className = "card-producto";
    div.innerHTML = `
    <img src="${item.imagen}" alt="${item.nombre}">
    <h2>${item.nombre}</h2>
    <p>Precio: $${item.precio}</p>
    <div>
      <input type="number" name="cantidadCompra-${nombre}-${item.id}" id="cantidadCompra-${nombre}-${item.id}" min="1" max="10" value="1">
      <button type="button" id="btn-${nombre}-${item.id}">Agregar al carrito</button>
    </div>
  `;
    container.append(div);

    let botonAgregarCarrito = document.getElementById(`btn-${nombre}-${item.id}`);
    let cantidadCompra = document.getElementById(`cantidadCompra-${nombre}-${item.id}`)

    const agregadoAlCarrito = () => { //funcion para pasar en el evento de agregar al carrito
      for (let i = 1; i <= cantidadCompra.value; i++) {// bucle para cargar la cantidad seleccionada del producto al carrito
        carrito.push(item)
        localStorage.setItem("carrito", JSON.stringify(carrito))
        contadorCarrito.innerHTML = carrito.length;
      }
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-right',
        iconColor: 'white',
        customClass: {
          popup: 'colored-toast'
        },
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      })
      Toast.fire({
        icon: 'success',
        title: `Se agrego ${cantidadCompra.value} ${item.nombre} al carrito`
      })
    }
    botonAgregarCarrito.addEventListener("click", agregadoAlCarrito); // evento para agregar al carrito el producto seleccionado
  }
}

const mostrarTodosLosProductos = (productos) => { //funcion para mostrar todos los productos en la seccion de productos
  container.innerHTML = "";
  let divTitulo = document.createElement("div");
  divTitulo.className = "productos";
  let titulo = document.createElement("h1");
  titulo.innerHTML = "Productos";
  let categoria = document.createElement("select");
  categoria.innerHTML = `
  <option value="Todos">Todas las categorias</option>
  <option value="Fernet Branca">Fernet</option>
  <option value="Gin Beefeater">Gin</option>
  <option value="José Cuervo">Tequila</option>
  <option value="Vodka Absolut">Vodka</option>
  <option value="Johnnie Walker - Blue Label" ; "Johnnie Walker - Red Label">Whisky</option>
  `;
  divTitulo.append(titulo);
  divTitulo.append(categoria);
  container.append(divTitulo);

  productos.forEach((item) => {
    card(item);
  });

  categoria.addEventListener("change", () => {
    let categoriaSeleccionada = categoria.value;
    container.innerHTML = "";
    divTitulo.append(titulo);
    divTitulo.append(categoria);
    container.append(divTitulo);

    if (categoriaSeleccionada === "Todos") {
      productos.forEach((item) => {
        card(item);
      });
    } else {
      const productosFiltrados = productos.filter((item) => item.tipo === categoriaSeleccionada);
      productosFiltrados.forEach((item) => {
        card(item);
      });
    }
  });


}

const filtroDeProductos = (productos) => { //funcion para filtrar los productos que este buscando el usuario
  let botonBuscador = document.getElementById("botonBuscador");
  let inputBuscador = document.getElementById("inputBuscador");


  const filtrar = () => { // funcion de filtrado para pasar en el evento
    container.innerHTML = ""

    let filtro = productos.filter(item => // filtro para cargar el producto que este buscando el usuario
      Object.values(item).some(value => typeof value === "string" && value.toLowerCase().includes(inputBuscador.value.toLowerCase())) // expresion para verificar que lo que ingreso el usuario este en alguno de los valores del objeto(producto)
    );
    if (filtro.length > 0) { // si se encontro algun producto lo muestra
      let div = document.createElement("div");
      div.className = "productosEncontrados"
      div.innerHTML = `
      <h1>Resultados de la busqueda</h1>
      <h2>${inputBuscador.value.toUpperCase()}`;
      container.append(div)
      filtro.forEach((item) => {
        card(item);
      });
    } else { // si no se encontro algun producto muestra mensaje
      let div = document.createElement("div");
      div.className = "noProducto";
      div.innerHTML = `<h2>No se encuentra disponible el producto "${inputBuscador.value}".</h2>`;
      container.append(div);
    }
  }

  botonBuscador.addEventListener("click", filtrar) //evento para iniciar la busqueda del producto
  inputBuscador.addEventListener("keyup", () => { //evento para iniciar la busqueda del producto
    if (event.key === "Enter") {
      filtrar();
    }
  })
}

const carritoCompras = () => { //funcion para mostrar los productos cargados en el carrito
  container.innerHTML = "";
  let titulo = document.createElement("h1")
  titulo.innerHTML = "Carrito De Compras";
  container.append(titulo);
  let productosEnCarrito = {};
  let total = 0;

  const mostrarProductoEnCarrito = (item) => { // funcion para guardar los productos que se repiten como uno solo
    if (!productosEnCarrito[item.id]) {
      productosEnCarrito[item.id] = {
        producto: item,
        cantidad: 1,
        subtotal: item.precio,
      };
    } else {
      productosEnCarrito[item.id].cantidad++; // suma la cantidad de productos repetidos
      productosEnCarrito[item.id].subtotal += item.precio; // suma del precio de productos repetidos
    }
  };

  carrito.forEach((item) => {
    mostrarProductoEnCarrito(item);
  });


  if (carrito.length > 0) { // si el carrito tiene algun producto
    for (let id in productosEnCarrito) { // itera sobre los productos guardados sin repetir
      let productoEnCarrito = productosEnCarrito[id];
      let div = document.createElement("div");
      div.className = "card-carrito"; // se crea la card de los productos en el carrito
      div.innerHTML = `
        <img src="${productoEnCarrito.producto.imagen}" alt="${productoEnCarrito.producto.nombre}">
        <h2>${productoEnCarrito.producto.nombre}</h2>
        <p>Cantidad: ${productoEnCarrito.cantidad}</p>
        <p>Subtotal: $${productoEnCarrito.subtotal}</p>
      `;
      container.append(div);
      total += productoEnCarrito.subtotal; //se suman todos los subtotales
    }

    let divTotal = document.createElement("div");
    divTotal.className = "total-carrito"; // muestra el total
    divTotal.innerHTML = `
    <h2>Total: $${total}</h2>
  `;
    container.append(divTotal);

    let divBotonesCarrito = document.createElement("div");
    divBotonesCarrito.className = "btn-carrito"; // muestra botones de final y eliminar 
    divBotonesCarrito.innerHTML = `
  <button class="finalizarCompra" id="btn-finalizarCompra">Finalizar compra</button>
  <button class="eliminarCarrito" id="btn-eliminarCarrito">Vaciar Carrito</button>`
    container.append(divBotonesCarrito);

    let finalizarCompra = document.getElementById("btn-finalizarCompra");
    let eliminarCarrito = document.getElementById("btn-eliminarCarrito")

    finalizarCompra.addEventListener("click", () => { //evento para la finalizacion de la compra
      usuarioIniciado[0]
        ? // si el usuario inicio session
        (Swal.fire({ // mensaje de la finalizacion de la compra
          position: 'center',
          icon: 'success',
          title: 'Gracias por su compra. En breve recibira con mail con la confirmacion',
          showConfirmButton: false,
          timer: 3000,
          color: 'rgb(193, 176, 162)',
          customClass: {
            confirmButton: 'btn-confirmacion',
          }
        }),
          carrito.forEach((item) => { // se utiliza el metodo vender del producto
            item.vender();
          }),
          localStorage.removeItem("carrito"), // se elimina el carrito
          setTimeout(() => { // se recarga la pagina 
            location.reload()
          }, 3000)
        )
        : // si el usuario no inicio sesion
        (Swal.fire({ // mensaje de la finalizacion de la compra
          position: 'center',
          icon: 'warning',
          title: 'Debes iniciar sesion para finalizar la compra',
          showConfirmButton: false,
          timer: 3000,
          color: 'rgb(193, 176, 162)'
        }),
          setTimeout(() => { // se envia al usuario a iniciar sesion
            iniciarSesion()
          }, 3000)
        )
    });

    eliminarCarrito.addEventListener("click", () => { //evento para eliminar el carrito
      Swal.fire({ // mensaje de confirmacion para eliminar el carrito
        title: '',
        text: "Seguro que quieres vaciar el carrito?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgb(193, 176, 162)',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, vaciar carrito '
      }).then((result) => {
        if (result.isConfirmed) { // si confirma se elimina el carrito
          localStorage.removeItem("carrito")
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Su carrito ha sido vaciado con exito.',
            timer: 3000,
            showConfirmButton: false,
            color: 'rgb(193, 176, 162)',
          })
          setTimeout(() => { // se recarga la pagina 
            location.reload()
          }, 3000);
        };
      });
    });
  } else { // si el carrito no tiene productos
    container.innerHTML = `
        <h1>Carrito de compras</h1>
        <p>El carrito esta vacio</p>`;
  }
}

const iniciarPagina = () => { // funcion para iniciar la pagina y llamar a las funciones
  const iniciar = () => { 
    localStorage.setItem("usuarios", JSON.stringify(listaDeUsuarios)); // se cargan los usuarios en el localStorage
    cerrarSesion();
    filtroDeProductos(listaDeProductos);
    pagCrearCuenta.addEventListener("click", crearCuenta);
    pagProductos.addEventListener("click", () => mostrarTodosLosProductos(listaDeProductos));
    pagCarritoDeCompras.addEventListener("click", carritoCompras);
    pagIniciarSesion.addEventListener("click", iniciarSesion);
  }
  if ("usuarioIniciado" in localStorage) {
    usuarioIniciado[0].admin
      ? (admin(listaDeProductos),
        cerrarSesion())
      : iniciar()
  } else {
    iniciar()
  }
}

iniciarPagina(); // llamada a la funcion para iniciar la pagina