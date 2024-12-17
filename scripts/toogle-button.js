class ToggleButton extends HTMLElement {
  constructor() {
    super(); // Necesario al extender HTMLElement
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(this.styleLink);

    // Crear el contenedor principal
    this.container = document.createElement("div");
    this.container.classList.add("container");

    // Crear el toggle
    const toggleDiv = document.createElement("div");
    toggleDiv.classList.add("toggle");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox"; // Tipo válido para un toggle
    checkbox.classList.add("checkbox");

    const button = document.createElement("span");
    button.classList.add("button");

    const label = document.createElement("span");
    label.classList.add("label");
    
    // Usar el atributo text-content inicial
    label.textContent = this.getAttribute("text-content") || "Default"; // Asegúrate de usar un valor predeterminado

    // Construcción del DOM
    toggleDiv.appendChild(checkbox);
    toggleDiv.appendChild(button);
    toggleDiv.appendChild(label);

    this.container.appendChild(toggleDiv);
    shadow.appendChild(this.container);
    
    // Guardar el label para futuras actualizaciones
    this.label = label;
  }

  // Hacer que el componente observe el atributo text-content
  static get observedAttributes() {
    return ["text-content"];
  }

  // Actualizar el texto del label cuando el atributo cambie
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "text-content") {
      this.updateLabelText(newValue);
    }
  }

  // Método para actualizar el texto del label
  updateLabelText(newText) {
    if (this.label) {
      this.label.textContent = newText || "Default";
    }
  }

  get styleLink() {
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = "/css/button.css"; // Ruta al CSS
    return styleLink;
  }
}

// Registrar el custom element
customElements.define("toggle-button", ToggleButton);
