const openBtn = document.getElementById('open-cart-btn')
const cart = document.getElementById('sidecart')
const closeBtn = document.getElementById('close-btn')
const backdrop = document.getElementById('backdrop')

openBtn.addEventListener('click', openCart)
closeBtn.addEventListener('click', closeCart)
backdrop.addEventListener('click', closeCart)

function openCart() {
    cart.classList.add('open')
    backdrop.style.display = 'block'

    setTimeout(() => {
        backdrop.classList.add('show')
    }, 0)
}

function closeCart() {
    cart.classList.remove('open')
    backdrop.classList.remove('show')

    setTimeout(() => {
        backdrop.style.display = 'none'
    }, 500)
}

const openMenuBtn = document.getElementById('icon-navbar')
const sideMenu = document.getElementById('sidemenu')
const closemenu = document.getElementById('close-menu')
const backmenu = document.getElementById('backMenu')

openMenuBtn.addEventListener('click', openMenu)
closemenu.addEventListener('click', closeMenu)
backmenu.addEventListener('click', closeMenu)

function openMenu() {
    sideMenu.classList.add('open-menu')
    backmenu.classList.add('show-back')
}

function closeMenu() {

    sideMenu.classList.remove('open-menu')
    backmenu.classList.remove('show-back')
}

const searchBtn = document.getElementById('search-icon')
const search = document.getElementById('search-bar')
const closeSearchBtn = document.getElementById('close-search')
const openSearchBack = document.getElementById('back-of-search')
const backdrop2 = document.getElementById('backdrop2')

searchBtn.addEventListener('click', openSearch)
closeSearchBtn.addEventListener('click', closeSearch)
backdrop2.addEventListener('click', closeSearch)

function openSearch() {
    search.classList.add('opens')
    openSearchBack.classList.add('opens-back')
    backdrop2.style.display = 'block'

    setTimeout(() => {
        backdrop2.classList.add('shows')
    }, 0)
}

function closeSearch() {
    search.classList.remove('opens')
    openSearchBack.classList.remove('opens-back')
    backdrop2.classList.remove('shows')

    setTimeout(() => {
        backdrop2.style.display = 'none'
    }, 500)
}


function checkAuthToken() {
    const authToken = getCookie('authToken');
    if (authToken) {
        displayLoggedInContent();
    } else {
        displayGuestContent();
    }
}

function displayLoggedInContent() {

    document.querySelector(".user-icon").classList.add("hide-guest");
    document.querySelector(".profile").classList.remove("hide-user");
}

function displayGuestContent() {


    document.querySelector(".user-icon").classList.remove("hide-guest");
    document.querySelector(".profile").classList.add("hide-user");
}

checkAuthToken();

