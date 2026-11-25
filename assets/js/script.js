$(document).ready(function () {
  $(".my-slider")
    .on("beforeChange", function (event, slick, currentSlide, nextSlide) {
      $(".custom-dot")
        .removeClass("w-6 bg-blue-600 dark:bg-gold")
        .addClass("w-2.5 bg-gray-300 dark:bg-slate-400");
      $(".dot-" + nextSlide)
        .removeClass("w-2.5 bg-gray-300 dark:bg-slate-400")
        .addClass("w-6 bg-blue-600 dark:bg-gold");
    })
    .slick({
      slidesToShow: 1,
      dots: false,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 2000,
      speed: 1000,
      prevArrow: $(".my-prev-btn"),
      nextArrow: $(".my-next-btn"),
    });
  $(".custom-dot").click(function () {
    var slideIndex = $(this).index();
    $(".my-slider").slick("slickGoTo", slideIndex);
  });
  $(".faq-header").click(function () {
    $(".faq-footer").not($(this).next()).slideUp(250);
    $(".faq-header i").not($(this).find("i")).removeClass("rotate-180");

    $(this).next(".faq-footer").slideToggle(250);
    $(this).find("i").toggleClass("rotate-180");
  });
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = menuBtn.querySelector("i");

  function closeMenu() {
    mobileMenu.classList.add("max-h-0");
    mobileMenu.classList.remove("max-h-60");
    mobileMenu.classList.add("is-closed");
    menuIcon.classList.add("ri-menu-line");
    menuIcon.classList.remove("ri-close-line");
    menuIcon.classList.remove("rotate-180");
  }

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("max-h-0");
    mobileMenu.classList.toggle("max-h-60");
    mobileMenu.classList.toggle("is-closed");
    menuIcon.classList.toggle("ri-menu-line");
    menuIcon.classList.toggle("ri-close-line");
    menuIcon.classList.toggle("rotate-180");
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });
  document.addEventListener("click", (e) => {
    if (mobileMenu.classList.contains("is-closed")) return;
    if (mobileMenu.contains(e.target) || menuBtn.contains(e.target)) return;
    closeMenu();
  });
});

const themeToggleBtn = document.getElementById("theme-toggle");

themeToggleBtn.addEventListener("click", function () {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("color-theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("color-theme", "dark");
  }
});
