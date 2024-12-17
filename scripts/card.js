const eventManager = (fn, delay = 3000) => {
  let executing = false; // Bandera para verificar si la función está en ejecución.

  return (...args) => {
    if (!executing) {
      executing = true; // Marca que la función está en ejecución.
      try {
        fn(...args); // Ejecuta la función asíncrona.
      } finally {
        setTimeout(() => (executing = false), delay); // Restablece la bandera después del tiempo especificado.
      }
    }
  };
};

function mezclarArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      // Seleccionar un índice aleatorio entre 0 y i
      const j = Math.floor(Math.random() * (i + 1));

      // Intercambiar los elementos array[i] y array[j]
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

class Card extends HTMLElement {
  isFront = true; // Estado inicial de la tarjeta
  cardsData = []; // Array para almacenar los datos de las tarjetas
  cardElement = [];
  timeToggle = 300;
  maxIndex;
  _currentIndex = 0;
  constructor() {
    super();
    this._currentIndex = 0;
    this.cardElement = [];
    this.cardsData = [];
    const shadow = this.attachShadow({ mode: "open" });

    // Contenedor principal
    this.cardsDiv = document.createElement("div");
    this.cardsDiv.classList.add("cards");
    this.btnsContents = document.createElement("div")

    // Botones personalizados (toggle-button)
    this.toggleCardBtn = document.createElement("button");
    this.toggleCardBtn.classList.add("toggle-button");
    this.toggleCardBtn.classList.add("btn");
    this.isFront = this.storageIsFront
    this.toggleCardBtn.textContent = this.isFront ? "Front" : "Back";
    this.toggleCardBtn.addEventListener("click", () => this.interChangeSideCard());
    this.toggleCardBtn.classList.add("none")

    this.shuffleCardsBtn = document.createElement("button");
    this.shuffleCardsBtn.classList.add("btn");
    this.shuffleCardsBtn.textContent = "shuffle";
    this.shuffleCardsBtn.addEventListener("click",()=>this.shuffleCards())

    this.btnsContents.appendChild(this.toggleCardBtn)
    this.btnsContents.appendChild(this.shuffleCardsBtn)


    // Crear alerta personalizada
    this.alertBox = document.createElement("div");
    this.alertBox.classList.add("alert");
    this.alertBox.style.display = "none"; // Inicialmente oculta

    // Adjuntar elementos al Shadow DOM
    shadow.appendChild(this.styleLink);
    shadow.appendChild(this.btnsContents);
    shadow.appendChild(this.cardsDiv);
    shadow.appendChild(this.alertBox); // Agregar la alerta al Shadow DOM
    this.key();
  }
  next() {
    this.cleanCard()
    this._currentIndex++
    if (this.cardsData.length - 1 < this._currentIndex) this._currentIndex = 0;
    console.log(this._currentIndex);
    this.showCard()
  }
  previous() {
    this.cleanCard()
    this._currentIndex--
    if (this._currentIndex < 0) this._currentIndex = this.cardsData.length - 1
    this.showCard()
  }
  showCard() {
    const thisCard = this.cardElement[this._currentIndex]
    thisCard.selected.on()
    thisCard.card.scrollIntoView({ behavior: "smooth", block: "center" })
  }
  toggleCard() {
    this.cardElement[this._currentIndex].toggleCardContent()
  }
  shuffleCards(){
    this.cardsData = [...mezclarArray(this.cardsData)];
    this.renderCards()
  }
  cleanCard() {
    this.cardElement[this._currentIndex].selected.off();
  }
  // Vincular el archivo CSS externo
  get styleLink() {
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = "css/cards.css"; // Ruta al archivo de estilos
    return styleLink;
  }
  get storageIsFront() {
    const isFront = localStorage.getItem("isFront")
    if (isFront === null) return true
    return isFront === "true";
  }
  set storageIsFront(isFront) {
    return localStorage.setItem("isFront", isFront)
  }
  // Alternar el lado visible de las tarjetas
  interChangeSideCard() {
    this.isFront = !this.isFront;
    this.storageIsFront = this.isFront
    this.toggleCardBtn.textContent = this.isFront ? "Front" : "Back";
    this.renderCards();
  }

