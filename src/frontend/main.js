$(document).ready(function () {

    // Código para adicionar uma campanha ao site de doações
    var campanha = "campaign";

    function adicionarCampanha() {
        document.getElementById(campanha).innerHTML += `<div class="row" style="background-color: #FEEF10;"><div class="col-sm-3 col-ms-12"><img src="img/youtube.png"></div><div class="col-sm-9 col-ms-12 text-black"><h1> Título da campanha </h1><p> descrição da campanha </p></div></div>`;
    };


    // Sticky Navigation

    let navbar = $(".navbar");

    $(window).scroll(function () {
        let oTop = $(".section-2").offset().top - window.innerHeight;
        if ($(window).scrollTop() > oTop) {
            navbar.addClass("sticky");
        } else {
            navbar.removeClass("sticky");
        }
    });

    let a = 0;
    $(window).scroll(function () {
        let oTop = $(".numbers").offset().top - window.innerHeight;
        if (a == 0 && $(window).scrollTop() >= oTop) {
            a++;
            nCount(".rect > h1");
        }
    });


    // Função para aplicar reuso da navbar e do final
    $(document).ready(function () {
        $("#header").load("reuso.html", function () {
            $("#btn").on('click', showmenu);
        });
    });

    function shownavbar() {
        navigator.classList.toggle('active');
    }

    function scrollDoacoes() {
        element = document.getElementsById("linhaDoacoes")[0];
        element.scrollIntoView();
    }
})
