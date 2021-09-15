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



// Criação das barreiras que irão aparecer na tela do jogo
function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares =[
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    // velocidade da animacao
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando um elemento sair da area do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            // valida se o passaro cruzou a abertura
            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

// insere o passaro como elemento
function Passaro(alturaJogo){
    let voando = false
    
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    // seta e pega a posicao do passaro
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    // teclas de comando de gameplay
    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    // animar o passaro
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        // impede que o passaro passe das bordas
        if(novoY <= 0){
            this.setY(0)
        }else if (novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo/2)
}

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos =>{
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// verifica sobreposicao
function estaoSobrepostos(elementoA, elementoB){
    // Retangulo associado ao elementoA e ao elementoB
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    // verifica se o lado direito de a colide com o lado esquerdo de b e vice versa
    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left
    // verifica se embaixo de a colide com em cima de b e vice versa
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical      
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(ParDeBarreiras => {
        if(!colidiu){
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento   

            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}


// funcao do jogo em si
function FlappyBird(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()

    // Barreiras(altura, largura, abertura, espaçoEntreBarreiras)
    const barreiras = new Barreiras(altura, largura, 250, 400, 
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () =>{
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()