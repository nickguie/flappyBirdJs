// Cria um elemento novo
function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

// Adiciona Barreira
function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')

    // cria os elementos div (borda e corpo)
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    // valida se vai adicionar primeiro o corpo ou a borda
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    // define a altura
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// const b = new Barreira(true)
// b.setAltura(200)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

// cria o par de barreiras
function ParDeBarreiras(altura, abertura, x){
    this.elemento=novoElemento('div', 'par-de-barreiras')

    // instancia e cria a barreira normal e a barreira reversa
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    this.elemento.appendChild(this.superior.elemento) 
    this.elemento.appendChild(this.inferior.elemento) 

    // Define aleatóriamente a posição da abertura entre as barreiras
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    } 

    // seta e coleta a posição das barreiras define a largura
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParDeBarreiras(700, 400, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

// Criação das barreiras que irão aparecer na tela do jogo
function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares =[
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando um elemento sair da area do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

const barreiras = new Barreiras(700, 1100, 400, 400)
const areaDoJogo = document.querySelector('[wm-flappy]')
barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
setInterval(() => {
    barreiras.animar()
}, 20)