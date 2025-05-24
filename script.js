var app = new Vue({
    el: '#app',
    data: {
        year: new Date().getFullYear(),
        title: 'Sávio Santos',
        subtitle: 'Engenheiro de Software, mestrando em Engenharia da Computação, com experiência em desenvolvimento frontend, mobile e backend, especialmente nas tecnologias Vue.js, Next.js, Express e Nest.js. Atualmente atuando em P&D com Inteligência Artificial, focado em visão computacional e modelos de linguagem.',
        contacts: [
            {
                id: 'email',
                title: 'E-mail',
                value: 'savi8sant8s@gmail.com',
                link: 'mailto:savi8sant8s@gmail.com'
            },
            {
                id: 'github',
                title: 'Github',
                value: 'github.com/savi8sant8s',
                link: 'https://github.com/savi8sant8s'
            },
            {
                id: 'linkedin',
                title: 'Linkedin',
                value: 'linkedin.com/in/savi8sant8s',
                link: 'https://linkedin.com/in/savi8sant8s'
            },
            {
                id: 'orcid',
                title: 'ORCID',
                value: '0000-0002-4707-6948',
                link: 'https://orcid.org/0000-0002-4707-6948'
            },
            {
                id: 'mandaru',
                title: 'Mandaru',
                value: 'mandaru.com',
                link: 'https://mandaru.com'
            },
            {
                id: 'quadro_tatico',
                title: 'Quadro Tático de Esportes',
                value: 'play.google.com/quadro-tatico-de-esportes',
                link: 'https://play.google.com/store/apps/details?id=com.prancheta.quadrotaticodeesportes'
            }
        ]
    }
});
