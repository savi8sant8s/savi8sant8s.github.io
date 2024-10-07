var app = new Vue({
    el: '#app',
    data: {
        title: 'Prancheta - Apps',
        subtitle: 'Criando engenhocas para o canivete suiço chamado "Smartphone".',
        apps: [
            {
                title: 'Quadro Tático de Esportes',
                logo: 'images/quadro-tatico-esportes.png',
                value: 'com.prancheta.quadrotaticodeesportes',
                link: 'https://play.google.com/store/apps/details?id=com.prancheta.quadrotaticodeesportes'
            }
        ],
        contacts: [
            {
                icon: 'fa fa-home',
                title: 'Play Store',
                value: 'play.google.com/prancheta-apps',
                link: 'https://play.google.com/store/apps/dev?id=7964185345858453468'
            },
            {
                icon: 'fa fa-envelope',
                title: 'E-mail',
                value: 'savi8sant8s@gmail.com',
                link: 'mailto:savi8sant8s@gmail.com'
            },
            {
                icon: 'fa fa-github',
                title: 'Github',
                value: 'github.com/savi8sant8s',
                link: 'https://github.com/savi8sant8s'
            },
            {
                icon: 'fa fa-linkedin',
                title: 'Linkedin',
                value: 'linkedin.com/in/savi8sant8s',
                link: 'https://linkedin.com/in/savi8sant8s'
            },
        ]
    }
});