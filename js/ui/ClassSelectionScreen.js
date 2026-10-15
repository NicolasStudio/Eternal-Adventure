import classes from "../player/classes.js";
import Player  from "../player/Player.js";
import AuthService from "../services/AuthService.js";
import SaveService from "../services/SaveService.js";

export default class ClassSelectionScreen {

    constructor(game) {

        this.game = game;
        this.element = document.getElementById("class-selection-screen");
        this.selectedClass = null;
        this.render();
        this.bindEvents();

    }

    render() {
        this.element.innerHTML = `
            <div class="class-selection">
                <h1 class="class-selection__title">Escolha sua Classe</h1>
                <div class="class-carousel">
                    <button class="class-carousel-arrow class-carousel-prev" aria-label="Classe anterior">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <div class="class-grid">${this.renderCards()}</div>
                    <button class="class-carousel-arrow class-carousel-next" aria-label="Próxima classe">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
                <div id="class-info" class="class-info"><p>Selecione uma classe.</p></div>
                <div class="class-actions">
                    <button id="btn-start" disabled>Começar Aventura</button>
                    <button id="btn-back">Voltar</button>
                </div>
            </div>
        `;
    }

    renderCards() {
        return Object.values(classes).map(character => `
            <div class="class-card" data-class="${character.id}">
                <div class="class-card-portrait">
                    <img src="${character.image}" alt="${character.name}">
                </div>
                <h2>${character.name}</h2>
            </div>
        `).join("");
    }

    bindEvents() {

        this.element
            .querySelector("#btn-start")
            .addEventListener("click", () => {

                if (!this.selectedClass) return;

                this.startAdventure();

            });

        this.element
            .querySelector("#btn-back")
            .addEventListener("click", () => {

                this.game.showScreen("home");

            });

        this.bindCarouselEvents();

    }

    // Carrossel horizontal: as setas rolam uma "página" (90% da largura
    // visível) pra esquerda/direita, e ficam acinzentadas/desabilitadas
    // quando já não há mais o que rolar naquela direção — reavaliado a
    // cada scroll (arrastar com o mouse/trackpad/touch também conta).
    // Também dá pra arrastar o carrossel direto com o mouse (clicar e
    // puxar pros lados), igual um touch — ver bindDragToScroll().
    bindCarouselEvents() {

        this.carouselTrack = this.element.querySelector(".class-grid");
        this.carouselPrev = this.element.querySelector(".class-carousel-prev");
        this.carouselNext = this.element.querySelector(".class-carousel-next");

        if (!this.carouselTrack || !this.carouselPrev || !this.carouselNext) return;

        const scrollByPage = (direction) => {
            this.carouselTrack.scrollBy({ left: direction * this.carouselTrack.clientWidth * 0.9, behavior: "smooth" });
        };

        this.carouselPrev.addEventListener("click", () => scrollByPage(-1));
        this.carouselNext.addEventListener("click", () => scrollByPage(1));

        this.carouselTrack.addEventListener("scroll", () => this.updateCarouselArrows());

        this.bindDragToScroll(this.carouselTrack);

    }

    // #class-selection-screen começa com a classe "hidden" (display:none)
    // — o construtor desta tela roda ANTES do primeiro show(), então
    // clientWidth/scrollWidth do carrossel ainda são 0 nesse momento
    // (elemento sem caixa nenhuma), o que travava as duas setas
    // desabilitadas pra sempre (0 >= 0 - 1 já dá "true"). Por isso
    // precisa recalcular aqui, toda vez que a tela fica visível de
    // verdade, não só uma vez no construtor.
    updateCarouselArrows() {

        if (!this.carouselTrack) return;

        const maxScroll = this.carouselTrack.scrollWidth - this.carouselTrack.clientWidth;

        this.carouselPrev.disabled = this.carouselTrack.scrollLeft <= 1;
        this.carouselNext.disabled = this.carouselTrack.scrollLeft >= maxScroll - 1;

    }

    // Arrastar o carrossel com o mouse (clicar e puxar pros lados) —
    // touch/trackpad já rolam sozinhos (scroll nativo), isso aqui é só
    // pra quem usa mouse. pointerId capturado no próprio track garante
    // que o pointermove/pointerup continuam chegando mesmo se o cursor
    // sair da área do carrossel no meio do arrasto.
    bindDragToScroll(track) {

        let dragging = false;
        let startX = 0;
        let startScrollLeft = 0;
        let dragDistance = 0;

        track.addEventListener("pointerdown", (event) => {

            // Só mouse, e só o botão principal — touch/caneta já rolam
            // sozinhos nativamente (scroll com inércia inclusa); se
            // essa lógica também capturasse o ponteiro do dedo, ia
            // substituir aquele scroll suave por um arrasto linear sem
            // inércia nenhuma, uma piora.
            if (event.pointerType !== "mouse" || event.button !== 0) return;

            dragging = true;
            dragDistance = 0;
            startX = event.clientX;
            startScrollLeft = track.scrollLeft;

            track.classList.add("dragging");
            track.setPointerCapture(event.pointerId);

        });

        track.addEventListener("pointermove", (event) => {

            if (!dragging) return;

            const delta = event.clientX - startX;

            dragDistance = Math.max(dragDistance, Math.abs(delta));
            track.scrollLeft = startScrollLeft - delta;

        });

        const endDrag = (event) => {

            if (!dragging) return;

            dragging = false;
            track.classList.remove("dragging");

            if (track.hasPointerCapture?.(event.pointerId)) {
                track.releasePointerCapture(event.pointerId);
            }

        };

        track.addEventListener("pointerup", endDrag);
        track.addEventListener("pointercancel", endDrag);

        // Seleção do card por delegação (um listener só, no carrossel,
        // em vez de um por card): setPointerCapture() acima faz o
        // navegador redirecionar o "click" pro PRÓPRIO track quando
        // quem clicou foi o mouse (mesmo sem arrastar de verdade) — por
        // isso event.target vem como o carrossel, não o card, e precisa
        // do elementFromPoint nas coordenadas do clique pra achar o
        // card de verdade. Touch nunca passa pelo pointerdown acima
        // (ver guard do pointerType), então o click dele chega com
        // event.target correto direto, sem precisar do fallback.
        track.addEventListener("click", (event) => {

            if (dragDistance > 5) return;

            const card = event.target.closest(".class-card")
                ?? document.elementFromPoint(event.clientX, event.clientY)?.closest(".class-card");

            if (card) this.selectClass(card.dataset.class);

        });

    }

