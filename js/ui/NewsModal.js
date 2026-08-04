import changelog from "../data/changelog.js";

export default class NewsModal {
    constructor() {
        this.container = document.getElementById("modal-container");
    }

    show() {
        this.container.innerHTML = `
            <div class="news-modal">
                <div class="news-window">
                    <div class="news-header">
                        <h2>
                            <i class="fas fa-scroll"></i>
                            Atualizações
                        </h2>
                        <button class="news-close" id="close-news">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="news-body">
                        ${this.renderVersions()}
                    </div>
                </div>
            </div>
        `;
        this.registerEvents();
    }

    hide() {
        this.container.innerHTML = "";
    }

    registerEvents() {
        const modal = this.container.querySelector(".news-modal");
        const close = this.container.querySelector("#close-news");
        close.addEventListener("click", () => {
            this.hide();
        });
        modal.addEventListener("click", e => {
            if (e.target === modal) {
                this.hide();
            }
        });
    }

    renderVersions() {
        return changelog.map(version => `
            <section class="news-version">
                <div class="news-version-header">
                    <h3>${version.version}</h3>
                    <span>${version.date}</span>
                </div>
                <ul>
                    ${version.changes.map(change => `
                        <li>
                            <i class="fas fa-star"></i>
                            ${change}
                        </li>
                    `).join("")}
                </ul>
            </section>
        `).join("");
    }
}