  // Crear una tarjeta individual
  createCard({ front, back, color = "red",index }) {
    const card = document.createElement("div");
    let isFront = this.isFront;
    let isSelected = false

    const rechargeColor = () => {
      const colorIfIsSelected = isSelected ? " selected-card" : ""
      const colorIfIsFront = `${color}${isFront ? "" : "-back"}`
      card.className = `card${colorIfIsSelected} ${colorIfIsFront}`
    }
    rechargeColor()
    const selected = {
      on: () => {
        isSelected = true
        rechargeColor()
      },
      off: () => {
        isSelected = false
        rechargeColor()
      }
    }

    const frontCard = document.createElement("p");
    frontCard.classList.add("tip");
    frontCard.textContent = this.isFront ? front : back;

    const copyBtn = document.createElement("button");
    copyBtn.classList.add("copy-btn");
    copyBtn.textContent = "Copy";

    let currentText = this.isFront ? front : back;

    // Envolver la lógica de cambio con eventManager
    const toggleCard = () => {
      isFront = !isFront;
      rechargeColor();
      frontCard.textContent = isFront ? front : back;
      currentText = isFront ? front : back; // Actualiza el texto
    }
    const toggleCardContent = eventManager(toggleCard, this.timeToggle);

    // Cambiar entre el frente y el reverso de la tarjeta
    card.addEventListener("click", toggleCardContent);
    card.addEventListener('mouseenter', () => {
      this.cleanCard()
      this._currentIndex = index
      selected.on()
    });

    // Botón de copiar
    copyBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // Evitar que se active el clic del card al copiar

      // Copiar el texto al portapapeles
      navigator.clipboard.writeText(currentText)
        .then(() => {
          this.showAlert("Texto copiado: " + currentText); // Mostrar la alerta personalizada
        })
        .catch(err => {
          console.error("Error al copiar: ", err);
        });
    });

    card.appendChild(frontCard);
    card.appendChild(copyBtn); // Agregar el botón de copiar

    this.cardElement.push({ card, toggleCardContent, selected, rechargeColor })
    return (card)
  }

  // Renderizar todas las tarjetas
  renderCards() {
    this.cardsDiv.innerHTML = ""; // Limpiar contenedor
    this.cardsData.forEach(({ front, back, color },index) => {
      const card = this.createCard({ front, back, color,index });
      this.cardsDiv.appendChild(card);
    });
    this.key()
  }

  // Asignar datos desde un array
  set data(array) {
    this.cardsData = array; // Guardar datos
    this.toggleCardBtn.classList.remove("none")
    this.renderCards(); // Renderizar tarjetas
    this.cardElement[this._currentIndex].selected.on()
    this.cardElement[this._currentIndex].rechargeColor()
  }

  // Obtener los datos actuales
  get data() {
    return this.cardsData; // Retornar los datos almacenados
  }
  key() {
    // Elimina el antiguo manejador de eventos si existía
    document.removeEventListener('keydown', this._keyHandler);

    // Define y asigna el nuevo manejador de eventos
    this._keyHandler = (event) => {
      // Prevenir siempre el comportamiento predeterminado para la barra espaciadora
      if (event.key === ' ') {
        event.preventDefault();
      }

      // Lógica envuelta en eventManager para controlar el delay
      this._debouncedHandler = this._debouncedHandler || eventManager((debouncedEvent) => {
        if (!this.cardsData.length) return;

        // Manejar las teclas específicas
        switch (debouncedEvent.key) {
          case 'ArrowLeft':
            this.previous();
            break;
          case 'ArrowRight':
            this.next();
            break;
          case ' ': // Barra espaciadora
            this.toggleCard();
            break;
        }
      }, this.timeToggle);

      // Llama al manejador con delay solo para teclas controladas
      this._debouncedHandler(event);
    };

    // Añade el nuevo manejador de eventos
    document.addEventListener('keydown', this._keyHandler);

  }

  // Mostrar la alerta personalizada
  showAlert(message) {
    this.alertBox.textContent = message;
    this.alertBox.style.display = "block"; // Mostrar la alerta

    // Cerrar la alerta después de 3 segundos
    setTimeout(() => {
      this.alertBox.style.display = "none";
    }, 3000);
  }
}

// Registrar el custom element
customElements.define("card-study", Card);