    selectClass(classId) {

        this.selectedClass = classes[classId];

        this.element
            .querySelectorAll(".class-card")
            .forEach(card => {

                card.classList.remove("selected");

            });

        this.element
            .querySelector(`[data-class="${classId}"]`)
            .classList.add("selected");

        this.renderInfo();

    }

    renderInfo() {

        const info = this.element.querySelector("#class-info");

        const specialties = {

            warrior: [
                "🪨 Absorção: anula golpes de monstros",
                "🛡️ Alta Armadura e Vida",
                "👢 Baixa Agilidade"
            ],

            archer: [
                "🏹 Alta Agilidade",
                "🎯 Alta Chance Crítica",
                "🛡️ Baixa Armadura"
            ],

            mage: [
                "✨ Alto Ataque",
                "🗡️ Alta Penetração",
                "🛡️ Baixa Armadura"
            ],

            barbarian: [
                "🩸 Alto Roubo de Vida",
                "💪 Ataque e Agilidade Equilibrados",
                "❤️ Vida Baixa"
            ],

            putrid: [
                "🦠 Dano Médio e Vida Alta",
                "🧪 Intoxica: enfraquece Ataque, Agilidade e especiais",
                "🏃 Agilidade considerada"
            ],

            mimic: [
                "🪞 Dano verdadeiro pela Vida do Inimigo",
                "🛡️ Armadura Alta",
                "🏃 Agilidade acima da Média"
            ],

            crazy: [
                "⚔️🏃 Maior Ataque e Agilidade do jogo",
                "🌀 Confusão: pode fazer o inimigo errar o ataque ou se acertar sozinho",
                "🛡️❤️ Menor Armadura e Vida do jogo"
            ],

            spark: [
                "⚔️ Segundo maior Ataque do jogo, atrás só do Mago",
                "⚡ Paralisia: chance de fazer o inimigo perder o próximo ataque por completo",
                "🛡️🏃❤️ Armadura, Agilidade e Vida medianas"
            ],

            samurai: [
                "⚔️ Ataque mediano, compensado pelo Golpe Duplo",
                "🗡️ Golpe Duplo: chance de acertar o mesmo dano duas vezes no mesmo golpe",
                "🏃 Agilidade alta, atrás só do Arqueiro",
                "🛡️❤️ Armadura e Vida medianas"
            ],

            singularity: [
                "⚔️ Ataque um pouco acima do Bárbaro",
                "🌌 Pressão Gravitacional: acumula no inimigo até ele receber Gravidade Máxima (perde o próximo ataque e a Armadura conta pela metade no golpe seguinte)",
                "🛡️ Armadura parecida com a do Pútrido",
                "👢 Agilidade baixa, só na frente do Guerreiro"
            ]

        };

        const list = (specialties[this.selectedClass.id] ?? [])
            .map(item => `<li>${item}</li>`)
            .join("");

        info.innerHTML = `

            <h2>${this.selectedClass.name}</h2>

            <p>${this.selectedClass.lore}</p>

            <h3>Especialidades</h3>

            <ul>

                ${list}

            </ul>

        `;

        this.element.querySelector("#btn-start").disabled = false;

    }

    show() {

        this.element.classList.remove("hidden");

        // Só agora o carrossel tem largura de verdade pra calcular (ver
        // comentário em updateCarouselArrows) — sem isso as setas
        // ficavam travadas desabilitadas desde o construtor.
        this.updateCarouselArrows();

    }

    hide() {

        this.element.classList.add("hidden");

    }

    startAdventure() {

        const name = this.game.pendingPlayerName;

        // Slot e personagem trocam juntos: o save ativo nunca fica apontando
        // pro slot de um personagem e gravando os dados de outro.
        SaveService.activeSlot = this.game.pendingSlot ?? SaveService.activeSlot;
        this.game.pendingSlot = null;

        this.game.player = SaveService.attachAccount(new Player(this.selectedClass, name));

        this.game.pendingPlayerName = null;

        const user = AuthService.getCurrentUser();

        if (user) {
            SaveService.reserveCharacterName(name, user.uid);
        }

        this.game.player.addListener(() => {
            this.game.hudScreen.updateHUD();
        });

        this.game.showScreen("hud");
    }

}