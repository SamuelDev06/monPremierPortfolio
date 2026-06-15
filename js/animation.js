document.addEventListener("DOMContentLoaded", () => {

    // Animations au scroll 
    const elementsToAnimate = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-fade');
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.15
    };
    const animObserver = new IntersectionObserver((entries, animObserver) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                animObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    elementsToAnimate.forEach(element => {
        animObserver.observe(element);
    });

    // Active nav link au clic 
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Active nav link au scroll
    const sections = document.querySelectorAll('main[id], section[id]');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => navObserver.observe(section));

    // Navbar shadow au scroll 
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
    });

});