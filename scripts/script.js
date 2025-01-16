class Grammar {
  lesson = null;

  constructor({ cardStudy, params = new Params(), actualizableLinks,mainTitle }) {
    this.cardStudy = cardStudy;
    this.params = params;
    this.actualizableLinks = actualizableLinks
    this.mainTitleElement = mainTitle
  }
  async getDataFile(){
    const url = "/data/glosario.json"
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar los datos");
      const data = await response.json();
      this.dataFile = data
    } catch (error) {
      console.error("Error en getGrammar:", error);
    }
  }
  async getGrammar(data) {
    try {
      this.data = await data;
      const lesson = Object.keys(this.data);
      this.lesson = lesson.map((e)=>({link:e,name:this.data[e].name}))
    } catch (error) {
      console.error("Error en getGrammar:", error);
    }
  }

  get dataLesson() {
    return this.data ? this.data[this.params.lesson] : { list: [] };
  }
  mainMenu(){
    this.actualizeLinks()
  }
  actualizeLinks() {
    this.actualizableLinks.update(this.lesson)
  }
  /**
   * @param {string} newTitle
   */
  set mainTitle(newTitle){
    this.mainTitleElement.textContent = newTitle
  }
  actualizeTitle(){
    if(this.dataLesson.name) {
      const capitalizeTitle = this.dataLesson.name.charAt(0).toUpperCase() + this.dataLesson.name.slice(1).toLowerCase()
      this.mainTitle= capitalizeTitle
      document.title = capitalizeTitle
      return;
    }
    
  }
  actualizeCards() {
    const dataLesson = this.dataLesson;
    if (dataLesson && dataLesson.list) {
      this.cardStudy.data = dataLesson.list
    } else {
      this.cardStudy.data = [{
        front: "No se encontraron datos para la lección.",
        back: "No se encontraron datos para la lección.", color: "red"
      }];
      console.warn("No se encontraron datos para la lección.");
    }
  }

  async start() {
    await this.getGrammar(data);
    if (this.params.lesson=="") return this.mainMenu()
    
    if (this.dataLesson?.list) {
      this.actualizeCards();
      this.actualizeTitle()
    }

  }
}

class Params {
  constructor(params) {
    this.params = params || new URLSearchParams();
  }

  get lesson() {
    return this.params.get("lesson") || "";
  }

  get page() {
    return this.params.get("page") || "1";
  }
}

class ActualizableLinks {
  constructor() {
    this.data = [];
    this.linkList = document.getElementById("linkList");
  }

  update(newData = []) {
    if (!this.linkList) {
      console.error("Elemento linkList no encontrado.");
      return;
    }
    this.data = newData;
    this.updateLinkList();
  }

  updateLinkList() {
    this.linkList.innerHTML = ""; // Limpiar la lista actual
    if (!this.data.length) {
      const listItem = document.createElement("a");
      listItem.classList.add("value")
      listItem.textContent = "No hay datos disponibles.";
      listItem.href = ""
      this.linkList.appendChild(listItem);
      return;
    }
    this.data.forEach(({link,name}) => {
      const listItem = document.createElement("a");
      listItem.classList.add("value")
      listItem.href = `?lesson=${link}`;
      listItem.textContent = name??link;
      this.linkList.appendChild(listItem);
    });
  }
}

// Inicialización
const cardStudy = document.getElementById("card-study");
const mainTitle = document.getElementById("main-title")
const params = new URLSearchParams(window.location.search);
const actualizableLinks = new ActualizableLinks()
const grammar = new Grammar({
  cardStudy,
  params: new Params(params),
  actualizableLinks,
  mainTitle
});
grammar.start();