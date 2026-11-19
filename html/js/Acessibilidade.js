/* =========================================================
   SINALIZA+ — ACESSIBILIDADE
   ========================================================= */

   document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CRIAR BOTÃO
       ===================================================== */

    const botao = document.createElement("button");

    botao.id = "btnAcessibilidade";
    botao.type = "button";

    botao.innerHTML = "♿ Acessibilidade";

    botao.setAttribute(
        "aria-label",
        "Abrir acessibilidade"
    );


    /* =====================================================
       CRIAR PAINEL
       ===================================================== */

    const painel = document.createElement("div");

    painel.id = "painelAcessibilidade";

    painel.innerHTML = `

        <div class="a11y-cabecalho">

            <strong>
                ♿ Acessibilidade
            </strong>

            <button
                id="a11yFechar"
                type="button"
                aria-label="Fechar"
            >
                ×
            </button>

        </div>


        <div class="a11y-conteudo">

            <p class="a11y-titulo">
                Tamanho do texto
            </p>


            <div class="a11y-fontes">

                <button
                    id="a11yDiminuir"
                    type="button"
                >
                    A−
                </button>


                <button
                    id="a11yNormal"
                    type="button"
                >
                    A
                </button>


                <button
                    id="a11yAumentar"
                    type="button"
                >
                    A+
                </button>

            </div>


            <button
                id="a11yContraste"
                class="a11y-opcao"
                type="button"
            >
                ◐ &nbsp; Alto contraste
            </button>


            <button
                id="a11yCinza"
                class="a11y-opcao"
                type="button"
            >
                ◑ &nbsp; Escala de cinza
            </button>

        </div>
    `;


    /* =====================================================
       CSS DO PAINEL
       ===================================================== */

    const estilo = document.createElement("style");

    estilo.textContent = `

        #btnAcessibilidade {

            position: fixed;

            right: 25px;
            bottom: 25px;

            z-index: 999999;

            padding: 14px 20px;

            border: none;
            border-radius: 50px;

            background: #003B7A;
            color: #FFFFFF;

            font-family: Arial, sans-serif;

            font-size: 15px;
            font-weight: bold;

            cursor: pointer;

            box-shadow:
                0 5px 20px rgba(0,0,0,0.25);

        }


        #btnAcessibilidade:hover {

            background: #0057B7;

        }


        #painelAcessibilidade {

            position: fixed;

            right: 25px;
            bottom: 90px;

            z-index: 1000000;

            width: 310px;

            background: #FFFFFF;

            border: 2px solid #0057B7;

            border-radius: 18px;

            box-shadow:
                0 10px 40px rgba(0,0,0,0.25);

            font-family: Arial, sans-serif;

            overflow: hidden;

            display: none;

        }


        #painelAcessibilidade.aberto {

            display: block;

        }


        .a11y-cabecalho {

            display: flex;

            align-items: center;

            justify-content: space-between;

            padding: 18px;

            background: #003B7A;

            color: #FFFFFF;

        }


        .a11y-cabecalho strong {

            font-size: 18px;

        }


        #a11yFechar {

            width: 32px;
            height: 32px;

            border: none;

            border-radius: 8px;

            background: rgba(255,255,255,0.2);

            color: #FFFFFF;

            font-size: 22px;

            cursor: pointer;

        }


        .a11y-conteudo {

            padding: 20px;

        }


        .a11y-titulo {

            margin: 0 0 10px;

            color: #003B7A;

            font-size: 14px;

            font-weight: bold;

        }


        .a11y-fontes {

            display: flex;

            gap: 8px;

            margin-bottom: 18px;

        }


        .a11y-fontes button {

            flex: 1;

            height: 45px;

            border: 1px solid #B9D9F2;

            border-radius: 8px;

            background: #EEF8FF;

            color: #003B7A;

            font-size: 18px;

            font-weight: bold;

            cursor: pointer;

        }


        .a11y-fontes button:hover {

            background: #DDF1FF;

        }


        .a11y-opcao {

            width: 100%;

            margin-top: 10px;

            padding: 13px;

            border: 1px solid #B9D9F2;

            border-radius: 8px;

            background: #FFFFFF;

            color: #003B7A;

            font-size: 14px;

            font-weight: bold;

            text-align: left;

            cursor: pointer;

        }


        .a11y-opcao:hover {

            background: #EEF8FF;

        }


        .a11y-opcao.ativo {

            background: #003B7A;

            color: #FFFFFF;

        }


        /* ALTO CONTRASTE */

        body.a11y-alto-contraste {
            background: #000000 !important;
            color: #FFFFFF !important;
        }

        body.a11y-alto-contraste :is(
            header, main, section, footer, article,
            .conteudo-secao, .sobre, .recursos, .contato,
            .hero, .cards, .card, .evento, .contato-box,
            .auth-card, .destaque, .cartao, .referencia
        ) {
            background: #000000 !important;
            color: #FFFFFF !important;
            border-color: #FFFFFF !important;
            box-shadow: none !important;
        }

        body.a11y-alto-contraste :is(
            h1, h2, h3, h4, p, li, label, strong, small, span,
            .mini-titulo, .etiqueta, .logo, .logo h1
        ) {
            color: #FFFFFF !important;
            -webkit-text-fill-color: #FFFFFF !important;
            background: none !important;
        }

        body.a11y-alto-contraste a {
            color: #FFEB3B !important;
            -webkit-text-fill-color: #FFEB3B !important;
            text-decoration: underline !important;
        }

        body.a11y-alto-contraste button:not(#btnAcessibilidade):not(#a11yFechar):not(.a11y-fontes button):not(.a11y-opcao) {
            background: #FFEB3B !important;
            color: #000000 !important;
            border: 2px solid #FFFFFF !important;
        }


        /* ESCALA DE CINZA */

        body.a11y-escala-cinza > :not(#btnAcessibilidade):not(#painelAcessibilidade) {

            filter: grayscale(100%);

        }


        /* CELULAR */

        @media (max-width: 600px) {

            #btnAcessibilidade {

                right: 15px;
                bottom: 15px;

                width: 55px;
                height: 55px;

                padding: 0;

                font-size: 0;

            }


            #btnAcessibilidade::before {

                content: "♿";

                font-size: 26px;

            }


            #painelAcessibilidade {

                right: 10px;

                bottom: 85px;

                width: calc(100% - 40px);

            }

        }

    `;


    /* =====================================================
       COLOCAR NA PÁGINA
       ===================================================== */

    document.head.appendChild(estilo);

    document.body.appendChild(botao);

    document.body.appendChild(painel);


    /* =====================================================
       TAMANHO DA FONTE
       ===================================================== */

    let tamanhoFonte = 100;


    function atualizarFonte() {

        document.documentElement.style.fontSize =
            tamanhoFonte + "%";

    }


    /* =====================================================
       ABRIR PAINEL
       ===================================================== */

    botao.addEventListener("click", function () {

        painel.classList.toggle("aberto");

    });


    /* =====================================================
       FECHAR PAINEL
       ===================================================== */

    document
        .getElementById("a11yFechar")
        .addEventListener("click", function () {

            painel.classList.remove("aberto");

        });


    /* =====================================================
       AUMENTAR TEXTO
       ===================================================== */

    document
        .getElementById("a11yAumentar")
        .addEventListener("click", function () {

            if (tamanhoFonte < 140) {

                tamanhoFonte += 10;

                atualizarFonte();

            }

        });


    /* =====================================================
       DIMINUIR TEXTO
       ===================================================== */

    document
        .getElementById("a11yDiminuir")
        .addEventListener("click", function () {

            if (tamanhoFonte > 80) {

                tamanhoFonte -= 10;

                atualizarFonte();

            }

        });


    /* =====================================================
       TAMANHO NORMAL
       ===================================================== */

    document
        .getElementById("a11yNormal")
        .addEventListener("click", function () {

            tamanhoFonte = 100;

            atualizarFonte();

        });


    /* =====================================================
       ALTO CONTRASTE
       ===================================================== */

    document
        .getElementById("a11yContraste")
        .addEventListener("click", function () {

            document.body.classList.toggle(
                "a11y-alto-contraste"
            );

            this.classList.toggle("ativo");

        });


    /* =====================================================
       ESCALA DE CINZA
       ===================================================== */

    document
        .getElementById("a11yCinza")
        .addEventListener("click", function () {

            document.body.classList.toggle(
                "a11y-escala-cinza"
            );

            this.classList.toggle("ativo");

        });


    /* =====================================================
       ESC
       ===================================================== */

    document.addEventListener("keydown", function (evento) {

        if (evento.key === "Escape") {

            painel.classList.remove("aberto");

        }

    });


    /* =====================================================
       INICIAR
       ===================================================== */

    atualizarFonte();

});
